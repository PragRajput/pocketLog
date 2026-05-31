import { notFound } from "next/navigation";
import { getFund, getCategories, getFunds, getTags } from "@/lib/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExpenseForm } from "@/components/expenses/expense-form";
import { EditExpenseButton } from "@/components/expenses/expense-form";
import { DeleteExpenseButton } from "@/components/expenses/delete-expense-button";
import { EditFundButton } from "@/components/funds/fund-form";
import { DeleteFundButton } from "@/components/funds/delete-fund-button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ArrowLeft, CalendarRange, TrendingUp, ReceiptText } from "lucide-react";
import Link from "next/link";

interface Props { params: Promise<{ id: string }> }

export default async function FundDetailPage({ params }: Props) {
  const { id } = await params;
  const [fund, categories, allFunds, tags] = await Promise.all([
    getFund(id),
    getCategories(),
    getFunds(),
    getTags(),
  ]);

  if (!fund) notFound();

  const total = fund.expenses.reduce((s, e) => s + e.amount, 0);
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthName = now.toLocaleString("default", { month: "long", year: "numeric" });
  const thisMonth = fund.expenses
    .filter((e) => new Date(e.date) >= monthStart)
    .reduce((s, e) => s + e.amount, 0);
  const remaining = fund.budget != null ? fund.budget - thisMonth : null;
  const avgExpense = fund.expenses.length > 0 ? total / fund.expenses.length : 0;
  const pct = fund.budget ? Math.min(100, Math.round((thisMonth / fund.budget) * 100)) : null;
  const isOver = remaining != null && remaining < 0;
  const statusColor = isOver ? "#ef4444" : pct != null && pct >= 75 ? "#f59e0b" : fund.color;

  // group by month
  const byMonth: Record<string, { label: string; total: number; expenses: typeof fund.expenses }> = {};
  for (const e of fund.expenses) {
    const d = new Date(e.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleString("default", { month: "long", year: "numeric" });
    if (!byMonth[key]) byMonth[key] = { label, total: 0, expenses: [] };
    byMonth[key].total += e.amount;
    byMonth[key].expenses.push(e);
  }
  const months = Object.entries(byMonth).sort(([a], [b]) => b.localeCompare(a));

  return (
    <div>
      {/* Back + Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/funds">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft size={16} />
          </Button>
        </Link>
        <div
          className="h-10 w-10 rounded-xl flex items-center justify-center text-white font-bold text-lg"
          style={{ backgroundColor: fund.color }}
        >
          {fund.name[0].toUpperCase()}
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{fund.name}</h1>
          {fund.description && <p className="text-sm text-gray-400">{fund.description}</p>}
        </div>
        <div className="flex items-center gap-2">
          <ExpenseForm
            funds={allFunds}
            categories={categories}
            tags={tags}
            defaultFundId={id}
          />
          <EditFundButton fund={fund} />
          <DeleteFundButton id={id} />
        </div>
      </div>

      {/* Budget hero card — shown when budget is set */}
      {fund.budget != null && (
        <Card className="mb-6 overflow-hidden">
          <div className="h-1.5 w-full" style={{ backgroundColor: statusColor }} />
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-5">
              <div>
                <p className="text-sm text-gray-500 mb-0.5">{monthName}</p>
                <p className="text-xs text-gray-400">Budget resets on 1st of each month</p>
              </div>
              {isOver && (
                <span className="text-xs font-semibold text-red-600 bg-red-50 px-2.5 py-1 rounded-full">
                  ⚠ Over budget
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-6 mb-5">
              <div>
                <p className="text-xs text-gray-500 mb-1">Monthly Budget</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(fund.budget)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Spent This Month</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(thisMonth)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">{isOver ? "Overspent By" : "Remaining"}</p>
                <p className="text-2xl font-black" style={{ color: statusColor }}>
                  {isOver ? "−" : ""}{formatCurrency(Math.abs(remaining!))}
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-400">
                <span>{pct}% used</span>
                <span>{100 - pct!}% left</span>
              </div>
              <div className="h-3 w-full rounded-full bg-gray-100">
                <div
                  className="h-3 rounded-full transition-all"
                  style={{ width: `${pct}%`, backgroundColor: statusColor }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats row — all time + avg */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "All Time Total", value: formatCurrency(total), icon: TrendingUp, color: "text-indigo-600", bg: "bg-indigo-50" },
          { label: "This Month Spent", value: formatCurrency(thisMonth), icon: CalendarRange, color: "text-violet-600", bg: "bg-violet-50" },
          { label: "Avg Per Expense", value: formatCurrency(avgExpense), icon: ReceiptText, color: "text-emerald-600", bg: "bg-emerald-50" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">{s.label}</p>
                  <p className="text-xl font-bold text-gray-900">{s.value}</p>
                </div>
                <div className={`${s.bg} p-2 rounded-lg`}>
                  <s.icon className={`${s.color} h-4.5 w-4.5`} size={18} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Expenses grouped by month */}
      {fund.expenses.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <p className="text-gray-400 mb-4">No expenses in this fund yet.</p>
            <ExpenseForm funds={allFunds} categories={categories} tags={tags} defaultFundId={id} />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {months.map(([key, { label, total: monthTotal, expenses }]) => (
            <Card key={key}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm text-gray-700">{label}</CardTitle>
                  <span className="text-sm font-bold text-gray-900">{formatCurrency(monthTotal)}</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-0">
                  {expenses.map((e) => (
                    <div
                      key={e.id}
                      className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-800">{e.description}</p>
                          {e.tag && (
                            <span
                              className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium text-white"
                              style={{ backgroundColor: e.tag.color }}
                            >
                              #{e.tag.name}
                            </span>
                          )}
                          {e.category && (
                            <Badge variant="secondary" className="text-[10px] py-0">
                              {e.category.name}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-gray-400">{formatDate(e.date)}</span>
                          {e.note && <span className="text-xs text-gray-400 italic">· {e.note}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-bold text-gray-900 mr-2">
                          {formatCurrency(e.amount)}
                        </span>
                        <EditExpenseButton expense={e} funds={allFunds} categories={categories} tags={tags} />
                        <DeleteExpenseButton id={e.id} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
