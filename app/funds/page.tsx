import { getFunds } from "@/lib/actions";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FundForm, EditFundButton } from "@/components/funds/fund-form";
import { DeleteFundButton } from "@/components/funds/delete-fund-button";
import { formatCurrency } from "@/lib/utils";
import { Wallet, ArrowRight, TrendingDown } from "lucide-react";
import Link from "next/link";

export default async function FundsPage() {
  const funds = await getFunds();

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthName = now.toLocaleString("default", { month: "long", year: "numeric" });

  const fundsWithStats = funds.map((f) => {
    const thisMonthExpenses = f.expenses.filter((e) => new Date(e.date) >= monthStart);
    const spent = thisMonthExpenses.reduce((s, e) => s + e.amount, 0);
    const remaining = f.budget != null ? f.budget - spent : null;
    const pct = f.budget != null ? Math.min(100, Math.round((spent / f.budget) * 100)) : null;
    const allTimeTotal = f.expenses.reduce((s, e) => s + e.amount, 0);
    return { ...f, spent, remaining, pct, allTimeTotal, count: thisMonthExpenses.length };
  });

  const totalBudget = fundsWithStats.reduce((s, f) => s + (f.budget ?? 0), 0);
  const totalSpent = fundsWithStats.reduce((s, f) => s + f.spent, 0);
  const totalRemaining = totalBudget > 0 ? totalBudget - totalSpent : null;

  return (
    <div>
      <Header
        title="Funds"
        description={`Monthly budget envelopes · ${monthName}`}
        action={<FundForm />}
      />

      {/* Monthly summary banner — only if any fund has a budget */}
      {totalBudget > 0 && (
        <Card className="mb-6 border-indigo-100 bg-gradient-to-r from-indigo-50 to-violet-50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-indigo-700">Total Monthly Budget — {monthName}</p>
              <p className="text-xs text-indigo-500">Resets on the 1st of each month</p>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Budget</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(totalBudget)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Spent</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(totalSpent)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Remaining</p>
                <p className={`text-xl font-bold ${totalRemaining! < 0 ? "text-red-600" : "text-emerald-600"}`}>
                  {totalRemaining! < 0 ? "−" : ""}{formatCurrency(Math.abs(totalRemaining!))}
                </p>
              </div>
            </div>
            <div className="mt-3 h-2.5 w-full rounded-full bg-white/70">
              <div
                className="h-2.5 rounded-full transition-all"
                style={{
                  width: `${Math.min(100, Math.round((totalSpent / totalBudget) * 100))}%`,
                  backgroundColor: totalSpent > totalBudget ? "#ef4444" : totalSpent / totalBudget > 0.8 ? "#f59e0b" : "#6366f1",
                }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {funds.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-14 w-14 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
              <Wallet className="h-7 w-7 text-indigo-400" />
            </div>
            <p className="text-lg font-semibold text-gray-700 mb-1">No funds yet</p>
            <p className="text-sm text-gray-400 mb-4 max-w-xs">
              Create funds with monthly budgets — like "Food ₹10,000/month" or "Construction Work"
            </p>
            <FundForm />
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {fundsWithStats.map((f) => {
          const hasBudget = f.budget != null;
          const isOver = hasBudget && f.remaining! < 0;
          const isWarning = hasBudget && !isOver && f.pct! >= 75;
          const statusColor = isOver ? "#ef4444" : isWarning ? "#f59e0b" : f.color;

          return (
            <Card key={f.id} className="hover:shadow-md transition-shadow group overflow-hidden">
              {/* Color accent top bar */}
              <div className="h-1.5 w-full" style={{ backgroundColor: f.color }} />

              <CardContent className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-10 w-10 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm"
                      style={{ backgroundColor: f.color }}
                    >
                      {f.name[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{f.name}</p>
                      {f.description && (
                        <p className="text-xs text-gray-400 line-clamp-1">{f.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <EditFundButton fund={f} />
                    <DeleteFundButton id={f.id} />
                  </div>
                </div>

                {hasBudget ? (
                  /* ── Budget mode: show remaining prominently ── */
                  <div>
                    {/* Remaining — big and bold */}
                    <div
                      className="rounded-xl p-4 mb-3 text-center"
                      style={{ backgroundColor: statusColor + "12" }}
                    >
                      <p className="text-xs font-medium mb-0.5" style={{ color: statusColor }}>
                        {isOver ? "Over budget by" : "Remaining this month"}
                      </p>
                      <p className="text-3xl font-black" style={{ color: statusColor }}>
                        {isOver ? "−" : ""}{formatCurrency(Math.abs(f.remaining!))}
                      </p>
                    </div>

                    {/* Spent / Budget */}
                    <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                      <span>Spent <span className="font-semibold text-gray-800">{formatCurrency(f.spent)}</span></span>
                      <span>of <span className="font-semibold text-gray-800">{formatCurrency(f.budget!)}</span> budget</span>
                    </div>

                    {/* Progress bar */}
                    <div className="h-2.5 w-full rounded-full bg-gray-100 mb-3">
                      <div
                        className="h-2.5 rounded-full transition-all"
                        style={{ width: `${f.pct}%`, backgroundColor: statusColor }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Badge
                        variant="secondary"
                        className="text-xs"
                        style={isOver ? { backgroundColor: "#fee2e2", color: "#dc2626" } : isWarning ? { backgroundColor: "#fef3c7", color: "#d97706" } : {}}
                      >
                        {isOver ? `⚠ ${f.pct}% used — over!` : `${f.pct}% used · ${f.count} tx`}
                      </Badge>
                      <Link
                        href={`/funds/${f.id}`}
                        className="text-xs flex items-center gap-1 font-medium"
                        style={{ color: f.color }}
                      >
                        Details <ArrowRight size={11} />
                      </Link>
                    </div>
                  </div>
                ) : (
                  /* ── No budget mode: simple stats ── */
                  <div>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-0.5">This Month</p>
                        <p className="text-lg font-bold text-gray-900">{formatCurrency(f.spent)}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-0.5">All Time</p>
                        <p className="text-lg font-bold text-gray-900">{formatCurrency(f.allTimeTotal)}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">
                        {f.count} expense{f.count !== 1 ? "s" : ""} this month
                      </Badge>
                      <Link
                        href={`/funds/${f.id}`}
                        className="text-xs flex items-center gap-1 font-medium"
                        style={{ color: f.color }}
                      >
                        Details <ArrowRight size={11} />
                      </Link>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
