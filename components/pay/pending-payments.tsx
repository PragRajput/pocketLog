"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { confirmPendingPayment, deletePendingPayment } from "@/lib/actions";
import { formatCurrency } from "@/lib/utils";
import { toast } from "@/lib/toast";
import { Check, X, Clock } from "lucide-react";

interface PendingPayment {
  id: string; amount: number; description: string;
  payeeVpa: string | null; payeeName: string | null; createdAt: Date;
}

export function PendingPayments({ payments }: { payments: PendingPayment[] }) {
  if (payments.length === 0) return null;
  return (
    <Card className="mb-4 border-amber-200 bg-amber-50/40">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="h-4 w-4 text-amber-500" />
          <p className="text-sm font-semibold text-gray-700">
            Awaiting confirmation
            <span className="ml-1.5 text-xs font-normal text-gray-400">
              ({payments.length}) — did these payments go through?
            </span>
          </p>
        </div>
        <div className="space-y-2">
          {payments.map((p) => (
            <PendingRow key={p.id} payment={p} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function PendingRow({ payment: p }: { payment: PendingPayment }) {
  const [isPending, startTransition] = useTransition();

  function confirm() {
    startTransition(async () => {
      await confirmPendingPayment(p.id);
      toast({ title: "Payment recorded", description: formatCurrency(p.amount), variant: "success" });
    });
  }
  function cancel() {
    startTransition(async () => {
      await deletePendingPayment(p.id);
      toast({ title: "Pending payment removed", variant: "info" });
    });
  }

  return (
    <div className="flex items-center justify-between gap-2 rounded-lg bg-white px-3 py-2 border border-amber-100">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-800 truncate">{p.description}</p>
        <p className="text-xs text-gray-400 truncate">
          {formatCurrency(p.amount)}
          {p.payeeName ? ` · ${p.payeeName}` : p.payeeVpa ? ` · ${p.payeeVpa}` : ""}
        </p>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <Button
          size="sm"
          className="h-8 gap-1 bg-emerald-600 hover:bg-emerald-700"
          disabled={isPending}
          onClick={confirm}
        >
          <Check size={14} />
          Paid
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 text-gray-400 hover:text-red-500"
          disabled={isPending}
          onClick={cancel}
          aria-label="Cancel pending payment"
        >
          <X size={15} />
        </Button>
      </div>
    </div>
  );
}
