/**
 * One-time / maintenance: create Member rows for Users missing from the directory.
 *
 * Run from server/: npm run db:sync-users-to-members
 */
import '../loadEnv';
import { PrismaClient } from '@prisma/client';
import { syncUsersToMembers } from '../services/syncUsersToMembers';

async function main() {
  const prisma = new PrismaClient();
  try {
    const result = await syncUsersToMembers(prisma);
    console.log('syncUsersToMembers complete:', {
      created: result.created,
      skipped: result.skipped,
      errorCount: result.errors.length,
    });
    if (result.errors.length > 0) {
      console.error('Errors:', result.errors);
      process.exitCode = 1;
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
