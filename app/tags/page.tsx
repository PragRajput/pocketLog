import { getTags } from "@/lib/actions";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { TagIcon, ArrowRight } from "lucide-react";
import Link from "next/link";
import { DeleteTagButton } from "@/components/tags/delete-tag-button";
import { TagForm } from "@/components/tags/tag-form";

export default async function TagsPage() {
  const tags = await getTags();

  const tagsWithStats = tags.map((t) => {
    const total = t.expenses.reduce((s, e) => s + e.amount, 0);
    const sorted = [...t.expenses].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const firstDate = sorted[0]?.date;
    const lastDate = sorted[sorted.length - 1]?.date;
    return { ...t, total, count: t.expenses.length, firstDate, lastDate };
  }).sort((a, b) => b.total - a.total);

  return (
    <div>
      <Header
        title="Tags"
        description="Group related payments together — like all payments for a single purchase"
        action={<TagForm />}
      />

      {tags.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-14 w-14 rounded-2xl bg-sky-50 flex items-center justify-center mb-4">
              <TagIcon className="h-7 w-7 text-sky-400" />
            </div>
            <p className="text-lg font-semibold text-gray-700 mb-1">No tags yet</p>
            <p className="text-sm text-gray-400 max-w-sm">
              Create tags while adding expenses to group multi-payment purchases together.
              For example, tag all RO Purifier payments with "RO Purifier" to track the total cost.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-3">
        {tagsWithStats.map((t) => (
          <Card key={t.id} className="hover:shadow-md transition-shadow group">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {/* Color pill */}
                  <div
                    className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold text-white shadow-sm"
                    style={{ backgroundColor: t.color }}
                  >
                    # {t.name}
                  </div>

                  {/* Stats */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                    <span>
                      <span className="text-xs text-gray-400">Total paid </span>
                      <span className="font-bold text-gray-900">{formatCurrency(t.total)}</span>
                    </span>
                    <span className="text-gray-200">·</span>
                    <span>
                      <span className="text-xs text-gray-400">Payments </span>
                      <span className="font-semibold text-gray-700">{t.count}</span>
                    </span>
                    {t.firstDate && (
                      <>
                        <span className="text-gray-200">·</span>
                        <span className="text-xs text-gray-500">
                          {formatDate(t.firstDate)}
                          {t.firstDate !== t.lastDate && t.lastDate ? ` → ${formatDate(t.lastDate)}` : ""}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link
                    href={`/expenses?tagId=${t.id}`}
                    className="text-xs text-sky-600 hover:text-sky-700 flex items-center gap-1 font-medium opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    View payments
                    <ArrowRight size={12} />
                  </Link>
                  <DeleteTagButton id={t.id} />
                </div>
              </div>

              {/* Payment mini-timeline */}
              {t.count > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-50 flex items-center gap-3 overflow-x-auto">
                  {[...t.expenses]
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .map((e, i) => (
                      <div key={e.id} className="flex items-center gap-2 flex-shrink-0">
                        {i > 0 && <div className="h-px w-4 bg-gray-200" />}
                        <div className="text-center">
                          <p className="text-xs text-gray-500">{formatDate(e.date)}</p>
                          <p
                            className="text-sm font-semibold mt-0.5"
                            style={{ color: t.color }}
                          >
                            {formatCurrency(e.amount)}
                          </p>
                        </div>
                      </div>
                    ))}
                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    <div className="h-px w-4 bg-gray-200" />
                    <div className="text-center">
                      <p className="text-xs text-gray-400">Total</p>
                      <p className="text-sm font-bold text-gray-900">{formatCurrency(t.total)}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
