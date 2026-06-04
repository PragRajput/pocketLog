import { getEMIs } from "@/lib/emi-actions";

import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { EMIForm, EditEMIButton } from "@/components/emis/emi-form";
import { MarkPaidButton, CloseEMIButton, ReopenEMIButton, DeleteEMIButton } from "@/components/emis/emi-actions-buttons";
import { formatCurrency, getInstallmentNo, isEMIActiveForMonth } from "@/lib/utils";
import { CreditCard, CheckCircle2 } from "lucide-react";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default async function EMIsPage() {
  const emis = await getEMIs();

  const now = new Date();
  const curMonth = now.getMonth() + 1;
  const curYear = now.getFullYear();

  const active = emis.filter(e => e.status === "active");
  const closed = emis.filter(e => e.status === "closed");

  const totalMonthlyOutflow = active.reduce((s, e) => {
    return isEMIActiveForMonth(e, curMonth, curYear) ? s + e.amount : s;
  }, 0);

  return (
    <div>
      <Header
        title="EMIs"
        description="Track your monthly installments and loan repayments"
        action={<EMIForm />}
      />

      {/* Summary */}
      {active.length > 0 && (
        <div className="flex gap-2 sm:gap-3 mb-6">
          <Card className="flex-1 min-w-0">
            <CardContent className="p-3 sm:p-5">
              <p className="text-[11px] sm:text-xs text-gray-500 mb-1 truncate">Active EMIs</p>
              <p className="text-base sm:text-2xl font-bold text-gray-900">{active.length}</p>
            </CardContent>
          </Card>
          <Card className="flex-1 min-w-0">
            <CardContent className="p-3 sm:p-5">
              <p className="text-[11px] sm:text-xs text-gray-500 mb-1 truncate">
                <span className="sm:hidden">This Month</span>
                <span className="hidden sm:inline">Total This Month</span>
              </p>
              <p className="text-base sm:text-2xl font-bold text-gray-900 truncate">{formatCurrency(totalMonthlyOutflow)}</p>
            </CardContent>
          </Card>
          <Card className="flex-1 min-w-0">
            <CardContent className="p-3 sm:p-5">
              <p className="text-[11px] sm:text-xs text-gray-500 mb-1 truncate">
                <span className="sm:hidden">Remaining</span>
                <span className="hidden sm:inline">Total Remaining (all EMIs)</span>
              </p>
              <p className="text-base sm:text-2xl font-bold text-gray-900 truncate">
                {formatCurrency(active.reduce((s, e) => {
                  const paidCount = e.payments.length;
                  const remaining = Math.max(0, e.tenure - paidCount);
                  return s + remaining * e.amount;
                }, 0))}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty state */}
      {emis.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-14 w-14 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
              <CreditCard className="h-7 w-7 text-indigo-400" />
            </div>
            <p className="text-lg font-semibold text-gray-700 mb-1">No EMIs yet</p>
            <p className="text-sm text-gray-400 mb-4 max-w-xs">
              Add your running EMIs — car loan, home loan, phone, etc. Track payments month by month.
            </p>
            <EMIForm />
          </CardContent>
        </Card>
      )}

      {/* Active EMIs */}
      {active.length > 0 && (
        <div className="space-y-4 mb-8">
          {active.map(emi => {
            const installmentNo = getInstallmentNo(emi, curMonth, curYear);
            const isThisMonthDue = isEMIActiveForMonth(emi, curMonth, curYear);
            const thisMonthPaid = emi.payments.some(p => p.month === curMonth && p.year === curYear);
            const paidCount = emi.payments.length;
            const pct = Math.round((paidCount / emi.tenure) * 100);
            const remaining = Math.max(0, emi.tenure - paidCount);
            const endDate = (() => {
              const d = new Date(emi.startYear, emi.startMonth - 1 + emi.tenure - 1, 1);
              return d.toLocaleString("default", { month: "short", year: "numeric" });
            })();

            const status = thisMonthPaid
              ? { label: "Paid this month", accent: "#10b981", iconBg: "bg-emerald-50", iconColor: "text-emerald-600", badge: "bg-emerald-50 text-emerald-700" }
              : isThisMonthDue
              ? { label: "Due now", accent: "#f59e0b", iconBg: "bg-amber-50", iconColor: "text-amber-600", badge: "bg-amber-50 text-amber-700" }
              : { label: "Active", accent: "#6366f1", iconBg: "bg-indigo-50", iconColor: "text-indigo-600", badge: "bg-indigo-50 text-indigo-600" };

            return (
              <Card key={emi.id} className={`overflow-hidden transition-shadow hover:shadow-md ${isThisMonthDue && !thisMonthPaid ? "ring-1 ring-amber-200" : ""}`}>
                <div className="h-1" style={{ backgroundColor: status.accent }} />
                <CardContent className="p-4 sm:p-5">
                  {/* Header: avatar + name + status + amount + actions */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${status.iconBg}`}>
                        <CreditCard className={`h-5 w-5 ${status.iconColor}`} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-gray-900 truncate">{emi.name}</h3>
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${status.badge}`}>
                            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: status.accent }} />
                            {status.label}
                          </span>
                        </div>
                        <p className="mt-0.5 flex items-baseline gap-1 flex-wrap">
                          <span className="font-bold text-indigo-600 text-base">{formatCurrency(emi.amount)}</span>
                          <span className="text-xs text-gray-400">/mo</span>
                          {emi.lender && <span className="text-xs text-gray-300">·</span>}
                          {emi.lender && <span className="text-xs text-gray-500 truncate">{emi.lender}</span>}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5 rounded-xl border border-gray-200 bg-gray-50/60 p-0.5 flex-shrink-0">
                      <EditEMIButton emi={emi} />
                      <CloseEMIButton id={emi.id} />
                      <DeleteEMIButton id={emi.id} />
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-medium text-gray-600">{paidCount} of {emi.tenure} installments paid</span>
                      <span className="font-semibold text-gray-500">{pct}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: pct >= 100 ? "#10b981" : "#6366f1" }} />
                    </div>
                  </div>

                  {/* Key stats */}
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="rounded-lg bg-gray-50 px-3 py-2">
                      <p className="text-[11px] text-gray-400">Remaining</p>
                      <p className="text-sm font-semibold text-gray-800">{remaining} mo</p>
                    </div>
                    <div className="rounded-lg bg-gray-50 px-3 py-2">
                      <p className="text-[11px] text-gray-400">Balance left</p>
                      <p className="text-sm font-semibold text-gray-800 truncate">{formatCurrency(remaining * emi.amount)}</p>
                    </div>
                    <div className="rounded-lg bg-gray-50 px-3 py-2">
                      <p className="text-[11px] text-gray-400">Ends</p>
                      <p className="text-sm font-semibold text-gray-800">{endDate}</p>
                    </div>
                    <div className="rounded-lg bg-gray-50 px-3 py-2">
                      <p className="text-[11px] text-gray-400">Total loan</p>
                      <p className="text-sm font-semibold text-gray-800 truncate">{formatCurrency(emi.amount * emi.tenure)}</p>
                    </div>
                  </div>

                  {/* Processing fees row */}
                  {(emi.processingFee || emi.gstOnFee || emi.otherCharges) && (() => {
                    const totalFees = (emi.processingFee ?? 0) + (emi.gstOnFee ?? 0) + (emi.otherCharges ?? 0);
                    const grandTotal = emi.amount * emi.tenure + totalFees;
                    return (
                      <div className="mt-3 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 flex flex-wrap gap-x-4 gap-y-1">
                        {emi.processingFee ? <span className="text-xs text-gray-600">Processing fee <span className="font-semibold">{formatCurrency(emi.processingFee)}</span></span> : null}
                        {emi.gstOnFee ? <span className="text-xs text-gray-600">GST <span className="font-semibold">{formatCurrency(emi.gstOnFee)}</span></span> : null}
                        {emi.otherCharges ? <span className="text-xs text-gray-600">{emi.otherChargesNote || "Other"} <span className="font-semibold">{formatCurrency(emi.otherCharges)}</span></span> : null}
                        <span className="text-xs font-bold text-amber-700 w-full sm:w-auto sm:ml-auto">Total fees {formatCurrency(totalFees)} · Grand total {formatCurrency(grandTotal)}</span>
                      </div>
                    );
                  })()}

                  {/* Mark paid banner — only when due this month */}
                  {isThisMonthDue && (
                    <div className={`mt-4 flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 ${thisMonthPaid ? "bg-emerald-50" : "bg-amber-50"}`}>
                      <span className={`text-xs font-medium ${thisMonthPaid ? "text-emerald-700" : "text-amber-700"}`}>
                        {thisMonthPaid
                          ? `Installment ${installmentNo} paid for ${MONTHS[curMonth - 1]}`
                          : `Installment ${installmentNo} of ${emi.tenure} due this month`}
                      </span>
                      <MarkPaidButton
                        emiId={emi.id} month={curMonth} year={curYear}
                        installmentNo={installmentNo} paid={thisMonthPaid}
                      />
                    </div>
                  )}

                  {/* Payment history strip */}
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-gray-400">Payment history</p>
                      <div className="flex items-center gap-2.5 text-[10px] text-gray-400">
                        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-emerald-200" />Paid</span>
                        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-amber-200 ring-1 ring-amber-400" />Now</span>
                        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-gray-100" />Due</span>
                      </div>
                    </div>
                    <div className="flex gap-1 flex-wrap">
                      {Array.from({ length: emi.tenure }, (_, i) => {
                        const m = ((emi.startMonth - 1 + i) % 12) + 1;
                        const y = emi.startYear + Math.floor((emi.startMonth - 1 + i) / 12);
                        const isPaid = emi.payments.some(p => p.month === m && p.year === y);
                        const isCurrent = m === curMonth && y === curYear;
                        return (
                          <div
                            key={i}
                            title={`${MONTHS[m-1]} ${y} — ${isPaid ? "Paid" : "Unpaid"}`}
                            className={`h-5 w-5 rounded text-[9px] flex items-center justify-center font-medium
                              ${isPaid ? "bg-emerald-100 text-emerald-700" : isCurrent ? "bg-amber-100 text-amber-700 ring-1 ring-amber-400" : "bg-gray-100 text-gray-400"}`}
                          >
                            {i + 1}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Closed EMIs */}
      {closed.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Closed / Pre-closed</h2>
          <div className="space-y-3">
            {closed.map(emi => (
              <Card key={emi.id} className="opacity-60 hover:opacity-80 transition-opacity">
                <CardContent className="p-4 flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <span className="font-medium text-gray-700">{emi.name}</span>
                      {emi.lender && <span className="text-xs text-gray-400">{emi.lender}</span>}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatCurrency(emi.amount)}/mo · {emi.payments.length}/{emi.tenure} paid · closed {emi.closedAt ? new Date(emi.closedAt).toLocaleDateString("en-IN") : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <ReopenEMIButton id={emi.id} />
                    <DeleteEMIButton id={emi.id} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
