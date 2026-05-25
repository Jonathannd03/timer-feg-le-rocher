"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { useWallClock } from "@/hooks/useWallClock";
import { useServiceStore } from "@/store/serviceStore";
import type { BibleVerse } from "@/types";

interface VerseItem { id: string; reference: string; }

interface Props {
  open: boolean;
  onClose: () => void;
  verse: BibleVerse | null;
}

async function fetchVerseText(bibleId: string, verseId: string): Promise<string> {
  const res  = await fetch(
    `/api/bible/verse?bibleId=${bibleId}&verseId=${encodeURIComponent(verseId)}`
  );
  const data = await res.json();
  return (data.content as string).trim();
}

export function VerseFullscreen({ open, onClose, verse }: Props) {
  const wallTime = useWallClock();
  const setVerse = useServiceStore((s) => s.setVerse);

  // ── Language toggle ────────────────────────────────────────────────────────
  const [lang, setLang]           = useState<"de" | "fr">("de");
  const [frBibleId, setFrBibleId] = useState<string | null>(null);
  const [frLabel, setFrLabel]     = useState("LSG");
  const [frLoading, setFrLoading] = useState(false);

  // ── Verse list & navigation ────────────────────────────────────────────────
  const [verseList, setVerseList]   = useState<VerseItem[]>([]);
  const [navigating, setNavigating] = useState(false);

  // Caches: verseId → text (German + French kept separately)
  const deCacheRef = useRef<Map<string, string>>(new Map());
  const frCacheRef = useRef<Map<string, string>>(new Map());

  // Current French text for the displayed verse
  const [frText, setFrText] = useState<string | null>(null);

  // ── Fetch French Bible ID once ─────────────────────────────────────────────
  useEffect(() => {
    fetch("/api/bible/bibles?language=fra")
      .then((r) => r.json())
      .then((bibles: { id: string; abbreviationLocal: string; name: string }[]) => {
        if (!bibles?.length) return;
        const lsg =
          bibles.find(
            (b) =>
              b.abbreviationLocal?.toUpperCase().includes("LSG") ||
              b.name?.toLowerCase().includes("segond")
          ) ?? bibles[0];
        setFrBibleId(lsg.id);
        setFrLabel(lsg.abbreviationLocal ?? "FR");
      })
      .catch(() => {});
  }, []);

  // ── Reset lang when fullscreen opens ──────────────────────────────────────
  useEffect(() => {
    if (open) { setLang("de"); setFrText(null); }
  }, [open]);

  // ── Fetch verse list for current chapter ──────────────────────────────────
  useEffect(() => {
    if (!verse?.verseId || !verse.bibleId) { setVerseList([]); return; }
    const chapterId = verse.verseId.split(".").slice(0, -1).join(".");
    fetch(`/api/bible/verses?bibleId=${verse.bibleId}&chapterId=${encodeURIComponent(chapterId)}`)
      .then((r) => r.json())
      .then((list: VerseItem[]) => setVerseList(list))
      .catch(() => setVerseList([]));
  }, [verse?.verseId, verse?.bibleId]);

  // ── Prefetch adjacent verses (DE + FR) in background ─────────────────────
  useEffect(() => {
    if (!verse?.bibleId || verseList.length === 0) return;
    const idx       = verseList.findIndex((v) => v.id === verse.verseId);
    const neighbors = [verseList[idx - 1], verseList[idx + 1]].filter(Boolean);

    neighbors.forEach(async (v) => {
      // German
      if (verse.bibleId && !deCacheRef.current.has(v.id)) {
        try {
          const text = await fetchVerseText(verse.bibleId, v.id);
          deCacheRef.current.set(v.id, text);
        } catch {}
      }
      // French (only if FR Bible is known)
      if (frBibleId && !frCacheRef.current.has(v.id)) {
        try {
          const text = await fetchVerseText(frBibleId, v.id);
          frCacheRef.current.set(v.id, text);
        } catch {}
      }
    });
  }, [verse?.verseId, verse?.bibleId, verseList, frBibleId]);

  // ── Load French text for current verse ───────────────────────────────────
  useEffect(() => {
    // Clear FR text whenever verse changes (navigation or external selection)
    setFrText(frCacheRef.current.get(verse?.verseId ?? "") ?? null);
  }, [verse?.verseId]);

  useEffect(() => {
    if (lang !== "fr" || !verse?.verseId || !frBibleId) return;
    // Already in cache (from prefetch or previous visit)
    const cached = frCacheRef.current.get(verse.verseId);
    if (cached) { setFrText(cached); return; }
    // Fetch
    setFrLoading(true);
    fetchVerseText(frBibleId, verse.verseId)
      .then((text) => {
        frCacheRef.current.set(verse.verseId!, text);
        setFrText(text);
      })
      .catch(() => setFrText(null))
      .finally(() => setFrLoading(false));
  }, [lang, verse?.verseId, frBibleId]);

  // ── Navigate to adjacent verse ────────────────────────────────────────────
  const navigate = useCallback(async (dir: -1 | 1) => {
    if (!verse?.verseId || !verse.bibleId || verseList.length === 0 || navigating) return;
    const idx  = verseList.findIndex((v) => v.id === verse.verseId);
    const next = verseList[idx + dir];
    if (!next) return;

    // Try cache first → instant
    const cachedDe = deCacheRef.current.get(next.id);
    if (cachedDe) {
      setVerse({
        reference:   next.reference,
        text:        cachedDe,
        translation: verse.translation,
        verseId:     next.id,
        bibleId:     verse.bibleId,
      });
      // Update FR text from cache immediately if in FR mode
      if (lang === "fr") {
        const cachedFr = frCacheRef.current.get(next.id);
        setFrText(cachedFr ?? null);
      }
      return;
    }

    // Fallback: fetch (should rarely happen if prefetch ran)
    setNavigating(true);
    try {
      const text = await fetchVerseText(verse.bibleId, next.id);
      deCacheRef.current.set(next.id, text);
      setVerse({
        reference:   next.reference,
        text,
        translation: verse.translation,
        verseId:     next.id,
        bibleId:     verse.bibleId,
      });
      if (lang === "fr") setFrText(frCacheRef.current.get(next.id) ?? null);
    } catch {
      // ignore
    } finally {
      setNavigating(false);
    }
  }, [verse, verseList, navigating, lang, setVerse]);

  // ── Keyboard handler ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape")     onClose();
      if (e.key === "ArrowLeft")  { e.preventDefault(); navigate(-1); }
      if (e.key === "ArrowRight") { e.preventDefault(); navigate(1);  }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose, navigate]);

  const currentIdx   = verseList.findIndex((v) => v.id === verse?.verseId);
  const hasPrev      = currentIdx > 0;
  const hasNext      = currentIdx >= 0 && currentIdx < verseList.length - 1;
  const canTranslate = !!verse?.verseId && !!frBibleId;
  const displayText  = lang === "fr" ? frText : verse?.text;
  const showSpinner  = navigating || (lang === "fr" && frLoading && !frText);

  return (
    <AnimatePresence>
      {open && verse && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex flex-col"
        >
          {/* Background */}
          <Image src="/images/bible-bg.jpg" alt="" fill className="object-cover object-center" priority />
          <div className="absolute inset-0 bg-black/65" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/40 to-black/75" />

          {/* Content */}
          <div className="relative z-10 flex flex-col h-full">

            {/* Top bar */}
            <div className="flex items-center justify-between px-8 pt-7">
              <motion.div
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 }}
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-white p-1.5 flex items-center justify-center shadow-lg">
                  <Image src="/images/feg_logo.png" alt="FEG Logo" width={30} height={30} className="object-contain" />
                </div>
                <div>
                  <p className="text-base font-bold text-white leading-tight drop-shadow-sm">FEG le Rocher</p>
                  <p className="text-[10px] text-white/50 tracking-widest uppercase">Gottesdienst</p>
                </div>
              </motion.div>

              <motion.time
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.08 }}
                className="absolute left-1/2 -translate-x-1/2 font-bold tabular-nums text-white/35 tracking-widest"
                style={{ fontSize: "clamp(1.1rem, 2.5vw, 1.8rem)" }}
              >
                {wallTime}
              </motion.time>

              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={onClose}
                className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/10 border border-white/20 text-white/60 hover:text-white hover:bg-white/20 backdrop-blur-sm transition-all"
                title="Schließen (Esc)"
              >
                <X size={15} />
              </button>
            </div>

            {/* Verse area + side buttons */}
            <div className="flex-1 flex items-center justify-center px-4 relative">

              {/* Prev */}
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => navigate(-1)}
                disabled={!hasPrev || navigating}
                className="absolute left-6 w-12 h-12 rounded-2xl flex items-center justify-center bg-white/10 border border-white/20 text-white/60 hover:text-white hover:bg-white/20 backdrop-blur-sm disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                title="Vorheriger Vers (←)"
              >
                <ChevronLeft size={22} />
              </button>

              {/* Verse text */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-4xl w-full text-center px-20"
              >
                {/* Ornament */}
                <div className="flex items-center justify-center gap-4 mb-10">
                  <div className="h-px w-20 bg-white/25" />
                  <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
                  <div className="h-px w-20 bg-white/25" />
                </div>

                {/* Reference */}
                <AnimatePresence mode="wait">
                  <motion.p
                    key={verse.reference}
                    initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="font-bold tracking-widest uppercase mb-8 drop-shadow"
                    style={{
                      color: "#E8C97A",
                      fontSize: "clamp(1rem, 2.5vw, 1.5rem)",
                      textShadow: "0 2px 12px rgba(0,0,0,0.6)",
                    }}
                  >
                    {verse.reference}
                  </motion.p>
                </AnimatePresence>

                {/* Verse text */}
                <div style={{ minHeight: "6rem" }}>
                  <AnimatePresence mode="wait">
                    {showSpinner ? (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="flex justify-center items-center py-6"
                      >
                        <Loader2 size={28} className="text-white/40 animate-spin" />
                      </motion.div>
                    ) : (
                      <motion.p
                        key={(verse.verseId ?? verse.reference) + lang}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="font-light leading-relaxed"
                        style={{
                          fontSize: "clamp(1.4rem, 3.5vw, 2.6rem)",
                          color: "rgba(255,255,255,0.90)",
                          textShadow: "0 2px 16px rgba(0,0,0,0.7)",
                        }}
                      >
                        „{displayText ?? verse.text}"
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Translation label + DE/FR toggle + position */}
                <div className="mt-10 flex items-center justify-center gap-4">
                  <span className="text-sm tracking-[0.3em] uppercase text-white/35">
                    {lang === "fr" ? frLabel : verse.translation}
                  </span>

                  {canTranslate && (
                    <div className="flex items-center rounded-xl overflow-hidden border border-white/20 backdrop-blur-sm">
                      {(["de", "fr"] as const).map((l) => (
                        <button
                          key={l}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => setLang(l)}
                          className={[
                            "px-3 py-1 text-xs font-bold tracking-widest uppercase transition-all",
                            lang === l
                              ? "bg-white/20 text-white"
                              : "bg-transparent text-white/35 hover:text-white/60",
                          ].join(" ")}
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                  )}

                  {verseList.length > 0 && currentIdx >= 0 && (
                    <span className="text-xs text-white/25 tabular-nums">
                      {currentIdx + 1} / {verseList.length}
                    </span>
                  )}
                </div>

                {/* Ornament */}
                <div className="flex items-center justify-center gap-4 mt-10">
                  <div className="h-px w-20 bg-white/25" />
                  <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
                  <div className="h-px w-20 bg-white/25" />
                </div>
              </motion.div>

              {/* Next */}
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => navigate(1)}
                disabled={!hasNext || navigating}
                className="absolute right-6 w-12 h-12 rounded-2xl flex items-center justify-center bg-white/10 border border-white/20 text-white/60 hover:text-white hover:bg-white/20 backdrop-blur-sm disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                title="Nächster Vers (→)"
              >
                <ChevronRight size={22} />
              </button>
            </div>

            {/* Bottom */}
            <div className="pb-7 flex justify-center">
              <p className="text-[11px] font-medium tracking-[0.3em] uppercase text-white/25">
                FEG le Rocher
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
