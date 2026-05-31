export type ToastVariant = "success" | "error" | "info";

export interface ToastPayload {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
}

type Subscriber = (t: ToastPayload) => void;

const subs = new Set<Subscriber>();

export function toast(data: Omit<ToastPayload, "id">) {
  const id = Math.random().toString(36).slice(2, 9);
  subs.forEach((fn) => fn({ ...data, id }));
}

export function subscribeToast(fn: Subscriber) {
  subs.add(fn);
  return () => { subs.delete(fn); };
}
