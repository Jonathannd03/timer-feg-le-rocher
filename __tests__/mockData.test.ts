/**
 * Tests for lib/mockData.ts — verify data integrity and shape.
 */

import { defaultSections, defaultVerse, quickVerses } from "@/lib/mockData";

describe("defaultSections", () => {
  it("is an array", () => {
    expect(Array.isArray(defaultSections)).toBe(true);
  });

  it("starts empty (app loads blank)", () => {
    expect(defaultSections).toHaveLength(0);
  });
});

describe("defaultVerse", () => {
  it("has a reference", () => {
    expect(typeof defaultVerse.reference).toBe("string");
    expect(defaultVerse.reference.length).toBeGreaterThan(0);
  });

  it("has text content", () => {
    expect(typeof defaultVerse.text).toBe("string");
    expect(defaultVerse.text.length).toBeGreaterThan(0);
  });

  it("has a translation label", () => {
    expect(typeof defaultVerse.translation).toBe("string");
    expect(defaultVerse.translation.length).toBeGreaterThan(0);
  });
});

describe("quickVerses", () => {
  it("is a non-empty array", () => {
    expect(Array.isArray(quickVerses)).toBe(true);
    expect(quickVerses.length).toBeGreaterThan(0);
  });

  it("each verse has reference, text and translation", () => {
    quickVerses.forEach((v) => {
      expect(typeof v.reference).toBe("string");
      expect(v.reference.length).toBeGreaterThan(0);
      expect(typeof v.text).toBe("string");
      expect(v.text.length).toBeGreaterThan(0);
      expect(typeof v.translation).toBe("string");
    });
  });

  it("all references are unique", () => {
    const refs = quickVerses.map((v) => v.reference);
    expect(new Set(refs).size).toBe(refs.length);
  });
});
