"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

// ── constants ──────────────────────────────────────────────────────────────────
const CARD_W    = 118;
const CARD_H    = 160;
const HALF_H    = CARD_H / 2;
const FONT      = 108;
const RADIUS    = 14;
const HALF_MS   = 230; // duration per flip half (ms)

// ── shared inline styles ───────────────────────────────────────────────────────
const BG_TOP: React.CSSProperties = {
  position: "absolute", inset: 0,
  background: "rgba(16,16,30,0.82)",
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
};
const BG_BOT: React.CSSProperties = {
  position: "absolute", inset: 0,
  background: "rgba(10,10,20,0.87)",
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
};

function digitBase(color = "#EEEEFF"): React.CSSProperties {
  return {
    position: "absolute",
    top: 0, left: 0,
    width: CARD_W, height: CARD_H,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: FONT, fontWeight: 800,
    color,
    lineHeight: 1,
    letterSpacing: "-0.04em",
    userSelect: "none", pointerEvents: "none",
  };
}
function digitBottomShift(color = "#CCCCEE"): React.CSSProperties {
  return { ...digitBase(color), top: -HALF_H };
}

// ── half-card primitives ───────────────────────────────────────────────────────
function TopHalf({ d, zIndex = 1, color }: { d: string; zIndex?: number; color?: string }) {
  return (
    <div style={{
      position: "absolute", top: 0, left: 0,
      width: CARD_W, height: HALF_H,
      overflow: "hidden",
      borderRadius: `${RADIUS}px ${RADIUS}px 0 0`,
      zIndex,
    }}>
      <div style={BG_TOP} />
      <div style={digitBase(color)}>{d}</div>
    </div>
  );
}

function BotHalf({ d, zIndex = 1, color }: { d: string; zIndex?: number; color?: string }) {
  return (
    <div style={{
      position: "absolute", bottom: 0, left: 0,
      width: CARD_W, height: HALF_H,
      overflow: "hidden",
      borderRadius: `0 0 ${RADIUS}px ${RADIUS}px`,
      zIndex,
    }}>
      <div style={BG_BOT} />
      <div style={digitBottomShift(color)}>{d}</div>
      {/* depth shadow */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 14,
        background: "linear-gradient(to bottom,rgba(0,0,0,0.22),transparent)",
        pointerEvents: "none",
      }} />
    </div>
  );
}

// ── single card ────────────────────────────────────────────────────────────────
type Phase = "idle" | "top" | "bottom";

function FlipCard({ digit, color }: { digit: string; color?: string }) {
  // `curr` = digit fully shown; `prev` = digit being flipped away
  const [curr, setCurr] = useState(digit);
  const [prev, setPrev] = useState(digit);
  const [phase, setPhase] = useState<Phase>("idle");

  // refs so the effect can read mutable state without being a dep
  const phaseRef  = useRef<Phase>("idle");
  const currRef   = useRef(digit);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Only depends on the EXTERNAL digit prop.
  // Does NOT include internal state (phase, curr, prev) to avoid
  // the cleanup-cancels-timeout bug.
  useEffect(() => {
    if (digit === currRef.current) return;   // same digit → nothing to do
    if (phaseRef.current !== "idle") return; // mid-flip → let it finish

    const from = currRef.current;
    const to   = digit;
    currRef.current  = to;
    phaseRef.current = "top";

    setPrev(from);
    setCurr(to);
    setPhase("top");

    const t1 = setTimeout(() => {
      phaseRef.current = "bottom";
      setPhase("bottom");
    }, HALF_MS + 10);

    const t2 = setTimeout(() => {
      phaseRef.current = "idle";
      setPhase("idle");
    }, HALF_MS * 2 + 20);

    timersRef.current = [t1, t2];
  }, [digit]); // ← only digit; refs handle the rest

  // Cancel timers on unmount only
  useEffect(() => () => {
    timersRef.current.forEach(clearTimeout);
  }, []);

  return (
    <div style={{
      position: "relative",
      width: CARD_W, height: CARD_H,
      flexShrink: 0,
      filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.55))",
    }}>

      {/* Static top  — shows `curr` (new digit) */}
      <TopHalf d={curr} zIndex={1} color={color} />

      {/* Static bottom — shows `prev` (old digit) during flip, `curr` when idle */}
      <BotHalf d={phase === "idle" ? curr : prev} zIndex={1} color={color} />

      {/* Divider line */}
      <div style={{
        position: "absolute", top: HALF_H - 1, left: 0, right: 0,
        height: 2,
        background: "rgba(0,0,0,0.75)",
        zIndex: 25,
      }} />

      {/* Top flap — prev digit, rotates 0 → −90° */}
      {phase === "top" && (
        <motion.div
          style={{
            position: "absolute", top: 0, left: 0,
            width: CARD_W, height: HALF_H,
            overflow: "hidden",
            borderRadius: `${RADIUS}px ${RADIUS}px 0 0`,
            transformOrigin: "50% 100%",
            zIndex: 20,
            backfaceVisibility: "hidden",
          }}
          initial={{ rotateX: 0 }}
          animate={{ rotateX: -90 }}
          transition={{ duration: HALF_MS / 1000, ease: "easeIn" }}
        >
          <div style={BG_TOP} />
          <div style={digitBase(color)}>{prev}</div>
          {/* darkening shade as it tips */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: HALF_MS / 1000 }}
            style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(to top,rgba(0,0,0,0.45),transparent 60%)",
              pointerEvents: "none",
            }}
          />
        </motion.div>
      )}

      {/* Bottom flap — curr digit, rotates 90 → 0° */}
      {phase === "bottom" && (
        <motion.div
          style={{
            position: "absolute", bottom: 0, left: 0,
            width: CARD_W, height: HALF_H,
            overflow: "hidden",
            borderRadius: `0 0 ${RADIUS}px ${RADIUS}px`,
            transformOrigin: "50% 0%",
            zIndex: 20,
            backfaceVisibility: "hidden",
          }}
          initial={{ rotateX: 90 }}
          animate={{ rotateX: 0 }}
          transition={{ duration: HALF_MS / 1000, ease: "easeOut" }}
        >
          <div style={BG_BOT} />
          <div style={digitBottomShift(color)}>{curr}</div>
          {/* highlight as it lands */}
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: HALF_MS / 1000 }}
            style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(to bottom,rgba(0,0,0,0.4),transparent 60%)",
              pointerEvents: "none",
            }}
          />
        </motion.div>
      )}
    </div>
  );
}

// ── colon separator ────────────────────────────────────────────────────────────
function Colon() {
  return (
    <div style={{
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      gap: 16, height: CARD_H, paddingBottom: 6, flexShrink: 0,
    }}>
      {[0, 1].map(i => (
        <div key={i} style={{
          width: 10, height: 10, borderRadius: "50%",
          background: "rgba(255,255,255,0.4)",
        }} />
      ))}
    </div>
  );
}

// ── public API ─────────────────────────────────────────────────────────────────
export function FlipClock({ seconds, isOvertime }: {
  seconds: number;
  isOvertime: boolean;
}) {
  const abs = Math.abs(seconds);
  const m   = Math.floor(abs / 60);
  const s   = abs % 60;

  const d = [
    String(Math.floor(m / 10)),
    String(m % 10),
    String(Math.floor(s / 10)),
    String(s % 10),
  ];

  const digitColor = isOvertime ? "#F87171" : undefined;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      {isOvertime && (
        <span style={{
          fontSize: 60, fontWeight: 800, color: "#F87171",
          lineHeight: 1, alignSelf: "center", paddingBottom: 6,
          letterSpacing: "-0.02em",
        }}>−</span>
      )}
      <FlipCard digit={d[0]} color={digitColor} />
      <FlipCard digit={d[1]} color={digitColor} />
      <Colon />
      <FlipCard digit={d[2]} color={digitColor} />
      <FlipCard digit={d[3]} color={digitColor} />
    </div>
  );
}
