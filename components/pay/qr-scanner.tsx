"use client";

import { useEffect, useId, useRef, useState } from "react";

interface Props {
  onResult: (text: string) => void;
}

// Camera QR scanner backed by html5-qrcode (loaded lazily, client-only).
export function QrScanner({ onResult }: Props) {
  const regionId = "qr-region-" + useId().replace(/[:]/g, "");
  const [error, setError] = useState<string | null>(null);
  // Keep the latest callback without re-running the effect.
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let scanner: any = null;
    let handled = false;

    import("html5-qrcode")
      .then(({ Html5Qrcode }) => {
        if (cancelled) return;
        scanner = new Html5Qrcode(regionId, false);
        return scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 230, height: 230 } },
          (decoded: string) => {
            if (handled) return;
            handled = true;
            onResultRef.current(decoded);
          },
          () => { /* ignore per-frame decode misses */ },
        );
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message ?? "Unable to access the camera. Grant camera permission and use HTTPS.");
      });

    return () => {
      cancelled = true;
      if (scanner) {
        scanner.stop().then(() => scanner.clear()).catch(() => {});
      }
    };
  }, [regionId]);

  return (
    <div className="space-y-2">
      <div id={regionId} className="w-full overflow-hidden rounded-xl bg-black/5 [&_video]:rounded-xl" />
      {error ? (
        <p className="text-xs text-red-500">{error}</p>
      ) : (
        <p className="text-xs text-gray-400 text-center">Point your camera at the shop&apos;s UPI QR code.</p>
      )}
    </div>
  );
}
