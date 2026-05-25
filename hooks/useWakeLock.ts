"use client";

import { useEffect, useRef } from "react";

/**
 * Acquires a Screen Wake Lock while `active` is true.
 * Silently no-ops on browsers that don't support the API.
 */
export function useWakeLock(active: boolean) {
  const lockRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    if (!active) {
      lockRef.current?.release().catch(() => {});
      lockRef.current = null;
      return;
    }

    if (!("wakeLock" in navigator)) return;

    navigator.wakeLock
      .request("screen")
      .then((lock) => {
        lockRef.current = lock;
      })
      .catch(() => {}); // denied or unsupported — fail silently

    return () => {
      lockRef.current?.release().catch(() => {});
      lockRef.current = null;
    };
  }, [active]);
}
