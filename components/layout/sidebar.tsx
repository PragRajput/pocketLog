"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard, Receipt, BarChart3,
  IndianRupee, Tag, CreditCard, Settings, LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UserMenu } from "./user-menu";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/expenses", label: "Expenses", icon: Receipt },
  { href: "/emis", label: "EMIs", icon: CreditCard },
  { href: "/tags", label: "Tags", icon: Tag },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

// Bottom tab bar shows the 5 primary routes, with Dashboard in the center slot.
const tabOrder = ["/emis", "/expenses", "/", "/tags", "/reports"];
const tabItems = tabOrder.map((href) => navItems.find((n) => n.href === href)!);

interface SidebarProps {
  user?: { name?: string | null; email?: string | null };
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      {/* ── Desktop sidebar ─────────────────────────────── */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-60 bg-white border-r border-gray-100 flex-col z-30">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-gray-100">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 shadow-sm">
            <IndianRupee className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm leading-tight">Pocketlog</p>
            <p className="text-xs text-gray-400 leading-tight">Personal Finance</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all group",
                  active
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <span
                  className={cn(
                    "absolute left-0 h-6 w-1 rounded-r-full bg-indigo-600 transition-all",
                    active ? "opacity-100" : "opacity-0"
                  )}
                  aria-hidden
                />
                <Icon
                  className={cn(
                    "flex-shrink-0",
                    active ? "text-indigo-600" : "text-gray-400 group-hover:text-gray-600"
                  )}
                  size={18}
                />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* User + Footer */}
        <div className="px-3 py-3 border-t border-gray-100">
          {user && <UserMenu name={user.name} email={user.email} />}
        </div>
      </aside>

      {/* ── Mobile top bar ──────────────────────────────── */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-100 flex items-center justify-between px-4 z-30">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600">
            <IndianRupee className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-gray-900 text-sm">Pocketlog</span>
        </div>

        <div className="flex items-center gap-1">
          <Link
            href="/settings"
            aria-label="Settings"
            className={cn(
              "p-2 rounded-lg transition-colors",
              isActive("/settings") ? "text-indigo-600 bg-indigo-50" : "text-gray-500 hover:bg-gray-100"
            )}
          >
            <Settings className="h-5 w-5" />
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            aria-label="Sign out"
            className="p-2 rounded-lg text-gray-500 hover:text-red-500 hover:bg-gray-100 transition-colors"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* ── Mobile bottom tab bar (5 primary routes) ────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-gray-100 z-30 flex pb-[env(safe-area-inset-bottom)]">
        {tabItems.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 transition-colors min-w-0 active:bg-gray-50",
                active ? "text-indigo-600" : "text-gray-400"
              )}
            >
              <Icon size={22} strokeWidth={active ? 2.2 : 1.8} />
              <span className={cn("text-[10px] font-medium truncate", active ? "font-semibold" : "")}>
                {label}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
