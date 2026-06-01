import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  return format(new Date(date), "dd MMM yyyy");
}

export function formatDateShort(date: Date | string): string {
  return format(new Date(date), "dd MMM");
}

export function getMonthRange(monthsAgo = 0) {
  const d = subMonths(new Date(), monthsAgo);
  return { start: startOfMonth(d), end: endOfMonth(d) };
}

export const FUND_COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#ef4444",
  "#f97316", "#eab308", "#22c55e", "#14b8a6",
  "#0ea5e9", "#64748b",
];

export const FUND_ICONS = [
  "wallet", "home", "wrench", "heart", "graduation-cap",
  "car", "utensils", "shopping-bag", "gift", "zap",
];

export const CATEGORY_DEFAULTS = [
  { name: "Groceries", color: "#22c55e", icon: "shopping-cart" },
  { name: "Dining Out", color: "#f97316", icon: "utensils" },
  { name: "Petrol / Fuel", color: "#f59e0b", icon: "fuel" },
  { name: "Auto / Cab", color: "#0ea5e9", icon: "car" },
  { name: "Electricity Bill", color: "#eab308", icon: "zap" },
  { name: "Mobile / Internet", color: "#8b5cf6", icon: "smartphone" },
  { name: "Medical", color: "#ef4444", icon: "heart" },
  { name: "Education", color: "#6366f1", icon: "graduation-cap" },
  { name: "Clothing", color: "#ec4899", icon: "shopping-bag" },
  { name: "Entertainment", color: "#a855f7", icon: "tv" },
  { name: "Rent", color: "#14b8a6", icon: "home" },
  { name: "Household", color: "#84cc16", icon: "wrench" },
  { name: "Money Transfer", color: "#06b6d4", icon: "send" },
  { name: "Investment", color: "#10b981", icon: "trending-up" },
  { name: "Other", color: "#64748b", icon: "tag" },
];

// ─── EMI helpers ──────────────────────────────────────────

export function getInstallmentNo(emi: { startMonth: number; startYear: number }, month: number, year: number) {
  return (year - emi.startYear) * 12 + (month - emi.startMonth) + 1;
}

export function isEMIActiveForMonth(
  emi: { startMonth: number; startYear: number; tenure: number; status: string; closedAt: Date | null },
  month: number,
  year: number
) {
  const no = getInstallmentNo(emi, month, year);
  if (no < 1 || no > emi.tenure) return false;
  if (emi.status === "closed" && emi.closedAt) {
    const closed = new Date(emi.closedAt);
    if (year > closed.getFullYear() || (year === closed.getFullYear() && month > closed.getMonth() + 1)) {
      return false;
    }
  }
  return true;
}
