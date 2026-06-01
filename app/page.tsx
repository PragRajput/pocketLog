export const dynamic = 'force-dynamic';

import { getDashboardStats, getFunds, getCategories, getTags } from "@/lib/actions";
import { getActiveEMIs } from "@/lib/emi-actions";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SpendingChart } from "@/components/dashboard/spending-chart";
import { FundBreakdown } from "@/components/dashboard/fund-breakdown";
import { ExpenseForm } from "@/components/expenses/expense-form";
import { MarkPaidButton } from "@/components/emis/emi-actions-buttons";
import { formatCurrency, formatDate, getInstallmentNo, isEMIActiveForMonth } from "@/lib/utils";
import { TrendingUp, Wallet, ReceiptText, Target, CreditCard, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const [stats, funds, categories, tags, activeEMIs] = await Promise.all([
    getDashboardStats(),
    getFunds(),
    getCategories(),
    getTags(),
    getActiveEMIs(),
  ]);

  const now = new Date();
  const curMonth = now.getMonth() + 1;
  const curYear = now.getFullYear();

  const dueEMIs = activeEMIs.filter(e => isEMIActiveForMonth(e, curMonth, curYear));
  const unpaidEMIs = dueEMIs.filter(e => !e.payments.some(p => p.month === curMonth && p.year === curYear));
  const paidEMIs = dueEMIs.filter(e => e.payments.some(p => p.month === curMonth && p.year === curYear));

  const totalBudget = funds.reduce((s, f) => s + (f.budget ?? 0), 0);
  const budgetUsed = totalBudget > 0
    ? Math.round((stats.totalThisMonth / totalBudget) * 100)
    : null;

  const statsCards = [
    {
      title: "Spent This Month",
      value: formatCurrency(stats.totalThisMonth),
      icon: TrendingUp,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      sub: budgetUsed != null ? `${budgetUsed}% of budget used` : "No budget set",
    },
    {
      title: "Total Expenses",
      value: stats.totalExpenses.toLocaleString(),
      icon: ReceiptText,
      color: "text-violet-600",
      bg: "bg-violet-50",
      sub: "All time",
    },
    {
      title: "Active Funds",
      value: funds.length.toString(),
      icon: Wallet,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      sub: funds.map((f) => f.name).join(", ") || "No funds yet",
    },
    {
      title: "Monthly Budget",
      value: totalBudget > 0 ? formatCurrency(totalBudget) : "—",
      icon: Target,
      color: "text-amber-600",
      bg: "bg-amber-50",
      sub: totalBudget > 0 ? `${formatCurrency(totalBudget - stats.totalThisMonth)} remaining` : "No budget set",
    },
  ];

  return (
    <div>
      <Header
        title="Dashboard"
        description={`Overview for ${new Date().toLocaleString("default", { month: "long", year: "numeric" })}`}
        action={<ExpenseForm funds={funds} categories={categories} tags={tags} />}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statsCards.map((s) => (
          <Card key={s.title}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">{s.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                  <p className="text-xs text-gray-400 mt-1 truncate max-w-[140px]">{s.sub}</p>
                </div>
                <div className={`${s.bg} p-2.5 rounded-lg`}>
                  <s.icon className={`${s.color} h-5 w-5`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm">Monthly Spending Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <SpendingChart data={stats.monthlyTrend} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Spending by Fund</CardTitle>
          </CardHeader>
          <CardContent>
            <FundBreakdown funds={stats.funds} />
          </CardContent>
        </Card>
      </div>

      {/* Fund quick stats + Recent transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Funds Overview</CardTitle>
              <Link href="/funds" className="text-xs text-indigo-600 hover:underline">View all</Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {funds.length === 0 && (
              <p className="text-sm text-gray-400">No funds yet. Create one!</p>
            )}
            {stats.funds.map((f) => {
              const pct = f.budget ? Math.min(100, Math.round((f.thisMonth / f.budget) * 100)) : null;
              return (
                <Link key={f.id} href={`/funds/${f.id}`} className="block group">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: f.color }}
                      />
                      <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-600 transition-colors">
                        {f.name}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      {formatCurrency(f.thisMonth)}
                    </span>
                  </div>
                  {pct != null && (
                    <div className="ml-4">
                      <div className="h-1.5 w-full rounded-full bg-gray-100">
                        <div
                          className="h-1.5 rounded-full transition-all"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: pct > 90 ? "#ef4444" : pct > 70 ? "#f59e0b" : f.color,
                          }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{pct}% of budget</p>
                    </div>
                  )}
                </Link>
              );
            })}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Recent Transactions</CardTitle>
              <Link href="/expenses" className="text-xs text-indigo-600 hover:underline">View all</Link>
            </div>
          </CardHeader>
          <CardContent>
            {stats.recentExpenses.length === 0 && (
              <p className="text-sm text-gray-400">No expenses yet.</p>
            )}
            <div className="space-y-2">
              {stats.recentExpenses.map((e) => (
                <div key={e.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-8 w-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: e.fund?.color ?? "#94a3b8" }}
                    >
                      {e.fund ? e.fund.name[0].toUpperCase() : "?"}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800 leading-tight">{e.description}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-xs text-gray-400">{formatDate(e.date)}</span>
                        {e.fund && (
                          <>
                            <span className="text-gray-200">·</span>
                            <Badge
                              variant="secondary"
                              className="py-0 px-1.5 text-[10px]"
                              style={{ backgroundColor: e.fund.color + "18", color: e.fund.color }}
                            >
                              {e.fund.name}
                            </Badge>
                          </>
                        )}
                        {e.category && (
                          <Badge variant="secondary" className="py-0 px-1.5 text-[10px]">
                            {e.category.name}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-gray-900">
                    {formatCurrency(e.amount)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* EMI widget — only shown if EMIs are due this month */}
      {dueEMIs.length > 0 && (
        <Card className="mt-4">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-indigo-500" />
                <CardTitle className="text-sm">EMIs Due This Month</CardTitle>
                {unpaidEMIs.length > 0 && (
                  <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                    {unpaidEMIs.length} pending
                  </span>
                )}
              </div>
              <Link href="/emis" className="text-xs text-indigo-600 hover:underline">View all</Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {dueEMIs.map(emi => {
                const installmentNo = getInstallmentNo(emi, curMonth, curYear);
                const paid = emi.payments.some(p => p.month === curMonth && p.year === curYear);
                return (
                  <div key={emi.id} className={`flex items-center justify-between p-3 rounded-lg ${paid ? "bg-emerald-50" : "bg-amber-50"}`}>
                    <div className="flex items-center gap-3">
                      {paid
                        ? <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                        : <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0" />
                      }
                      <div>
                        <p className="text-sm font-medium text-gray-800">{emi.name}</p>
                        <p className="text-xs text-gray-500">
                          Installment {installmentNo} of {emi.tenure}
                          {emi.lender ? ` · ${emi.lender}` : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-gray-900">{formatCurrency(emi.amount)}</span>
                      <MarkPaidButton
                        emiId={emi.id} month={curMonth} year={curYear}
                        installmentNo={installmentNo} paid={paid}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
