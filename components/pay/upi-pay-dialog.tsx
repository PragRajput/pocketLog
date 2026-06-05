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
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger,
} from "@/components/ui/dialog";
import { QrScanner } from "./qr-scanner";
import { createPendingPayment } from "@/lib/actions";
import { buildUpiUrl, parseUpiQr, isValidVpa, UPI_APPS, type UpiApp } from "@/lib/upi";
import { toast } from "@/lib/toast";
import { QrCode, ScanLine, ArrowLeft, Wallet } from "lucide-react";

interface Category { id: string; name: string }
interface TagType { id: string; name: string; color: string }
interface RecentPayee { vpa: string; name: string | null }

interface Props {
  categories: Category[];
  tags: TagType[];
  recentPayees: RecentPayee[];
  trigger?: React.ReactNode;
}

type Step = "choose" | "scan" | "details";

export function UpiPayDialog({ categories, tags, recentPayees, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("choose");
  const [isPending, startTransition] = useTransition();

  // payee
  const [vpa, setVpa] = useState("");
  const [payeeName, setPayeeName] = useState("");
  const [manualVpa, setManualVpa] = useState("");

  // details
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [tagId, setTagId] = useState("");
  const [note, setNote] = useState("");
  const [app, setApp] = useState<UpiApp>("any");

  function reset() {
    setStep("choose");
    setVpa(""); setPayeeName(""); setManualVpa("");
    setAmount(""); setDescription(""); setCategoryId(""); setTagId(""); setNote("");
    setApp("any");
  }

  function onOpenChange(v: boolean) {
    setOpen(v);
    if (!v) setTimeout(reset, 200);
  }

  function pickPayee(payeeVpa: string, name: string | null, prefillAmount?: string | null) {
    setVpa(payeeVpa);
    setPayeeName(name ?? "");
    setDescription(name ?? "UPI Payment");
    if (prefillAmount) setAmount(prefillAmount);
    setStep("details");
  }

  function handleScan(raw: string) {
    const parsed = parseUpiQr(raw);
    if (!parsed) {
      toast({ title: "Not a UPI QR", description: "That QR isn't a UPI payment code.", variant: "error" });
      return;
    }
    pickPayee(parsed.pa, parsed.pn, parsed.am);
    toast({ title: "QR scanned", description: parsed.pn ?? parsed.pa, variant: "success" });
  }

  function handleManualContinue() {
    const v = manualVpa.trim();
    if (!isValidVpa(v)) {
      toast({ title: "Invalid UPI ID", description: "Enter a valid UPI ID like name@bank.", variant: "error" });
      return;
    }
    pickPayee(v, null);
  }

  function handlePay() {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      toast({ title: "Enter an amount", variant: "error" });
      return;
    }
    const appLabel = UPI_APPS.find((a) => a.value === app)?.label;
    const paymentMethod = app === "any" ? "UPI" : `UPI · ${appLabel}`;
    const desc = description.trim() || payeeName || "UPI Payment";

    startTransition(async () => {
      // Record as pending first so it survives the redirect to the UPI app.
      await createPendingPayment({
        amount: amt,
        description: desc,
        payeeVpa: vpa,
        payeeName: payeeName || undefined,
        categoryId: categoryId && categoryId !== "none" ? categoryId : undefined,
        tagId: tagId && tagId !== "none" ? tagId : undefined,
        note: note || undefined,
        paymentMethod,
      });

      const url = buildUpiUrl(app, {
        pa: vpa,
        pn: payeeName || undefined,
        am: amt,
        tn: desc,
        tr: `PL${Date.now()}`,
      });

      setOpen(false);
      setTimeout(reset, 200);
      // Hand off to the UPI app. On desktop there's no handler; tell the user.
      window.location.href = url;
      setTimeout(() => {
        toast({ title: "Opening payment app…", description: "After paying, return here and tap “Paid”.", variant: "info" });
      }, 100);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline">
            <ScanLine size={16} />
            Scan & Pay
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {step === "details" && (
              <button type="button" onClick={() => setStep("choose")} className="text-gray-400 hover:text-gray-700">
                <ArrowLeft size={18} />
              </button>
            )}
            {step === "scan" ? "Scan UPI QR" : step === "details" ? "Payment details" : "Scan & Pay"}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Pay a UPI payee and log the expense.
          </DialogDescription>
        </DialogHeader>

        {/* Step 1: choose payee */}
        {step === "choose" && (
          <div className="space-y-4 mt-1">
            <Button type="button" className="w-full justify-center gap-2" onClick={() => setStep("scan")}>
              <QrCode size={18} />
              Scan a QR code
            </Button>

            {recentPayees.length > 0 && (
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-400">Recent payees</Label>
                <div className="flex flex-wrap gap-2">
                  {recentPayees.map((p) => (
                    <button
                      key={p.vpa}
                      type="button"
                      onClick={() => pickPayee(p.vpa, p.name)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-700 hover:border-indigo-300 hover:bg-indigo-50"
                    >
                      <Wallet size={12} className="text-indigo-500" />
                      {p.name || p.vpa}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="vpa">Or enter a UPI ID</Label>
              <div className="flex gap-2">
                <Input
                  id="vpa"
                  placeholder="name@bank"
                  value={manualVpa}
                  onChange={(e) => setManualVpa(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleManualContinue())}
                />
                <Button type="button" variant="secondary" onClick={handleManualContinue}>Continue</Button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: scan */}
        {step === "scan" && (
          <div className="space-y-3 mt-1">
            <QrScanner onResult={handleScan} />
            <Button type="button" variant="outline" className="w-full" onClick={() => setStep("choose")}>
              Cancel
            </Button>
          </div>
        )}

        {/* Step 3: details */}
        {step === "details" && (
          <div className="space-y-4 mt-1">
            <div className="rounded-lg bg-indigo-50 px-3 py-2">
              <p className="text-xs text-gray-500">Paying</p>
              <p className="text-sm font-semibold text-gray-900">{payeeName || vpa}</p>
              {payeeName && <p className="text-xs text-gray-500">{vpa}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="pay-amount">Amount (₹)</Label>
                <Input
                  id="pay-amount" type="number" inputMode="decimal" placeholder="0" min="0" step="0.01"
                  value={amount} onChange={(e) => setAmount(e.target.value)} autoFocus required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Pay using</Label>
                <Select value={app} onValueChange={(v) => setApp(v as UpiApp)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {UPI_APPS.map((a) => (
                      <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="pay-desc">Description</Label>
              <Input id="pay-desc" placeholder="What is this for?" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-3">
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
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="pay-note">Note (optional)</Label>
              <Textarea id="pay-note" placeholder="Additional details…" value={note} onChange={(e) => setNote(e.target.value)} rows={2} />
            </div>

            <Button type="button" className="w-full gap-2" disabled={isPending} onClick={handlePay}>
              <Wallet size={16} />
              {isPending ? "Opening…" : `Pay ₹${amount || "0"}`}
            </Button>
            <p className="text-[11px] text-gray-400 text-center">
              We&apos;ll open your UPI app. After paying, return and tap “Paid”.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
