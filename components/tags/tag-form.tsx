"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { createTag } from "@/lib/actions";
import { Plus } from "lucide-react";
import { FUND_COLORS } from "@/lib/utils";

const TAG_COLORS = [
  "#0ea5e9", "#6366f1", "#8b5cf6", "#ec4899", "#ef4444",
  "#f97316", "#eab308", "#22c55e", "#14b8a6", "#64748b",
];

export function TagForm() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [color, setColor] = useState(TAG_COLORS[0]);
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setError("");

    startTransition(async () => {
      try {
        await createTag({ name: name.trim(), color });
        setName("");
        setColor(TAG_COLORS[0]);
        setOpen(false);
      } catch {
        setError("A tag with this name already exists.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus size={16} />
          New Tag
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Create New Tag</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="tagname">Tag Name</Label>
            <Input
              id="tagname"
              placeholder="e.g. RO Purifier, Bike Repair, Laptop"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(""); }}
              required
              autoFocus
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
            <p className="text-xs text-gray-400">
              Use this to group multiple payments for the same item across any date or fund.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label>Color</Label>
            <div className="flex gap-2 flex-wrap">
              {TAG_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="h-7 w-7 rounded-full transition-transform hover:scale-110"
                  style={{
                    backgroundColor: c,
                    outline: color === c ? `3px solid ${c}` : "none",
                    outlineOffset: "2px",
                  }}
                />
              ))}
            </div>
            {name && (
              <div className="mt-2">
                <span
                  className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium text-white"
                  style={{ backgroundColor: color }}
                >
                  # {name}
                </span>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} style={{ backgroundColor: color }}>
              {isPending ? "Creating..." : "Create Tag"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
