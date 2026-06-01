"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { format } from "date-fns";

interface Expense {
  amount: number;
  description: string;
  date: Date;
  note?: string | null;
  fund: { name: string } | null;
  category?: { name: string } | null;
}

interface Props {
  expenses: Expense[];
  month: string;
}

export function ExportButton({ expenses, month }: Props) {
  function handleExport() {
    const rows = [
      ["Date", "Description", "Amount (₹)", "Fund", "Category", "Note"],
      ...expenses.map((e) => [
        format(new Date(e.date), "dd/MM/yyyy"),
        e.description,
        e.amount.toFixed(2),
        e.fund?.name ?? "",
        e.category?.name ?? "",
        e.note ?? "",
      ]),
    ];

    const csv = rows
      .map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `expenses-${month.replace(/ /g, "-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Button variant="outline" onClick={handleExport}>
      <Download size={15} />
      Export CSV
    </Button>
  );
}
