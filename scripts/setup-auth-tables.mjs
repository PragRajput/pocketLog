import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";

// Load .env manually
const env = readFileSync(".env", "utf8");
const dbUrl = env.match(/DATABASE_URL="?([^"\n]+)"?/)?.[1];
if (!dbUrl) throw new Error("DATABASE_URL not found in .env");

const sql = neon(dbUrl);

console.log("Setting up auth tables...");

await sql`
  CREATE TABLE IF NOT EXISTS "User" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    password TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ DEFAULT NOW()
  )
`;
console.log("✓ User table");

await sql`ALTER TABLE "Fund" ADD COLUMN IF NOT EXISTS "userId" TEXT REFERENCES "User"(id) ON DELETE CASCADE`;
await sql`ALTER TABLE "Expense" ADD COLUMN IF NOT EXISTS "userId" TEXT REFERENCES "User"(id) ON DELETE CASCADE`;
await sql`ALTER TABLE "Tag" ADD COLUMN IF NOT EXISTS "userId" TEXT REFERENCES "User"(id) ON DELETE CASCADE`;
await sql`ALTER TABLE "EMI" ADD COLUMN IF NOT EXISTS "userId" TEXT REFERENCES "User"(id) ON DELETE CASCADE`;
console.log("✓ userId columns added");

await sql`CREATE INDEX IF NOT EXISTS idx_fund_user ON "Fund"("userId")`;
await sql`CREATE INDEX IF NOT EXISTS idx_expense_user ON "Expense"("userId")`;
await sql`CREATE INDEX IF NOT EXISTS idx_tag_user ON "Tag"("userId")`;
await sql`CREATE INDEX IF NOT EXISTS idx_emi_user ON "EMI"("userId")`;
console.log("✓ Indexes created");

console.log("Done! Auth DB setup complete.");
