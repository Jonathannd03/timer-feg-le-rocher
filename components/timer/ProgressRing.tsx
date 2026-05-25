"use client";

import { useMemo } from "react";
import { timerHex } from "@/lib/utils";

interface Props {
  progress: number; // 0..1
  isOvertime: boolean;
  isIdle?: boolean;
  size?: number;
  strokeWidth?: number;
}

export function ProgressRing({
  progress,
  isOvertime,
  isIdle = false,
  size = 140,
  strokeWidth = 6,
}: Props) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(1, progress));
  const offset = circ * (1 - clamped);

  const color = useMemo(() => timerHex(progress, isOvertime, isIdle), [progress, isOvertime, isIdle]);

  const center = size / 2;

  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      {/* Track */}
      <circle
        cx={center}
        cy={center}
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.05)"
        strokeWidth={strokeWidth}
      />
      {/* Progress arc */}
      <circle
        cx={center}
        cy={center}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 0.4s linear, stroke 0.4s ease" }}
      />
    </svg>
  );
}
