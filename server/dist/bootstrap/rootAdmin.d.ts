import type { PrismaClient } from '@prisma/client';
/**
 * Ensures one root admin exists from environment variables.
 * This account is intended to be the only account allowed to grant/revoke ADMIN role.
 */
export declare function ensureRootAdminFromEnv(prisma: PrismaClient): Promise<void>;
//# sourceMappingURL=rootAdmin.d.ts.map