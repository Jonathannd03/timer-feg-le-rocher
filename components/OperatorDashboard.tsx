"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Info, List, BookOpen, Maximize2, CheckCircle2 } from "lucide-react";
import { useServiceStore } from "@/store/serviceStore";
import { formatTime } from "@/lib/utils";
import { useTimer } from "@/hooks/useTimer";
import { useKeyboard } from "@/hooks/useKeyboard";
import { useBroadcastSender } from "@/hooks/useBroadcast";
import { useWakeLock } from "@/hooks/useWakeLock";
import { AppHeader } from "@/components/layout/AppHeader";
import { LeftSidebar } from "@/components/layout/LeftSidebar";
import { CenterPanel } from "@/components/layout/CenterPanel";
import { RightSidebar } from "@/components/layout/RightSidebar";
import { ProgramList } from "@/components/program/ProgramList";
import { BibleModule } from "@/components/bible/BibleModule";
import { VerseFullscreen } from "@/components/bible/VerseFullscreen";
import type { ServiceSection, BibleVerse, TimerStatus } from "@/types";

type MobileTab = "info" | "timer" | "bibel" | "program";

const tabs: { id: MobileTab; label: string; icon: React.ReactNode }[] = [
  { id: "info",    label: "Info",     icon: <Info size={18} /> },
  { id: "timer",   label: "Timer",    icon: <Clock size={18} /> },
  { id: "bibel",   label: "Bibel",    icon: <BookOpen size={18} /> },
  { id: "program", label: "Programm", icon: <List size={18} /> },
];

export function OperatorDashboard() {
  const [mobileTab, setMobileTab]   = useState<MobileTab>("timer");
  const [verseFs,   setVerseFs]     = useState(false);

  // Hooks that must always run regardless of which tab is active
  const timerStatus  = useServiceStore((s) => s.timerStatus);
  const currentVerse = useServiceStore((s) => s.currentVerse);
  useTimer();
  useKeyboard();
  useBroadcastSender();
  useWakeLock(timerStatus === "running" || timerStatus === "overtime");

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#09090F] flex flex-col">
      <AppHeader />

      {/* Desktop: 3-column layout */}
      <div className="hidden lg:flex flex-1 min-h-0 overflow-hidden">
        <LeftSidebar />
        <div className="flex-1 border-x border-white/[0.05] overflow-hidden">
          <CenterPanel />
        </div>
        <RightSidebar />
      </div>

      {/* Mobile: tabbed single-column */}
      <div className="flex lg:hidden flex-1 min-h-0 flex-col overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={mobileTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.15 }}
            className="flex-1 overflow-hidden"
          >
            {mobileTab === "info" && (
              <div className="h-full overflow-y-auto px-4 py-4">
                <MobileInfo />
              </div>
            )}
            {mobileTab === "timer" && (
              <div className="h-full overflow-hidden">
                <CenterPanel />
              </div>
            )}
            {mobileTab === "bibel" && (
              <div className="h-full flex flex-col overflow-hidden">
                {/* Header — selected verse + fullscreen button */}
                <div className="flex items-center justify-between px-4 pt-3 pb-2 flex-shrink-0">
                  <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#3E4560]">
                    Bibelvers
                  </p>
                  {currentVerse && (
                    <div className="flex items-center gap-2 min-w-0 flex-1 mx-3">
                      <CheckCircle2 size={11} className="text-[#22C55E] flex-shrink-0" />
                      <span className="text-xs font-semibold text-[#E8A83A] truncate">
                        {currentVerse.reference}
                      </span>
                    </div>
                  )}
                  <button
                    onClick={() => setVerseFs(true)}
                    disabled={!currentVerse}
                    className={[
                      "w-8 h-8 flex-shrink-0 rounded-xl flex items-center justify-center border transition-all",
                      currentVerse && mobileTab === "bibel"
                        ? "bg-[#3D72F6]/20 border-[#3D72F6]/50 text-[#3D72F6] hover:bg-[#3D72F6]/30 hover:text-white shadow-[0_0_10px_rgba(61,114,246,0.3)]"
                        : "bg-white/[0.04] border-white/[0.07] text-[#3E4560] hover:text-[#EEEEFF] hover:bg-white/[0.08] disabled:opacity-25 disabled:cursor-not-allowed",
                    ].join(" ")}
                    title="Vers Vollbild"
                  >
                    <Maximize2 size={13} />
                  </button>
                </div>

                {/* Bible module — takes all remaining space */}
                <div className="flex-1 min-h-0 overflow-hidden px-4 pb-4">
                  <BibleModule />
                </div>
              </div>
            )}

            {mobileTab === "program" && (
              <div className="h-full overflow-hidden bg-white/[0.02] border border-white/[0.06]">
                <ProgramList />
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Verse fullscreen — available from Bibel tab on mobile */}
        <VerseFullscreen open={verseFs} onClose={() => setVerseFs(false)} verse={currentVerse} />

        {/* Hint strip — shown when a verse is active and user is not on Bibel tab */}
        {currentVerse && mobileTab !== "bibel" && (
          <button
            onClick={() => setMobileTab("bibel")}
            className="flex-shrink-0 flex items-center justify-between gap-2 px-4 py-2 border-t border-[#22C55E]/20 bg-[#22C55E]/[0.06] transition-colors active:bg-[#22C55E]/[0.12]"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse flex-shrink-0" />
              <span className="text-[11px] font-semibold text-[#22C55E] truncate">
                {currentVerse.reference}
              </span>
            </div>
            <span className="text-[10px] text-[#22C55E]/70 flex-shrink-0 tracking-wide">
              Vollbild →
            </span>
          </button>
        )}

        {/* Bottom tab bar — flex-shrink-0 keeps it always visible */}
        <nav className="flex-shrink-0 flex items-center border-t border-white/[0.06] bg-[#0F0F18]">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setMobileTab(tab.id)}
              className={[
                "flex-1 flex flex-col items-center justify-center gap-1 py-3 transition-colors relative",
                mobileTab === tab.id ? "text-[#3D72F6]" : "text-[#3E4560]",
              ].join(" ")}
            >
              <div className="relative">
                {tab.icon}
              </div>
              <span className="text-[9px] font-semibold tracking-wider uppercase">
                {tab.label}
              </span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}

function MobileInfo() {
  const sections = useServiceStore((s) => s.sections);
  const currentIndex = useServiceStore((s) => s.currentIndex);
  const remaining = useServiceStore((s) => s.remaining);
  const timerStatus = useServiceStore((s) => s.timerStatus);
  const currentVerse = useServiceStore((s) => s.currentVerse);

  const current = sections[currentIndex];
  const next = sections[currentIndex + 1];

  return (
    <div className="flex flex-col gap-3">
      <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.07]">
        <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-[#3E4560] mb-2">
          Aktuell
        </p>
        <p className="text-sm font-bold text-[#EEEEFF] mb-1">{current?.name ?? ""}</p>
        <p className="text-3xl font-bold tabular-nums text-[#EEEEFF]">
          {formatTime(remaining)}
        </p>
        <div className="mt-2 h-0.5 rounded-full bg-white/[0.05] overflow-hidden">
          <div
            className="h-full rounded-full bg-[#3D72F6] transition-all duration-500"
            style={{
              width: `${Math.max(0, Math.min(100, (remaining / (current?.duration || 1)) * 100))}%`,
            }}
          />
        </div>
        <p className="text-[10px] text-[#3E4560] mt-1.5">
          {timerStatus === "running" ? "Läuft" : timerStatus === "paused" ? "Pausiert" : "Bereit"}
        </p>
      </div>

      {next && (
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.07]">
          <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-[#3E4560] mb-1">
            Nächster Abschnitt
          </p>
          <p className="text-sm font-medium text-[#7580A0]">
            {next.name} · {formatTime(next.duration)}
          </p>
        </div>
      )}

      {currentVerse && (
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.07]">
          <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-[#3E4560] mb-2">
            Aktueller Vers
          </p>
          <p className="text-xs font-bold text-[#E8A83A] mb-1.5">
            {currentVerse.reference}
          </p>
          <p className="text-xs text-[#7580A0] leading-relaxed">
            „{currentVerse.text}"
          </p>
        </div>
      )}

      <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.07]">
        <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-[#3E4560] mb-2">
          Tastenkürzel
        </p>
        {[
          ["Space", "Play / Pause"],
          ["← →", "Navigation"],
          ["F", "Vollbild"],
        ].map(([key, label]) => (
          <div key={key} className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-[#7580A0]">{label}</span>
            <kbd className="px-2 py-0.5 rounded-md bg-white/[0.06] border border-white/[0.08] text-[10px] text-[#7580A0] font-mono">
              {key}
            </kbd>
          </div>
        ))}
      </div>
    </div>
  );
}
