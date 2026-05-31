"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { createFund, updateFund } from "@/lib/actions";
import { Plus, Pencil } from "lucide-react";
import { FUND_COLORS } from "@/lib/utils";

interface Fund {
  id: string; name: string; description?: string | null;
  color: string; budget?: number | null;
}

interface FundFormProps {
  fund?: Fund;
  trigger?: React.ReactNode;
}

export function FundForm({ fund, trigger }: FundFormProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState(fund?.name ?? "");
  const [description, setDescription] = useState(fund?.description ?? "");
  const [color, setColor] = useState(fund?.color ?? FUND_COLORS[0]);
  const [budget, setBudget] = useState(fund?.budget?.toString() ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name) return;

    startTransition(async () => {
      const data = {
        name,
        description: description || undefined,
        color,
        icon: "wallet",
        budget: budget ? parseFloat(budget) : undefined,
      };
      if (fund) {
        await updateFund(fund.id, data);
      } else {
        await createFund(data);
        setName("");
        setDescription("");
        setBudget("");
        setColor(FUND_COLORS[0]);
      }
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button>
            <Plus size={16} />
            New Fund
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{fund ? "Edit Fund" : "Create New Fund"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="fname">Fund Name</Label>
            <Input
              id="fname"
              placeholder="e.g. Construction, Mom, Daily Expenses"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="fdesc">Description (optional)</Label>
            <Textarea
              id="fdesc"
              placeholder="What is this fund for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Color</Label>
            <div className="flex gap-2 flex-wrap">
              {FUND_COLORS.map((c) => (
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
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="budget">Monthly Budget (₹)</Label>
            <Input
              id="budget"
              type="number"
              placeholder="e.g. 10000 — leave blank for no limit"
              min="0"
              step="100"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
            />
            <p className="text-xs text-gray-400">
              Tracks how much you have left this month. Resets automatically on the 1st.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} style={{ backgroundColor: color }}>
              {isPending ? "Saving..." : fund ? "Update Fund" : "Create Fund"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function EditFundButton({ fund }: { fund: Fund }) {
  return (
    <FundForm
      fund={fund}
      trigger={
        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-indigo-600">
          <Pencil size={14} />
        </Button>
      }
    />
  );
}
