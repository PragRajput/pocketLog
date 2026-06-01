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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <Card>
            <CardContent className="p-5">
              <p className="text-xs text-gray-500 mb-1">Active EMIs</p>
              <p className="text-2xl font-bold text-gray-900">{active.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-xs text-gray-500 mb-1">Total This Month</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalMonthlyOutflow)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-xs text-gray-500 mb-1">Total Remaining (all EMIs)</p>
              <p className="text-2xl font-bold text-gray-900">
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

            return (
              <Card key={emi.id} className={`overflow-hidden ${isThisMonthDue && !thisMonthPaid ? "ring-2 ring-amber-200" : ""}`}>
                <div className="h-1" style={{ backgroundColor: thisMonthPaid ? "#10b981" : isThisMonthDue ? "#f59e0b" : "#6366f1" }} />
                <CardContent className="p-5">
                  <div className="flex items-start justify-between flex-wrap gap-3">
                    {/* Left: info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-gray-900">{emi.name}</h3>
                        {emi.lender && <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{emi.lender}</span>}
                      </div>

                      <div className="flex items-center gap-4 text-sm mb-3 flex-wrap">
                        <span className="font-bold text-indigo-600 text-lg">{formatCurrency(emi.amount)}<span className="text-xs font-normal text-gray-400">/mo</span></span>
                        <span className="text-gray-500">{paidCount}/{emi.tenure} paid</span>
                        <span className="text-gray-500">{remaining} left · ends {endDate}</span>
                        <span className="font-medium text-gray-700">{formatCurrency(remaining * emi.amount)} remaining</span>
                      </div>

                      {/* Processing fees row */}
                      {(emi.processingFee || emi.gstOnFee || emi.otherCharges) && (() => {
                        const totalFees = (emi.processingFee ?? 0) + (emi.gstOnFee ?? 0) + (emi.otherCharges ?? 0);
                        const grandTotal = emi.amount * emi.tenure + totalFees;
                        return (
                          <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mb-3 flex flex-wrap gap-x-4 gap-y-1">
                            {emi.processingFee ? <span className="text-xs text-gray-600">Processing fee <span className="font-semibold">{formatCurrency(emi.processingFee)}</span></span> : null}
                            {emi.gstOnFee ? <span className="text-xs text-gray-600">GST <span className="font-semibold">{formatCurrency(emi.gstOnFee)}</span></span> : null}
                            {emi.otherCharges ? <span className="text-xs text-gray-600">{emi.otherChargesNote || "Other"} <span className="font-semibold">{formatCurrency(emi.otherCharges)}</span></span> : null}
                            <span className="text-xs font-bold text-amber-700 ml-auto">Total fees {formatCurrency(totalFees)} · Grand total {formatCurrency(grandTotal)}</span>
                          </div>
                        );
                      })()}

                      {/* Progress bar */}
                      <div className="mb-1">
                        <div className="h-2 w-full rounded-full bg-gray-100 max-w-sm">
                          <div className="h-2 rounded-full bg-indigo-500 transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">{pct}% complete</p>
                      </div>
                    </div>

                    {/* Right: actions */}
                    <div className="flex flex-col items-end gap-2">
                      {isThisMonthDue && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">Month {installmentNo} of {emi.tenure}</span>
                          <MarkPaidButton
                            emiId={emi.id} month={curMonth} year={curYear}
                            installmentNo={installmentNo} paid={thisMonthPaid}
                          />
                        </div>
                      )}
                      <div className="flex items-center gap-0.5 rounded-xl border border-gray-200 bg-gray-50/60 p-0.5">
                        <EditEMIButton emi={emi} />
                        <CloseEMIButton id={emi.id} />
                        <DeleteEMIButton id={emi.id} />
                      </div>
                    </div>
                  </div>

                  {/* Payment history strip */}
                  <div className="mt-4 pt-3 border-t border-gray-50">
                    <p className="text-xs text-gray-400 mb-2">Payment history</p>
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
