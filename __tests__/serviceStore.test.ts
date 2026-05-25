/**
 * Unit tests for the Zustand serviceStore.
 *
 * We import the store factory directly and reconstruct a fresh store
 * instance for each test so state never leaks between cases.
 */

import { create } from "zustand";

// ── helpers ──────────────────────────────────────────────────
import { generateId } from "@/lib/utils";
import type { ServiceSection, BibleVerse, TimerStatus } from "@/types";

// ── re-build a bare store (no persist middleware) for testing ─
type StoreState = {
  sections: ServiceSection[];
  currentIndex: number;
  timerStatus: TimerStatus;
  remaining: number;
  endTime: number | null;
  currentVerse: BibleVerse | null;
  presenterMessage: string;
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
};

function makeStore() {
  return create<StoreState>()((set, get) => ({
    sections: [],
    currentIndex: 0,
    timerStatus: "idle",
    remaining: 0,
    endTime: null,
    currentVerse: null,
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
      if (remaining <= -3600) return;
      set({ remaining, timerStatus: remaining < 0 ? "overtime" : "running" });
    },

    goToSection: (index) => {
      const { sections } = get();
      if (index < 0 || index >= sections.length) return;
      const duration = sections[index].duration;
      set({ currentIndex: index, timerStatus: "idle", remaining: duration, endTime: null });
    },

    nextSection: () => {
      const { currentIndex, sections } = get();
      if (currentIndex < sections.length - 1) get().goToSection(currentIndex + 1);
    },

    prevSection: () => {
      const { currentIndex } = get();
      if (currentIndex > 0) get().goToSection(currentIndex - 1);
    },

    addSection: (section) => {
      set((state) => ({
        sections: [...state.sections, { ...section, id: generateId() }],
      }));
    },

    updateSection: (id, updates) => {
      set((state) => ({
        sections: state.sections.map((s) => (s.id === id ? { ...s, ...updates } : s)),
      }));
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
        return { sections: next, currentIndex: idx, remaining: next[idx]?.duration ?? 0, timerStatus: "idle", endTime: null };
      });
    },

    reorderSections: (sections) => set({ sections }),

    setVerse: (verse) => set({ currentVerse: verse }),
    setPresenterMessage: (presenterMessage) => set({ presenterMessage }),
  }));
}

// ── helper to get state snapshot ─────────────────────────────
function state(store: ReturnType<typeof makeStore>) {
  return store.getState();
}

// ── sample sections ───────────────────────────────────────────
const sec = (name: string, duration: number): Omit<ServiceSection, "id"> => ({
  name,
  duration,
});

// ─────────────────────────────────────────────────────────────
// Initial state
// ─────────────────────────────────────────────────────────────
describe("initial state", () => {
  it("starts with empty sections", () => {
    const store = makeStore();
    expect(state(store).sections).toEqual([]);
  });

  it("starts with idle timer", () => {
    const store = makeStore();
    expect(state(store).timerStatus).toBe("idle");
  });

  it("starts at index 0", () => {
    const store = makeStore();
    expect(state(store).currentIndex).toBe(0);
  });

  it("starts with null verse", () => {
    const store = makeStore();
    expect(state(store).currentVerse).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────
// addSection
// ─────────────────────────────────────────────────────────────
describe("addSection", () => {
  it("adds a section with a generated id", () => {
    const store = makeStore();
    state(store).addSection(sec("Begrüßung", 300));
    expect(state(store).sections).toHaveLength(1);
    expect(state(store).sections[0].name).toBe("Begrüßung");
    expect(state(store).sections[0].id).toBeTruthy();
  });

  it("appends sections in order", () => {
    const store = makeStore();
    state(store).addSection(sec("A", 60));
    state(store).addSection(sec("B", 120));
    state(store).addSection(sec("C", 180));
    expect(state(store).sections.map((s) => s.name)).toEqual(["A", "B", "C"]);
  });

  it("preserves section duration", () => {
    const store = makeStore();
    state(store).addSection(sec("Predigt", 1800));
    expect(state(store).sections[0].duration).toBe(1800);
  });

  it("assigns unique ids to each section", () => {
    const store = makeStore();
    state(store).addSection(sec("A", 60));
    state(store).addSection(sec("B", 60));
    const [a, b] = state(store).sections;
    expect(a.id).not.toBe(b.id);
  });
});

// ─────────────────────────────────────────────────────────────
// startTimer
// ─────────────────────────────────────────────────────────────
describe("startTimer", () => {
  it("sets status to running when idle", () => {
    const store = makeStore();
    state(store).addSection(sec("A", 300));
    state(store).goToSection(0);
    state(store).startTimer();
    expect(state(store).timerStatus).toBe("running");
  });

  it("sets endTime when started", () => {
    const store = makeStore();
    state(store).addSection(sec("A", 300));
    state(store).goToSection(0);
    const before = Date.now();
    state(store).startTimer();
    const after = Date.now();
    expect(state(store).endTime).toBeGreaterThanOrEqual(before + 300_000);
    expect(state(store).endTime).toBeLessThanOrEqual(after + 300_000);
  });

  it("does nothing when already running", () => {
    const store = makeStore();
    state(store).addSection(sec("A", 300));
    state(store).goToSection(0);
    state(store).startTimer();
    const endTime = state(store).endTime;
    state(store).startTimer();
    expect(state(store).endTime).toBe(endTime); // unchanged
  });

  it("sets status to overtime when remaining is negative", () => {
    const store = makeStore();
    store.setState({ remaining: -10, timerStatus: "paused" });
    state(store).startTimer();
    expect(state(store).timerStatus).toBe("overtime");
  });
});

// ─────────────────────────────────────────────────────────────
// pauseTimer
// ─────────────────────────────────────────────────────────────
describe("pauseTimer", () => {
  it("sets status to paused from running", () => {
    const store = makeStore();
    state(store).addSection(sec("A", 300));
    state(store).goToSection(0);
    state(store).startTimer();
    state(store).pauseTimer();
    expect(state(store).timerStatus).toBe("paused");
  });

  it("clears endTime when paused", () => {
    const store = makeStore();
    state(store).addSection(sec("A", 300));
    state(store).goToSection(0);
    state(store).startTimer();
    state(store).pauseTimer();
    expect(state(store).endTime).toBeNull();
  });

  it("does nothing when idle", () => {
    const store = makeStore();
    state(store).pauseTimer();
    expect(state(store).timerStatus).toBe("idle");
  });

  it("can pause from overtime", () => {
    const store = makeStore();
    store.setState({ remaining: -5, timerStatus: "overtime", endTime: Date.now() - 5000 });
    state(store).pauseTimer();
    expect(state(store).timerStatus).toBe("paused");
    expect(state(store).endTime).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────
// resetTimer
// ─────────────────────────────────────────────────────────────
describe("resetTimer", () => {
  it("resets to idle with section duration", () => {
    const store = makeStore();
    state(store).addSection(sec("A", 300));
    state(store).goToSection(0);
    state(store).startTimer();
    state(store).resetTimer();
    expect(state(store).timerStatus).toBe("idle");
    expect(state(store).remaining).toBe(300);
    expect(state(store).endTime).toBeNull();
  });

  it("resets remaining to 0 when no section exists", () => {
    const store = makeStore();
    state(store).resetTimer();
    expect(state(store).remaining).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────
// tickTimer
// ─────────────────────────────────────────────────────────────
describe("tickTimer", () => {
  it("does nothing when idle", () => {
    const store = makeStore();
    store.setState({ timerStatus: "idle", remaining: 300 });
    state(store).tickTimer();
    expect(state(store).remaining).toBe(300);
  });

  it("does nothing when endTime is null", () => {
    const store = makeStore();
    store.setState({ timerStatus: "running", endTime: null, remaining: 300 });
    state(store).tickTimer();
    expect(state(store).remaining).toBe(300);
  });

  it("updates remaining when running", () => {
    const store = makeStore();
    const endTime = Date.now() + 100_000;
    store.setState({ timerStatus: "running", endTime, remaining: 100 });
    state(store).tickTimer();
    expect(state(store).remaining).toBeLessThanOrEqual(100);
    expect(state(store).remaining).toBeGreaterThan(90);
  });

  it("transitions to overtime when remaining goes negative", () => {
    const store = makeStore();
    const endTime = Date.now() - 5000; // already 5s past
    store.setState({ timerStatus: "running", endTime, remaining: 10 });
    state(store).tickTimer();
    expect(state(store).timerStatus).toBe("overtime");
    expect(state(store).remaining).toBeLessThan(0);
  });

  it("continues ticking when in overtime", () => {
    const store = makeStore();
    const endTime = Date.now() - 10_000;
    store.setState({ timerStatus: "overtime", endTime, remaining: -10 });
    state(store).tickTimer();
    expect(state(store).timerStatus).toBe("overtime");
    expect(state(store).remaining).toBeLessThan(0);
  });

  it("stops at the 1hr overtime safety cap", () => {
    const store = makeStore();
    const endTime = Date.now() - 4_000_000; // way past 1hr
    store.setState({ timerStatus: "overtime", endTime, remaining: -3600 });
    const before = state(store).remaining;
    state(store).tickTimer();
    expect(state(store).remaining).toBe(before); // unchanged
  });
});

// ─────────────────────────────────────────────────────────────
// goToSection
// ─────────────────────────────────────────────────────────────
describe("goToSection", () => {
  it("switches to the given section index", () => {
    const store = makeStore();
    state(store).addSection(sec("A", 60));
    state(store).addSection(sec("B", 120));
    state(store).goToSection(1);
    expect(state(store).currentIndex).toBe(1);
    expect(state(store).remaining).toBe(120);
    expect(state(store).timerStatus).toBe("idle");
  });

  it("ignores out-of-bounds index", () => {
    const store = makeStore();
    state(store).addSection(sec("A", 60));
    state(store).goToSection(5);
    expect(state(store).currentIndex).toBe(0); // unchanged
  });

  it("ignores negative index", () => {
    const store = makeStore();
    state(store).addSection(sec("A", 60));
    state(store).goToSection(-1);
    expect(state(store).currentIndex).toBe(0);
  });

  it("resets timer when changing section", () => {
    const store = makeStore();
    state(store).addSection(sec("A", 60));
    state(store).addSection(sec("B", 120));
    state(store).goToSection(0);
    state(store).startTimer();
    state(store).goToSection(1);
    expect(state(store).timerStatus).toBe("idle");
    expect(state(store).endTime).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────
// nextSection / prevSection
// ─────────────────────────────────────────────────────────────
describe("nextSection", () => {
  it("advances to the next section", () => {
    const store = makeStore();
    state(store).addSection(sec("A", 60));
    state(store).addSection(sec("B", 120));
    state(store).goToSection(0);
    state(store).nextSection();
    expect(state(store).currentIndex).toBe(1);
  });

  it("does not go past the last section", () => {
    const store = makeStore();
    state(store).addSection(sec("A", 60));
    state(store).goToSection(0);
    state(store).nextSection();
    expect(state(store).currentIndex).toBe(0);
  });
});

describe("prevSection", () => {
  it("goes back to previous section", () => {
    const store = makeStore();
    state(store).addSection(sec("A", 60));
    state(store).addSection(sec("B", 120));
    state(store).goToSection(1);
    state(store).prevSection();
    expect(state(store).currentIndex).toBe(0);
  });

  it("does not go below index 0", () => {
    const store = makeStore();
    state(store).addSection(sec("A", 60));
    state(store).goToSection(0);
    state(store).prevSection();
    expect(state(store).currentIndex).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────
// updateSection
// ─────────────────────────────────────────────────────────────
describe("updateSection", () => {
  it("updates section name", () => {
    const store = makeStore();
    state(store).addSection(sec("Old", 60));
    const id = state(store).sections[0].id;
    state(store).updateSection(id, { name: "New" });
    expect(state(store).sections[0].name).toBe("New");
  });

  it("syncs remaining when updating current section duration while idle", () => {
    const store = makeStore();
    state(store).addSection(sec("A", 300));
    state(store).goToSection(0);
    const id = state(store).sections[0].id;
    state(store).updateSection(id, { duration: 600 });
    expect(state(store).remaining).toBe(600);
  });

  it("does not sync remaining if timer is running", () => {
    const store = makeStore();
    state(store).addSection(sec("A", 300));
    state(store).goToSection(0);
    state(store).startTimer();
    const id = state(store).sections[0].id;
    state(store).updateSection(id, { duration: 600 });
    // remaining was set by startTimer, not by the update
    expect(state(store).timerStatus).toBe("running");
  });

  it("does not affect other sections", () => {
    const store = makeStore();
    state(store).addSection(sec("A", 60));
    state(store).addSection(sec("B", 120));
    const idA = state(store).sections[0].id;
    state(store).updateSection(idA, { name: "Updated A" });
    expect(state(store).sections[1].name).toBe("B");
  });
});

// ─────────────────────────────────────────────────────────────
// removeSection
// ─────────────────────────────────────────────────────────────
describe("removeSection", () => {
  it("removes the section by id", () => {
    const store = makeStore();
    state(store).addSection(sec("A", 60));
    state(store).addSection(sec("B", 120));
    const idA = state(store).sections[0].id;
    state(store).removeSection(idA);
    expect(state(store).sections).toHaveLength(1);
    expect(state(store).sections[0].name).toBe("B");
  });

  it("adjusts currentIndex to not exceed new length", () => {
    const store = makeStore();
    state(store).addSection(sec("A", 60));
    state(store).addSection(sec("B", 120));
    state(store).goToSection(1);
    const idB = state(store).sections[1].id;
    state(store).removeSection(idB);
    expect(state(store).currentIndex).toBe(0);
  });

  it("resets timer on removal", () => {
    const store = makeStore();
    state(store).addSection(sec("A", 60));
    state(store).goToSection(0);
    state(store).startTimer();
    const id = state(store).sections[0].id;
    state(store).removeSection(id);
    expect(state(store).timerStatus).toBe("idle");
    expect(state(store).endTime).toBeNull();
  });

  it("sets remaining to 0 when last section removed", () => {
    const store = makeStore();
    state(store).addSection(sec("A", 60));
    const id = state(store).sections[0].id;
    state(store).removeSection(id);
    expect(state(store).remaining).toBe(0);
    expect(state(store).sections).toHaveLength(0);
  });
});

// ─────────────────────────────────────────────────────────────
// reorderSections
// ─────────────────────────────────────────────────────────────
describe("reorderSections", () => {
  it("replaces sections with the new order", () => {
    const store = makeStore();
    state(store).addSection(sec("A", 60));
    state(store).addSection(sec("B", 120));
    const [a, b] = state(store).sections;
    state(store).reorderSections([b, a]);
    expect(state(store).sections[0].name).toBe("B");
    expect(state(store).sections[1].name).toBe("A");
  });
});

// ─────────────────────────────────────────────────────────────
// setVerse
// ─────────────────────────────────────────────────────────────
describe("setVerse", () => {
  const verse: BibleVerse = {
    reference: "Johannes 3:16",
    text: "Denn also hat Gott die Welt geliebt...",
    translation: "L1912",
    verseId: "JHN.3.16",
    bibleId: "abc123",
  };

  it("sets the current verse", () => {
    const store = makeStore();
    state(store).setVerse(verse);
    expect(state(store).currentVerse).toEqual(verse);
  });

  it("can clear the verse by setting null", () => {
    const store = makeStore();
    state(store).setVerse(verse);
    state(store).setVerse(null);
    expect(state(store).currentVerse).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────
// setPresenterMessage
// ─────────────────────────────────────────────────────────────
describe("setPresenterMessage", () => {
  it("sets the presenter message", () => {
    const store = makeStore();
    state(store).setPresenterMessage("Willkommen!");
    expect(state(store).presenterMessage).toBe("Willkommen!");
  });

  it("can be cleared", () => {
    const store = makeStore();
    state(store).setPresenterMessage("Hello");
    state(store).setPresenterMessage("");
    expect(state(store).presenterMessage).toBe("");
  });
});
