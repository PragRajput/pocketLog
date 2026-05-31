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
  { name: "Food & Dining", color: "#f97316", icon: "utensils" },
  { name: "Transportation", color: "#0ea5e9", icon: "car" },
  { name: "Shopping", color: "#ec4899", icon: "shopping-bag" },
  { name: "Entertainment", color: "#8b5cf6", icon: "tv" },
  { name: "Healthcare", color: "#ef4444", icon: "heart" },
  { name: "Education", color: "#6366f1", icon: "graduation-cap" },
  { name: "Housing", color: "#22c55e", icon: "home" },
  { name: "Utilities", color: "#eab308", icon: "zap" },
  { name: "Travel", color: "#14b8a6", icon: "map-pin" },
  { name: "Other", color: "#64748b", icon: "tag" },
];
