import murmurhash from 'murmurhash'

/**
 * Returns a stable bucket 0-99 for a given userId + flagKey.
 * Same inputs always return the same bucket — ensures consistent
 * experience for the same user across every API call.
 */
export function getBucket(userId: string, flagKey: string): number {
  const seed = `${flagKey}:${userId}`
  return Math.abs(murmurhash.v3(seed)) % 100
}
