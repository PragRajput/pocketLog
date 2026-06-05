// UPI deep-link helpers.
//
// A UPI QR encodes a string like:
//   upi://pay?pa=merchant@bank&pn=Merchant%20Name&am=100.00&cu=INR&tn=note
// Static shop QRs usually omit `am` (amount); dynamic/bill QRs include it.

export type UpiApp = "any" | "gpay" | "phonepe" | "paytm";

export interface UpiPayParams {
  pa: string;        // payee VPA (UPI id)
  pn?: string;       // payee name
  am?: string | number; // amount
  tn?: string;       // transaction note
  tr?: string;       // transaction reference id
}

export interface ParsedUpi {
  pa: string;
  pn: string | null;
  am: string | null;
}

// App-specific URL schemes. They accept the same query params as `upi://pay`.
// "any" uses the generic scheme so Android shows the app chooser.
const APP_SCHEME: Record<UpiApp, string> = {
  any: "upi://pay",
  gpay: "tez://upi/pay",
  phonepe: "phonepe://pay",
  paytm: "paytmmp://pay",
};

export const UPI_APPS: { value: UpiApp; label: string }[] = [
  { value: "any", label: "Choose app" },
  { value: "gpay", label: "Google Pay" },
  { value: "phonepe", label: "PhonePe" },
  { value: "paytm", label: "Paytm" },
];

export function buildUpiUrl(app: UpiApp, params: UpiPayParams): string {
  const qs = new URLSearchParams();
  qs.set("pa", params.pa);
  if (params.pn) qs.set("pn", params.pn);
  if (params.am != null && params.am !== "") qs.set("am", String(params.am));
  qs.set("cu", "INR");
  if (params.tn) qs.set("tn", params.tn);
  if (params.tr) qs.set("tr", params.tr);
  return `${APP_SCHEME[app]}?${qs.toString()}`;
}

// Parse a scanned QR string. Returns null if it isn't a UPI payment QR.
export function parseUpiQr(raw: string): ParsedUpi | null {
  const text = raw.trim();
  if (!/^upi:\/\//i.test(text)) return null;
  try {
    const q = text.substring(text.indexOf("?") + 1);
    const params = new URLSearchParams(q);
    const pa = params.get("pa");
    if (!pa) return null;
    return {
      pa,
      pn: params.get("pn"),
      am: params.get("am"),
    };
  } catch {
    return null;
  }
}

// Loose VPA validation: something@handle.
export function isValidVpa(vpa: string): boolean {
  return /^[\w.\-]{2,}@[a-zA-Z]{2,}$/.test(vpa.trim());
}
