import { formatTime, getTimerColor, timerHex, generateId } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────
// formatTime
// ─────────────────────────────────────────────────────────────
describe("formatTime", () => {
  it("formats zero as 00:00", () => {
    expect(formatTime(0)).toBe("00:00");
  });

  it("formats seconds only", () => {
    expect(formatTime(45)).toBe("00:45");
  });

  it("formats minutes and seconds", () => {
    expect(formatTime(90)).toBe("01:30");
  });

  it("formats exactly one minute", () => {
    expect(formatTime(60)).toBe("01:00");
  });

  it("formats hours when >= 3600s", () => {
    expect(formatTime(3600)).toBe("1:00:00");
    expect(formatTime(3661)).toBe("1:01:01");
    expect(formatTime(7322)).toBe("2:02:02");
  });

  it("pads minutes and seconds with leading zero", () => {
    expect(formatTime(605)).toBe("10:05");
  });

  it("includes minus sign for negative values (overtime display)", () => {
    // The function preserves the sign; callers strip it and prepend "−" themselves
    expect(formatTime(-30)).toBe("-00:30");
    expect(formatTime(-90)).toBe("-01:30");
    expect(formatTime(-3661)).toBe("-1:01:01");
  });

  it("handles large values", () => {
    expect(formatTime(86399)).toBe("23:59:59");
  });
});

// ─────────────────────────────────────────────────────────────
// getTimerColor
// ─────────────────────────────────────────────────────────────
describe("getTimerColor", () => {
  it("returns red when remaining is 0", () => {
    expect(getTimerColor(0, 600)).toBe("red");
  });

  it("returns red when remaining is negative", () => {
    expect(getTimerColor(-10, 600)).toBe("red");
  });

  it("returns red when <= 10% remaining", () => {
    expect(getTimerColor(60, 600)).toBe("red");   // exactly 10%
    expect(getTimerColor(59, 600)).toBe("red");   // just under
  });

  it("returns yellow when > 10% and <= 25% remaining", () => {
    expect(getTimerColor(61, 600)).toBe("yellow");  // just over 10%
    expect(getTimerColor(150, 600)).toBe("yellow"); // exactly 25%
  });

  it("returns green when > 25% remaining", () => {
    expect(getTimerColor(151, 600)).toBe("green");
    expect(getTimerColor(600, 600)).toBe("green"); // full
  });
});

// ─────────────────────────────────────────────────────────────
// timerHex
// ─────────────────────────────────────────────────────────────
describe("timerHex", () => {
  it("returns neutral white when idle", () => {
    expect(timerHex(0, false, true)).toBe("#EEEEFF");
    expect(timerHex(1, false, true)).toBe("#EEEEFF");
  });

  it("returns red when overtime", () => {
    expect(timerHex(0, true)).toBe("#F87171");
    expect(timerHex(0.5, true)).toBe("#F87171");
  });

  it("returns red when progress <= 10%", () => {
    expect(timerHex(0.1, false)).toBe("#F87171");
    expect(timerHex(0.05, false)).toBe("#F87171");
    expect(timerHex(0, false)).toBe("#F87171");
  });

  it("returns orange when progress <= 25% and not overtime", () => {
    expect(timerHex(0.11, false)).toBe("#FB923C");
    expect(timerHex(0.25, false)).toBe("#FB923C");
  });

  it("returns green when progress > 25%", () => {
    expect(timerHex(0.26, false)).toBe("#4ADE80");
    expect(timerHex(1, false)).toBe("#4ADE80");
  });

  it("isIdle overrides overtime and progress", () => {
    expect(timerHex(0, true, true)).toBe("#EEEEFF");
  });
});

// ─────────────────────────────────────────────────────────────
// generateId
// ─────────────────────────────────────────────────────────────
describe("generateId", () => {
  it("returns a non-empty string", () => {
    expect(typeof generateId()).toBe("string");
    expect(generateId().length).toBeGreaterThan(0);
  });

  it("returns unique values on repeated calls", () => {
    const ids = Array.from({ length: 100 }, generateId);
    const unique = new Set(ids);
    expect(unique.size).toBe(100);
  });

  it("contains only alphanumeric characters", () => {
    const id = generateId();
    expect(/^[a-z0-9]+$/.test(id)).toBe(true);
  });

  it("has expected length (8 chars from slice(2,10))", () => {
    // Math.random().toString(36).slice(2, 10) → 8 chars
    const id = generateId();
    expect(id.length).toBeLessThanOrEqual(8);
  });
});
