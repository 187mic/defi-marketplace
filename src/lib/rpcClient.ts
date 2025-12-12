import { JsonRpcProvider, Network } from 'ethers';
import type { RpcProviderConfig, CircuitBreakerState } from '@/types';

// Circuit breaker configuration
const CIRCUIT_BREAKER_CONFIG = {
  failureThreshold: 3,
  resetTimeoutMs: 30000, // 30 seconds
  halfOpenMaxAttempts: 1,
} as const;

// Provider configurations
const providerConfigs: RpcProviderConfig[] = [
  {
    url: process.env.NEXT_PUBLIC_ALCHEMY_RPC ?? '',
    name: 'alchemy',
    priority: 1,
    isHealthy: true,
    failureCount: 0,
  },
  {
    url: process.env.NEXT_PUBLIC_INFURA_RPC ?? '',
    name: 'infura',
    priority: 2,
    isHealthy: true,
    failureCount: 0,
  },
  {
    url: process.env.NEXT_PUBLIC_FALLBACK_RPC ?? '',
    name: 'fallback',
    priority: 3,
    isHealthy: true,
    failureCount: 0,
  },
];

// Circuit breaker state per provider
const circuitBreakers: Map<string, CircuitBreakerState> = new Map();

// Provider cache
const providerCache: Map<string, JsonRpcProvider> = new Map();

/**
 * Initialize circuit breaker state for a provider
 */
function initCircuitBreaker(providerName: string): CircuitBreakerState {
  const state: CircuitBreakerState = {
    isOpen: false,
    failureCount: 0,
  };
  circuitBreakers.set(providerName, state);
  return state;
}

/**
 * Get circuit breaker state for a provider
 */
function getCircuitBreakerState(providerName: string): CircuitBreakerState {
  return circuitBreakers.get(providerName) ?? initCircuitBreaker(providerName);
}

/**
 * Record a failure for circuit breaker
 */
function recordFailure(providerName: string): void {
  const state = getCircuitBreakerState(providerName);
  state.failureCount++;
  state.lastFailureTime = Date.now();

  if (state.failureCount >= CIRCUIT_BREAKER_CONFIG.failureThreshold) {
    state.isOpen = true;
    state.nextRetryTime = Date.now() + CIRCUIT_BREAKER_CONFIG.resetTimeoutMs;
    console.warn(`Circuit breaker opened for provider: ${providerName}`);
  }

  circuitBreakers.set(providerName, state);

  // Update provider config
  const config = providerConfigs.find((p) => p.name === providerName);
  if (config) {
    config.failureCount = state.failureCount;
    config.lastFailure = new Date();
    if (state.isOpen) {
      config.isHealthy = false;
    }
  }
}

/**
 * Record a success for circuit breaker
 */
function recordSuccess(providerName: string): void {
  const state = getCircuitBreakerState(providerName);
  state.failureCount = 0;
  state.isOpen = false;
  state.lastFailureTime = undefined;
  state.nextRetryTime = undefined;
  circuitBreakers.set(providerName, state);

  // Update provider config
  const config = providerConfigs.find((p) => p.name === providerName);
  if (config) {
    config.failureCount = 0;
    config.isHealthy = true;
    config.lastFailure = undefined;
  }
}

/**
 * Check if circuit breaker allows request
 */
function canAttemptRequest(providerName: string): boolean {
  const state = getCircuitBreakerState(providerName);

  if (!state.isOpen) {
    return true;
  }

  // Check if we should try half-open state
  if (state.nextRetryTime && Date.now() >= state.nextRetryTime) {
    console.log(`Circuit breaker half-open for provider: ${providerName}`);
    return true;
  }

  return false;
}

/**
 * Create a provider instance for a given config
 */
function createProvider(config: RpcProviderConfig): JsonRpcProvider {
  const cached = providerCache.get(config.name);
  if (cached) {
    return cached;
  }

  // Create static network to avoid network detection calls
  const network = new Network('sepolia', 11155111n);
  const provider = new JsonRpcProvider(config.url, network, {
    staticNetwork: network,
  });

  providerCache.set(config.name, provider);
  return provider;
}

/**
 * Health check for a single provider
 */
export async function checkProviderHealth(
  providerName: string
): Promise<boolean> {
  const config = providerConfigs.find((p) => p.name === providerName);
  if (!config) {
    return false;
  }

  try {
    const provider = createProvider(config);
    const blockNumber = await provider.getBlockNumber();
    if (blockNumber > 0) {
      recordSuccess(providerName);
      return true;
    }
    recordFailure(providerName);
    return false;
  } catch (error) {
    console.error(`Health check failed for ${providerName}:`, error);
    recordFailure(providerName);
    return false;
  }
}

/**
 * Health check for all providers
 */
export async function checkAllProvidersHealth(): Promise<
  Record<string, boolean>
> {
  const results: Record<string, boolean> = {};

  await Promise.all(
    providerConfigs.map(async (config) => {
      results[config.name] = await checkProviderHealth(config.name);
    })
  );

  return results;
}

/**
 * Get the best available RPC provider with failover
 */
export async function getRpcProvider(): Promise<JsonRpcProvider> {
  // Sort by priority and health status
  const sortedConfigs = [...providerConfigs]
    .filter((config) => config.url && config.url.length > 0)
    .sort((a, b) => {
      // Healthy providers first
      if (a.isHealthy !== b.isHealthy) {
        return a.isHealthy ? -1 : 1;
      }
      // Then by priority
      return a.priority - b.priority;
    });

  const errors: Error[] = [];

  for (const config of sortedConfigs) {
    // Check circuit breaker
    if (!canAttemptRequest(config.name)) {
      console.log(`Skipping ${config.name} - circuit breaker open`);
      continue;
    }

    try {
      const provider = createProvider(config);

      // Quick health check
      const blockNumber = await provider.getBlockNumber();
      if (blockNumber > 0) {
        recordSuccess(config.name);
        console.log(`Using RPC provider: ${config.name}`);
        return provider;
      }
    } catch (error) {
      console.warn(`Provider ${config.name} failed:`, error);
      recordFailure(config.name);
      errors.push(error instanceof Error ? error : new Error(String(error)));
    }
  }

  throw new Error(
    `All RPC providers failed. Errors: ${errors.map((e) => e.message).join(', ')}`
  );
}

/**
 * Execute a function with automatic provider failover
 */
export async function withFailover<T>(
  fn: (provider: JsonRpcProvider) => Promise<T>
): Promise<T> {
  const sortedConfigs = [...providerConfigs]
    .filter((config) => config.url && config.url.length > 0)
    .sort((a, b) => {
      if (a.isHealthy !== b.isHealthy) {
        return a.isHealthy ? -1 : 1;
      }
      return a.priority - b.priority;
    });

  const errors: Error[] = [];

  for (const config of sortedConfigs) {
    if (!canAttemptRequest(config.name)) {
      continue;
    }

    try {
      const provider = createProvider(config);
      const result = await fn(provider);
      recordSuccess(config.name);
      return result;
    } catch (error) {
      console.warn(`Operation failed with provider ${config.name}:`, error);
      recordFailure(config.name);
      errors.push(error instanceof Error ? error : new Error(String(error)));
    }
  }

  throw new Error(
    `All providers failed. Errors: ${errors.map((e) => e.message).join(', ')}`
  );
}

/**
 * Get current provider status
 */
export function getProviderStatus(): RpcProviderConfig[] {
  return providerConfigs.map((config) => ({
    ...config,
    isHealthy: canAttemptRequest(config.name) && config.isHealthy,
  }));
}

/**
 * Reset all circuit breakers (useful for testing or manual recovery)
 */
export function resetAllCircuitBreakers(): void {
  circuitBreakers.clear();
  providerConfigs.forEach((config) => {
    config.isHealthy = true;
    config.failureCount = 0;
    config.lastFailure = undefined;
  });
  console.log('All circuit breakers reset');
}

/**
 * Get a specific provider by name (bypasses failover logic)
 */
export function getProviderByName(name: string): JsonRpcProvider | null {
  const config = providerConfigs.find((p) => p.name === name);
  if (!config || !config.url) {
    return null;
  }
  return createProvider(config);
}
