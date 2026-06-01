import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";

const env = readFileSync(".env", "utf8");
const dbUrl = env.match(/DATABASE_URL="?([^"\n]+)"?/)?.[1];
if (!dbUrl) throw new Error("DATABASE_URL not found in .env");

const sql = neon(dbUrl);

await sql`ALTER TABLE "Expense" ADD COLUMN IF NOT EXISTS "paymentMethod" TEXT`;
console.log("✓ paymentMethod column added to Expense");
