import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Get DATABASE_URL from environment
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error(
    '❌ DATABASE_URL environment variable is not set. Make sure .env.local is configured.'
  );
  throw new Error('DATABASE_URL environment variable is not set');
}

// Create Neon HTTP client
const sql = neon(connectionString);

// Create Drizzle ORM instance with schema
export const db = drizzle(sql, { schema });
