"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { createExpense } from "@/lib/actions";
import { toast } from "@/lib/toast";
import { Check } from "lucide-react";

interface Category { id: string; name: string }
interface TagType { id: string; name: string; color: string }

interface Props {
  categories: Category[];
  tags: TagType[];
  defaultAmount: string;
  defaultDescription: string;
  defaultPaymentMethod: string;
  rawText: string;
}

export function ShareExpenseForm({ categories, tags, defaultAmount, defaultDescription, defaultPaymentMethod, rawText }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [amount, setAmount] = useState(defaultAmount);
  const [description, setDescription] = useState(defaultDescription);
  const [categoryId, setCategoryId] = useState("");
  const [tagId, setTagId] = useState("");
  const [note, setNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState(defaultPaymentMethod);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || !description.trim()) return;
    startTransition(async () => {
      await createExpense({
        amount: parseFloat(amount),
        description: description.trim(),
        date: new Date(),
        categoryId: categoryId && categoryId !== "none" ? categoryId : undefined,
        tagId: tagId && tagId !== "none" ? tagId : undefined,
        note: note.trim() || undefined,
        paymentMethod: paymentMethod.trim() || undefined,
      });
      toast({ title: "Expense saved", description: `₹${parseFloat(amount).toLocaleString("en-IN")}`, variant: "success" });
      router.push("/expenses");
    });
  }

  return (
    <Card>
      <CardContent className="p-4 sm:p-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          {!defaultAmount && (
            <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
              Couldn&apos;t read the amount automatically — please enter it below.
            </p>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="s-amount">Amount (₹)</Label>
              <Input
                id="s-amount" type="number" inputMode="decimal" placeholder="0" min="0" step="0.01"
                value={amount} onChange={(e) => setAmount(e.target.value)} required autoFocus={!defaultAmount}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No category</SelectItem>
                  {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="s-desc">Description</Label>
            <Input id="s-desc" placeholder="What was this for?" value={description} onChange={(e) => setDescription(e.target.value)} required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Tag</Label>
              <Select value={tagId} onValueChange={setTagId}>
                <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No tag</SelectItem>
                  {tags.map((t) => <SelectItem key={t.id} value={t.id}>#{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="s-method">Paid via</Label>
              <Input
                id="s-method"
                placeholder="e.g. Credit Card · HDFC"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="s-note">Note</Label>
            <Textarea id="s-note" placeholder="Additional details…" value={note} onChange={(e) => setNote(e.target.value)} rows={2} />
          </div>

          {rawText && (
            <details className="text-xs text-gray-400">
              <summary className="cursor-pointer">Shared text</summary>
              <p className="mt-1 whitespace-pre-wrap break-words rounded-lg bg-gray-50 p-2">{rawText}</p>
            </details>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={() => router.push("/")}>Cancel</Button>
            <Button type="submit" className="gap-2" disabled={isPending}>
              <Check size={16} />
              {isPending ? "Saving…" : "Save expense"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
