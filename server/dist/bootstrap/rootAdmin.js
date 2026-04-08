"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureRootAdminFromEnv = ensureRootAdminFromEnv;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
function readRootAdminEnv() {
    const email = (process.env.ROOT_ADMIN_EMAIL || '').trim().toLowerCase();
    const password = process.env.ROOT_ADMIN_PASSWORD || '';
    const firstName = (process.env.ROOT_ADMIN_FIRST_NAME || 'Root').trim();
    const lastName = (process.env.ROOT_ADMIN_LAST_NAME || 'Admin').trim();
    return { email, password, firstName, lastName };
}
/**
 * Ensures one root admin exists from environment variables.
 * This account is intended to be the only account allowed to grant/revoke ADMIN role.
 */
async function ensureRootAdminFromEnv(prisma) {
    const { email, password, firstName, lastName } = readRootAdminEnv();
    if (!email && !password)
        return;
    if (!email || !password) {
        console.warn('ROOT_ADMIN_EMAIL / ROOT_ADMIN_PASSWORD are incomplete. Root admin bootstrap skipped.');
        return;
    }
    const passwordHash = await bcryptjs_1.default.hash(password, 12);
    const existing = await prisma.user.findUnique({ where: { email } });
    if (!existing) {
        await prisma.user.create({
            data: {
                email,
                password: passwordHash,
                firstName,
                lastName,
                role: 'ADMIN',
                isActive: true,
            },
        });
        console.log(`✅ Root admin account created for ${email}`);
        return;
    }
    await prisma.user.update({
        where: { email },
        data: {
            password: passwordHash,
            firstName,
            lastName,
            role: 'ADMIN',
            isActive: true,
        },
    });
    console.log(`✅ Root admin account synced for ${email}`);
}
//# sourceMappingURL=rootAdmin.js.map