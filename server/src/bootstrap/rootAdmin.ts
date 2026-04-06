import bcrypt from 'bcryptjs';
import type { PrismaClient } from '@prisma/client';

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
export async function ensureRootAdminFromEnv(prisma: PrismaClient): Promise<void> {
  const { email, password, firstName, lastName } = readRootAdminEnv();
  if (!email && !password) return;

  if (!email || !password) {
    console.warn('ROOT_ADMIN_EMAIL / ROOT_ADMIN_PASSWORD are incomplete. Root admin bootstrap skipped.');
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
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

