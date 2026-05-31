import { getExpenses, getFunds, getCategories } from "@/lib/actions";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ReportsCharts } from "@/components/dashboard/reports-charts";
import { ExportButton } from "@/components/reports/export-button";
import { formatCurrency } from "@/lib/utils";

interface SearchParams { month?: string }
interface Props { searchParams: Promise<SearchParams> }

export default async function ReportsPage({ searchParams }: Props) {
  const sp = await searchParams;

  // month = "2026-05" format, default to current month
  const now = new Date();
  const monthStr = sp.month ?? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const [year, month] = monthStr.split("-").map(Number);
  const from = new Date(year, month - 1, 1);
  const to = new Date(year, month, 0, 23, 59, 59);

  const [expenses, funds, categories] = await Promise.all([
    getExpenses({ from, to }),
    getFunds(),
    getCategories(),
  ]);

  const total = expenses.reduce((s, e) => s + e.amount, 0);

  // By fund
  const byFund = funds.map((f) => {
    const fExpenses = expenses.filter((e) => e.fundId === f.id);
    return {
      id: f.id,
      name: f.name,
      color: f.color,
      amount: fExpenses.reduce((s, e) => s + e.amount, 0),
      count: fExpenses.length,
    };
  }).filter((f) => f.amount > 0).sort((a, b) => b.amount - a.amount);

  // By category
  const byCat: Record<string, { name: string; color: string; amount: number; count: number }> = {};
  for (const e of expenses) {
    const key = e.categoryId ?? "uncategorized";
    const name = e.category?.name ?? "Uncategorized";
    const color = e.category?.color ?? "#94a3b8";
    if (!byCat[key]) byCat[key] = { name, color, amount: 0, count: 0 };
    byCat[key].amount += e.amount;
    byCat[key].count++;
  }
  const byCategory = Object.values(byCat).sort((a, b) => b.amount - a.amount);

  // Daily breakdown for chart
  const dailyMap: Record<string, number> = {};
  for (const e of expenses) {
    const day = new Date(e.date).getDate();
    const key = String(day);
    dailyMap[key] = (dailyMap[key] ?? 0) + e.amount;
  }
  const daysInMonth = new Date(year, month, 0).getDate();
  const dailyData = Array.from({ length: daysInMonth }, (_, i) => ({
    day: String(i + 1),
    amount: dailyMap[String(i + 1)] ?? 0,
  }));

  // Month navigation
  const prevMonth = new Date(year, month - 2, 1);
  const nextMonth = new Date(year, month, 1);
  const prevStr = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, "0")}`;
  const nextStr = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, "0")}`;
  const isCurrentMonth = monthStr === `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const monthLabel = from.toLocaleString("default", { month: "long", year: "numeric" });

  return (
    <div>
      <Header
        title="Reports"
        description={`Analysis for ${monthLabel}`}
        action={<ExportButton expenses={expenses} month={monthLabel} />}
      />

      {/* Month navigation */}
      <div className="flex items-center gap-3 mb-6">
        <a
          href={`/reports?month=${prevStr}`}
          className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors"
        >
          ← Previous
        </a>
        <span className="text-sm font-semibold text-gray-700 px-2">{monthLabel}</span>
        {!isCurrentMonth && (
          <a
            href={`/reports?month=${nextStr}`}
            className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors"
          >
            Next →
          </a>
        )}
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-gray-500 mb-1">Total Spent</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(total)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-gray-500 mb-1">Transactions</p>
            <p className="text-2xl font-bold text-gray-900">{expenses.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-gray-500 mb-1">Daily Average</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(total / daysInMonth)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Daily spending chart */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-sm">Daily Spending — {monthLabel}</CardTitle>
        </CardHeader>
        <CardContent>
          <ReportsCharts daily={dailyData} byFund={byFund} byCategory={byCategory} />
        </CardContent>
      </Card>

      {/* Fund + Category breakdown */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">By Fund</CardTitle>
          </CardHeader>
          <CardContent>
            {byFund.length === 0 ? (
              <p className="text-sm text-gray-400">No data for this month.</p>
            ) : (
              <div className="space-y-3">
                {byFund.map((f) => (
                  <div key={f.id}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: f.color }} />
                        <span className="text-sm font-medium text-gray-700">{f.name}</span>
                        <Badge variant="secondary" className="text-[10px] py-0">{f.count}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">
                          {total > 0 ? Math.round((f.amount / total) * 100) : 0}%
                        </span>
                        <span className="text-sm font-bold text-gray-900">{formatCurrency(f.amount)}</span>
                      </div>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-gray-100">
                      <div
                        className="h-1.5 rounded-full"
                        style={{
                          width: total > 0 ? `${(f.amount / total) * 100}%` : "0%",
                          backgroundColor: f.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">By Category</CardTitle>
          </CardHeader>
          <CardContent>
            {byCategory.length === 0 ? (
              <p className="text-sm text-gray-400">No data for this month.</p>
            ) : (
              <div className="space-y-3">
                {byCategory.map((c) => (
                  <div key={c.name}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                        <span className="text-sm font-medium text-gray-700">{c.name}</span>
                        <Badge variant="secondary" className="text-[10px] py-0">{c.count}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">
                          {total > 0 ? Math.round((c.amount / total) * 100) : 0}%
                        </span>
                        <span className="text-sm font-bold text-gray-900">{formatCurrency(c.amount)}</span>
                      </div>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-gray-100">
                      <div
                        className="h-1.5 rounded-full"
                        style={{
                          width: total > 0 ? `${(c.amount / total) * 100}%` : "0%",
                          backgroundColor: c.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
