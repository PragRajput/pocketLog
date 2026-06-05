"use server";

import { revalidatePath } from "next/cache";
import { sql } from "./db";
import { requireUserId } from "./auth-helpers";

// ─── Types ────────────────────────────────────────────────

export type Category = { id: string; name: string; color: string; icon: string };
export type Tag = { id: string; name: string; color: string; note: string | null; createdAt: Date };
export type Expense = {
  id: string; amount: number; description: string; date: Date;
  categoryId: string | null; tagId: string | null;
  note: string | null; paymentMethod: string | null;
  payeeVpa: string | null; payeeName: string | null;
  createdAt: Date; updatedAt: Date;
};
export type ExpenseWithRelations = Expense & {
  category: Category | null; tag: Tag | null;
};
export type TagWithExpenses = Tag & { expenses: Pick<Expense, "id" | "amount" | "date">[] };

export type PendingPayment = {
  id: string; amount: number; description: string;
  payeeVpa: string | null; payeeName: string | null;
  categoryId: string | null; tagId: string | null;
  note: string | null; paymentMethod: string | null; createdAt: Date;
};
export type RecentPayee = { vpa: string; name: string | null };

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
  const userId = await requireUserId();
  return sql`
    SELECT t.*,
      COALESCE((
        SELECT json_agg(json_build_object('id', e.id, 'amount', e.amount, 'date', e.date))
        FROM "Expense" e WHERE e."tagId" = t.id AND e."userId" = ${userId}
      ), '[]') AS expenses
    FROM "Tag" t WHERE t."userId" = ${userId}
    ORDER BY t.name ASC
  ` as unknown as Promise<TagWithExpenses[]>;
}

export async function createTag(data: { name: string; color?: string; note?: string }): Promise<Tag> {
  const userId = await requireUserId();
  const existing = await sql`SELECT * FROM "Tag" WHERE name = ${data.name} AND "userId" = ${userId} LIMIT 1`;
  if (existing[0]) return existing[0] as Tag;
  const rows = await sql`
    INSERT INTO "Tag" (id, name, color, note, "userId", "createdAt")
    VALUES (${crypto.randomUUID()}, ${data.name}, ${data.color ?? "#0ea5e9"}, ${data.note ?? null}, ${userId}, NOW())
    RETURNING *
  `;
  revalidatePath("/expenses"); revalidatePath("/tags");
  return rows[0] as Tag;
}

export async function updateTag(id: string, data: { name?: string; color?: string; note?: string | null }): Promise<Tag> {
  const userId = await requireUserId();
  const sets: string[] = [];
  const params: unknown[] = [];
  const add = (col: string, val: unknown) => { params.push(val); sets.push(`"${col}" = $${params.length}`); };
  if (data.name !== undefined) add("name", data.name);
  if (data.color !== undefined) add("color", data.color);
  if (data.note !== undefined) add("note", data.note);
  if (sets.length === 0) {
    const rows = await sql`SELECT * FROM "Tag" WHERE id = ${id} AND "userId" = ${userId} LIMIT 1`;
    return rows[0] as Tag;
  }
  params.push(id); params.push(userId);
  const rows = await sql(
    `UPDATE "Tag" SET ${sets.join(", ")} WHERE id = $${params.length - 1} AND "userId" = $${params.length} RETURNING *`,
    params,
  );
  revalidatePath("/expenses"); revalidatePath("/tags");
  return rows[0] as Tag;
}

export async function deleteTag(id: string) {
  const userId = await requireUserId();
  await sql`DELETE FROM "Tag" WHERE id = ${id} AND "userId" = ${userId}`;
  revalidatePath("/expenses"); revalidatePath("/tags");
}

// ─── Expenses ─────────────────────────────────────────────

export async function getExpenses(filters?: {
  categoryId?: string; tagId?: string; tagMode?: "eq" | "ne";
  search?: string; from?: Date; to?: Date;
}): Promise<ExpenseWithRelations[]> {
  const userId = await requireUserId();
  const params: unknown[] = [userId];
  const conds: string[] = [`e."userId" = $1`];
  const p = (v: unknown) => { params.push(v); return `$${params.length}`; };

  if (filters?.categoryId) conds.push(`e."categoryId" = ${p(filters.categoryId)}`);
  if (filters?.tagId) {
    // "ne" keeps untagged expenses and any other tag; only the chosen tag is excluded.
    conds.push(
      filters.tagMode === "ne"
        ? `e."tagId" IS DISTINCT FROM ${p(filters.tagId)}`
        : `e."tagId" = ${p(filters.tagId)}`,
    );
  }
  if (filters?.search) {
    const pat = p(`%${filters.search}%`);
    conds.push(`(e.description ILIKE ${pat} OR e.note ILIKE ${pat} OR EXISTS (SELECT 1 FROM "Tag" t WHERE t.id = e."tagId" AND t.name ILIKE ${pat}))`);
  }
  if (filters?.from) conds.push(`e.date >= ${p(filters.from)}`);
  if (filters?.to) conds.push(`e.date <= ${p(filters.to)}`);

  return sql(
    `SELECT e.*,
      (SELECT row_to_json(c.*) FROM "Category" c WHERE c.id = e."categoryId") AS category,
      (SELECT row_to_json(t.*) FROM "Tag" t WHERE t.id = e."tagId") AS tag
    FROM "Expense" e WHERE ${conds.join(" AND ")}
    ORDER BY e."createdAt" DESC`,
    params,
  ) as unknown as Promise<ExpenseWithRelations[]>;
}

export async function createExpense(data: {
  amount: number; description: string; date: Date;
  categoryId?: string; tagId?: string; note?: string; paymentMethod?: string;
  payeeVpa?: string; payeeName?: string;
}): Promise<Expense> {
  const userId = await requireUserId();
  const rows = await sql`
    INSERT INTO "Expense" (id, amount, description, date, "categoryId", "tagId", note, "paymentMethod", "payeeVpa", "payeeName", "userId", "createdAt", "updatedAt")
    VALUES (${crypto.randomUUID()}, ${data.amount}, ${data.description}, ${data.date},
            ${data.categoryId ?? null}, ${data.tagId ?? null},
            ${data.note ?? null}, ${data.paymentMethod ?? null},
            ${data.payeeVpa ?? null}, ${data.payeeName ?? null}, ${userId}, NOW(), NOW())
    RETURNING *
  `;
  revalidatePath("/"); revalidatePath("/expenses"); revalidatePath("/reports"); revalidatePath("/tags");
  return rows[0] as Expense;
}

export async function updateExpense(id: string, data: {
  amount?: number; description?: string; date?: Date;
  categoryId?: string | null; tagId?: string | null; note?: string; paymentMethod?: string | null;
}): Promise<Expense> {
  const userId = await requireUserId();
  const sets: string[] = ['"updatedAt" = NOW()'];
  const params: unknown[] = [];
  const add = (col: string, val: unknown) => { params.push(val); sets.push(`"${col}" = $${params.length}`); };
  if (data.amount !== undefined) add("amount", data.amount);
  if (data.description !== undefined) add("description", data.description);
  if (data.date !== undefined) add("date", data.date);
  if (data.categoryId !== undefined) add("categoryId", data.categoryId);
  if (data.tagId !== undefined) add("tagId", data.tagId);
  if (data.note !== undefined) add("note", data.note);
  if (data.paymentMethod !== undefined) add("paymentMethod", data.paymentMethod);
  params.push(id); params.push(userId);
  const rows = await sql(`UPDATE "Expense" SET ${sets.join(", ")} WHERE id = $${params.length - 1} AND "userId" = $${params.length} RETURNING *`, params);
  revalidatePath("/"); revalidatePath("/expenses"); revalidatePath("/reports"); revalidatePath("/tags");
  return rows[0] as Expense;
}

export async function deleteExpense(id: string) {
  const userId = await requireUserId();
  await sql`DELETE FROM "Expense" WHERE id = ${id} AND "userId" = ${userId}`;
  revalidatePath("/"); revalidatePath("/expenses"); revalidatePath("/reports"); revalidatePath("/tags");
}

// ─── UPI Pay: pending payments + recent payees ────────────

export async function getPendingPayments(): Promise<PendingPayment[]> {
  const userId = await requireUserId();
  return sql`
    SELECT * FROM "PendingPayment" WHERE "userId" = ${userId} ORDER BY "createdAt" DESC
  ` as unknown as Promise<PendingPayment[]>;
}

export async function createPendingPayment(data: {
  amount: number; description: string;
  payeeVpa?: string; payeeName?: string;
  categoryId?: string; tagId?: string; note?: string; paymentMethod?: string;
}): Promise<PendingPayment> {
  const userId = await requireUserId();
  const rows = await sql`
    INSERT INTO "PendingPayment" (id, amount, description, "payeeVpa", "payeeName", "categoryId", "tagId", note, "paymentMethod", "userId", "createdAt")
    VALUES (${crypto.randomUUID()}, ${data.amount}, ${data.description},
            ${data.payeeVpa ?? null}, ${data.payeeName ?? null},
            ${data.categoryId ?? null}, ${data.tagId ?? null},
            ${data.note ?? null}, ${data.paymentMethod ?? null}, ${userId}, NOW())
    RETURNING *
  `;
  revalidatePath("/"); revalidatePath("/expenses");
  return rows[0] as PendingPayment;
}

// Confirm a pending payment → turn it into a real expense and remove the pending row.
export async function confirmPendingPayment(id: string): Promise<void> {
  const userId = await requireUserId();
  const rows = await sql`SELECT * FROM "PendingPayment" WHERE id = ${id} AND "userId" = ${userId} LIMIT 1`;
  const pp = rows[0] as PendingPayment | undefined;
  if (!pp) return;
  await sql`
    INSERT INTO "Expense" (id, amount, description, date, "categoryId", "tagId", note, "paymentMethod", "payeeVpa", "payeeName", "userId", "createdAt", "updatedAt")
    VALUES (${crypto.randomUUID()}, ${pp.amount}, ${pp.description}, NOW(),
            ${pp.categoryId ?? null}, ${pp.tagId ?? null},
            ${pp.note ?? null}, ${pp.paymentMethod ?? null},
            ${pp.payeeVpa ?? null}, ${pp.payeeName ?? null}, ${userId}, NOW(), NOW())
  `;
  await sql`DELETE FROM "PendingPayment" WHERE id = ${id} AND "userId" = ${userId}`;
  revalidatePath("/"); revalidatePath("/expenses"); revalidatePath("/reports"); revalidatePath("/tags");
}

export async function deletePendingPayment(id: string): Promise<void> {
  const userId = await requireUserId();
  await sql`DELETE FROM "PendingPayment" WHERE id = ${id} AND "userId" = ${userId}`;
  revalidatePath("/"); revalidatePath("/expenses");
}

// Distinct payees from confirmed expenses, most-recently-used first.
export async function getRecentPayees(): Promise<RecentPayee[]> {
  const userId = await requireUserId();
  return sql`
    SELECT "payeeVpa" AS vpa,
           (array_agg("payeeName" ORDER BY "createdAt" DESC))[1] AS name
    FROM "Expense"
    WHERE "userId" = ${userId} AND "payeeVpa" IS NOT NULL AND "payeeVpa" <> ''
    GROUP BY "payeeVpa"
    ORDER BY MAX("createdAt") DESC
    LIMIT 12
  ` as unknown as Promise<RecentPayee[]>;
}

// ─── Dashboard stats ──────────────────────────────────────

export async function getDashboardStats() {
  const userId = await requireUserId();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  // Oldest month shown in the 6-month trend.
  const trendStart = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [scalarRow, recentExpenses, trendRows, byCategoryRows] = await Promise.all([
    // All-time count/avg + this-month total in a single pass.
    sql`
      SELECT
        COUNT(*) AS count,
        COALESCE(AVG(amount), 0) AS avg,
        COALESCE(SUM(amount) FILTER (WHERE date >= ${monthStart} AND date <= ${monthEnd}), 0) AS month_total
      FROM "Expense" WHERE "userId" = ${userId}
    `,
    sql`
      SELECT e.*,
        (SELECT row_to_json(c.*) FROM "Category" c WHERE c.id = e."categoryId") AS category,
        (SELECT row_to_json(t.*) FROM "Tag" t WHERE t.id = e."tagId") AS tag
      FROM "Expense" e WHERE e."userId" = ${userId}
      ORDER BY e."createdAt" DESC LIMIT 8
    `,
    // Whole 6-month trend in one grouped query instead of 6 round-trips.
    sql`
      SELECT date_trunc('month', date) AS month, COALESCE(SUM(amount), 0) AS amount
      FROM "Expense"
      WHERE "userId" = ${userId} AND date >= ${trendStart} AND date <= ${monthEnd}
      GROUP BY 1
    `,
    // Top categories this month
    sql`
      SELECT c.name, c.color, COALESCE(SUM(e.amount), 0) AS total, COUNT(e.id) AS count
      FROM "Category" c
      JOIN "Expense" e ON e."categoryId" = c.id
      WHERE e."userId" = ${userId} AND e.date >= ${monthStart} AND e.date <= ${monthEnd}
      GROUP BY c.id, c.name, c.color
      ORDER BY total DESC
      LIMIT 5
    `,
  ]);

  // Map grouped sums back onto a fixed 6-slot (oldest → newest) timeline,
  // filling months with no spending as 0.
  const trendByMonth = new Map(
    (trendRows as { month: string; amount: number }[]).map(r => [
      new Date(r.month).getFullYear() * 12 + new Date(r.month).getMonth(),
      Number(r.amount),
    ]),
  );
  const monthlyTrend = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    return {
      month: d.toLocaleString("default", { month: "short", year: "2-digit" }),
      amount: trendByMonth.get(d.getFullYear() * 12 + d.getMonth()) ?? 0,
    };
  });

  return {
    totalThisMonth: Number(scalarRow[0].month_total),
    totalExpenses: Number(scalarRow[0].count),
    avgExpense: Number(scalarRow[0].avg),
    recentExpenses: recentExpenses as ExpenseWithRelations[],
    monthlyTrend,
    topCategories: (byCategoryRows as { name: string; color: string; total: number; count: number }[])
      .map(r => ({ name: r.name, color: r.color, total: Number(r.total), count: Number(r.count) })),
  };
}

// ─── Seed ─────────────────────────────────────────────────

// Runs from the root layout on every request, so it must be cheap and safe:
// it skips work once seeded, and never throws (a transient DB outage should
// degrade gracefully, not 500 the entire app).
let categoriesSeeded = false;

export async function seedDatabase() {
  if (categoriesSeeded) return;
  try {
    const existing = await sql`SELECT 1 FROM "Category" LIMIT 1`;
    if (existing.length > 0) {
      categoriesSeeded = true;
      return;
    }
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
    categoriesSeeded = true;
  } catch (err) {
    // Best-effort: leave categoriesSeeded false so a later request can retry.
    console.error("seedDatabase skipped (DB unavailable):", err);
  }
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
