"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, CheckCircle2, Loader2, ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";
import { useServiceStore } from "@/store/serviceStore";
import { useBibles, useBooks, useChapters, useVerseList } from "@/hooks/useBible";

// ── navigation state ──────────────────────────────────────────────────────────
type Step =
  | { mode: "books" }
  | { mode: "chapters"; bookId: string; bookName: string }
  | { mode: "verses";   bookId: string; bookName: string; chapterId: string; chapterNum: string };

// ── component ─────────────────────────────────────────────────────────────────
export function BibleModule() {
  const setVerse    = useServiceStore((s) => s.setVerse);
  const currentVerse = useServiceStore((s) => s.currentVerse);

  // Translation
  const { bibles } = useBibles();
  const [bibleId, setBibleId] = useState("");

  // Default to L1912 once bibles are loaded
  useEffect(() => {
    if (bibles.length === 0 || bibleId) return;
    const l1912 = bibles.find(
      (b) => b.abbreviationLocal?.toUpperCase() === "L1912" ||
             b.name?.toLowerCase().includes("luther 1912")
    );
    setBibleId(l1912?.id ?? bibles[0].id);
  }, [bibles, bibleId]);

  const bibleLabel = bibles.find((b) => b.id === bibleId)?.abbreviationLocal ?? "L1912";

  // Browse state
  const [step, setStep] = useState<Step>({ mode: "books" });

  // Book filter query
  const [query, setQuery] = useState("");
  const inputRef          = useRef<HTMLInputElement>(null);

  // Reset browse when translation changes
  useEffect(() => { setStep({ mode: "books" }); }, [bibleId]);

  // Data hooks
  const { books,    loading: booksLoading,    error: booksError    } = useBooks(bibleId);

  const filteredBooks = query.trim()
    ? books.filter((b) => b.name.toLowerCase().includes(query.trim().toLowerCase()))
    : books;
  const { chapters, loading: chaptersLoading, error: chaptersError } = useChapters(
    bibleId,
    step.mode === "chapters" ? step.bookId : ""
  );
  const { verses,   loading: versesLoading,   error: versesError   } = useVerseList(
    bibleId,
    step.mode === "verses" ? step.chapterId : ""
  );

  const apiError = booksError ?? chaptersError ?? versesError;

  // Apply a verse (always fetches full text)
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [applyError, setApplyError] = useState<"RATE_LIMIT" | "ERROR" | null>(null);

  const applyVerse = async (verseId: string, reference: string) => {
    if (!bibleId) return;
    setApplyingId(verseId);
    setApplyError(null);
    try {
      const res  = await fetch(`/api/bible/verse?bibleId=${bibleId}&verseId=${encodeURIComponent(verseId)}`);
      if (res.status === 429) { setApplyError("RATE_LIMIT"); return; }
      if (!res.ok) { setApplyError("ERROR"); return; }
      const data = await res.json();
      setVerse({ reference, text: (data.content as string).trim(), translation: bibleLabel, verseId, bibleId });
    } catch {
      setApplyError("ERROR");
    } finally {
      setApplyingId(null);
    }
  };

  return (
    <div className="flex flex-col h-full gap-3">

      {/* ── Search bar + translation selector ── */}
      <div className="flex items-center gap-2 p-1 rounded-2xl bg-white/[0.04] border border-white/[0.07]">
        <div className="relative flex-1">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3E4560] pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Vers suchen…"
            className="w-full h-9 pl-8 pr-7 bg-transparent text-sm text-[#EEEEFF] placeholder-[#3E4560] focus:outline-none"
          />
          <AnimatePresence>
            {query.length > 0 && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.1 }}
                onClick={() => { setQuery(""); inputRef.current?.focus(); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#3E4560] hover:text-[#7580A0] transition-colors"
              >
                <X size={13} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <select
          value={bibleId}
          onChange={(e) => setBibleId(e.target.value)}
          className="h-7 px-2 rounded-lg bg-white/[0.06] border border-white/[0.08] text-[10px] font-bold text-[#7580A0] hover:text-[#EEEEFF] focus:outline-none cursor-pointer transition-colors appearance-none text-center"
          style={{ minWidth: "3.5rem" }}
          title="Übersetzung"
        >
          {bibles.map((b) => (
            <option key={b.id} value={b.id}>{b.abbreviationLocal}</option>
          ))}
        </select>
      </div>

      {/* ── API error banner ── */}
      {(apiError ?? applyError) && (
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-500/[0.08] border border-red-500/20">
          <AlertTriangle size={13} className="text-red-400 flex-shrink-0" />
          <p className="text-[11px] text-red-400 leading-snug">
            {(apiError ?? applyError) === "RATE_LIMIT"
              ? "API-Limit erreicht. Bitte später erneut versuchen."
              : "Verbindungsfehler. Bitte Seite neu laden."}
          </p>
        </div>
      )}

      {/* ── Breadcrumb ── */}
      {step.mode !== "books" && (
        <div className="flex items-center gap-1.5 px-1">
          <button
            onClick={() =>
              step.mode === "chapters"
                ? setStep({ mode: "books" })
                : setStep({ mode: "chapters", bookId: step.bookId, bookName: step.bookName })
            }
            className="flex items-center gap-1 text-[11px] text-[#7580A0] hover:text-[#EEEEFF] transition-colors"
          >
            <ChevronLeft size={13} />
            {step.mode === "chapters" ? "Bücher" : step.bookName}
          </button>
          <span className="text-[#3E4560] text-[11px]">/</span>
          <span className="text-[11px] text-[#EEEEFF] font-medium">
            {step.mode === "chapters"
              ? step.bookName
              : `Kapitel ${step.chapterNum}`}
          </span>
        </div>
      )}

      {/* ── Main scrollable area ── */}
      <div className="flex-1 min-h-0 overflow-y-auto -mx-1 px-1">
        <AnimatePresence mode="wait">

          {/* Books list (filtered when query is set) */}
          {step.mode === "books" && (
            <motion.div key="books"
              initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.14 }}
            >
              {booksLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 size={14} className="text-[#3D72F6] animate-spin" />
                </div>
              ) : filteredBooks.length === 0 ? (
                <div className="flex justify-center py-8">
                  <p className="text-xs text-[#3E4560]">
                    Kein Buch gefunden für{" "}
                    <span className="text-[#7580A0]">„{query}"</span>
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-0.5">
                  {filteredBooks.map((book) => (
                    <button
                      key={book.id}
                      onClick={() => { setStep({ mode: "chapters", bookId: book.id, bookName: book.name }); setQuery(""); }}
                      className="group w-full flex items-center justify-between px-3 py-2.5 rounded-xl border border-transparent bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.07] text-left transition-all"
                    >
                      <span className="text-xs font-medium text-[#EEEEFF]">{book.name}</span>
                      <ChevronRight size={12} className="text-[#3E4560] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Chapters grid */}
          {step.mode === "chapters" && (
            <motion.div key="chapters"
              initial={{ opacity: 0, x: 6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 6 }}
              transition={{ duration: 0.14 }}
            >
              {chaptersLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 size={14} className="text-[#3D72F6] animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-5 gap-1.5">
                  {chapters.map((ch) => (
                    <button
                      key={ch.id}
                      onClick={() => setStep({
                        mode: "verses",
                        bookId: step.bookId,
                        bookName: step.bookName,
                        chapterId: ch.id,
                        chapterNum: ch.number,
                      })}
                      className="h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] text-xs font-semibold text-[#7580A0] hover:bg-white/[0.09] hover:text-[#EEEEFF] hover:border-white/[0.12] transition-all"
                    >
                      {ch.number}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Verses grid */}
          {step.mode === "verses" && (
            <motion.div key="verses"
              initial={{ opacity: 0, x: 6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 6 }}
              transition={{ duration: 0.14 }}
            >
              {versesLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 size={14} className="text-[#3D72F6] animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-5 gap-1.5">
                  {verses.map((v) => {
                    const verseNum = v.id.split(".").pop() ?? v.reference;
                    const isApplying = applyingId === v.id;
                    const isActive   = currentVerse?.reference === v.reference;
                    return (
                      <button
                        key={v.id}
                        onClick={() => applyVerse(v.id, v.reference)}
                        disabled={isApplying}
                        className={[
                          "h-10 rounded-xl border text-xs font-semibold transition-all",
                          isActive
                            ? "bg-[#3D72F6]/20 border-[#3D72F6]/40 text-[#6B9BFF]"
                            : "bg-white/[0.04] border-white/[0.06] text-[#7580A0] hover:bg-white/[0.09] hover:text-[#EEEEFF] hover:border-white/[0.12]",
                        ].join(" ")}
                      >
                        {isApplying
                          ? <Loader2 size={11} className="animate-spin mx-auto" />
                          : verseNum}
                      </button>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* ── Active verse bar ── */}
      <AnimatePresence>
        {currentVerse && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.2 }}
            className="flex-shrink-0 flex items-start gap-2.5 px-3 py-3 rounded-xl bg-[#22C55E]/[0.06] border border-[#22C55E]/[0.15]"
          >
            <CheckCircle2 size={13} className="flex-shrink-0 text-[#22C55E] mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-[#22C55E] tracking-widest uppercase mb-0.5">
                Presenter aktiv
              </p>
              <p className="text-[11px] font-semibold text-[#E8A83A]">{currentVerse.reference}</p>
              <p className="text-[10px] text-[#7580A0] line-clamp-1 mt-0.5 leading-relaxed">
                {currentVerse.text}
              </p>
            </div>
            <button
              onClick={() => setVerse(null)}
              className="flex-shrink-0 w-5 h-5 rounded-md flex items-center justify-center text-[#3E4560] hover:text-[#F87171] hover:bg-[#F87171]/[0.08] transition-all"
              title="Vers entfernen"
            >
              <X size={11} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
