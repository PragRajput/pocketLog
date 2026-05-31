"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { X, Search } from "lucide-react";
import { useCallback, useTransition } from "react";

interface Fund { id: string; name: string; color: string }
interface Category { id: string; name: string }
interface Tag { id: string; name: string; color: string }

interface Props {
  funds: Fund[];
  categories: Category[];
  tags: Tag[];
}

export function ExpenseFilters({ funds, categories, tags }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

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

  return (
    <div className="flex items-center gap-3 mb-5 flex-wrap">
      <div className="relative flex-1 min-w-48">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search expenses or tags..."
          className="pl-9"
          defaultValue={searchParams.get("search") ?? ""}
          onChange={(e) => {
            const v = e.target.value;
            setTimeout(() => update("search", v || null), 350);
          }}
        />
      </div>

      <Select
        value={searchParams.get("fundId") ?? "all"}
        onValueChange={(v) => update("fundId", v === "all" ? null : v)}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="All Funds" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Funds</SelectItem>
          {funds.map((f) => (
            <SelectItem key={f.id} value={f.id}>
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: f.color }} />
                {f.name}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {tags.length > 0 && (
        <Select
          value={searchParams.get("tagId") ?? "all"}
          onValueChange={(v) => update("tagId", v === "all" ? null : v)}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All Tags" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tags</SelectItem>
            {tags.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: t.color }} />
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
        <SelectTrigger className="w-44">
          <SelectValue placeholder="All Categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {categories.map((c) => (
            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        type="date"
        className="w-36"
        value={searchParams.get("from") ?? ""}
        onChange={(e) => update("from", e.target.value || null)}
      />
      <Input
        type="date"
        className="w-36"
        value={searchParams.get("to") ?? ""}
        onChange={(e) => update("to", e.target.value || null)}
      />

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
  );
}
