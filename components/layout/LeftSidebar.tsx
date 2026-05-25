"use client";

import { useServiceStore } from "@/store/serviceStore";
import { formatTime, timerHex } from "@/lib/utils";
import { GlassCard } from "@/components/ui/GlassCard";

export function LeftSidebar() {
  const sections     = useServiceStore((s) => s.sections);
  const currentIndex = useServiceStore((s) => s.currentIndex);
  const remaining    = useServiceStore((s) => s.remaining);
  const timerStatus  = useServiceStore((s) => s.timerStatus);
  const currentVerse = useServiceStore((s) => s.currentVerse);

  const current = sections[currentIndex];
  const next    = sections[currentIndex + 1];

  const isRunning  = timerStatus === "running" || timerStatus === "overtime";
  const isOvertime = remaining < 0;
  const progress   = Math.max(0, Math.min(100, (remaining / (current?.duration || 1)) * 100));

  const timeColor = timerHex(progress / 100, isOvertime, timerStatus === "idle" && remaining <= 0);

  return (
    <aside className="w-[260px] flex-shrink-0 flex flex-col gap-3 h-full py-4 pl-4 pr-2">

      {/* ── Aktuell ── fills top ~55% */}
      <GlassCard className="flex-[11] flex flex-col p-4 min-h-0">
        <p className="text-[9px] font-semibold tracking-[0.2em] uppercase text-[#3E4560] mb-3 flex-shrink-0">
          Aktuell
        </p>

        <p className="text-sm font-semibold text-[#EEEEFF] truncate flex-shrink-0">
          {current?.name ?? ""}
        </p>
        {current?.speaker && (
          <p className="text-xs text-[#3E4560] truncate mt-0.5 flex-shrink-0">
            {current.speaker}
          </p>
        )}

        {/* Time */}
        <p
          className="font-bold tabular-nums leading-none mt-4 flex-shrink-0"
          style={{ fontSize: "2.8rem", color: timeColor, letterSpacing: "-0.03em" }}
        >
          {isOvertime ? "−" : ""}{formatTime(Math.abs(remaining))}
        </p>

        {/* Progress bar */}
        <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden mt-3 flex-shrink-0">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progress}%`,
              background: timerHex(progress / 100, isOvertime),
            }}
          />
        </div>

        {/* Status */}
        <div className="flex items-center gap-1.5 mt-2 flex-shrink-0">
          <div className={[
            "w-2 h-2 rounded-full flex-shrink-0",
            isRunning ? "bg-green-400 animate-pulse" : "bg-[#2A2F48]",
          ].join(" ")} />
          <span className="text-xs text-[#3E4560]">
            {isRunning
              ? isOvertime ? "Overtime läuft" : "Läuft"
              : timerStatus === "paused" ? "Pausiert"
              : "Bereit"}
          </span>
        </div>

        {/* Shortcuts — pinned at bottom of this card */}
        <div className="mt-auto pt-4 border-t border-white/[0.05] flex-shrink-0">
          <p className="text-[9px] font-semibold tracking-[0.2em] uppercase text-[#3E4560] mb-2">
            Shortcuts
          </p>
          {[
            ["Space", "Play / Pause"],
            ["← →",  "Navigation"],
            ["F",    "Vollbild"],
          ].map(([key, label]) => (
            <div key={key} className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-[#3E4560]">{label}</span>
              <kbd className="px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.07] text-[10px] text-[#7580A0] font-mono">
                {key}
              </kbd>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* ── Nächster ── */}
      {next ? (
        <GlassCard className="flex-[5] flex flex-col p-4 min-h-0">
          <p className="text-[9px] font-semibold tracking-[0.2em] uppercase text-[#3E4560] mb-2 flex-shrink-0">
            Nächster
          </p>
          <p className="text-sm font-medium text-[#7580A0] truncate flex-shrink-0">{next.name}</p>
          {next.speaker && (
            <p className="text-xs text-[#3E4560] truncate mt-0.5 flex-shrink-0">{next.speaker}</p>
          )}
          <p className="text-2xl font-bold tabular-nums text-[#3E4560] mt-auto" style={{ letterSpacing: "-0.02em" }}>
            {formatTime(next.duration)}
          </p>
        </GlassCard>
      ) : (
        <div className="flex-[5]" />
      )}

      {/* ── Aktiver Vers ── */}
      {currentVerse ? (
        <GlassCard className="flex-[6] flex flex-col p-4 min-h-0">
          <p className="text-[9px] font-semibold tracking-[0.2em] uppercase text-[#3E4560] mb-2 flex-shrink-0">
            Aktiver Vers
          </p>
          <p className="text-sm font-semibold text-[#E8A83A] mb-2 flex-shrink-0">
            {currentVerse.reference}
          </p>
          <p className="text-xs text-[#7580A0] leading-relaxed overflow-hidden">
            „{currentVerse.text}"
          </p>
        </GlassCard>
      ) : (
        <div className="flex-[6]" />
      )}

    </aside>
  );
}
