import { getExpenses, getFunds, getCategories, getTags } from "@/lib/actions";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExpenseForm } from "@/components/expenses/expense-form";
import { EditExpenseButton } from "@/components/expenses/expense-form";
import { DeleteExpenseButton } from "@/components/expenses/delete-expense-button";
import { ExpenseFilters } from "@/components/expenses/expense-filters";
import { formatCurrency, formatDate } from "@/lib/utils";

interface SearchParams {
  fundId?: string;
  categoryId?: string;
  tagId?: string;
  search?: string;
  from?: string;
  to?: string;
}

interface Props { searchParams: Promise<SearchParams> }

export default async function ExpensesPage({ searchParams }: Props) {
  const sp = await searchParams;
  const [expenses, funds, categories, tags] = await Promise.all([
    getExpenses({
      fundId: sp.fundId,
      categoryId: sp.categoryId,
      tagId: sp.tagId,
      search: sp.search,
      from: sp.from ? new Date(sp.from) : undefined,
      to: sp.to ? new Date(sp.to) : undefined,
    }),
    getFunds(),
    getCategories(),
    getTags(),
  ]);

  const total = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div>
      <Header
        title="Expenses"
        description={`${expenses.length} expense${expenses.length !== 1 ? "s" : ""} · ${formatCurrency(total)} total`}
        action={<ExpenseForm funds={funds} categories={categories} tags={tags} />}
      />

      <ExpenseFilters funds={funds} categories={categories} tags={tags} />

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
                  className="flex items-center justify-between px-5 py-3.5 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div
                      className="h-9 w-9 rounded-lg flex-shrink-0 flex items-center justify-center text-white font-semibold text-sm"
                      style={{ backgroundColor: e.fund.color }}
                    >
                      {e.fund.name[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-gray-800 truncate">{e.description}</p>
                        <Badge
                          variant="secondary"
                          className="text-[10px] py-0 px-1.5 flex-shrink-0"
                          style={{ backgroundColor: e.fund.color + "18", color: e.fund.color }}
                        >
                          {e.fund.name}
                        </Badge>
                        {e.tag && (
                          <span
                            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium text-white flex-shrink-0"
                            style={{ backgroundColor: e.tag.color }}
                          >
                            # {e.tag.name}
                          </span>
                        )}
                        {e.category && (
                          <Badge variant="secondary" className="text-[10px] py-0 px-1.5 flex-shrink-0">
                            {e.category.name}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-400">{formatDate(e.date)}</span>
                        {e.note && <span className="text-xs text-gray-400 italic truncate">· {e.note}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-4 flex-shrink-0">
                    <span className="text-sm font-bold text-gray-900 mr-2">
                      {formatCurrency(e.amount)}
                    </span>
                    <EditExpenseButton expense={e} funds={funds} categories={categories} tags={tags} />
                    <DeleteExpenseButton id={e.id} />
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
