"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "./db";

// ─── Funds ───────────────────────────────────────────────

export async function getFunds() {
  return prisma.fund.findMany({
    include: { expenses: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function getFund(id: string) {
  return prisma.fund.findUnique({
    where: { id },
    include: { expenses: { include: { category: true, tag: true }, orderBy: { date: "desc" } } },
  });
}

export async function createFund(data: {
  name: string;
  description?: string;
  color: string;
  icon: string;
  budget?: number;
}) {
  const fund = await prisma.fund.create({ data });
  revalidatePath("/");
  revalidatePath("/funds");
  return fund;
}

export async function updateFund(id: string, data: {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
  budget?: number | null;
}) {
  const fund = await prisma.fund.update({ where: { id }, data });
  revalidatePath("/");
  revalidatePath("/funds");
  revalidatePath(`/funds/${id}`);
  return fund;
}

export async function deleteFund(id: string) {
  await prisma.fund.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/funds");
}

// ─── Categories ──────────────────────────────────────────

export async function getCategories() {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}

export async function createCategory(data: { name: string; color: string; icon: string }) {
  const cat = await prisma.category.create({ data });
  revalidatePath("/expenses");
  return cat;
}

export async function deleteCategory(id: string) {
  await prisma.category.delete({ where: { id } });
  revalidatePath("/expenses");
}

// ─── Tags ─────────────────────────────────────────────────

export async function getTags() {
  return prisma.tag.findMany({
    include: { expenses: true },
    orderBy: { name: "asc" },
  });
}

export async function createTag(data: { name: string; color?: string }) {
  const existing = await prisma.tag.findUnique({ where: { name: data.name } });
  if (existing) return existing;
  const tag = await prisma.tag.create({ data: { name: data.name, color: data.color ?? "#0ea5e9" } });
  revalidatePath("/expenses");
  revalidatePath("/tags");
  return tag;
}

export async function deleteTag(id: string) {
  await prisma.tag.delete({ where: { id } });
  revalidatePath("/expenses");
  revalidatePath("/tags");
}

// ─── Expenses ─────────────────────────────────────────────

export async function getExpenses(filters?: {
  fundId?: string;
  categoryId?: string;
  tagId?: string;
  search?: string;
  from?: Date;
  to?: Date;
}) {
  return prisma.expense.findMany({
    where: {
      ...(filters?.fundId && { fundId: filters.fundId }),
      ...(filters?.categoryId && { categoryId: filters.categoryId }),
      ...(filters?.tagId && { tagId: filters.tagId }),
      ...(filters?.search && {
        OR: [
          { description: { contains: filters.search } },
          { tag: { name: { contains: filters.search } } },
          { note: { contains: filters.search } },
        ],
      }),
      ...((filters?.from || filters?.to) && {
        date: {
          ...(filters.from && { gte: filters.from }),
          ...(filters.to && { lte: filters.to }),
        },
      }),
    },
    include: { fund: true, category: true, tag: true },
    orderBy: { date: "desc" },
  });
}

export async function createExpense(data: {
  amount: number;
  description: string;
  date: Date;
  fundId: string;
  categoryId?: string;
  tagId?: string;
  note?: string;
}) {
  const expense = await prisma.expense.create({ data });
  revalidatePath("/");
  revalidatePath("/expenses");
  revalidatePath(`/funds/${data.fundId}`);
  revalidatePath("/reports");
  revalidatePath("/tags");
  return expense;
}

export async function updateExpense(id: string, data: {
  amount?: number;
  description?: string;
  date?: Date;
  fundId?: string;
  categoryId?: string | null;
  tagId?: string | null;
  note?: string;
}) {
  const expense = await prisma.expense.update({ where: { id }, data });
  revalidatePath("/");
  revalidatePath("/expenses");
  revalidatePath("/reports");
  revalidatePath("/tags");
  return expense;
}

export async function deleteExpense(id: string) {
  const expense = await prisma.expense.findUnique({ where: { id } });
  await prisma.expense.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/expenses");
  if (expense) revalidatePath(`/funds/${expense.fundId}`);
  revalidatePath("/reports");
  revalidatePath("/tags");
}

// ─── Dashboard stats ──────────────────────────────────────

export async function getDashboardStats() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const [totalThisMonth, totalExpenses, funds, recentExpenses, monthlyTrend] = await Promise.all([
    prisma.expense.aggregate({
      _sum: { amount: true },
      where: { date: { gte: monthStart, lte: monthEnd } },
    }),
    prisma.expense.count(),
    prisma.fund.findMany({ include: { expenses: true } }),
    prisma.expense.findMany({
      take: 8,
      orderBy: { date: "desc" },
      include: { fund: true, category: true, tag: true },
    }),
    Promise.all(
      Array.from({ length: 6 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const start = new Date(d.getFullYear(), d.getMonth(), 1);
        const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
        return prisma.expense.aggregate({
          _sum: { amount: true },
          where: { date: { gte: start, lte: end } },
        }).then((r) => ({
          month: d.toLocaleString("default", { month: "short", year: "2-digit" }),
          amount: r._sum.amount ?? 0,
        }));
      })
    ),
  ]);

  const fundsWithTotal = funds.map((f) => ({
    ...f,
    total: f.expenses.reduce((s, e) => s + e.amount, 0),
    thisMonth: f.expenses
      .filter((e) => e.date >= monthStart && e.date <= monthEnd)
      .reduce((s, e) => s + e.amount, 0),
  }));

  return {
    totalThisMonth: totalThisMonth._sum.amount ?? 0,
    totalExpenses,
    funds: fundsWithTotal,
    recentExpenses,
    monthlyTrend: monthlyTrend.reverse(),
  };
}

// ─── Seed ─────────────────────────────────────────────────

export async function seedDatabase() {
  const { CATEGORY_DEFAULTS } = await import("./utils");
  const count = await prisma.category.count();
  if (count > 0) return;
  await prisma.category.createMany({ data: CATEGORY_DEFAULTS });
}
