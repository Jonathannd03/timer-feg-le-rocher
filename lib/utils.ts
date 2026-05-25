import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { TimerColor } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(seconds: number): string {
  const abs = Math.abs(seconds);
  const h = Math.floor(abs / 3600);
  const m = Math.floor((abs % 3600) / 60);
  const s = abs % 60;
  const sign = seconds < 0 ? "-" : "";
  if (h > 0) {
    return `${sign}${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${sign}${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function getTimerColor(remaining: number, total: number): TimerColor {
  if (remaining <= 0) return "red";
  const pct = remaining / total;
  if (pct > 0.25) return "green";
  if (pct > 0.1) return "yellow";
  return "red";
}

/** Green → Orange → Red based on progress (0..1). Neutral white when idle. */
export function timerHex(progress: number, isOvertime: boolean, isIdle = false): string {
  if (isIdle)                        return "#EEEEFF"; // neutral — timer not started
  if (isOvertime || progress <= 0.1) return "#F87171"; // red
  if (progress <= 0.25)              return "#FB923C"; // orange
  return "#4ADE80";                                    // green
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}
