import "dotenv/config";
import { neon } from "@neondatabase/serverless";

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  console.log("🔗 Connecting to Neon...");

  await sql`
    CREATE TABLE IF NOT EXISTS "user" (
      "id"            TEXT PRIMARY KEY,
      "name"          TEXT NOT NULL,
      "email"         TEXT NOT NULL UNIQUE,
      "emailVerified" BOOLEAN NOT NULL DEFAULT false,
      "image"         TEXT,
      "createdAt"     TIMESTAMP NOT NULL DEFAULT NOW(),
      "updatedAt"     TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `;
  console.log("✅ user table ready");

  await sql`
    CREATE TABLE IF NOT EXISTS "session" (
      "id"        TEXT PRIMARY KEY,
      "expiresAt" TIMESTAMP NOT NULL,
      "token"     TEXT NOT NULL UNIQUE,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      "ipAddress" TEXT,
      "userAgent" TEXT,
      "userId"    TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE
    )
  `;
  console.log("✅ session table ready");

  await sql`
    CREATE TABLE IF NOT EXISTS "account" (
      "id"                     TEXT PRIMARY KEY,
      "accountId"              TEXT NOT NULL,
      "providerId"             TEXT NOT NULL,
      "userId"                 TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
      "accessToken"            TEXT,
      "refreshToken"           TEXT,
      "idToken"                TEXT,
      "accessTokenExpiresAt"   TIMESTAMP,
      "refreshTokenExpiresAt"  TIMESTAMP,
      "scope"                  TEXT,
      "password"               TEXT,
      "createdAt"              TIMESTAMP NOT NULL DEFAULT NOW(),
      "updatedAt"              TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `;
  console.log("✅ account table ready");

  await sql`
    CREATE TABLE IF NOT EXISTS "verification" (
      "id"         TEXT PRIMARY KEY,
      "identifier" TEXT NOT NULL,
      "value"      TEXT NOT NULL,
      "expiresAt"  TIMESTAMP NOT NULL,
      "createdAt"  TIMESTAMP DEFAULT NOW(),
      "updatedAt"  TIMESTAMP DEFAULT NOW()
    )
  `;
  console.log("✅ verification table ready");

  console.log("\n🎉 All Better Auth tables created/verified on Neon!");
}

main().catch((e) => {
  console.error("❌ Migration failed:", e.message);
  process.exit(1);
});
