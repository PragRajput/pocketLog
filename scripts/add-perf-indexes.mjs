import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";

// Load .env manually
const env = readFileSync(".env", "utf8");
const dbUrl = env.match(/DATABASE_URL="?([^"\n]+)"?/)?.[1];
if (!dbUrl) throw new Error("DATABASE_URL not found in .env");

const sql = neon(dbUrl);

console.log("Adding performance indexes...");

// The expenses list and dashboard "recent" both sort newest-created first:
// WHERE "userId" = … ORDER BY "createdAt" DESC. This composite lets Postgres
// satisfy the filter AND the sort from one index.
await sql`CREATE INDEX IF NOT EXISTS idx_expense_user_created ON "Expense"("userId", "createdAt" DESC)`;
console.log("✓ idx_expense_user_created");

// Date-range filters (reports, month totals, trend) still scan by date.
await sql`CREATE INDEX IF NOT EXISTS idx_expense_user_date ON "Expense"("userId", date DESC)`;
console.log("✓ idx_expense_user_date");

// Speeds the per-EMI payment subqueries (json_agg of payments).
await sql`CREATE INDEX IF NOT EXISTS idx_emipayment_emi ON "EMIPayment"("emiId")`;
console.log("✓ idx_emipayment_emi");

// Active-EMI dashboard widget filters on status.
await sql`CREATE INDEX IF NOT EXISTS idx_emi_user_status ON "EMI"("userId", status)`;
console.log("✓ idx_emi_user_status");

console.log("Done! Run ANALYZE to refresh planner stats.");
await sql`ANALYZE "Expense"`;
