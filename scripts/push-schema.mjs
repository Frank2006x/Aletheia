import { config } from 'dotenv';
import { resolve } from 'path';
import { execSync } from 'child_process';

// Load .env.local
config({ path: resolve(process.cwd(), '.env.local') });

// Run drizzle-kit push
execSync('pnpm drizzle-kit push', { 
  stdio: 'inherit',
  env: { ...process.env, NODE_OPTIONS: '' }
});
