"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { createExpense, updateExpense, createTag } from "@/lib/actions";
import { toast } from "@/lib/toast";
import { Plus, Pencil, Tag, X } from "lucide-react";
import { format } from "date-fns";

interface Fund { id: string; name: string; color: string }
interface Category { id: string; name: string; color: string }
interface TagType { id: string; name: string; color: string }
interface Expense {
  id: string; amount: number; description: string; date: Date;
  fundId: string; categoryId: string | null; tagId: string | null; note: string | null;
}

interface ExpenseFormProps {
  funds: Fund[];
  categories: Category[];
  tags: TagType[];
  expense?: Expense;
  defaultFundId?: string;
  trigger?: React.ReactNode;
}

export function ExpenseForm({ funds, categories, tags: initialTags, expense, defaultFundId, trigger }: ExpenseFormProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [amount, setAmount] = useState(expense?.amount?.toString() ?? "");
  const [description, setDescription] = useState(expense?.description ?? "");
  const [date, setDate] = useState(
    expense ? format(new Date(expense.date), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd")
  );
  const [fundId, setFundId] = useState(expense?.fundId ?? defaultFundId ?? funds[0]?.id ?? "");
  const [categoryId, setCategoryId] = useState(expense?.categoryId ?? "");
  const [tagId, setTagId] = useState(expense?.tagId ?? "");
  const [note, setNote] = useState(expense?.note ?? "");

  // inline tag creation
  const [tags, setTags] = useState<TagType[]>(initialTags);
  const [newTagName, setNewTagName] = useState("");
  const [showTagInput, setShowTagInput] = useState(false);
  const [creatingTag, startCreatingTag] = useTransition();

  async function handleCreateTag() {
    if (!newTagName.trim()) return;
    startCreatingTag(async () => {
      const tag = await createTag({ name: newTagName.trim() });
      setTags((prev) => [...prev, tag].sort((a, b) => a.name.localeCompare(b.name)));
      setTagId(tag.id);
      setNewTagName("");
      setShowTagInput(false);
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || !description || !fundId) return;

    startTransition(async () => {
      const data = {
        amount: parseFloat(amount),
        description,
        date: new Date(date),
        fundId,
        categoryId: categoryId && categoryId !== "none" ? categoryId : undefined,
        tagId: tagId && tagId !== "none" ? tagId : undefined,
        note: note || undefined,
      };
      if (expense) {
        await updateExpense(expense.id, data);
        toast({ title: "Expense updated", variant: "success" });
      } else {
        await createExpense(data);
        toast({ title: "Expense added", description: `₹${data.amount.toLocaleString("en-IN")} recorded`, variant: "success" });
        setAmount("");
        setDescription("");
        setNote("");
        setTagId("");
        setDate(format(new Date(), "yyyy-MM-dd"));
      }
      setOpen(false);
    });
  }

  const selectedTag = tags.find((t) => t.id === tagId);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button>
            <Plus size={16} />
            Add Expense
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{expense ? "Edit Expense" : "Add New Expense"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="What did you spend on?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Fund</Label>
              <Select value={fundId} onValueChange={setFundId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select fund" />
                </SelectTrigger>
                <SelectContent>
                  {funds.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      <span className="flex items-center gap-2">
                        <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: f.color }} />
                        {f.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Optional" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No category</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tag picker */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5">
              <Tag size={13} className="text-sky-500" />
              Tag <span className="text-gray-400 font-normal">(link payments together)</span>
            </Label>

            {selectedTag ? (
              <div className="flex items-center gap-2">
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium text-white"
                  style={{ backgroundColor: selectedTag.color }}
                >
                  {selectedTag.name}
                </span>
                <button
                  type="button"
                  onClick={() => setTagId("")}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Select value={tagId} onValueChange={(v) => { setTagId(v); setShowTagInput(false); }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select existing tag or create new" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No tag</SelectItem>
                    {tags.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        <span className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: t.color }} />
                          {t.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {!showTagInput ? (
                  <button
                    type="button"
                    onClick={() => setShowTagInput(true)}
                    className="text-xs text-sky-600 hover:text-sky-700 flex items-center gap-1"
                  >
                    <Plus size={12} /> Create new tag
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="e.g. RO Purifier, Bike Repair"
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      className="h-8 text-sm"
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleCreateTag())}
                      autoFocus
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={handleCreateTag}
                      disabled={creatingTag || !newTagName.trim()}
                    >
                      {creatingTag ? "..." : "Add"}
                    </Button>
                    <button type="button" onClick={() => { setShowTagInput(false); setNewTagName(""); }}>
                      <X size={14} className="text-gray-400 hover:text-gray-600" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="note">Note (optional)</Label>
            <Textarea
              id="note"
              placeholder="Additional details..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : expense ? "Update" : "Add Expense"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function EditExpenseButton({ expense, funds, categories, tags }: {
  expense: Expense; funds: Fund[]; categories: Category[]; tags: TagType[];
}) {
  return (
    <ExpenseForm
      expense={expense}
      funds={funds}
      categories={categories}
      tags={tags}
      trigger={
        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-indigo-600">
          <Pencil size={14} />
        </Button>
      }
    />
  );
}
