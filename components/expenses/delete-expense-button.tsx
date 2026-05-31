"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { deleteExpense } from "@/lib/actions";
import { toast } from "@/lib/toast";
import { Trash2 } from "lucide-react";

export function DeleteExpenseButton({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      await deleteExpense(id);
      setOpen(false);
      toast({ title: "Expense deleted", variant: "info" });
    });
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-gray-400 hover:text-red-500"
        onClick={() => setOpen(true)}
      >
        <Trash2 size={14} />
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Delete expense?"
        description="This will permanently remove this expense. This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleConfirm}
        isPending={isPending}
      />
    </>
  );
}
