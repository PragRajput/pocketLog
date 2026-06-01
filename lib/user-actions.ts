"use server";

import bcrypt from "bcryptjs";
import { sql } from "./db";
import { CATEGORY_DEFAULTS } from "./utils";

export async function createUser(data: { name?: string; email: string; password: string }) {
  // Check if email already used
  const existing = await sql`SELECT id FROM "User" WHERE email = ${data.email} LIMIT 1`;
  if (existing[0]) return { error: "An account with this email already exists." };

  const hashed = await bcrypt.hash(data.password, 12);
  const rows = await sql`
    INSERT INTO "User" (id, email, name, password)
    VALUES (gen_random_uuid()::text, ${data.email}, ${data.name || null}, ${hashed})
    RETURNING id, email, name
  `;
  return { user: rows[0] };
}

export async function seedUserCategories(userId: string) {
  // Called after first login to ensure categories exist
  for (const cat of CATEGORY_DEFAULTS) {
    await sql`
      INSERT INTO "Category" (id, name, color, icon)
      VALUES (gen_random_uuid()::text, ${cat.name}, ${cat.color}, ${cat.icon})
      ON CONFLICT (name) DO NOTHING
    `;
  }
}
