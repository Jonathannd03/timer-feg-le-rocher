"use client";

import { useMemo } from "react";
import { formatTime, timerHex } from "@/lib/utils";
import { ProgressRing } from "./ProgressRing";
import type { TimerStatus } from "@/types";

interface Props {
  remaining: number;
  totalDuration: number;
  status: TimerStatus;
}

export function TimerDisplay({ remaining, totalDuration, status }: Props) {
  const isOvertime = remaining < 0;
  const progress = useMemo(
    () => Math.max(0, Math.min(1, remaining / Math.max(totalDuration, 1))),
    [remaining, totalDuration]
  );

  const timeColor = useMemo(() => timerHex(progress, isOvertime, status === "idle" && remaining <= 0), [progress, isOvertime, status, remaining]);

  const timeStr = formatTime(remaining);

  return (
    <div className="relative flex items-center justify-center">
      <ProgressRing
        progress={progress}
        isOvertime={isOvertime}
        isIdle={status === "idle" && remaining <= 0}
        size={240}
        strokeWidth={6}
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
        <span
          className="font-bold tabular-nums leading-none tracking-tight"
          style={{
            fontSize: "clamp(2.8rem, 7vw, 4.2rem)",
            color: timeColor,
            fontVariantNumeric: "tabular-nums",
            transition: "color 0.4s ease",
          }}
        >
          {isOvertime ? "-" : ""}{formatTime(Math.abs(remaining))}
        </span>
        <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-[#3E4560]">
          {status === "running"
            ? "Läuft"
            : status === "paused"
            ? "Pausiert"
            : status === "overtime"
            ? "Overtime"
            : "Bereit"}
        </span>
      </div>
    </div>
  );
}
