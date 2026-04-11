import { randomUUID } from 'crypto';

/**
 * Generates stable-looking member IDs compatible with legacy expectations.
 * Example: mem_a1b2c3d4e5f6
 */
export function generateMemberId(): string {
  return `mem_${randomUUID().replace(/-/g, '').slice(0, 12)}`;
}
