import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";

const env = readFileSync(".env", "utf8");
const dbUrl = env.match(/DATABASE_URL="?([^"\n]+)"?/)?.[1];
if (!dbUrl) throw new Error("DATABASE_URL not found in .env");

const sql = neon(dbUrl);

// Store who an expense was paid to, so we can offer "recent payees".
await sql`ALTER TABLE "Expense" ADD COLUMN IF NOT EXISTS "payeeVpa" TEXT`;
await sql`ALTER TABLE "Expense" ADD COLUMN IF NOT EXISTS "payeeName" TEXT`;
console.log("✓ payeeVpa / payeeName columns added to Expense");

// A payment that has been initiated (UPI app opened) but not yet confirmed.
await sql`
  CREATE TABLE IF NOT EXISTS "PendingPayment" (
    id TEXT PRIMARY KEY,
    amount DOUBLE PRECISION NOT NULL,
    description TEXT NOT NULL,
    "payeeVpa" TEXT,
    "payeeName" TEXT,
    "categoryId" TEXT,
    "tagId" TEXT,
    note TEXT,
    "paymentMethod" TEXT,
    "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMPTZ DEFAULT NOW()
  )
`;
await sql`CREATE INDEX IF NOT EXISTS idx_pending_user ON "PendingPayment"("userId")`;
console.log("✓ PendingPayment table ready");

console.log("Done.");
