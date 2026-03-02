import { config } from 'dotenv';
import { resolve } from 'path';
import type { Config } from 'drizzle-kit';

// Load .env.local file
config({ path: resolve(__dirname, '.env.local') });

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined in .env.local');
}

export default {
  schema: './core/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
} satisfies Config;
