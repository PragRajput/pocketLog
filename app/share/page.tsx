export const dynamic = "force-dynamic";

import { getCategories, getTags } from "@/lib/actions";
import { parseSharedPayment } from "@/lib/parse-payment";
import { Header } from "@/components/layout/header";
import { ShareExpenseForm } from "@/components/pay/share-expense-form";

interface SearchParams { title?: string; text?: string; url?: string }
interface Props { searchParams: Promise<SearchParams> }

// PWA share-target landing page. When the user shares a payment confirmation
// or bank debit SMS to Pocketlog, the shared content arrives here as query
// params; we parse an amount + merchant and pre-fill an expense to confirm.
export default async function SharePage({ searchParams }: Props) {
  const sp = await searchParams;
  const shared = [sp.text, sp.title, sp.url].filter(Boolean).join("\n");
  const parsed = parseSharedPayment(shared);

  const [categories, tags] = await Promise.all([getCategories(), getTags()]);

  return (
    <div>
      <Header
        title="Log payment"
        description="Captured from another app — check the details and save."
      />
      <ShareExpenseForm
        categories={categories}
        tags={tags}
        defaultAmount={parsed.amount != null ? String(parsed.amount) : ""}
        defaultDescription={parsed.merchant ?? ""}
        defaultPaymentMethod={parsed.paymentMethod ?? ""}
        rawText={parsed.raw}
      />
    </div>
  );
}
