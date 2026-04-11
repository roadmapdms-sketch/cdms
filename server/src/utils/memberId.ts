import { randomBytes } from 'crypto';

const PREFIX = 'mem_';
/** Total length including prefix (prefix + 21 hex digits). */
export const MEMBER_ID_LENGTH = 25;

/**
 * Generates opaque member IDs: fixed 25 characters (`mem_` + 21 hex).
 */
export function generateMemberId(): string {
  const suffixLen = MEMBER_ID_LENGTH - PREFIX.length;
  const hex = randomBytes(Math.ceil(suffixLen / 2))
    .toString('hex')
    .slice(0, suffixLen);
  return `${PREFIX}${hex}`;
}
