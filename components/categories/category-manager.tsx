"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { addCategory, deleteCategory } from "@/lib/actions";
import { toast } from "@/lib/toast";
import { Plus, Trash2, X } from "lucide-react";

const PRESET_COLORS = [
  "#22c55e", "#f97316", "#f59e0b", "#0ea5e9", "#eab308",
  "#8b5cf6", "#ef4444", "#6366f1", "#ec4899", "#a855f7",
  "#14b8a6", "#84cc16", "#06b6d4", "#10b981", "#64748b",
];

interface Category { id: string; name: string; color: string }

export function CategoryManager({ categories: initial }: { categories: Category[] }) {
  const [categories, setCategories] = useState(initial);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]);
  const [adding, startAdding] = useTransition();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, startDeleting] = useTransition();

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    startAdding(async () => {
      const cat = await addCategory({ name: newName.trim(), color: newColor });
      setCategories(prev => {
        const exists = prev.find(c => c.id === cat.id);
        if (exists) return prev;
        return [...prev, cat].sort((a, b) => a.name.localeCompare(b.name));
      });
      toast({ title: "Category added", description: newName.trim(), variant: "success" });
      setNewName("");
    });
  }

  function handleDelete() {
    if (!deleteId) return;
    startDeleting(async () => {
      await deleteCategory(deleteId);
      setCategories(prev => prev.filter(c => c.id !== deleteId));
      toast({ title: "Category deleted", variant: "info" });
      setDeleteId(null);
    });
  }

  const toDelete = categories.find(c => c.id === deleteId);

  return (
    <div className="space-y-4">
      {/* Add new */}
      <form onSubmit={handleAdd} className="flex items-center gap-2">
        <div className="flex gap-1.5">
          {PRESET_COLORS.map(c => (
            <button
              key={c} type="button"
              onClick={() => setNewColor(c)}
              className="h-6 w-6 rounded-full flex-shrink-0 transition-transform hover:scale-110"
              style={{
                backgroundColor: c,
                outline: newColor === c ? `3px solid ${c}` : "none",
                outlineOffset: "2px",
              }}
            />
          ))}
        </div>
        <Input
          placeholder="New category name…"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          className="flex-1 min-w-0"
        />
        <Button type="submit" disabled={adding || !newName.trim()} size="sm">
          <Plus size={14} />
          Add
        </Button>
      </form>

      {/* List */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {categories.map(cat => (
          <div
            key={cat.id}
            className="flex items-center justify-between gap-2 rounded-lg border border-gray-100 px-3 py-2 group hover:border-gray-200 transition-colors"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
              <span className="text-sm text-gray-700 truncate">{cat.name}</span>
            </div>
            <button
              onClick={() => setDeleteId(cat.id)}
              className="text-gray-300 hover:text-red-400 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={13} />
            </button>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={open => !open && setDeleteId(null)}
        title={`Delete "${toDelete?.name}"?`}
        description="Expenses using this category will become uncategorised. This cannot be undone."
        confirmLabel="Delete Category"
        onConfirm={handleDelete}
        isPending={deleting}
      />
    </div>
  );
}
