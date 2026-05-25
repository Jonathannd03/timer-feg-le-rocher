"use client";

import { useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Pause, SkipBack, SkipForward, Square } from "lucide-react";
import { useServiceStore } from "@/store/serviceStore";
import { useWallClock } from "@/hooks/useWallClock";
import { FlipClock } from "./FlipClock";
import { timerHex } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function TimerFullscreen({ open, onClose }: Props) {
  const sections    = useServiceStore((s) => s.sections);
  const currentIndex = useServiceStore((s) => s.currentIndex);
  const remaining   = useServiceStore((s) => s.remaining);
  const timerStatus = useServiceStore((s) => s.timerStatus);
  const startTimer  = useServiceStore((s) => s.startTimer);
  const pauseTimer  = useServiceStore((s) => s.pauseTimer);
  const resetTimer  = useServiceStore((s) => s.resetTimer);
  const nextSection = useServiceStore((s) => s.nextSection);
  const prevSection = useServiceStore((s) => s.prevSection);

  const wallTime = useWallClock();
  const current  = sections[currentIndex];
  const total    = current?.duration ?? 1;
  const isRunning  = timerStatus === "running" || timerStatus === "overtime";
  const isOvertime = remaining < 0;
  const progress   = Math.max(0, Math.min(1, remaining / total));

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex flex-col"
        >
          {/* Background */}
          <Image
            src="/images/timer-bg.jpg"
            alt=""
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-black/55" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/70" />

          {/* Content */}
          <div className="relative z-10 flex flex-col h-full">

            {/* ── Top bar — 3-col grid so nothing overlaps ── */}
            <div className="grid grid-cols-3 items-center px-4 sm:px-8 pt-5 sm:pt-7">

              {/* Left: logo + name */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.06 }}
                className="flex items-center gap-2 sm:gap-3 min-w-0"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white p-1 sm:p-1.5 flex items-center justify-center shadow-lg flex-shrink-0">
                  <Image src="/images/feg_logo.png" alt="FEG" width={30} height={30} className="object-contain" />
                </div>
                <div className="min-w-0">
                  <p className="text-base font-bold text-white leading-tight truncate" style={{ textShadow: "0 1px 8px rgba(0,0,0,0.8)" }}>FEG le Rocher</p>
                  <p className="text-[10px] text-white/50 tracking-widest uppercase">Gottesdienst</p>
                </div>
              </motion.div>

              {/* Center: wall clock */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="flex justify-center"
              >
                <time
                  className="font-bold tabular-nums text-white/35 tracking-widest"
                  style={{ fontSize: "clamp(0.85rem, 2.5vw, 1.8rem)" }}
                >
                  {wallTime}
                </time>
              </motion.div>

              {/* Right: close button */}
              <div className="flex justify-end">
                <button
                  onClick={onClose}
                  className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/10 border border-white/20 text-white/60 hover:text-white hover:bg-white/20 backdrop-blur-sm transition-all"
                  title="Schließen (Esc)"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* ── Center ── */}
            <div className="flex-1 flex flex-col items-center justify-center gap-3 sm:gap-5 lg:gap-6">

              {/* Section counter + name */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 }}
                className="flex flex-col items-center gap-2"
              >
                <span className="text-[11px] font-semibold tracking-[0.3em] uppercase text-white/35">
                  {currentIndex + 1} / {sections.length}
                </span>
                <h2
                  className="font-bold text-white text-center leading-tight drop-shadow-lg"
                  style={{ fontSize: "clamp(1.1rem, 4vw, 2.8rem)", maxWidth: "80vw" }}
                >
                  {current?.name ?? ""}
                </h2>
                {current?.speaker && (
                  <p
                    className="font-medium text-white/55 text-center"
                    style={{ fontSize: "clamp(0.95rem, 2vw, 1.3rem)" }}
                  >
                    {current.speaker}
                  </p>
                )}
              </motion.div>

              {/* Time's up banner */}
              <AnimatePresence>
                {timerStatus === "overtime" && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.85, y: -6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="flex items-center gap-2 px-4 py-2 sm:px-7 sm:py-3 rounded-2xl border backdrop-blur-sm"
                    style={{
                      background: "rgba(239,68,68,0.18)",
                      borderColor: "rgba(239,68,68,0.4)",
                      boxShadow: "0 0 48px rgba(239,68,68,0.25), 0 2px 16px rgba(0,0,0,0.4)",
                    }}
                  >
                    <motion.span
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                      style={{
                        width: 9, height: 9, borderRadius: "50%",
                        background: "#F87171", display: "inline-block", flexShrink: 0,
                      }}
                    />
                    <span
                      className="font-bold tracking-[0.22em] uppercase"
                      style={{ color: "#FCA5A5", fontSize: "clamp(0.9rem, 2vw, 1.2rem)" }}
                    >
                      Zeit abgelaufen
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Flip clock — responsive scale */}
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="py-4 sm:py-6 lg:py-7"
              >
                <div className="scale-[0.72] sm:scale-[1.05] lg:scale-[1.45] origin-center">
                  <FlipClock seconds={remaining} isOvertime={isOvertime} />
                </div>
              </motion.div>

              {/* Status label */}
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.14 }}
                className="text-xs font-semibold tracking-[0.28em] uppercase"
                style={{ color: isOvertime ? "rgba(251,146,60,0.7)" : "rgba(255,255,255,0.35)" }}
              >
                {isRunning
                  ? isOvertime ? "Overtime läuft" : "Läuft"
                  : timerStatus === "paused"
                  ? "Pausiert"
                  : "Bereit"}
              </motion.span>

              {/* Controls */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.16 }}
                className="flex items-center gap-3 sm:gap-5"
              >
                <button
                  onClick={prevSection}
                  disabled={currentIndex === 0}
                  className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center bg-white/10 border border-white/20 text-white/70 hover:text-white hover:bg-white/20 backdrop-blur-sm disabled:opacity-25 transition-all"
                >
                  <SkipBack size={20} />
                </button>

                <button
                  onClick={isRunning ? pauseTimer : startTimer}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl flex items-center justify-center bg-white/15 border border-white/30 text-white backdrop-blur-sm hover:bg-white/25 active:scale-95 transition-all shadow-xl"
                >
                  {isRunning
                    ? <Pause size={28} />
                    : <Play size={28} className="translate-x-0.5" />}
                </button>

                <button
                  onClick={resetTimer}
                  disabled={timerStatus === "idle"}
                  className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center bg-white/10 border border-white/20 text-white/70 hover:text-white hover:bg-white/20 backdrop-blur-sm disabled:opacity-25 transition-all"
                  title="Stopp"
                >
                  <Square size={18} />
                </button>

                <button
                  onClick={nextSection}
                  disabled={currentIndex >= sections.length - 1}
                  className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center bg-white/10 border border-white/20 text-white/70 hover:text-white hover:bg-white/20 backdrop-blur-sm disabled:opacity-25 transition-all"
                >
                  <SkipForward size={20} />
                </button>
              </motion.div>
            </div>

            {/* ── Bottom bar ── */}
            <div className="px-8 pb-7 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {sections.map((_, i) => (
                  <div
                    key={i}
                    className={[
                      "rounded-full transition-all duration-300",
                      i === currentIndex
                        ? "w-5 h-1.5 bg-white/70"
                        : i < currentIndex
                        ? "w-1.5 h-1.5 bg-white/25"
                        : "w-1.5 h-1.5 bg-white/12",
                    ].join(" ")}
                  />
                ))}
              </div>

              {sections[currentIndex + 1] && (
                <p className="text-[11px] text-white/35">
                  Nächster:{" "}
                  <span className="text-white/55 font-medium">
                    {sections[currentIndex + 1].name}
                  </span>
                </p>
              )}
            </div>

            {/* Progress bar */}
            <div className="h-0.5 bg-white/10">
              <motion.div
                className="h-full"
                style={{ background: timerHex(progress, isOvertime, timerStatus === "idle" && remaining <= 0) }}
                animate={{ width: `${progress * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
