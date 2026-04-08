import type { PrismaClient } from '@prisma/client';
export type SyncUsersToMembersResult = {
    /** New Member rows created from User accounts. */
    created: number;
    /** Users skipped (no email, or Member with same email already exists). */
    skipped: number;
    /** Per-email failures (e.g. constraint). */
    errors: string[];
};
/**
 * Creates Member records for each User that does not yet have a Member with the same email.
 * Idempotent: safe to run multiple times.
 */
export declare function syncUsersToMembers(prisma: PrismaClient): Promise<SyncUsersToMembersResult>;
//# sourceMappingURL=syncUsersToMembers.d.ts.map