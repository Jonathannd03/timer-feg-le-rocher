"use client";

import { useEffect } from "react";
import { useServiceStore } from "@/store/serviceStore";

export function useKeyboard() {
  const startTimer = useServiceStore((s) => s.startTimer);
  const pauseTimer = useServiceStore((s) => s.pauseTimer);
  const timerStatus = useServiceStore((s) => s.timerStatus);
  const nextSection = useServiceStore((s) => s.nextSection);
  const prevSection = useServiceStore((s) => s.prevSection);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      switch (e.code) {
        case "Space":
          e.preventDefault();
          if (timerStatus === "running") {
            pauseTimer();
          } else {
            startTimer();
          }
          break;
        case "ArrowRight":
          e.preventDefault();
          if (timerStatus === "idle") nextSection();
          break;
        case "ArrowLeft":
          e.preventDefault();
          if (timerStatus === "idle") prevSection();
          break;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [timerStatus, startTimer, pauseTimer, nextSection, prevSection]);
}
