import {
  ethers,
  Contract,
  Signer,
  keccak256,
  solidityPacked,
  getCreate2Address,
  ZeroAddress,
  parseEther,
} from 'ethers';
import { getRpcProvider, withFailover } from './rpcClient';
import type { SafeConfig, TransactionResult } from '@/types';

// Safe contract addresses (Sepolia)
const SAFE_PROXY_FACTORY_ADDRESS = '0xa6B71E26C5e0845f74c812102Ca7114b6a896AB2';
const SAFE_SINGLETON_ADDRESS = '0xd9Db270c1B5E3Bd161E8c8503c55cEABeE709552';
const SAFE_FALLBACK_HANDLER_ADDRESS =
  '0xf48f2B2d2a534e402487b3ee7C18c33Aec0Fe5e4';

// ABIs (minimal required functions)
const SAFE_PROXY_FACTORY_ABI = [
  'function createProxyWithNonce(address singleton, bytes memory initializer, uint256 saltNonce) public returns (address proxy)',
  'function proxyCreationCode() public pure returns (bytes memory)',
  'event ProxyCreation(address indexed proxy, address singleton)',
];

const SAFE_ABI = [
  'function setup(address[] calldata _owners, uint256 _threshold, address to, bytes calldata data, address fallbackHandler, address paymentToken, uint256 payment, address payable paymentReceiver) external',
  'function execTransaction(address to, uint256 value, bytes calldata data, uint8 operation, uint256 safeTxGas, uint256 baseGas, uint256 gasPrice, address gasToken, address payable refundReceiver, bytes memory signatures) external payable returns (bool success)',
  'function getTransactionHash(address to, uint256 value, bytes calldata data, uint8 operation, uint256 safeTxGas, uint256 baseGas, uint256 gasPrice, address gasToken, address refundReceiver, uint256 _nonce) public view returns (bytes32)',
  'function nonce() public view returns (uint256)',
  'function getOwners() public view returns (address[] memory)',
  'function getThreshold() public view returns (uint256)',
  'function isOwner(address owner) public view returns (bool)',
  'function domainSeparator() public view returns (bytes32)',
];

const ERC20_ABI = [
  'function transfer(address to, uint256 amount) external returns (bool)',
  'function balanceOf(address account) external view returns (uint256)',
  'function approve(address spender, uint256 amount) external returns (bool)',
];

/**
 * Generate the initializer data for Safe setup
 */
function generateSafeInitializer(owners: string[], threshold: number): string {
  const safeInterface = new ethers.Interface(SAFE_ABI);
  return safeInterface.encodeFunctionData('setup', [
    owners,
    threshold,
    ZeroAddress, // to
    '0x', // data
    SAFE_FALLBACK_HANDLER_ADDRESS,
    ZeroAddress, // paymentToken
    0, // payment
    ZeroAddress, // paymentReceiver
  ]);
}

/**
 * Predict the Safe address before deployment
 */
export async function predictSafeAddress(
  owners: string[],
  threshold: number,
  saltNonce: string = '0'
): Promise<string> {
  return withFailover(async (provider) => {
    const factory = new Contract(
      SAFE_PROXY_FACTORY_ADDRESS,
      SAFE_PROXY_FACTORY_ABI,
      provider
    );

    // Get proxy creation code
    const proxyCreationCode = await factory.proxyCreationCode!();

    // Generate initializer
    const initializer = generateSafeInitializer(owners, threshold);

    // Calculate salt
    const salt = keccak256(
      solidityPacked(
        ['bytes32', 'uint256'],
        [keccak256(initializer), saltNonce]
      )
    );

    // Calculate deployment data
    const deploymentData = solidityPacked(
      ['bytes', 'uint256'],
      [proxyCreationCode, SAFE_SINGLETON_ADDRESS]
    );

    // Predict address using CREATE2
    const predictedAddress = getCreate2Address(
      SAFE_PROXY_FACTORY_ADDRESS,
      salt,
      keccak256(deploymentData)
    );

    return predictedAddress;
  });
}

/**
 * Deploy a new Safe with the given configuration
 */
export async function deploySafe(
  signer: Signer,
  owners: string[],
  threshold: number,
  saltNonce?: string
): Promise<{ safeAddress: string; txHash: string }> {
  // Validate inputs
  if (owners.length === 0) {
    throw new Error('At least one owner is required');
  }
  if (threshold <= 0 || threshold > owners.length) {
    throw new Error('Invalid threshold');
  }

  // Validate owner addresses
  for (const owner of owners) {
    if (!ethers.isAddress(owner)) {
      throw new Error(`Invalid owner address: ${owner}`);
    }
  }

  const factory = new Contract(
    SAFE_PROXY_FACTORY_ADDRESS,
    SAFE_PROXY_FACTORY_ABI,
    signer
  );

  const initializer = generateSafeInitializer(owners, threshold);
  const nonce = saltNonce ?? Date.now().toString();

  // Deploy the proxy
  const tx = await factory.createProxyWithNonce!(
    SAFE_SINGLETON_ADDRESS,
    initializer,
    nonce
  );

  const receipt = await tx.wait();

  // Extract proxy address from event
  const proxyCreationEvent = receipt.logs.find(
    (log: { topics: string[] }) =>
      log.topics[0] ===
      ethers.id('ProxyCreation(address,address)')
  );

  if (!proxyCreationEvent) {
    throw new Error('Failed to get proxy address from deployment');
  }

  // Decode the proxy address from the event
  const safeAddress = ethers.AbiCoder.defaultAbiCoder().decode(
    ['address'],
    proxyCreationEvent.topics[1] ?? '0x'
  )[0] as string;

  return {
    safeAddress,
    txHash: receipt.hash as string,
  };
}

/**
 * Get Safe contract instance
 */
export async function getSafeContract(
  safeAddress: string,
  signerOrProvider?: Signer | ethers.Provider
): Promise<Contract> {
  const provider = signerOrProvider ?? (await getRpcProvider());
  return new Contract(safeAddress, SAFE_ABI, provider);
}

/**
 * Create a release transaction (transfer funds from Safe to recipient with platform fee)
 */
export async function createReleaseTransaction(
  safeAddress: string,
  recipient: string,
  amount: bigint,
  feeRecipient: string,
  feeBps: number,
  tokenAddress?: string
): Promise<{
  recipientTx: {
    to: string;
    value: string;
    data: string;
  };
  feeTx?: {
    to: string;
    value: string;
    data: string;
  };
  totalAmount: bigint;
  feeAmount: bigint;
  recipientAmount: bigint;
}> {
  // Calculate fee
  const feeAmount = (amount * BigInt(feeBps)) / BigInt(10000);
  const recipientAmount = amount - feeAmount;

  // Native ETH transfer
  if (!tokenAddress || tokenAddress === ZeroAddress) {
    const recipientTx = {
      to: recipient,
      value: recipientAmount.toString(),
      data: '0x',
    };

    const feeTx =
      feeAmount > 0n
        ? {
            to: feeRecipient,
            value: feeAmount.toString(),
            data: '0x',
          }
        : undefined;

    return {
      recipientTx,
      feeTx,
      totalAmount: amount,
      feeAmount,
      recipientAmount,
    };
  }

  // ERC20 token transfer
  const erc20Interface = new ethers.Interface(ERC20_ABI);

  const recipientTx = {
    to: tokenAddress,
    value: '0',
    data: erc20Interface.encodeFunctionData('transfer', [
      recipient,
      recipientAmount,
    ]),
  };

  const feeTx =
    feeAmount > 0n
      ? {
          to: tokenAddress,
          value: '0',
          data: erc20Interface.encodeFunctionData('transfer', [
            feeRecipient,
            feeAmount,
          ]),
        }
      : undefined;

  return {
    recipientTx,
    feeTx,
    totalAmount: amount,
    feeAmount,
    recipientAmount,
  };
}

/**
 * Execute a transaction on the Safe
 */
export async function executeTransaction(
  signer: Signer,
  safeAddress: string,
  to: string,
  value: string,
  data: string,
  signatures: string
): Promise<TransactionResult> {
  const safe = new Contract(safeAddress, SAFE_ABI, signer);

  const tx = await safe.execTransaction!(
    to,
    value,
    data,
    0, // operation (0 = Call)
    0, // safeTxGas
    0, // baseGas
    0, // gasPrice
    ZeroAddress, // gasToken
    ZeroAddress, // refundReceiver
    signatures
  );

  const receipt = await tx.wait();

  return {
    hash: receipt.hash as string,
    status: receipt.status === 1 ? 'confirmed' : 'failed',
    blockNumber: receipt.blockNumber as number,
    confirmations: await receipt.confirmations(),
  };
}

/**
 * Get transaction status
 */
export async function getTransactionStatus(
  txHash: string
): Promise<TransactionResult> {
  return withFailover(async (provider) => {
    const receipt = await provider.getTransactionReceipt(txHash);

    if (!receipt) {
      return {
        hash: txHash,
        status: 'pending',
      };
    }

    const currentBlock = await provider.getBlockNumber();
    const confirmations = currentBlock - receipt.blockNumber;

    return {
      hash: txHash,
      status: receipt.status === 1 ? 'confirmed' : 'failed',
      blockNumber: receipt.blockNumber,
      confirmations,
    };
  });
}

/**
 * Get Safe info (owners, threshold, nonce)
 */
export async function getSafeInfo(safeAddress: string): Promise<{
  owners: string[];
  threshold: number;
  nonce: number;
}> {
  return withFailover(async (provider) => {
    const safe = new Contract(safeAddress, SAFE_ABI, provider);

    const [owners, threshold, nonce] = await Promise.all([
      safe.getOwners!(),
      safe.getThreshold!(),
      safe.nonce!(),
    ]);

    return {
      owners: owners as string[],
      threshold: Number(threshold),
      nonce: Number(nonce),
    };
  });
}

/**
 * Check if an address is an owner of the Safe
 */
export async function isOwner(
  safeAddress: string,
  address: string
): Promise<boolean> {
  return withFailover(async (provider) => {
    const safe = new Contract(safeAddress, SAFE_ABI, provider);
    return safe.isOwner!(address) as Promise<boolean>;
  });
}

/**
 * Get Safe balance (ETH or ERC20)
 */
export async function getSafeBalance(
  safeAddress: string,
  tokenAddress?: string
): Promise<bigint> {
  return withFailover(async (provider) => {
    if (!tokenAddress || tokenAddress === ZeroAddress) {
      return provider.getBalance(safeAddress);
    }

    const token = new Contract(tokenAddress, ERC20_ABI, provider);
    return token.balanceOf!(safeAddress) as Promise<bigint>;
  });
}

/**
 * Get the transaction hash for signing
 */
export async function getTransactionHash(
  safeAddress: string,
  to: string,
  value: string,
  data: string,
  nonce: number
): Promise<string> {
  return withFailover(async (provider) => {
    const safe = new Contract(safeAddress, SAFE_ABI, provider);

    const hash = await safe.getTransactionHash!(
      to,
      value,
      data,
      0, // operation
      0, // safeTxGas
      0, // baseGas
      0, // gasPrice
      ZeroAddress, // gasToken
      ZeroAddress, // refundReceiver
      nonce
    );

    return hash as string;
  });
}
