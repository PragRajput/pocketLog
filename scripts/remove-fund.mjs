import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";

const env = readFileSync(".env", "utf8");
const dbUrl = env.match(/DATABASE_URL="?([^"\n]+)"?/)?.[1];
const sql = neon(dbUrl);

console.log("Removing Fund from database...");
await sql`ALTER TABLE "Expense" DROP COLUMN IF EXISTS "fundId"`;
await sql`ALTER TABLE "EMI" DROP COLUMN IF EXISTS "fundId"`;
await sql`DROP TABLE IF EXISTS "Fund" CASCADE`;
console.log("✓ Done — Fund table and fundId columns removed.");
