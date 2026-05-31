"use client";

import { useEffect, useState } from "react";
import { subscribeToast, type ToastPayload } from "@/lib/toast";
import { X, CheckCircle2, XCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export function Toaster() {
  const [toasts, setToasts] = useState<ToastPayload[]>([]);

  useEffect(() => {
    return subscribeToast((t) => {
      setToasts((prev) => [...prev, t]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.id !== t.id));
      }, 3500);
    });
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-[calc(100vw-2rem)] max-w-sm">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg text-sm animate-in slide-in-from-bottom-2 fade-in duration-200 bg-white",
            t.variant === "error" && "border-red-200",
            t.variant === "success" && "border-emerald-200",
            (!t.variant || t.variant === "info") && "border-gray-200"
          )}
        >
          {t.variant === "success" && <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-px" />}
          {t.variant === "error" && <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-px" />}
          {(!t.variant || t.variant === "info") && <Info className="h-5 w-5 text-indigo-500 flex-shrink-0 mt-px" />}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 leading-tight">{t.title}</p>
            {t.description && <p className="text-gray-500 text-xs mt-0.5">{t.description}</p>}
          </div>
          <button
            onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
            className="text-gray-300 hover:text-gray-500 flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
