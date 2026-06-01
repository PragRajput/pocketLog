"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { markEMIPaid, unmarkEMIPaid, closeEMI, reopenEMI, deleteEMI } from "@/lib/emi-actions";
import { toast } from "@/lib/toast";
import { Check, Undo2, XCircle, RotateCcw, Trash2 } from "lucide-react";

export function MarkPaidButton({
  emiId, month, year, installmentNo, paid,
}: {
  emiId: string; month: number; year: number; installmentNo: number; paid: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => {
      if (paid) {
        await unmarkEMIPaid(emiId, month, year);
        toast({ title: "Payment unmarked", variant: "info" });
      } else {
        await markEMIPaid(emiId, month, year, installmentNo);
        toast({ title: `EMI paid ✓`, description: `Installment ${installmentNo} marked as paid`, variant: "success" });
      }
    });
  }

  if (paid) {
    return (
      <Button variant="secondary" size="sm" onClick={toggle} disabled={isPending}
        className="text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200 gap-1.5">
        <Check size={14} />
        Paid
        <span className="text-emerald-400 ml-0.5"><Undo2 size={11} /></span>
      </Button>
    );
  }

  return (
    <Button size="sm" onClick={toggle} disabled={isPending}
      className="bg-indigo-600 hover:bg-indigo-700 gap-1.5">
      <Check size={14} />
      {isPending ? "Marking…" : "Mark Paid"}
    </Button>
  );
}

export function CloseEMIButton({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <>
      <Button variant="ghost" size="icon" title="Close EMI" aria-label="Close EMI"
        onClick={() => setOpen(true)}
        className="h-8 w-8 rounded-lg text-gray-400 hover:text-orange-600 hover:bg-orange-50">
        <XCircle size={15} />
      </Button>
      <ConfirmDialog
        open={open} onOpenChange={setOpen}
        title="Close this EMI early?"
        description="This marks the EMI as pre-closed. No further monthly payments will be shown. You can reopen it if needed."
        confirmLabel="Yes, Close EMI"
        variant="destructive"
        onConfirm={() => startTransition(async () => {
          await closeEMI(id);
          setOpen(false);
          toast({ title: "EMI closed", description: "Pre-closure recorded", variant: "info" });
        })}
        isPending={isPending}
      />
    </>
  );
}

export function ReopenEMIButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <Button variant="outline" size="sm" disabled={isPending}
      onClick={() => startTransition(async () => {
        await reopenEMI(id);
        toast({ title: "EMI reopened", variant: "success" });
      })}
      className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 gap-1.5">
      <RotateCcw size={14} />
      Reopen
    </Button>
  );
}

export function DeleteEMIButton({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  return (
    <>
      <Button variant="ghost" size="icon" title="Delete EMI" aria-label="Delete EMI"
        onClick={() => setOpen(true)}
        className="h-8 w-8 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50">
        <Trash2 size={15} />
      </Button>
      <ConfirmDialog
        open={open} onOpenChange={setOpen}
        title="Delete EMI?"
        description="This will permanently delete this EMI and all its payment history."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => startTransition(async () => {
          await deleteEMI(id);
          setOpen(false);
          toast({ title: "EMI deleted", variant: "info" });
        })}
        isPending={isPending}
      />
    </>
  );
}
