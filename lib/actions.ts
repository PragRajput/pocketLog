"use server";

import { revalidatePath } from "next/cache";
import { sql } from "./db";

// ─── Types ────────────────────────────────────────────────

export type Fund = {
  id: string; name: string; description: string | null; color: string;
  icon: string; budget: number | null; createdAt: Date; updatedAt: Date;
};
export type Category = { id: string; name: string; color: string; icon: string };
export type Tag = { id: string; name: string; color: string; createdAt: Date };
export type Expense = {
  id: string; amount: number; description: string; date: Date;
  fundId: string | null; categoryId: string | null; tagId: string | null;
  note: string | null; createdAt: Date; updatedAt: Date;
};
export type ExpenseWithRelations = Expense & {
  fund: Fund | null; category: Category | null; tag: Tag | null;
};
export type TagWithExpenses = Tag & { expenses: Pick<Expense, "id" | "amount" | "date">[] };
export type FundWithStats = Fund & { total: number; thisMonth: number };
export type FundWithExpenses = Fund & { expenses: Pick<Expense, "id" | "amount" | "date">[] };

// ─── Funds ───────────────────────────────────────────────

export async function getFunds(): Promise<FundWithExpenses[]> {
  return sql`
    SELECT f.*,
      COALESCE((
        SELECT json_agg(json_build_object('id', e.id, 'amount', e.amount, 'date', e.date))
        FROM "Expense" e WHERE e."fundId" = f.id
      ), '[]') AS expenses
    FROM "Fund" f ORDER BY f."createdAt" ASC
  ` as unknown as Promise<FundWithExpenses[]>;
}

export type FundDetail = Fund & { expenses: (ExpenseWithRelations)[] };

export async function getFund(id: string): Promise<FundDetail | null> {
  const rows = await sql`
    SELECT f.*,
      COALESCE((
        SELECT json_agg(
          json_build_object(
            'id', e.id, 'amount', e.amount, 'description', e.description,
            'date', e.date, 'fundId', e."fundId", 'categoryId', e."categoryId",
            'tagId', e."tagId", 'note', e.note, 'createdAt', e."createdAt", 'updatedAt', e."updatedAt",
            'category', (SELECT row_to_json(c.*) FROM "Category" c WHERE c.id = e."categoryId"),
            'tag', (SELECT row_to_json(t.*) FROM "Tag" t WHERE t.id = e."tagId")
          ) ORDER BY e.date DESC
        )
        FROM "Expense" e WHERE e."fundId" = f.id
      ), '[]') AS expenses
    FROM "Fund" f WHERE f.id = ${id}
  `;
  return (rows[0] ?? null) as FundDetail | null;
}

export async function createFund(data: {
  name: string; description?: string; color: string; icon: string; budget?: number;
}): Promise<Fund> {
  const rows = await sql`
    INSERT INTO "Fund" (id, name, description, color, icon, budget, "createdAt", "updatedAt")
    VALUES (${crypto.randomUUID()}, ${data.name}, ${data.description ?? null},
            ${data.color}, ${data.icon}, ${data.budget ?? null}, NOW(), NOW())
    RETURNING *
  `;
  revalidatePath("/"); revalidatePath("/funds");
  return rows[0] as Fund;
}

export async function updateFund(id: string, data: {
  name?: string; description?: string; color?: string; icon?: string; budget?: number | null;
}): Promise<Fund> {
  const sets: string[] = ['"updatedAt" = NOW()'];
  const params: unknown[] = [];
  const add = (col: string, val: unknown) => { params.push(val); sets.push(`"${col}" = $${params.length}`); };
  if (data.name !== undefined) add("name", data.name);
  if (data.description !== undefined) add("description", data.description);
  if (data.color !== undefined) add("color", data.color);
  if (data.icon !== undefined) add("icon", data.icon);
  if (data.budget !== undefined) add("budget", data.budget);
  params.push(id);
  const rows = await sql(`UPDATE "Fund" SET ${sets.join(", ")} WHERE id = $${params.length} RETURNING *`, params);
  revalidatePath("/"); revalidatePath("/funds"); revalidatePath(`/funds/${id}`);
  return rows[0] as Fund;
}

export async function deleteFund(id: string) {
  await sql`DELETE FROM "Fund" WHERE id = ${id}`;
  revalidatePath("/"); revalidatePath("/funds");
}

// ─── Categories ──────────────────────────────────────────

export async function getCategories(): Promise<Category[]> {
  return sql`SELECT * FROM "Category" ORDER BY name ASC` as unknown as Promise<Category[]>;
}

export async function createCategory(data: { name: string; color: string; icon: string }): Promise<Category> {
  const rows = await sql`
    INSERT INTO "Category" (id, name, color, icon)
    VALUES (${crypto.randomUUID()}, ${data.name}, ${data.color}, ${data.icon})
    RETURNING *
  `;
  revalidatePath("/expenses");
  return rows[0] as Category;
}

export async function deleteCategory(id: string) {
  await sql`DELETE FROM "Category" WHERE id = ${id}`;
  revalidatePath("/expenses");
}

// ─── Tags ─────────────────────────────────────────────────

export async function getTags(): Promise<TagWithExpenses[]> {
  return sql`
    SELECT t.*,
      COALESCE((
        SELECT json_agg(
          json_build_object('id', e.id, 'amount', e.amount, 'date', e.date)
        )
        FROM "Expense" e WHERE e."tagId" = t.id
      ), '[]') AS expenses
    FROM "Tag" t
    ORDER BY t.name ASC
  ` as unknown as Promise<TagWithExpenses[]>;
}

export async function createTag(data: { name: string; color?: string }): Promise<Tag> {
  const existing = await sql`SELECT * FROM "Tag" WHERE name = ${data.name} LIMIT 1`;
  if (existing[0]) return existing[0] as Tag;
  const rows = await sql`
    INSERT INTO "Tag" (id, name, color, "createdAt")
    VALUES (${crypto.randomUUID()}, ${data.name}, ${data.color ?? "#0ea5e9"}, NOW())
    RETURNING *
  `;
  revalidatePath("/expenses"); revalidatePath("/tags");
  return rows[0] as Tag;
}

export async function deleteTag(id: string) {
  await sql`DELETE FROM "Tag" WHERE id = ${id}`;
  revalidatePath("/expenses"); revalidatePath("/tags");
}

// ─── Expenses ─────────────────────────────────────────────

export async function getExpenses(filters?: {
  fundId?: string; categoryId?: string; tagId?: string;
  search?: string; from?: Date; to?: Date;
}): Promise<ExpenseWithRelations[]> {
  const conds: string[] = [];
  const params: unknown[] = [];
  const p = (v: unknown) => { params.push(v); return `$${params.length}`; };

  if (filters?.fundId) conds.push(`e."fundId" = ${p(filters.fundId)}`);
  if (filters?.categoryId) conds.push(`e."categoryId" = ${p(filters.categoryId)}`);
  if (filters?.tagId) conds.push(`e."tagId" = ${p(filters.tagId)}`);
  if (filters?.search) {
    const pat = p(`%${filters.search}%`);
    conds.push(`(e.description ILIKE ${pat} OR e.note ILIKE ${pat} OR EXISTS (SELECT 1 FROM "Tag" t WHERE t.id = e."tagId" AND t.name ILIKE ${pat}))`);
  }
  if (filters?.from) conds.push(`e.date >= ${p(filters.from)}`);
  if (filters?.to) conds.push(`e.date <= ${p(filters.to)}`);

  const where = conds.length ? `WHERE ${conds.join(" AND ")}` : "";
  return sql(
    `SELECT e.*,
      (SELECT row_to_json(f.*) FROM "Fund" f WHERE f.id = e."fundId") AS fund,
      (SELECT row_to_json(c.*) FROM "Category" c WHERE c.id = e."categoryId") AS category,
      (SELECT row_to_json(t.*) FROM "Tag" t WHERE t.id = e."tagId") AS tag
    FROM "Expense" e ${where}
    ORDER BY e.date DESC`,
    params,
  ) as unknown as Promise<ExpenseWithRelations[]>;
}

export async function createExpense(data: {
  amount: number; description: string; date: Date;
  fundId?: string; categoryId?: string; tagId?: string; note?: string;
}): Promise<Expense> {
  const rows = await sql`
    INSERT INTO "Expense" (id, amount, description, date, "fundId", "categoryId", "tagId", note, "createdAt", "updatedAt")
    VALUES (${crypto.randomUUID()}, ${data.amount}, ${data.description}, ${data.date},
            ${data.fundId ?? null}, ${data.categoryId ?? null}, ${data.tagId ?? null},
            ${data.note ?? null}, NOW(), NOW())
    RETURNING *
  `;
  revalidatePath("/"); revalidatePath("/expenses");
  if (data.fundId) revalidatePath(`/funds/${data.fundId}`);
  revalidatePath("/reports"); revalidatePath("/tags");
  return rows[0] as Expense;
}

export async function updateExpense(id: string, data: {
  amount?: number; description?: string; date?: Date;
  fundId?: string; categoryId?: string | null; tagId?: string | null; note?: string;
}): Promise<Expense> {
  const sets: string[] = ['"updatedAt" = NOW()'];
  const params: unknown[] = [];
  const add = (col: string, val: unknown) => { params.push(val); sets.push(`"${col}" = $${params.length}`); };
  if (data.amount !== undefined) add("amount", data.amount);
  if (data.description !== undefined) add("description", data.description);
  if (data.date !== undefined) add("date", data.date);
  if (data.fundId !== undefined) add("fundId", data.fundId);
  if (data.categoryId !== undefined) add("categoryId", data.categoryId);
  if (data.tagId !== undefined) add("tagId", data.tagId);
  if (data.note !== undefined) add("note", data.note);
  params.push(id);
  const rows = await sql(`UPDATE "Expense" SET ${sets.join(", ")} WHERE id = $${params.length} RETURNING *`, params);
  revalidatePath("/"); revalidatePath("/expenses"); revalidatePath("/reports"); revalidatePath("/tags");
  return rows[0] as Expense;
}

export async function deleteExpense(id: string) {
  const found = await sql`SELECT "fundId" FROM "Expense" WHERE id = ${id}`;
  await sql`DELETE FROM "Expense" WHERE id = ${id}`;
  revalidatePath("/"); revalidatePath("/expenses");
  if (found[0]?.fundId) revalidatePath(`/funds/${found[0].fundId}`);
  revalidatePath("/reports"); revalidatePath("/tags");
}

// ─── Dashboard stats ──────────────────────────────────────

export async function getDashboardStats() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const [monthlyRow, countRow, funds, recentExpenses, trend] = await Promise.all([
    sql`SELECT COALESCE(SUM(amount), 0) AS total FROM "Expense" WHERE date >= ${monthStart} AND date <= ${monthEnd}`,
    sql`SELECT COUNT(*) AS count FROM "Expense"`,
    sql`
      SELECT f.*,
        COALESCE(SUM(e.amount), 0) AS total,
        COALESCE(SUM(CASE WHEN e.date >= ${monthStart} AND e.date <= ${monthEnd} THEN e.amount ELSE 0 END), 0) AS "thisMonth"
      FROM "Fund" f
      LEFT JOIN "Expense" e ON e."fundId" = f.id
      GROUP BY f.id
      ORDER BY f."createdAt" ASC
    `,
    sql`
      SELECT e.*,
        (SELECT row_to_json(f.*) FROM "Fund" f WHERE f.id = e."fundId") AS fund,
        (SELECT row_to_json(c.*) FROM "Category" c WHERE c.id = e."categoryId") AS category,
        (SELECT row_to_json(t.*) FROM "Tag" t WHERE t.id = e."tagId") AS tag
      FROM "Expense" e
      ORDER BY e.date DESC LIMIT 8
    `,
    Promise.all(
      Array.from({ length: 6 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const start = new Date(d.getFullYear(), d.getMonth(), 1);
        const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
        return sql`SELECT COALESCE(SUM(amount), 0) AS amount FROM "Expense" WHERE date >= ${start} AND date <= ${end}`
          .then(rows => ({
            month: d.toLocaleString("default", { month: "short", year: "2-digit" }),
            amount: Number(rows[0].amount),
          }));
      })
    ),
  ]);

  return {
    totalThisMonth: Number(monthlyRow[0].total),
    totalExpenses: Number(countRow[0].count),
    funds: funds.map(f => ({ ...f, total: Number(f.total), thisMonth: Number(f.thisMonth) })) as FundWithStats[],
    recentExpenses: recentExpenses as ExpenseWithRelations[],
    monthlyTrend: trend.reverse(),
  };
}

// ─── Seed ─────────────────────────────────────────────────

export async function seedDatabase() {
  const { CATEGORY_DEFAULTS } = await import("./utils");
  await Promise.all(
    CATEGORY_DEFAULTS.map((cat) =>
      sql`
        INSERT INTO "Category" (id, name, color, icon)
        VALUES (${crypto.randomUUID()}, ${cat.name}, ${cat.color}, ${cat.icon})
        ON CONFLICT (name) DO NOTHING
      `
    )
  );
}

export async function addCategory(data: { name: string; color: string }): Promise<Category> {
  const rows = await sql`
    INSERT INTO "Category" (id, name, color, icon)
    VALUES (${crypto.randomUUID()}, ${data.name}, ${data.color}, 'tag')
    ON CONFLICT (name) DO UPDATE SET color = EXCLUDED.color
    RETURNING *
  `;
  revalidatePath("/expenses");
  return rows[0] as Category;
}
