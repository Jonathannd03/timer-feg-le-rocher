"use client";

import Image from "next/image";
import { useWallClock } from "@/hooks/useWallClock";
import { useServiceStore } from "@/store/serviceStore";
import { formatTime } from "@/lib/utils";

export function AppHeader() {
  const time         = useWallClock();
  const sections     = useServiceStore((s) => s.sections);
  const currentIndex = useServiceStore((s) => s.currentIndex);
  const remaining    = useServiceStore((s) => s.remaining);
  const timerStatus  = useServiceStore((s) => s.timerStatus);

  const current    = sections[currentIndex];
  const isLive     = timerStatus === "running" || timerStatus === "overtime";
  const isPaused   = timerStatus === "paused";
  const isOvertime = remaining < 0;

  return (
    <header
      className="flex-shrink-0 flex items-center justify-between px-5 h-14 border-b border-white/[0.06]"
      style={{ background: "rgba(9,9,15,0.92)", backdropFilter: "blur(12px)" }}
    >
      {/* ── Left: logo + name ── */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="w-8 h-8 rounded-xl bg-white p-1.5 flex items-center justify-center flex-shrink-0 shadow-md">
          <Image
            src="/images/feg_logo.png"
            alt="FEG Logo"
            width={24}
            height={24}
            className="object-contain"
          />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-[#EEEEFF] leading-tight">FEG le Rocher</p>
          <p className="text-[9px] font-semibold tracking-[0.22em] uppercase text-[#3E4560] leading-tight">
            Operator Panel
          </p>
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-px h-6 bg-white/[0.07] mx-2 flex-shrink-0" />

        {/* Live status pill */}
        {current && (
          <div className="hidden sm:flex items-center gap-2 min-w-0">
            {/* Status dot */}
            <span
              className={[
                "w-1.5 h-1.5 rounded-full flex-shrink-0",
                isLive    ? "bg-green-400 animate-pulse"  :
                isPaused  ? "bg-amber-400"                 :
                            "bg-[#2A2F48]",
              ].join(" ")}
            />
            {/* Section name */}
            <span className="text-xs font-medium text-[#7580A0] truncate max-w-[180px]">
              {current.name}
            </span>
            {/* Time remaining */}
            <span
              className="text-xs font-bold tabular-nums flex-shrink-0"
              style={{
                color: isOvertime ? "#F87171" : isLive ? "#4ADE80" : "#3E4560",
              }}
            >
              {isOvertime ? "−" : ""}{formatTime(Math.abs(remaining))}
            </span>
            {/* Status label */}
            <span className="hidden md:inline text-[9px] font-semibold tracking-[0.18em] uppercase px-2 py-0.5 rounded-md flex-shrink-0"
              style={{
                background: isLive   ? "rgba(74,222,128,0.08)"  :
                            isPaused ? "rgba(251,191,36,0.08)"   :
                                       "rgba(255,255,255,0.03)",
                color:      isLive   ? "#4ADE80"                 :
                            isPaused ? "#FBB924"                 :
                                       "#3E4560",
                border:     `1px solid ${
                              isLive   ? "rgba(74,222,128,0.2)"  :
                              isPaused ? "rgba(251,191,36,0.2)"  :
                                         "rgba(255,255,255,0.06)"
                            }`,
              }}
            >
              {isLive    ? isOvertime ? "Overtime" : "Live"
               : isPaused ? "Pausiert"
               : "Bereit"}
            </span>
          </div>
        )}
      </div>

      {/* ── Right: clock + copyright ── */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="hidden sm:block w-px h-6 bg-white/[0.07]" />
        <div className="flex flex-col items-end gap-0.5">
          <time
            className="text-sm font-bold tabular-nums tracking-widest"
            style={{ color: "#7580A0", letterSpacing: "0.08em" }}
            dateTime={time}
          >
            {time}
          </time>
          <p className="hidden sm:block text-[8px] text-[#4A5270] leading-none whitespace-nowrap">
            © {new Date().getFullYear()} FEG le Rocher · Developed by Jonathan Ndinga
          </p>
        </div>
      </div>
    </header>
  );
}
