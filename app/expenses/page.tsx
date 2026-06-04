import { getExpenses, getCategories, getTags } from "@/lib/actions";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExpenseForm } from "@/components/expenses/expense-form";
import { EditExpenseButton } from "@/components/expenses/expense-form";
import { DeleteExpenseButton } from "@/components/expenses/delete-expense-button";
import { ExpenseFilters } from "@/components/expenses/expense-filters";
import { formatCurrency, formatDate } from "@/lib/utils";

interface SearchParams {
  categoryId?: string;
  tagId?: string;
  tagMode?: string;
  search?: string;
  from?: string;
  to?: string;
}

interface Props { searchParams: Promise<SearchParams> }

export default async function ExpensesPage({ searchParams }: Props) {
  const sp = await searchParams;
  const [expenses, categories, tags] = await Promise.all([
    getExpenses({
      categoryId: sp.categoryId,
      tagId: sp.tagId,
      tagMode: sp.tagMode === "ne" ? "ne" : "eq",
      search: sp.search,
      from: sp.from ? new Date(sp.from) : undefined,
      to: sp.to ? new Date(sp.to) : undefined,
    }),
    getCategories(),
    getTags(),
  ]);

  const total = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div>
      <Header
        title="Expenses"
        description={`${expenses.length} expense${expenses.length !== 1 ? "s" : ""} · ${formatCurrency(total)} total`}
        action={<ExpenseForm categories={categories} tags={tags} />}
      />

      <ExpenseFilters categories={categories} tags={tags} />

      <Card>
        <CardContent className="p-0">
          {expenses.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-gray-400 text-sm">No expenses found.</p>
            </div>
          ) : (
            <div>
              {expenses.map((e) => (
                <div
                  key={e.id}
                  className="flex items-start sm:items-center justify-between px-4 sm:px-5 py-3.5 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors gap-3"
                >
                  {/* Left: avatar + details */}
                  <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                    <div
                      className="h-9 w-9 rounded-lg flex-shrink-0 flex items-center justify-center text-white font-semibold text-sm mt-0.5 sm:mt-0"
                      style={{ backgroundColor: e.category?.color ?? "#94a3b8" }}
                    >
                      {e.description[0]?.toUpperCase() ?? "?"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                        <p className="text-sm font-medium text-gray-800">{e.description}</p>
                        {e.tag && (
                          <span
                            className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium text-white flex-shrink-0"
                            style={{ backgroundColor: e.tag.color }}
                          >
                            #{e.tag.name}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs text-gray-400">{formatDate(e.date)}</span>
                        {e.category && (
                          <Badge variant="secondary" className="text-[10px] py-0 px-1.5 flex-shrink-0">
                            {e.category.name}
                          </Badge>
                        )}
                        {e.paymentMethod && (
                          <span className="text-[10px] font-medium py-0.5 px-1.5 rounded-full flex-shrink-0 bg-slate-100 text-slate-600 border border-slate-200">
                            {e.paymentMethod}
                          </span>
                        )}
                        {e.note && <span className="text-xs text-gray-400 italic truncate hidden sm:inline">· {e.note}</span>}
                      </div>
                    </div>
                  </div>
                  {/* Right: amount + actions */}
                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1 flex-shrink-0">
                    <span className="text-sm font-bold text-gray-900">
                      {formatCurrency(e.amount)}
                    </span>
                    <div className="flex items-center gap-0.5">
                      <EditExpenseButton expense={e} categories={categories} tags={tags} />
                      <DeleteExpenseButton id={e.id} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
