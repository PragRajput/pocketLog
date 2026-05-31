"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  Wallet,
  BarChart3,
  IndianRupee,
  Tag,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/expenses", label: "Expenses", icon: Receipt },
  { href: "/funds", label: "Funds", icon: Wallet },
  { href: "/tags", label: "Tags", icon: Tag },
  { href: "/reports", label: "Reports", icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop sidebar */}
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

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                  active
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <Icon className={cn("h-4.5 w-4.5", active ? "text-indigo-600" : "text-gray-400")} size={18} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100">
          <p className="text-xs text-gray-400">Track every rupee.</p>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-100 flex items-center px-4 z-30">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600">
            <IndianRupee className="h-4 w-4 text-white" />
          </div>
          <p className="font-bold text-gray-900 text-sm">Pocketlog</p>
        </div>
      </header>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-30 flex">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors",
                active ? "text-indigo-600" : "text-gray-400"
              )}
            >
              <Icon size={20} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
