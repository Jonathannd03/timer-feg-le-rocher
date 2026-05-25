"use client";

import { useEffect, useRef } from "react";
import { useServiceStore } from "@/store/serviceStore";

export function useTimer() {
  const tickTimer = useServiceStore((s) => s.tickTimer);
  const timerStatus = useServiceStore((s) => s.timerStatus);
  const endTime = useServiceStore((s) => s.endTime);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (timerStatus !== "running" && timerStatus !== "overtime") {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }

    const loop = () => {
      tickTimer();
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [timerStatus, tickTimer]);

  // Recalculate on tab visibility change
  useEffect(() => {
    const onVisible = () => {
      if ((timerStatus === "running" || timerStatus === "overtime") && endTime !== null) {
        tickTimer();
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [timerStatus, endTime, tickTimer]);
}
