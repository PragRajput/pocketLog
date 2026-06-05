"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RotateCcw } from "lucide-react";

// Graceful fallback for page-render errors (e.g. a transient database outage)
// so users see a retry button instead of a raw 500.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="h-14 w-14 rounded-2xl bg-amber-50 flex items-center justify-center mb-4">
        <AlertTriangle className="h-7 w-7 text-amber-500" />
      </div>
      <h2 className="text-lg font-semibold text-gray-800 mb-1">Couldn&apos;t load this page</h2>
      <p className="text-sm text-gray-400 max-w-xs mb-5">
        We had trouble reaching the server. This is usually temporary — please try again.
      </p>
      <Button onClick={reset} className="gap-2">
        <RotateCcw size={15} />
        Try again
      </Button>
    </div>
  );
}
