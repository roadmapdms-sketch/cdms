"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * One-time / maintenance: create Member rows for Users missing from the directory.
 *
 * Run from server/: npm run db:sync-users-to-members
 */
require("../loadEnv");
const client_1 = require("@prisma/client");
const syncUsersToMembers_1 = require("../services/syncUsersToMembers");
async function main() {
    const prisma = new client_1.PrismaClient();
    try {
        const result = await (0, syncUsersToMembers_1.syncUsersToMembers)(prisma);
        console.log('syncUsersToMembers complete:', {
            created: result.created,
            skipped: result.skipped,
            errorCount: result.errors.length,
        });
        if (result.errors.length > 0) {
            console.error('Errors:', result.errors);
            process.exitCode = 1;
        }
    }
    finally {
        await prisma.$disconnect();
    }
}
main().catch((e) => {
    console.error(e);
    process.exit(1);
});
//# sourceMappingURL=syncUsersToMembers.js.map