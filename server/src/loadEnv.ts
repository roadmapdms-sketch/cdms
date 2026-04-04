import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

const serverRoot = path.resolve(__dirname, '..');

function loadIfExists(file: string, override: boolean) {
  const full = path.join(serverRoot, file);
  if (fs.existsSync(full)) {
    dotenv.config({ path: full, override });
  }
}

// Base config, then .env.local wins (Supabase secrets usually live here).
loadIfExists('.env', false);
loadIfExists('.env.local', true);
