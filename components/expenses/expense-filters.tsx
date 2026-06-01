"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { X, Search, SlidersHorizontal } from "lucide-react";
import { useCallback, useState, useTransition } from "react";

interface Category { id: string; name: string }
interface Tag { id: string; name: string; color: string }

interface Props { categories: Category[]; tags: Tag[] }

export function ExpenseFilters({ categories, tags }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const update = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      startTransition(() => router.push(`/expenses?${params.toString()}`));
    },
    [router, searchParams]
  );

  const hasFilters = searchParams.size > 0;
  const advancedCount = ["tagId", "categoryId", "from", "to"].filter(
    (k) => searchParams.has(k)
  ).length;

  const filterSelects = (
    <>
      {tags.length > 0 && (
        <Select
          value={searchParams.get("tagId") ?? "all"}
          onValueChange={(v) => update("tagId", v === "all" ? null : v)}
        >
          <SelectTrigger className="w-full md:w-44">
            <SelectValue placeholder="All Tags" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tags</SelectItem>
            {tags.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: t.color }} />
                  #{t.name}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <Select
        value={searchParams.get("categoryId") ?? "all"}
        onValueChange={(v) => update("categoryId", v === "all" ? null : v)}
      >
        <SelectTrigger className="w-full md:w-44">
          <SelectValue placeholder="All Categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {categories.map((c) => (
            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex gap-2 w-full md:w-auto">
        <Input
          type="date"
          className="flex-1 md:w-36"
          value={searchParams.get("from") ?? ""}
          onChange={(e) => update("from", e.target.value || null)}
        />
        <Input
          type="date"
          className="flex-1 md:w-36"
          value={searchParams.get("to") ?? ""}
          onChange={(e) => update("to", e.target.value || null)}
        />
      </div>
    </>
  );

  return (
    <div className="mb-5">
      {/* Search row — always visible */}
      <div className="flex gap-2 mb-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <Input
            placeholder="Search expenses or tags…"
            className="pl-9"
            defaultValue={searchParams.get("search") ?? ""}
            onChange={(e) => {
              const v = e.target.value;
              setTimeout(() => update("search", v || null), 350);
            }}
          />
        </div>

        {/* Mobile: toggle button for advanced filters */}
        <Button
          variant="outline"
          size="icon"
          className="md:hidden flex-shrink-0 relative"
          onClick={() => setShowAdvanced((v) => !v)}
          aria-label="Toggle filters"
        >
          <SlidersHorizontal size={16} />
          {advancedCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">
              {advancedCount}
            </span>
          )}
        </Button>

        {hasFilters && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/expenses")}
            className="flex-shrink-0 text-gray-400 hover:text-red-500"
            aria-label="Clear filters"
          >
            <X size={16} />
          </Button>
        )}
      </div>

      {/* Mobile: collapsible advanced filters */}
      {showAdvanced && (
        <div className="md:hidden grid grid-cols-2 gap-2 mb-2">
          {filterSelects}
        </div>
      )}

      {/* Desktop: always-visible filter row */}
      <div className="hidden md:flex items-center gap-3 flex-wrap">
        {filterSelects}
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/expenses")}
            className="text-gray-500"
          >
            <X size={14} />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
