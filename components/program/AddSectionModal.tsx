"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useServiceStore } from "@/store/serviceStore";

const SECTION_TYPES = [
  "Einlass & Musik",
  "Begrüssung",
  "Lobpreis",
  "Anbetung",
  "Gebet",
  "Ansagen",
  "Predigt",
  "Abendmahl",
  "Kollekte",
  "Segen",
  "Andere…",
] as const;

const DEFAULT_DURATIONS: Partial<Record<string, number>> = {
  "Einlass & Musik": 15,
  "Begrüssung":      5,
  "Lobpreis":        25,
  "Anbetung":        20,
  "Gebet":           8,
  "Ansagen":         10,
  "Predigt":         40,
  "Abendmahl":       15,
  "Kollekte":        5,
  "Segen":           5,
};

interface Props {
  open: boolean;
  onClose: () => void;
}

export function AddSectionModal({ open, onClose }: Props) {
  const addSection = useServiceStore((s) => s.addSection);

  const [type, setType]         = useState<string>(SECTION_TYPES[0]);
  const [customName, setCustomName] = useState("");
  const [speaker, setSpeaker]   = useState("");
  const [minutes, setMinutes]   = useState(DEFAULT_DURATIONS[SECTION_TYPES[0]] ?? 5);
  const [seconds, setSeconds]   = useState(0);

  const isPredigt  = type === "Predigt";
  const isCustom   = type === "Andere…";
  const resolvedName = isCustom ? customName.trim() : type;

  const canAdd = resolvedName.length > 0 && (minutes > 0 || seconds > 0);

  const handleTypeChange = (t: string) => {
    setType(t);
    const preset = DEFAULT_DURATIONS[t];
    if (preset !== undefined) setMinutes(preset);
    if (t !== "Predigt") setSpeaker("");
    if (t !== "Andere…") setCustomName("");
  };

  const handleAdd = () => {
    if (!canAdd) return;
    addSection({
      name: resolvedName,
      duration: minutes * 60 + seconds,
      ...(isPredigt && speaker.trim() ? { speaker: speaker.trim() } : {}),
    });
    // reset
    setType(SECTION_TYPES[0]);
    setCustomName("");
    setSpeaker("");
    setMinutes(DEFAULT_DURATIONS[SECTION_TYPES[0]] ?? 5);
    setSeconds(0);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-sm rounded-2xl border border-white/[0.09] shadow-2xl"
        style={{ background: "rgba(14,14,26,0.97)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <h2 className="text-sm font-semibold text-[#EEEEFF]">Abschnitt hinzufügen</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#3E4560] hover:text-[#EEEEFF] hover:bg-white/[0.06] transition-all"
          >
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 flex flex-col gap-4">

          {/* Section type */}
          <div>
            <label className="block text-[10px] font-semibold tracking-[0.18em] uppercase text-[#7580A0] mb-1.5">
              Typ
            </label>
            <select
              value={type}
              onChange={(e) => handleTypeChange(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-white/[0.05] border border-white/[0.09] text-sm text-[#EEEEFF] focus:outline-none focus:border-[#3D72F6]/50 cursor-pointer transition-colors"
            >
              {SECTION_TYPES.map((t) => (
                <option key={t} value={t} style={{ background: "#0E0E1A" }}>{t}</option>
              ))}
            </select>
          </div>

          {/* Custom name — shown when "Andere…" */}
          <AnimatePresence>
            {isCustom && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.18 }}
              >
                <label className="block text-[10px] font-semibold tracking-[0.18em] uppercase text-[#7580A0] mb-1.5">
                  Bezeichnung
                </label>
                <input
                  autoFocus
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Name des Abschnitts"
                  className="w-full h-10 px-3 rounded-xl bg-white/[0.05] border border-white/[0.09] text-sm text-[#EEEEFF] placeholder-[#3E4560] focus:outline-none focus:border-[#3D72F6]/50 transition-colors"
                  onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Speaker — shown when "Predigt" */}
          <AnimatePresence>
            {isPredigt && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.18 }}
              >
                <label className="block text-[10px] font-semibold tracking-[0.18em] uppercase text-[#7580A0] mb-1.5">
                  Prediger
                </label>
                <input
                  autoFocus
                  value={speaker}
                  onChange={(e) => setSpeaker(e.target.value)}
                  placeholder="Name des Predigers"
                  className="w-full h-10 px-3 rounded-xl bg-white/[0.05] border border-white/[0.09] text-sm text-[#EEEEFF] placeholder-[#3E4560] focus:outline-none focus:border-[#3D72F6]/50 transition-colors"
                  onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Duration */}
          <div>
            <label className="block text-[10px] font-semibold tracking-[0.18em] uppercase text-[#7580A0] mb-1.5">
              Dauer
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={minutes}
                min={0}
                onChange={(e) => setMinutes(Math.max(0, Number(e.target.value)))}
                className="w-20 h-10 px-3 rounded-xl bg-white/[0.05] border border-white/[0.09] text-sm text-[#EEEEFF] text-center focus:outline-none focus:border-[#3D72F6]/50 transition-colors"
              />
              <span className="text-[#3E4560] text-sm">min</span>
              <input
                type="number"
                value={seconds}
                min={0}
                max={59}
                onChange={(e) => setSeconds(Math.max(0, Math.min(59, Number(e.target.value))))}
                className="w-20 h-10 px-3 rounded-xl bg-white/[0.05] border border-white/[0.09] text-sm text-[#EEEEFF] text-center focus:outline-none focus:border-[#3D72F6]/50 transition-colors"
              />
              <span className="text-[#3E4560] text-sm">sek</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-white/[0.06]">
          <button
            onClick={onClose}
            className="h-9 px-4 rounded-xl text-xs font-medium text-[#7580A0] hover:text-[#EEEEFF] hover:bg-white/[0.05] transition-all"
          >
            Abbrechen
          </button>
          <button
            onClick={handleAdd}
            disabled={!canAdd}
            className="h-9 px-4 rounded-xl text-xs font-semibold bg-[#3D72F6] text-white hover:bg-[#5585F7] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            Hinzufügen
          </button>
        </div>
      </motion.div>
    </div>
  );
}
