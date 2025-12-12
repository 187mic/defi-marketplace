// Enums
export enum TradeStatus {
  PENDING = 'PENDING',
  FUNDED = 'FUNDED',
  PAID = 'PAID',
  RELEASED = 'RELEASED',
  DISPUTED = 'DISPUTED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentMethod {
  BANK_TRANSFER = 'BANK_TRANSFER',
  PAYPAL = 'PAYPAL',
  VENMO = 'VENMO',
  ZELLE = 'ZELLE',
  CASH_APP = 'CASH_APP',
  WISE = 'WISE',
  REVOLUT = 'REVOLUT',
  CRYPTO = 'CRYPTO',
  CASH = 'CASH',
  OTHER = 'OTHER',
}

export enum OfferType {
  BUY = 'BUY',
  SELL = 'SELL',
}

export enum DisputeReason {
  PAYMENT_NOT_RECEIVED = 'PAYMENT_NOT_RECEIVED',
  PAYMENT_NOT_SENT = 'PAYMENT_NOT_SENT',
  WRONG_AMOUNT = 'WRONG_AMOUNT',
  FRAUD = 'FRAUD',
  OTHER = 'OTHER',
}

export enum DisputeResolution {
  PENDING = 'PENDING',
  BUYER_WINS = 'BUYER_WINS',
  SELLER_WINS = 'SELLER_WINS',
  SPLIT = 'SPLIT',
}

// Interfaces
export interface User {
  id: string;
  address: string;
  username?: string;
  bio?: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  totalTrades: number;
  completedTrades: number;
  averageRating: number;
  isVerified: boolean;
  isBanned: boolean;
  lastActiveAt: Date;
}

export interface Offer {
  id: string;
  creatorId: string;
  creator: User;
  type: OfferType;
  tokenAddress: string;
  tokenSymbol: string;
  tokenDecimals: number;
  minAmount: string;
  maxAmount: string;
  pricePerToken: string;
  currency: string;
  paymentMethods: PaymentMethod[];
  paymentDetails?: string;
  terms?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
  completedTradesCount: number;
}

export interface Trade {
  id: string;
  offerId: string;
  offer: Offer;
  buyerId: string;
  buyer: User;
  sellerId: string;
  seller: User;
  safeAddress: string;
  tokenAddress: string;
  tokenSymbol: string;
  tokenDecimals: number;
  tokenAmount: string;
  fiatAmount: string;
  currency: string;
  paymentMethod: PaymentMethod;
  paymentDetails?: string;
  status: TradeStatus;
  createdAt: Date;
  updatedAt: Date;
  fundedAt?: Date;
  paidAt?: Date;
  releasedAt?: Date;
  cancelledAt?: Date;
  disputedAt?: Date;
  releaseTxHash?: string;
  fundTxHash?: string;
  platformFeeBps: number;
  platformFeeAmount: string;
}

export interface Dispute {
  id: string;
  tradeId: string;
  trade: Trade;
  initiatorId: string;
  initiator: User;
  reason: DisputeReason;
  description: string;
  evidence: DisputeEvidence[];
  resolution: DisputeResolution;
  moderatorId?: string;
  moderator?: User;
  moderatorNotes?: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
}

export interface DisputeEvidence {
  id: string;
  disputeId: string;
  submitterId: string;
  submitter: User;
  type: 'IMAGE' | 'TEXT' | 'LINK';
  content: string;
  description?: string;
  createdAt: Date;
}

export interface Rating {
  id: string;
  tradeId: string;
  trade: Trade;
  raterId: string;
  rater: User;
  ratedUserId: string;
  ratedUser: User;
  score: number; // 1-5
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Safe/Transaction Types
export interface SafeConfig {
  owners: string[];
  threshold: number;
  saltNonce?: string;
}

export interface SafeTransaction {
  to: string;
  value: string;
  data: string;
  operation: number;
  safeTxGas: string;
  baseGas: string;
  gasPrice: string;
  gasToken: string;
  refundReceiver: string;
  nonce: number;
}

export interface TransactionResult {
  hash: string;
  status: 'pending' | 'confirmed' | 'failed';
  blockNumber?: number;
  confirmations?: number;
}

// RPC Types
export interface RpcProviderConfig {
  url: string;
  name: string;
  priority: number;
  isHealthy: boolean;
  failureCount: number;
  lastFailure?: Date;
}

export interface CircuitBreakerState {
  isOpen: boolean;
  failureCount: number;
  lastFailureTime?: number;
  nextRetryTime?: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Simplified UI Types (for frontend display)
export interface UIOfferCard {
  id: string;
  creatorAddress: string;
  assetType: string;
  amount: string;
  price: string;
  paymentMethod: string;
  terms: string;
  status: 'active' | 'inactive';
  rating: number;
  tradeCount: number;
}

export interface MarketplaceStats {
  totalOffers: number;
  totalVolume: number;
  activeTraders: number;
}
