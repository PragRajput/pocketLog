"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { Menu, X, IndianRupee } from "lucide-react";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // close drawer on navigation
  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <>
      {/* Desktop sidebar — always visible */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile sidebar drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          {/* Drawer */}
          <div className="relative z-50 w-64">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 h-14 bg-white border-b border-gray-100 flex items-center px-4 gap-3">
        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600">
            <IndianRupee className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-gray-900 text-sm">Pocketlog</span>
        </div>
      </div>

      {/* Main content */}
      <main className="md:ml-60 min-h-full">
        <div className="p-4 pt-20 md:p-8 md:pt-8">{children}</div>
      </main>
    </>
  );
}
