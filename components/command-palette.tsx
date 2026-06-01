"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog, DialogContent, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  LayoutDashboard, Receipt, CreditCard, BarChart3, Tag,
  Search, ArrowRight, Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";

const PAGES = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard, keywords: ["home", "overview"] },
  { label: "Expenses", href: "/expenses", icon: Receipt, keywords: ["transactions", "list"] },
  { label: "EMIs", href: "/emis", icon: CreditCard, keywords: ["loan", "installment"] },
  { label: "Tags", href: "/tags", icon: Tag, keywords: ["labels", "group"] },
  { label: "Reports", href: "/reports", icon: BarChart3, keywords: ["analytics", "chart"] },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const router = useRouter();
  const [, startTransition] = useTransition();

  // Cmd+K / Ctrl+K to open
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // reset on open
  useEffect(() => {
    if (open) { setQuery(""); setActiveIdx(0); }
  }, [open]);

  const q = query.toLowerCase().trim();

  const pageResults = PAGES.filter(
    (p) =>
      !q ||
      p.label.toLowerCase().includes(q) ||
      p.keywords.some((k) => k.includes(q))
  );

  const searchAction = q
    ? [{ label: `Search expenses for "${query}"`, href: `/expenses?search=${encodeURIComponent(query)}`, icon: Search }]
    : [];

  const addAction = q
    ? []
    : [{ label: "Add new expense", href: "/__add_expense__", icon: Plus }];

  const allResults = [...addAction, ...pageResults, ...searchAction];

  function go(href: string) {
    setOpen(false);
    if (href === "/__add_expense__") {
      // navigate to expenses and programmatically open form isn't trivial;
      // just navigate to expenses page
      startTransition(() => router.push("/expenses?add=1"));
    } else {
      startTransition(() => router.push(href));
    }
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, allResults.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && allResults[activeIdx]) {
      go(allResults[activeIdx].href);
    }
  }

  return (
    <>
      {/* Trigger hint in sidebar — desktop only */}
      <button
        onClick={() => setOpen(true)}
        className="hidden md:flex fixed bottom-14 left-3 right-3 w-[calc(15rem-1.5rem)] items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-400 hover:border-gray-300 hover:text-gray-600 transition-colors z-20"
        style={{ width: "calc(15rem - 1.5rem)" }}
      >
        <Search size={13} />
        <span className="flex-1 text-left">Search…</span>
        <kbd className="text-[10px] font-mono bg-gray-100 px-1.5 py-0.5 rounded">⌘K</kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 gap-0 max-w-lg overflow-hidden">
          <DialogTitle className="sr-only">Command palette</DialogTitle>
          <DialogDescription className="sr-only">
            Search pages and expenses, or jump to an action.
          </DialogDescription>
          {/* Search input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
            <Search className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <input
              autoFocus
              className="flex-1 text-sm text-gray-900 placeholder:text-gray-400 outline-none bg-transparent"
              placeholder="Search pages, expenses…"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setActiveIdx(0); }}
              onKeyDown={onKeyDown}
            />
            <kbd className="text-[10px] font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded hidden sm:block">
              esc
            </kbd>
          </div>

          {/* Results */}
          <div className="max-h-80 overflow-y-auto py-1.5">
            {allResults.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No results</p>
            ) : (
              allResults.map((item, i) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.href + item.label}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left",
                      i === activeIdx
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-gray-700 hover:bg-gray-50"
                    )}
                    onMouseEnter={() => setActiveIdx(i)}
                    onClick={() => go(item.href)}
                  >
                    <Icon
                      size={15}
                      className={i === activeIdx ? "text-indigo-500" : "text-gray-400"}
                    />
                    <span className="flex-1">{item.label}</span>
                    <ArrowRight size={13} className="text-gray-300" />
                  </button>
                );
              })
            )}
          </div>

          <div className="border-t border-gray-100 px-4 py-2 flex items-center gap-3 text-[11px] text-gray-400">
            <span><kbd className="font-mono">↑↓</kbd> navigate</span>
            <span><kbd className="font-mono">↵</kbd> open</span>
            <span><kbd className="font-mono">esc</kbd> close</span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
