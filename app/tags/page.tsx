import { getTags } from "@/lib/actions";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { TagIcon, ArrowRight } from "lucide-react";
import Link from "next/link";
import { DeleteTagButton } from "@/components/tags/delete-tag-button";
import { TagForm, EditTagButton } from "@/components/tags/tag-form";

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

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
        {tagsWithStats.map((t) => (
          <Card key={t.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-5">
              {/* Header: color pill + actions */}
              <div className="flex items-start justify-between gap-2">
                <div
                  className="inline-flex min-w-0 items-center rounded-full px-3 py-1.5 text-sm font-semibold text-white shadow-sm"
                  style={{ backgroundColor: t.color }}
                >
                  <span className="truncate"># {t.name}</span>
                </div>
                <div className="flex items-center gap-0.5 flex-shrink-0">
                  <EditTagButton tag={t} />
                  <DeleteTagButton id={t.id} />
                </div>
              </div>

              {/* Stats */}
              <div className="mt-3 grid grid-cols-3 gap-2">
                <div>
                  <p className="text-[11px] text-gray-400">Total paid</p>
                  <p className="text-sm font-bold text-gray-900 truncate">{formatCurrency(t.total)}</p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-400">Payments</p>
                  <p className="text-sm font-semibold text-gray-700">{t.count}</p>
                </div>
                {t.firstDate && (
                  <div className="min-w-0">
                    <p className="text-[11px] text-gray-400">Period</p>
                    <p className="text-xs font-medium text-gray-600 truncate">
                      {formatDate(t.firstDate)}
                      {t.firstDate !== t.lastDate && t.lastDate ? ` → ${formatDate(t.lastDate)}` : ""}
                    </p>
                  </div>
                )}
              </div>

              {/* Note */}
              {t.note && (
                <div className="mt-3 rounded-lg bg-gray-50 px-3 py-2">
                  <p className="text-xs text-gray-600 whitespace-pre-wrap">{t.note}</p>
                </div>
              )}

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

              {/* View payments — bottom-right on laptop/tablet, left on mobile */}
              <div className="mt-3 flex sm:justify-end">
                <Link
                  href={`/expenses?tagId=${t.id}`}
                  className="inline-flex items-center gap-1 text-xs font-medium text-sky-600 hover:text-sky-700"
                >
                  View payments
                  <ArrowRight size={12} />
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
