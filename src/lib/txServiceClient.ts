import { ethers, Signer } from 'ethers';
import { getRpcProvider, withFailover } from './rpcClient';
import type { SafeTransaction, TransactionResult } from '@/types';

// Safe Transaction Service API URL (Sepolia)
const TX_SERVICE_URL = 'https://safe-transaction-sepolia.safe.global/api';

// Safe contract ABI (minimal for transaction operations)
const SAFE_ABI = [
  'function getTransactionHash(address to, uint256 value, bytes calldata data, uint8 operation, uint256 safeTxGas, uint256 baseGas, uint256 gasPrice, address gasToken, address refundReceiver, uint256 _nonce) public view returns (bytes32)',
  'function nonce() public view returns (uint256)',
  'function domainSeparator() public view returns (bytes32)',
  'function getOwners() public view returns (address[] memory)',
  'function getThreshold() public view returns (uint256)',
];

interface SafeTxServiceTransaction {
  safe: string;
  to: string;
  value: string;
  data: string;
  operation: number;
  gasToken: string;
  safeTxGas: number;
  baseGas: number;
  gasPrice: string;
  refundReceiver: string;
  nonce: number;
  executionDate: string | null;
  submissionDate: string;
  modified: string;
  blockNumber: number | null;
  transactionHash: string | null;
  safeTxHash: string;
  executor: string | null;
  isExecuted: boolean;
  isSuccessful: boolean | null;
  confirmations: Array<{
    owner: string;
    submissionDate: string;
    signature: string;
    signatureType: string;
  }>;
  confirmationsRequired: number;
}

interface ProposeTransactionParams {
  safeAddress: string;
  safeTransactionData: {
    to: string;
    value: string;
    data: string;
    operation?: number;
    safeTxGas?: string;
    baseGas?: string;
    gasPrice?: string;
    gasToken?: string;
    refundReceiver?: string;
    nonce?: number;
  };
  safeTxHash: string;
  senderAddress: string;
  senderSignature: string;
  origin?: string;
}

/**
 * Get the current nonce for a Safe
 */
export async function getSafeNonce(safeAddress: string): Promise<number> {
  return withFailover(async (provider) => {
    const safe = new ethers.Contract(safeAddress, SAFE_ABI, provider);
    const nonceFn = safe.nonce;
    if (!nonceFn) {
      throw new Error('nonce method not found on safe contract');
    }
    const nonce = await nonceFn();
    return Number(nonce);
  });
}

/**
 * Get transaction hash for signing
 */
export async function getTransactionHash(
  safeAddress: string,
  tx: Omit<SafeTransaction, 'nonce'> & { nonce?: number }
): Promise<string> {
  return withFailover(async (provider) => {
    const safe = new ethers.Contract(safeAddress, SAFE_ABI, provider);

    const nonce = tx.nonce ?? (await getSafeNonce(safeAddress));

    const getTransactionHashFn = safe.getTransactionHash;
    if (!getTransactionHashFn) {
      throw new Error('getTransactionHash method not found on safe contract');
    }
    const hash = await getTransactionHashFn(
      tx.to,
      tx.value,
      tx.data,
      tx.operation,
      tx.safeTxGas,
      tx.baseGas,
      tx.gasPrice,
      tx.gasToken,
      tx.refundReceiver,
      nonce
    );

    return hash as string;
  });
}

/**
 * Submit a transaction to the Safe Transaction Service
 */
export async function submitTransaction(
  safeAddress: string,
  txData: SafeTransaction,
  signature: string,
  senderAddress: string
): Promise<{ safeTxHash: string }> {
  const safeTxHash = await getTransactionHash(safeAddress, txData);

  const payload = {
    to: txData.to,
    value: txData.value,
    data: txData.data,
    operation: txData.operation,
    gasToken: txData.gasToken,
    safeTxGas: txData.safeTxGas,
    baseGas: txData.baseGas,
    gasPrice: txData.gasPrice,
    refundReceiver: txData.refundReceiver,
    nonce: txData.nonce,
    contractTransactionHash: safeTxHash,
    sender: senderAddress,
    signature: signature,
    origin: 'DeFi P2P Marketplace',
  };

  const response = await fetch(
    `${TX_SERVICE_URL}/v1/safes/${safeAddress}/multisig-transactions/`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to submit transaction: ${error}`);
  }

  return { safeTxHash };
}

/**
 * Get a transaction by its Safe transaction hash
 */
export async function getTransaction(
  safeTxHash: string
): Promise<SafeTxServiceTransaction | null> {
  const response = await fetch(
    `${TX_SERVICE_URL}/v1/multisig-transactions/${safeTxHash}/`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get transaction: ${error}`);
  }

  return response.json() as Promise<SafeTxServiceTransaction>;
}

/**
 * Get pending transactions for a Safe
 */
export async function getPendingTransactions(
  safeAddress: string
): Promise<SafeTxServiceTransaction[]> {
  const response = await fetch(
    `${TX_SERVICE_URL}/v1/safes/${safeAddress}/multisig-transactions/?executed=false&trusted=true`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get pending transactions: ${error}`);
  }

  const data = (await response.json()) as { results: SafeTxServiceTransaction[] };
  return data.results;
}

/**
 * Get all transactions for a Safe
 */
export async function getAllTransactions(
  safeAddress: string,
  options?: {
    executed?: boolean;
    limit?: number;
    offset?: number;
  }
): Promise<{ results: SafeTxServiceTransaction[]; count: number }> {
  const params = new URLSearchParams();

  if (options?.executed !== undefined) {
    params.set('executed', String(options.executed));
  }
  if (options?.limit !== undefined) {
    params.set('limit', String(options.limit));
  }
  if (options?.offset !== undefined) {
    params.set('offset', String(options.offset));
  }

  const url = `${TX_SERVICE_URL}/v1/safes/${safeAddress}/multisig-transactions/?${params.toString()}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get transactions: ${error}`);
  }

  return response.json() as Promise<{ results: SafeTxServiceTransaction[]; count: number }>;
}

/**
 * Propose a new transaction to the Safe
 */
export async function proposeTransaction(
  signer: Signer,
  safeAddress: string,
  tx: {
    to: string;
    value: string;
    data: string;
    operation?: number;
  }
): Promise<{ safeTxHash: string }> {
  const signerAddress = await signer.getAddress();

  // Get current nonce
  const nonce = await getSafeNonce(safeAddress);

  // Build full transaction
  const safeTx: SafeTransaction = {
    to: tx.to,
    value: tx.value,
    data: tx.data,
    operation: tx.operation ?? 0,
    safeTxGas: '0',
    baseGas: '0',
    gasPrice: '0',
    gasToken: ethers.ZeroAddress,
    refundReceiver: ethers.ZeroAddress,
    nonce,
  };

  // Get transaction hash
  const safeTxHash = await getTransactionHash(safeAddress, safeTx);

  // Sign the transaction hash
  const signature = await signer.signMessage(ethers.getBytes(safeTxHash));

  // Convert signature to Safe format (add signature type)
  const safeSignature = signature + '1f'; // 1f = eth_sign signature type

  // Submit to transaction service
  return submitTransaction(safeAddress, safeTx, safeSignature, signerAddress);
}

/**
 * Add a confirmation (signature) to an existing transaction
 */
export async function confirmTransaction(
  signer: Signer,
  safeTxHash: string
): Promise<void> {
  const signerAddress = await signer.getAddress();

  // Sign the transaction hash
  const signature = await signer.signMessage(ethers.getBytes(safeTxHash));
  const safeSignature = signature + '1f';

  const response = await fetch(
    `${TX_SERVICE_URL}/v1/multisig-transactions/${safeTxHash}/confirmations/`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        signature: safeSignature,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to confirm transaction: ${error}`);
  }
}

/**
 * Get confirmations for a transaction
 */
export async function getConfirmations(
  safeTxHash: string
): Promise<
  Array<{
    owner: string;
    submissionDate: string;
    signature: string;
    signatureType: string;
  }>
> {
  const response = await fetch(
    `${TX_SERVICE_URL}/v1/multisig-transactions/${safeTxHash}/confirmations/`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get confirmations: ${error}`);
  }

  const data = (await response.json()) as {
    results: Array<{
      owner: string;
      submissionDate: string;
      signature: string;
      signatureType: string;
    }>;
  };
  return data.results;
}

/**
 * Check if a transaction has enough confirmations to execute
 */
export async function canExecute(safeTxHash: string): Promise<boolean> {
  const tx = await getTransaction(safeTxHash);
  if (!tx) {
    return false;
  }

  return tx.confirmations.length >= tx.confirmationsRequired;
}

/**
 * Get Safe info from transaction service
 */
export async function getSafeInfo(safeAddress: string): Promise<{
  address: string;
  nonce: number;
  threshold: number;
  owners: string[];
  masterCopy: string;
  modules: string[];
  fallbackHandler: string;
  guard: string;
  version: string;
}> {
  const response = await fetch(
    `${TX_SERVICE_URL}/v1/safes/${safeAddress}/`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get Safe info: ${error}`);
  }

  return response.json() as Promise<{
    address: string;
    nonce: number;
    threshold: number;
    owners: string[];
    masterCopy: string;
    modules: string[];
    fallbackHandler: string;
    guard: string;
    version: string;
  }>;
}

/**
 * Estimate gas for a Safe transaction
 */
export async function estimateTransaction(
  safeAddress: string,
  tx: {
    to: string;
    value: string;
    data: string;
    operation?: number;
  }
): Promise<{ safeTxGas: string }> {
  const response = await fetch(
    `${TX_SERVICE_URL}/v1/safes/${safeAddress}/multisig-transactions/estimations/`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: tx.to,
        value: tx.value,
        data: tx.data,
        operation: tx.operation ?? 0,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to estimate transaction: ${error}`);
  }

  return response.json() as Promise<{ safeTxGas: string }>;
}
