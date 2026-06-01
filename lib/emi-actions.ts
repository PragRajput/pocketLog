"use server";

import { revalidatePath } from "next/cache";
import { sql } from "./db";

// ─── Types ────────────────────────────────────────────────

type EMIPayment = {
  id: string; emiId: string; month: number; year: number;
  installmentNo: number; paidAt: Date; createdAt: Date;
};
type Fund = { id: string; name: string; color: string; icon: string; budget: number | null; description: string | null; createdAt: Date; updatedAt: Date };
type EMI = {
  id: string; name: string; lender: string | null; amount: number; tenure: number;
  startMonth: number; startYear: number; processingFee: number | null;
  gstOnFee: number | null; otherCharges: number | null; otherChargesNote: string | null;
  note: string | null; status: string; closedAt: Date | null; fundId: string | null;
  createdAt: Date; updatedAt: Date;
};

export type EMIWithPayments = EMI & { payments: EMIPayment[]; fund: Fund | null };

// ─── Queries ──────────────────────────────────────────────

export async function getEMIs(): Promise<EMIWithPayments[]> {
  return sql`
    SELECT e.*,
      COALESCE((
        SELECT json_agg(p.* ORDER BY p.year, p.month)
        FROM "EMIPayment" p WHERE p."emiId" = e.id
      ), '[]') AS payments,
      (SELECT row_to_json(f.*) FROM "Fund" f WHERE f.id = e."fundId") AS fund
    FROM "EMI" e
    ORDER BY e."createdAt" ASC
  ` as unknown as Promise<EMIWithPayments[]>;
}

export async function getActiveEMIs(): Promise<EMIWithPayments[]> {
  return sql`
    SELECT e.*,
      COALESCE((
        SELECT json_agg(p.* ORDER BY p.year, p.month)
        FROM "EMIPayment" p WHERE p."emiId" = e.id
      ), '[]') AS payments,
      (SELECT row_to_json(f.*) FROM "Fund" f WHERE f.id = e."fundId") AS fund
    FROM "EMI" e
    WHERE e.status = 'active'
    ORDER BY e."createdAt" ASC
  ` as unknown as Promise<EMIWithPayments[]>;
}

export async function createEMI(data: {
  name: string; lender?: string; amount: number; tenure: number;
  startMonth: number; startYear: number; processingFee?: number;
  gstOnFee?: number; otherCharges?: number; otherChargesNote?: string;
  fundId?: string; note?: string;
}) {
  const rows = await sql`
    INSERT INTO "EMI" (id, name, lender, amount, tenure, "startMonth", "startYear",
                       "processingFee", "gstOnFee", "otherCharges", "otherChargesNote",
                       note, status, "fundId", "createdAt", "updatedAt")
    VALUES (
      ${crypto.randomUUID()}, ${data.name}, ${data.lender ?? null}, ${data.amount},
      ${data.tenure}, ${data.startMonth}, ${data.startYear},
      ${data.processingFee ?? null}, ${data.gstOnFee ?? null},
      ${data.otherCharges ?? null}, ${data.otherChargesNote ?? null},
      ${data.note ?? null}, 'active', ${data.fundId ?? null}, NOW(), NOW()
    )
    RETURNING *
  `;
  revalidatePath("/"); revalidatePath("/emis");
  return rows[0];
}

export async function updateEMI(id: string, data: {
  name?: string; lender?: string; amount?: number; tenure?: number;
  startMonth?: number; startYear?: number; processingFee?: number | null;
  gstOnFee?: number | null; otherCharges?: number | null; otherChargesNote?: string;
  fundId?: string | null; note?: string;
}) {
  const sets: string[] = ['"updatedAt" = NOW()'];
  const params: unknown[] = [];
  const add = (col: string, val: unknown) => { params.push(val); sets.push(`"${col}" = $${params.length}`); };
  if (data.name !== undefined) add("name", data.name);
  if (data.lender !== undefined) add("lender", data.lender);
  if (data.amount !== undefined) add("amount", data.amount);
  if (data.tenure !== undefined) add("tenure", data.tenure);
  if (data.startMonth !== undefined) add("startMonth", data.startMonth);
  if (data.startYear !== undefined) add("startYear", data.startYear);
  if (data.processingFee !== undefined) add("processingFee", data.processingFee);
  if (data.gstOnFee !== undefined) add("gstOnFee", data.gstOnFee);
  if (data.otherCharges !== undefined) add("otherCharges", data.otherCharges);
  if (data.otherChargesNote !== undefined) add("otherChargesNote", data.otherChargesNote);
  if (data.fundId !== undefined) add("fundId", data.fundId);
  if (data.note !== undefined) add("note", data.note);
  params.push(id);
  const rows = await sql(`UPDATE "EMI" SET ${sets.join(", ")} WHERE id = $${params.length} RETURNING *`, params);
  revalidatePath("/"); revalidatePath("/emis");
  return rows[0];
}

export async function deleteEMI(id: string) {
  await sql`DELETE FROM "EMI" WHERE id = ${id}`;
  revalidatePath("/"); revalidatePath("/emis");
}

export async function markEMIPaid(emiId: string, month: number, year: number, installmentNo: number) {
  await sql`
    INSERT INTO "EMIPayment" (id, "emiId", month, year, "installmentNo", "paidAt", "createdAt")
    VALUES (${crypto.randomUUID()}, ${emiId}, ${month}, ${year}, ${installmentNo}, NOW(), NOW())
    ON CONFLICT ("emiId", month, year) DO UPDATE SET "paidAt" = NOW()
  `;
  revalidatePath("/"); revalidatePath("/emis");
}

export async function unmarkEMIPaid(emiId: string, month: number, year: number) {
  await sql`DELETE FROM "EMIPayment" WHERE "emiId" = ${emiId} AND month = ${month} AND year = ${year}`;
  revalidatePath("/"); revalidatePath("/emis");
}

export async function closeEMI(id: string) {
  await sql`UPDATE "EMI" SET status = 'closed', "closedAt" = NOW(), "updatedAt" = NOW() WHERE id = ${id}`;
  revalidatePath("/"); revalidatePath("/emis");
}

export async function reopenEMI(id: string) {
  await sql`UPDATE "EMI" SET status = 'active', "closedAt" = NULL, "updatedAt" = NOW() WHERE id = ${id}`;
  revalidatePath("/"); revalidatePath("/emis");
}
