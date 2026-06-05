// Best-effort extraction of an amount + merchant from shared text
// (a bank debit SMS, an order-confirmation, etc.). Heuristic, not perfect —
// the user confirms before saving.

const MERCHANTS = [
  "Swiggy", "Zomato", "Flipkart", "Amazon", "Blinkit", "Zepto", "BigBasket",
  "Instamart", "Dunzo", "Myntra", "Ajio", "Nykaa", "Meesho",
  "Uber", "Ola", "Rapido", "BookMyShow", "IRCTC", "MakeMyTrip", "Ixigo",
  "Netflix", "Spotify", "Hotstar", "Jio", "Airtel", "Vi",
  "PhonePe", "Paytm", "GooglePay", "CRED",
];

const BANKS = [
  "HDFC", "ICICI", "SBI", "Axis", "Kotak", "IDFC", "Canara", "RBL", "IndusInd",
  "Yes Bank", "Bank of Baroda", "BOB", "PNB", "Union Bank", "Amex",
  "American Express", "Citi", "Standard Chartered", "AU", "Federal",
];

export interface ParsedPayment {
  amount: number | null;
  merchant: string | null;
  paymentMethod: string | null; // e.g. "Credit Card · HDFC", "Debit Card", "UPI"
  raw: string;
}

// Detect how the payment was made from a card/UPI alert SMS or email.
function detectPaymentMethod(raw: string): string | null {
  let type: string | null = null;
  if (/credit\s*card/i.test(raw)) type = "Credit Card";
  else if (/debit\s*card/i.test(raw)) type = "Debit Card";
  else if (/\bUPI\b/i.test(raw)) type = "UPI";
  else if (/\bcard\b/i.test(raw)) type = "Card";

  let bank: string | null = null;
  for (const b of BANKS) {
    if (new RegExp(`\\b${b}\\b`, "i").test(raw)) { bank = b; break; }
  }

  if (type && bank) return `${type} · ${bank}`;
  return type ?? bank ?? null;
}

export function parseSharedPayment(text: string | undefined | null): ParsedPayment {
  const raw = (text ?? "").trim();
  if (!raw) return { amount: null, merchant: null, paymentMethod: null, raw: "" };

  // ── Amount ──────────────────────────────────────────────
  // Prefer an amount that sits next to a spend keyword (avoids grabbing the
  // account balance, which also appears in debit SMS).
  const amtPattern = "(?:₹|rs\\.?|inr)\\s?([\\d,]+(?:\\.\\d{1,2})?)";
  const near = raw.match(new RegExp(`(?:debited|debit|paid|spent|sent|purchase|txn|payment of|charged)[^\\d₹]{0,20}${amtPattern}`, "i"));
  const any = raw.match(new RegExp(amtPattern, "i"));
  const plainNum = raw.match(/(?:^|\s)([\d,]+(?:\.\d{1,2}))(?:\s|$)/); // e.g. "450.00"
  const picked = near?.[1] ?? any?.[1] ?? plainNum?.[1];
  const amount = picked ? Number(picked.replace(/,/g, "")) : null;

  // ── Merchant ────────────────────────────────────────────
  let merchant: string | null = null;
  for (const m of MERCHANTS) {
    if (new RegExp(`\\b${m}\\b`, "i").test(raw)) { merchant = m; break; }
  }
  if (!merchant) {
    const to = raw.match(/\b(?:to|at|@)\s+([A-Za-z][A-Za-z0-9&.\- ]{2,28})/);
    if (to) merchant = to[1].trim().replace(/\s+(on|via|using|ref|upi|dated).*$/i, "").trim();
  }

  return {
    amount: amount && amount > 0 ? amount : null,
    merchant: merchant || null,
    paymentMethod: detectPaymentMethod(raw),
    raw,
  };
}
