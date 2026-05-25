"use client";

import { Play, Pause, RotateCcw, SkipBack, SkipForward, Square } from "lucide-react";
import { useServiceStore } from "@/store/serviceStore";
import { Button } from "@/components/ui/Button";

export function TimerControls() {
  const status       = useServiceStore((s) => s.timerStatus);
  const startTimer   = useServiceStore((s) => s.startTimer);
  const pauseTimer   = useServiceStore((s) => s.pauseTimer);
  const resetTimer   = useServiceStore((s) => s.resetTimer);
  const nextSection  = useServiceStore((s) => s.nextSection);
  const prevSection  = useServiceStore((s) => s.prevSection);
  const currentIndex = useServiceStore((s) => s.currentIndex);
  const sections     = useServiceStore((s) => s.sections);

  const isRunning = status === "running" || status === "overtime";

  return (
    <div className="flex items-center justify-center gap-2">
      <Button
        variant="icon" size="md"
        onClick={prevSection}
        disabled={currentIndex === 0}
        title="Vorheriger Abschnitt (←)"
        className="rounded-xl"
      >
        <SkipBack size={15} />
      </Button>

      {/* Reset — back to full duration */}
      <Button
        variant="icon" size="md"
        onClick={resetTimer}
        title="Zurücksetzen"
        className="rounded-xl"
      >
        <RotateCcw size={15} />
      </Button>

      {/* Play / Pause — main action */}
      <button
        onClick={isRunning ? pauseTimer : startTimer}
        title={isRunning ? "Pause (Space)" : "Start (Space)"}
        className="flex items-center justify-center w-14 h-14 rounded-2xl bg-[#3D72F6] text-white shadow-lg shadow-[#3D72F6]/30 hover:bg-[#4f83ff] active:scale-[0.96] transition-all duration-150"
      >
        {isRunning
          ? <Pause size={22} />
          : <Play size={22} className="translate-x-0.5" />}
      </button>

      {/* Stop — halt and reset */}
      <Button
        variant="icon" size="md"
        onClick={resetTimer}
        disabled={status === "idle"}
        title="Stopp"
        className="rounded-xl"
      >
        <Square size={14} />
      </Button>

      <Button
        variant="icon" size="md"
        onClick={nextSection}
        disabled={currentIndex >= sections.length - 1}
        title="Nächster Abschnitt (→)"
        className="rounded-xl"
      >
        <SkipForward size={15} />
      </Button>
    </div>
  );
}
