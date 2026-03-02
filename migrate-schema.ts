import { config } from "dotenv";
config({ path: ".env.local" });
import { neon } from "@neondatabase/serverless";

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  console.log("🔗 Connecting to Neon...");

  // Add new columns to csv_uploads
  await sql`
    ALTER TABLE "csv_uploads"
      ADD COLUMN IF NOT EXISTS "investor_user_id" TEXT,
      ADD COLUMN IF NOT EXISTS "supplier_user_id" TEXT,
      ADD COLUMN IF NOT EXISTS "link_token"        TEXT,
      ADD COLUMN IF NOT EXISTS "ipfs_cid"          TEXT,
      ADD COLUMN IF NOT EXISTS "ipfs_url"          TEXT,
      ADD COLUMN IF NOT EXISTS "analysis_result"   JSONB
  `;
  // Make supplierId and investorId optional
  await sql`ALTER TABLE "csv_uploads" ALTER COLUMN "supplier_id" DROP NOT NULL`;
  await sql`ALTER TABLE "csv_uploads" ALTER COLUMN "investor_id" DROP NOT NULL`;
  console.log("✅ csv_uploads columns updated");

  // Create upload_links table
  await sql`
    CREATE TABLE IF NOT EXISTS "upload_links" (
      "id"               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      "token"            TEXT NOT NULL UNIQUE,
      "investor_user_id" TEXT NOT NULL,
      "supplier_user_id" TEXT,
      "status"           TEXT NOT NULL DEFAULT 'pending',
      "upload_id"        UUID REFERENCES "csv_uploads"("id"),
      "created_at"       TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `;
  console.log("✅ upload_links table ready");

  console.log("\n🎉 Schema migration complete!");
}

main().catch((e) => {
  console.error("❌ Migration failed:", e.message);
  process.exit(1);
});
