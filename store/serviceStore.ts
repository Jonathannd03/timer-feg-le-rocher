"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ServiceSection, BibleVerse, TimerStatus } from "@/types";
import { defaultSections, defaultVerse } from "@/lib/mockData";
import { generateId } from "@/lib/utils";

interface ServiceStore {
  // Program
  sections: ServiceSection[];
  currentIndex: number;

  // Timer
  timerStatus: TimerStatus;
  remaining: number;
  endTime: number | null;

  // Content
  currentVerse: BibleVerse | null;
  presenterMessage: string;

  // Actions
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  tickTimer: () => void;
  goToSection: (index: number) => void;
  nextSection: () => void;
  prevSection: () => void;

  addSection: (section: Omit<ServiceSection, "id">) => void;
  updateSection: (id: string, updates: Partial<ServiceSection>) => void;
  removeSection: (id: string) => void;
  reorderSections: (sections: ServiceSection[]) => void;

  setVerse: (verse: BibleVerse | null) => void;
  setPresenterMessage: (msg: string) => void;
}

export const useServiceStore = create<ServiceStore>()(
  persist(
    (set, get) => ({
      sections: defaultSections,
      currentIndex: 0,
      timerStatus: "idle",
      remaining: defaultSections[0]?.duration ?? 0,
      endTime: null,
      currentVerse: defaultVerse,
      presenterMessage: "",

      startTimer: () => {
        const { remaining, timerStatus } = get();
        if (timerStatus === "running" || timerStatus === "overtime") return;
        const endTime = Date.now() + remaining * 1000;
        set({ timerStatus: remaining < 0 ? "overtime" : "running", endTime });
      },

      pauseTimer: () => {
        const { timerStatus, endTime } = get();
        if (timerStatus !== "running" && timerStatus !== "overtime") return;
        const remaining = Math.ceil((endTime! - Date.now()) / 1000);
        set({ timerStatus: "paused", remaining, endTime: null });
      },

      resetTimer: () => {
        const { sections, currentIndex } = get();
        const duration = sections[currentIndex]?.duration ?? 0;
        set({ timerStatus: "idle", remaining: duration, endTime: null });
      },

      tickTimer: () => {
        const { timerStatus, endTime } = get();
        if ((timerStatus !== "running" && timerStatus !== "overtime") || endTime === null) return;
        const remaining = Math.ceil((endTime - Date.now()) / 1000);
        if (remaining <= -3600) return; // safety cap at 1hr overtime
        set({
          remaining,
          timerStatus: remaining < 0 ? "overtime" : "running",
        });
      },

      goToSection: (index) => {
        const { sections } = get();
        if (index < 0 || index >= sections.length) return;
        const duration = sections[index].duration;
        set({
          currentIndex: index,
          timerStatus: "idle",
          remaining: duration,
          endTime: null,
        });
      },

      nextSection: () => {
        const { currentIndex, sections } = get();
        if (currentIndex < sections.length - 1) {
          get().goToSection(currentIndex + 1);
        }
      },

      prevSection: () => {
        const { currentIndex } = get();
        if (currentIndex > 0) {
          get().goToSection(currentIndex - 1);
        }
      },

      addSection: (section) => {
        set((state) => ({
          sections: [...state.sections, { ...section, id: generateId() }],
        }));
      },

      updateSection: (id, updates) => {
        set((state) => ({
          sections: state.sections.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
        }));
        // if editing current section duration, sync remaining
        const { sections, currentIndex, timerStatus } = get();
        const updated = sections.find((s) => s.id === id);
        if (updated && sections[currentIndex]?.id === id && timerStatus === "idle") {
          set({ remaining: updated.duration });
        }
      },

      removeSection: (id) => {
        set((state) => {
          const next = state.sections.filter((s) => s.id !== id);
          const idx = Math.min(state.currentIndex, Math.max(0, next.length - 1));
          return {
            sections: next,
            currentIndex: idx,
            remaining: next[idx]?.duration ?? 0,
            timerStatus: "idle",
            endTime: null,
          };
        });
      },

      reorderSections: (sections) => set({ sections }),

      setVerse: (verse) => set({ currentVerse: verse }),
      setPresenterMessage: (presenterMessage) => set({ presenterMessage }),
    }),
    {
      name: "feg-service-store",
      partialize: (state) => ({
        sections: state.sections,
        currentVerse: state.currentVerse,
        presenterMessage: state.presenterMessage,
      }),
    }
  )
);
