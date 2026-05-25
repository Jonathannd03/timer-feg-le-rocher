"use client";

import { useState, useEffect } from "react";
import { Maximize2 } from "lucide-react";
import { useServiceStore } from "@/store/serviceStore";
import { TimerDisplay } from "@/components/timer/TimerDisplay";
import { TimerControls } from "@/components/timer/TimerControls";
import { TimerFullscreen } from "@/components/timer/TimerFullscreen";
import { BibleModule } from "@/components/bible/BibleModule";
import { VerseFullscreen } from "@/components/bible/VerseFullscreen";

export function CenterPanel() {
  const sections     = useServiceStore((s) => s.sections);
  const currentIndex = useServiceStore((s) => s.currentIndex);
  const remaining    = useServiceStore((s) => s.remaining);
  const timerStatus  = useServiceStore((s) => s.timerStatus);
  const currentVerse = useServiceStore((s) => s.currentVerse);

  const [timerFs, setTimerFs] = useState(false);
  const [verseFs, setVerseFs] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "f" || e.key === "F") {
        if (!e.metaKey && !e.ctrlKey) {
          e.preventDefault();
          setTimerFs((v) => !v);
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const current     = sections[currentIndex];
  const total       = current?.duration ?? 1;
  const nextSection = sections[currentIndex + 1];

  return (
    <>
      <main className="flex-1 flex flex-col min-w-0 h-full">

        {/* ── Timer panel — full height on mobile, 50% on desktop ── */}
        <div className="flex-1 flex flex-col min-h-0 border-b lg:border-b border-white/[0.05] px-3 py-3 lg:px-5 lg:py-4">

          {/* Header row — single line, never grows */}
          <div className="flex items-center justify-between mb-3 flex-shrink-0 gap-3 min-h-0">
            <div className="flex items-center gap-2 min-w-0 overflow-hidden">
              <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#3E4560] flex-shrink-0">
                {currentIndex + 1}/{sections.length}
              </span>
              <span className="w-px h-3 bg-white/[0.08] flex-shrink-0" />
              <h1 className="text-sm font-bold text-[#EEEEFF] truncate leading-tight">
                {current?.name ?? ""}
              </h1>
              {current?.speaker && (
                <>
                  <span className="w-px h-3 bg-white/[0.08] flex-shrink-0" />
                  <p className="text-xs text-[#3E4560] truncate flex-shrink-0 max-w-[120px]">{current.speaker}</p>
                </>
              )}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0 ml-3">
              {nextSection && (
                <div className="text-right hidden sm:block">
                  <p className="text-[10px] text-[#3E4560]">Nächster</p>
                  <p className="text-xs font-medium text-[#7580A0] truncate max-w-[120px]">
                    {nextSection.name}
                  </p>
                </div>
              )}
              <button
                onClick={() => setTimerFs(true)}
                className={[
                  "w-8 h-8 flex-shrink-0 rounded-xl flex items-center justify-center border transition-all",
                  timerStatus === "running" || timerStatus === "overtime"
                    ? "bg-[#3D72F6]/20 border-[#3D72F6]/50 text-[#3D72F6] hover:bg-[#3D72F6]/30 hover:text-white shadow-[0_0_10px_rgba(61,114,246,0.3)]"
                    : "bg-white/[0.04] border-white/[0.07] text-[#3E4560] hover:text-[#EEEEFF] hover:bg-white/[0.08]",
                ].join(" ")}
                title="Timer Vollbild (F)"
              >
                <Maximize2 size={13} />
              </button>
            </div>
          </div>

          {/* Timer + controls */}
          <div className="flex flex-col items-center gap-2 flex-1 justify-center min-h-0 overflow-hidden">
            {/* Always in layout — invisible when not overtime so nothing shifts */}
            <div
              className={[
                "flex items-center gap-2 px-4 py-1.5 rounded-xl border flex-shrink-0 transition-opacity duration-300",
                timerStatus === "overtime" ? "opacity-100" : "opacity-0 pointer-events-none",
              ].join(" ")}
              style={{ background: "rgba(239,68,68,0.08)", borderColor: "rgba(239,68,68,0.2)" }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse flex-shrink-0" />
              <span className="text-[11px] font-bold tracking-[0.22em] uppercase text-red-400">
                Zeit abgelaufen
              </span>
            </div>

            <div className="flex-shrink-0 scale-[0.88] sm:scale-[0.95] lg:scale-100 origin-center">
              <TimerDisplay remaining={remaining} totalDuration={total} status={timerStatus} />
            </div>
            <div className="flex-shrink-0">
              <TimerControls />
            </div>

            {/* Section dots */}
            <div className="flex items-center gap-1.5 flex-wrap justify-center max-w-xs flex-shrink-0">
              {sections.map((_, i) => (
                <div
                  key={i}
                  className={[
                    "rounded-full transition-all duration-200",
                    i === currentIndex
                      ? "w-4 h-1.5 bg-[#3D72F6]"
                      : i < currentIndex
                      ? "w-1.5 h-1.5 bg-white/20"
                      : "w-1.5 h-1.5 bg-white/[0.07]",
                  ].join(" ")}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ── Bible panel — desktop only; mobile has its own tab ── */}
        <div className="hidden lg:flex flex-1 flex-col min-h-0 px-5 py-4">

          {/* Header row */}
          <div className="flex items-center justify-between mb-3 flex-shrink-0">
            <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#3E4560]">
              Bibelvers
            </p>
            <button
              onClick={() => setVerseFs(true)}
              disabled={!currentVerse}
              className={[
                "w-8 h-8 flex-shrink-0 rounded-xl flex items-center justify-center border transition-all",
                currentVerse
                  ? "bg-[#3D72F6]/20 border-[#3D72F6]/50 text-[#3D72F6] hover:bg-[#3D72F6]/30 hover:text-white shadow-[0_0_10px_rgba(61,114,246,0.3)]"
                  : "bg-white/[0.04] border-white/[0.07] text-[#3E4560] hover:text-[#EEEEFF] hover:bg-white/[0.08] disabled:opacity-25 disabled:cursor-not-allowed",
              ].join(" ")}
              title="Vers Vollbild"
            >
              <Maximize2 size={13} />
            </button>
          </div>

          {/* Bible module */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <BibleModule />
          </div>
        </div>

      </main>

      {/* Fullscreen overlays */}
      <TimerFullscreen open={timerFs} onClose={() => setTimerFs(false)} />
      <VerseFullscreen open={verseFs} onClose={() => setVerseFs(false)} verse={currentVerse} />
    </>
  );
}
