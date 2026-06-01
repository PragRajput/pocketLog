"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { createEMI, updateEMI } from "@/lib/emi-actions";
import { toast } from "@/lib/toast";
import { Plus, Pencil, ChevronDown, ChevronUp } from "lucide-react";

interface Fund { id: string; name: string; color: string }

interface EMI {
  id: string; name: string; lender: string | null; amount: number;
  tenure: number; startMonth: number; startYear: number;
  processingFee: number | null; gstOnFee: number | null;
  otherCharges: number | null; otherChargesNote: string | null;
  fundId: string | null; note: string | null;
}

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 6 }, (_, i) => currentYear - 3 + i);

interface Props { funds: Fund[]; emi?: EMI; trigger?: React.ReactNode }

export function EMIForm({ funds, emi, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [showFees, setShowFees] = useState(!!(emi?.processingFee || emi?.gstOnFee || emi?.otherCharges));

  const now = new Date();
  const [name, setName] = useState(emi?.name ?? "");
  const [lender, setLender] = useState(emi?.lender ?? "");
  const [amount, setAmount] = useState(emi?.amount?.toString() ?? "");
  const [tenure, setTenure] = useState(emi?.tenure?.toString() ?? "");
  const [startMonth, setStartMonth] = useState(emi?.startMonth?.toString() ?? String(now.getMonth() + 1));
  const [startYear, setStartYear] = useState(emi?.startYear?.toString() ?? String(now.getFullYear()));
  const [fundId, setFundId] = useState(emi?.fundId ?? "none");
  const [note, setNote] = useState(emi?.note ?? "");

  // Fee fields
  const [processingFee, setProcessingFee] = useState(emi?.processingFee?.toString() ?? "");
  const [gstOnFee, setGstOnFee] = useState(emi?.gstOnFee?.toString() ?? "");
  const [otherCharges, setOtherCharges] = useState(emi?.otherCharges?.toString() ?? "");
  const [otherChargesNote, setOtherChargesNote] = useState(emi?.otherChargesNote ?? "");

  const endDate = (() => {
    const m = parseInt(startMonth); const y = parseInt(startYear); const t = parseInt(tenure);
    if (!m || !y || !t) return null;
    const end = new Date(y, m - 1 + t - 1, 1);
    return end.toLocaleString("default", { month: "long", year: "numeric" });
  })();

  const totalEMI = amount && tenure ? parseFloat(amount) * parseInt(tenure) : 0;
  const totalFees = (parseFloat(processingFee) || 0) + (parseFloat(gstOnFee) || 0) + (parseFloat(otherCharges) || 0);
  const grandTotal = totalEMI + totalFees;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const data = {
        name, lender: lender || undefined,
        amount: parseFloat(amount), tenure: parseInt(tenure),
        startMonth: parseInt(startMonth), startYear: parseInt(startYear),
        processingFee: processingFee ? parseFloat(processingFee) : undefined,
        gstOnFee: gstOnFee ? parseFloat(gstOnFee) : undefined,
        otherCharges: otherCharges ? parseFloat(otherCharges) : undefined,
        otherChargesNote: otherChargesNote || undefined,
        fundId: fundId !== "none" ? fundId : undefined,
        note: note || undefined,
      };
      if (emi) {
        await updateEMI(emi.id, data);
        toast({ title: "EMI updated", variant: "success" });
      } else {
        await createEMI(data);
        toast({ title: "EMI added", description: `₹${parseFloat(amount).toLocaleString("en-IN")}/month × ${tenure} months`, variant: "success" });
      }
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? <Button><Plus size={16} />Add EMI</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{emi ? "Edit EMI" : "Add New EMI"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">

          {/* Basic info */}
          <div className="space-y-1.5">
            <Label>EMI Name</Label>
            <Input placeholder="Car Loan, Home Loan, Phone EMI…" value={name} onChange={e => setName(e.target.value)} required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Lender / Bank</Label>
              <Input placeholder="HDFC, SBI, Bajaj…" value={lender} onChange={e => setLender(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Monthly Amount (₹)</Label>
              <Input type="number" placeholder="5000" min="1" value={amount} onChange={e => setAmount(e.target.value)} required />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Tenure (months)</Label>
            <Input type="number" placeholder="24" min="1" max="360" value={tenure} onChange={e => setTenure(e.target.value)} required />
            {totalEMI > 0 && endDate && (
              <p className="text-xs text-gray-400">
                Principal total: ₹{totalEMI.toLocaleString("en-IN")} · Ends {endDate}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Start Month</Label>
              <Select value={startMonth} onValueChange={setStartMonth}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m, i) => <SelectItem key={i+1} value={String(i+1)}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Start Year</Label>
              <Select value={startYear} onValueChange={setStartYear}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {YEARS.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Processing Fees section */}
          <div className="border border-gray-100 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowFees(v => !v)}
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-sm font-medium text-gray-700"
            >
              <span className="flex items-center gap-2">
                Processing Fees
                {totalFees > 0 && (
                  <span className="text-xs text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded-full">
                    ₹{totalFees.toLocaleString("en-IN")}
                  </span>
                )}
              </span>
              {showFees ? <ChevronUp size={15} className="text-gray-400" /> : <ChevronDown size={15} className="text-gray-400" />}
            </button>

            {showFees && (
              <div className="px-4 py-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Processing Fee (₹)</Label>
                    <Input
                      type="number" placeholder="0" min="0" step="0.01"
                      value={processingFee} onChange={e => setProcessingFee(e.target.value)}
                    />
                    <p className="text-[10px] text-gray-400">One-time charge by lender</p>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">GST on Fee (₹)</Label>
                    <Input
                      type="number" placeholder="0" min="0" step="0.01"
                      value={gstOnFee} onChange={e => setGstOnFee(e.target.value)}
                    />
                    <p className="text-[10px] text-gray-400">18% GST on processing fee</p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Other Charges (₹)</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      type="number" placeholder="0" min="0" step="0.01"
                      value={otherCharges} onChange={e => setOtherCharges(e.target.value)}
                    />
                    <Input
                      placeholder="e.g. Insurance, Stamp duty"
                      value={otherChargesNote} onChange={e => setOtherChargesNote(e.target.value)}
                    />
                  </div>
                </div>

                {totalFees > 0 && (
                  <div className="bg-indigo-50 rounded-lg p-3 space-y-1">
                    {processingFee && <div className="flex justify-between text-xs text-gray-600"><span>Processing fee</span><span>₹{parseFloat(processingFee).toLocaleString("en-IN")}</span></div>}
                    {gstOnFee && <div className="flex justify-between text-xs text-gray-600"><span>GST on fee</span><span>₹{parseFloat(gstOnFee).toLocaleString("en-IN")}</span></div>}
                    {otherCharges && <div className="flex justify-between text-xs text-gray-600"><span>{otherChargesNote || "Other charges"}</span><span>₹{parseFloat(otherCharges).toLocaleString("en-IN")}</span></div>}
                    <div className="border-t border-indigo-100 pt-1 flex justify-between text-xs font-semibold text-indigo-700">
                      <span>Total fees</span>
                      <span>₹{totalFees.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Grand total summary */}
          {grandTotal > 0 && (
            <div className="bg-gray-50 rounded-xl p-3 grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-[10px] text-gray-400 mb-0.5">Principal total</p>
                <p className="text-sm font-bold text-gray-900">₹{totalEMI.toLocaleString("en-IN")}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 mb-0.5">Total fees</p>
                <p className="text-sm font-bold text-gray-900">₹{totalFees.toLocaleString("en-IN")}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 mb-0.5">Grand total</p>
                <p className="text-sm font-bold text-indigo-600">₹{grandTotal.toLocaleString("en-IN")}</p>
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Deduct from Fund (optional)</Label>
            <Select value={fundId} onValueChange={setFundId}>
              <SelectTrigger><SelectValue placeholder="No fund" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No fund</SelectItem>
                {funds.map(f => (
                  <SelectItem key={f.id} value={f.id}>
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: f.color }} />{f.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Note (optional)</Label>
            <Textarea placeholder="Loan account number, purpose…" value={note} onChange={e => setNote(e.target.value)} rows={2} />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending}>{isPending ? "Saving…" : emi ? "Update" : "Add EMI"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function EditEMIButton({ emi, funds }: { emi: EMI; funds: Fund[] }) {
  return (
    <EMIForm emi={emi} funds={funds} trigger={
      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-indigo-600">
        <Pencil size={14} />
      </Button>
    } />
  );
}
