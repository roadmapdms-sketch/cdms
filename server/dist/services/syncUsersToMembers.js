"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncUsersToMembers = syncUsersToMembers;
const client_1 = require("@prisma/client");
/**
 * Creates Member records for each User that does not yet have a Member with the same email.
 * Idempotent: safe to run multiple times.
 */
async function syncUsersToMembers(prisma) {
    try {
        await prisma.member.count();
    }
    catch (e) {
        if (e instanceof client_1.Prisma.PrismaClientKnownRequestError && e.code === 'P2021') {
            throw new Error('The members table does not exist in the connected database. Run database migrations first (npm run db:deploy), then re-run the sync.');
        }
        throw e;
    }
    const users = await prisma.user.findMany({
        select: { email: true, firstName: true, lastName: true },
    });
    let created = 0;
    let skipped = 0;
    const errors = [];
    for (const u of users) {
        const email = (u.email || '').trim();
        if (!email) {
            skipped += 1;
            continue;
        }
        const existing = await prisma.member.findUnique({ where: { email } });
        if (existing) {
            skipped += 1;
            continue;
        }
        try {
            await prisma.member.create({
                data: {
                    firstName: u.firstName,
                    lastName: u.lastName,
                    email,
                    status: 'ACTIVE',
                    membershipDate: new Date(),
                },
            });
            created += 1;
        }
        catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            errors.push(`${email}: ${msg}`);
        }
    }
    return { created, skipped, errors };
}
//# sourceMappingURL=syncUsersToMembers.js.map