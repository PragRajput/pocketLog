"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger,
} from "@/components/ui/dialog";
import { createTag, updateTag } from "@/lib/actions";
import { toast } from "@/lib/toast";
import { Plus, Pencil } from "lucide-react";

const TAG_COLORS = [
  "#0ea5e9", "#6366f1", "#8b5cf6", "#ec4899", "#ef4444",
  "#f97316", "#eab308", "#22c55e", "#14b8a6", "#64748b",
];

interface TagData {
  id: string; name: string; color: string; note: string | null;
}

interface TagFormProps {
  tag?: TagData;
  trigger?: React.ReactNode;
}

export function TagForm({ tag, trigger }: TagFormProps) {
  const isEdit = !!tag;
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(tag?.name ?? "");
  const [color, setColor] = useState(tag?.color ?? TAG_COLORS[0]);
  const [note, setNote] = useState(tag?.note ?? "");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setError("");

    startTransition(async () => {
      try {
        if (isEdit) {
          await updateTag(tag.id, { name: name.trim(), color, note: note.trim() || null });
          toast({ title: "Tag updated", description: name.trim(), variant: "success" });
        } else {
          await createTag({ name: name.trim(), color, note: note.trim() || undefined });
          toast({ title: "Tag created", description: name.trim(), variant: "success" });
          setName("");
          setColor(TAG_COLORS[0]);
          setNote("");
        }
        setOpen(false);
      } catch {
        setError("A tag with this name already exists.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button>
            <Plus size={16} />
            New Tag
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Tag" : "Create New Tag"}</DialogTitle>
          <DialogDescription className="sr-only">
            Name your tag, pick a color, and optionally add a note.
          </DialogDescription>
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
              Use this to group multiple payments for the same item across any date or category.
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
                  className="h-8 w-8 rounded-full transition-transform hover:scale-110"
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

          <div className="space-y-1.5">
            <Label htmlFor="tagnote">Note (optional)</Label>
            <Textarea
              id="tagnote"
              placeholder="e.g. Total budget ₹15,000 · paid in 3 installments"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} style={{ backgroundColor: color }}>
              {isPending ? "Saving..." : isEdit ? "Save Changes" : "Create Tag"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function EditTagButton({ tag }: { tag: TagData }) {
  return (
    <TagForm
      tag={tag}
      trigger={
        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-indigo-600">
          <Pencil size={14} />
        </Button>
      }
    />
  );
}
