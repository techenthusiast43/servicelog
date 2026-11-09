import { keccak256, stringToBytes } from 'viem';

/**
 * Generates a unique bytes32 ID using crypto.randomUUID() combined with timestamp
 */
export function generateUniqueServiceId(): `0x${string}` {
  const uuid = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
  const seed = `${uuid}-${Date.now()}-${Math.random()}`;
  return keccak256(stringToBytes(seed));
}

/**
 * Validates if a string is a valid 32-byte hex string (0x followed by 64 hex characters)
 */
export function isValidBytes32(str: string): boolean {
  return /^0x[0-9a-fA-F]{64}$/.test(str);
}

