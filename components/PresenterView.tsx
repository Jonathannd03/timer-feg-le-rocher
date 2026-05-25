"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useBroadcastReceiver } from "@/hooks/useBroadcast";
import { formatTime } from "@/lib/utils";
import type { BroadcastPayload, TimerStatus, BibleVerse } from "@/types";

interface PresenterState {
  sectionName: string;
  remaining: number;
  status: TimerStatus;
  verse: BibleVerse | null;
  totalDuration: number;
}

export function PresenterView() {
  const [state, setState] = useState<PresenterState>({
    sectionName: "Warte auf Verbindung...",
    remaining: 0,
    status: "idle",
    verse: null,
    totalDuration: 1,
  });

  useBroadcastReceiver((payload: BroadcastPayload["state"]) => {
    setState(payload);
  });

  const { sectionName, remaining, status, verse, totalDuration } = state;
  const isOvertime = remaining < 0;
  const progress = Math.max(0, Math.min(1, remaining / Math.max(totalDuration, 1)));

  const timeColor = isOvertime
    ? "#F87171"
    : progress > 0.25
    ? "#EEEEFF"
    : progress > 0.1
    ? "#FB923C"
    : "#F87171";

  const ringColor = isOvertime
    ? "#F87171"
    : progress > 0.25
    ? "#3D72F6"
    : progress > 0.1
    ? "#FB923C"
    : "#F87171";

  const r = 110;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - progress);

  return (
    <div className="fixed inset-0 bg-[#09090F] flex flex-col overflow-hidden">
      {/* Back button */}
      <div className="absolute top-4 left-4 z-10">
        <Link
          href="/"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.05] border border-white/[0.07] text-[#7580A0] text-xs hover:text-[#EEEEFF] hover:bg-white/[0.08] transition-all"
        >
          <ArrowLeft size={12} />
          Operator
        </Link>
      </div>

      {/* Status pill */}
      <div className="absolute top-4 right-4 z-10">
        <div
          className={[
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border",
            status === "running"
              ? "bg-green-500/10 border-green-500/20 text-green-400"
              : "bg-white/[0.05] border-white/[0.08] text-[#7580A0]",
          ].join(" ")}
        >
          <div
            className={[
              "w-1.5 h-1.5 rounded-full",
              status === "running" ? "bg-green-400 animate-pulse" : "bg-[#3E4560]",
            ].join(" ")}
          />
          {status === "running" ? "Läuft" : status === "paused" ? "Pausiert" : "Bereit"}
        </div>
      </div>

      {/* Main split layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Timer */}
        <div className="flex-1 flex flex-col items-center justify-center px-12 xl:px-20 border-r border-white/[0.05]">
          <AnimatePresence mode="wait">
            <motion.p
              key={sectionName}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              className="text-sm font-semibold tracking-[0.15em] uppercase text-[#7580A0] mb-8"
            >
              {sectionName}
            </motion.p>
          </AnimatePresence>

          {/* Ring + Timer */}
          <div className="relative flex items-center justify-center mb-8">
            <svg
              width={260}
              height={260}
              style={{ transform: "rotate(-90deg)" }}
            >
              <circle
                cx={130}
                cy={130}
                r={r}
                fill="none"
                stroke="rgba(255,255,255,0.04)"
                strokeWidth={8}
              />
              <circle
                cx={130}
                cy={130}
                r={r}
                fill="none"
                stroke={ringColor}
                strokeWidth={8}
                strokeLinecap="round"
                strokeDasharray={circ}
                strokeDashoffset={offset}
                style={{
                  transition: "stroke-dashoffset 0.5s linear, stroke 0.5s ease",
                }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span
                className="font-bold tabular-nums leading-none"
                style={{
                  fontSize: "clamp(3.5rem, 10vw, 7rem)",
                  color: timeColor,
                  transition: "color 0.4s ease",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {isOvertime ? "-" : ""}{formatTime(Math.abs(remaining))}
              </span>
              <span className="text-[11px] font-medium tracking-[0.2em] uppercase text-[#3E4560] mt-2">
                Verbleibende Zeit
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-48 h-0.5 rounded-full bg-white/[0.05] overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: ringColor }}
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Right: Verse */}
        <div className="flex-1 flex flex-col items-center justify-center px-12 xl:px-20">
          <AnimatePresence mode="wait">
            {verse ? (
              <motion.div
                key={verse.reference}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4 }}
                className="max-w-lg text-center"
              >
                <p
                  className="font-bold mb-6 tracking-wide"
                  style={{ color: "#E8A83A", fontSize: "clamp(1rem, 2.5vw, 1.5rem)" }}
                >
                  {verse.reference}
                </p>
                <p
                  className="leading-relaxed text-[#EEEEFF]/80 font-light"
                  style={{ fontSize: "clamp(1.1rem, 2.8vw, 1.8rem)" }}
                >
                  „{verse.text}"
                </p>
                <p className="mt-6 text-sm text-[#3E4560] uppercase tracking-widest">
                  {verse.translation}
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.07] flex items-center justify-center mx-auto mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3E4560" strokeWidth="1.5">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                  </svg>
                </div>
                <p className="text-[#3E4560] text-sm">Kein Vers ausgewählt</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
