/**
 * Unit tests for lib/apiBible.ts
 * All network calls are mocked via jest.
 */

import { BibleApi, stripHtml } from "@/lib/apiBible";

// ── mock global fetch ─────────────────────────────────────────
const mockFetch = jest.fn();
global.fetch = mockFetch;

function mockResponse(data: unknown, ok = true, status = 200) {
  mockFetch.mockResolvedValueOnce({
    ok,
    status,
    json: async () => ({ data }),
  });
}

beforeEach(() => {
  mockFetch.mockClear();
});

// ─────────────────────────────────────────────────────────────
// stripHtml
// ─────────────────────────────────────────────────────────────
describe("stripHtml", () => {
  it("removes HTML tags", () => {
    expect(stripHtml("<p>Hello <b>world</b></p>")).toBe("Hello world");
  });

  it("collapses multiple spaces", () => {
    expect(stripHtml("<p>One</p>  <p>Two</p>")).toBe("One Two");
  });

  it("removes leading verse numbers", () => {
    expect(stripHtml("16 Denn also hat Gott")).toBe("Denn also hat Gott");
    expect(stripHtml("3 For God so loved")).toBe("For God so loved");
  });

  it("handles plain text with no tags", () => {
    expect(stripHtml("Simple text")).toBe("Simple text");
  });

  it("trims surrounding whitespace", () => {
    expect(stripHtml("  <p>text</p>  ")).toBe("text");
  });

  it("handles empty string", () => {
    expect(stripHtml("")).toBe("");
  });

  it("does not strip numbers mid-sentence", () => {
    expect(stripHtml("John 3 says hello")).toBe("John 3 says hello");
  });
});

// ─────────────────────────────────────────────────────────────
// BibleApi.listBibles
// ─────────────────────────────────────────────────────────────
describe("BibleApi.listBibles", () => {
  it("calls the correct endpoint with default language", async () => {
    mockResponse([{ id: "abc", name: "Lutherbibel" }]);
    const result = await BibleApi.listBibles();
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const url: string = mockFetch.mock.calls[0][0];
    expect(url).toContain("/bibles");
    expect(url).toContain("language=deu");
    expect(result).toEqual([{ id: "abc", name: "Lutherbibel" }]);
  });

  it("calls with custom language", async () => {
    mockResponse([]);
    await BibleApi.listBibles("fra");
    const url: string = mockFetch.mock.calls[0][0];
    expect(url).toContain("language=fra");
  });

  it("throws on non-ok response", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 401, json: async () => ({}) });
    await expect(BibleApi.listBibles()).rejects.toThrow("api.bible 401");
  });
});

// ─────────────────────────────────────────────────────────────
// BibleApi.listBooks
// ─────────────────────────────────────────────────────────────
describe("BibleApi.listBooks", () => {
  it("calls the correct endpoint", async () => {
    mockResponse([{ id: "GEN", name: "Genesis" }]);
    const result = await BibleApi.listBooks("bible-id-123");
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const url: string = mockFetch.mock.calls[0][0];
    expect(url).toContain("/bibles/bible-id-123/books");
    expect(result[0].id).toBe("GEN");
  });
});

// ─────────────────────────────────────────────────────────────
// BibleApi.listChapters
// ─────────────────────────────────────────────────────────────
describe("BibleApi.listChapters", () => {
  it("calls the correct endpoint", async () => {
    mockResponse([{ id: "JHN.3", number: "3" }]);
    await BibleApi.listChapters("bible-id", "JHN");
    const url: string = mockFetch.mock.calls[0][0];
    expect(url).toContain("/bibles/bible-id/books/JHN/chapters");
  });
});

// ─────────────────────────────────────────────────────────────
// BibleApi.listVerses
// ─────────────────────────────────────────────────────────────
describe("BibleApi.listVerses", () => {
  it("calls the correct endpoint", async () => {
    mockResponse([{ id: "JHN.3.16", reference: "John 3:16" }]);
    await BibleApi.listVerses("bible-id", "JHN.3");
    const url: string = mockFetch.mock.calls[0][0];
    expect(url).toContain("/bibles/bible-id/chapters/JHN.3/verses");
  });
});

// ─────────────────────────────────────────────────────────────
// BibleApi.getVerse
// ─────────────────────────────────────────────────────────────
describe("BibleApi.getVerse", () => {
  it("calls the correct endpoint with text params", async () => {
    mockResponse({ id: "JHN.3.16", content: "For God so loved...", reference: "John 3:16", copyright: "" });
    await BibleApi.getVerse("bible-id", "JHN.3.16");
    const url: string = mockFetch.mock.calls[0][0];
    expect(url).toContain("/bibles/bible-id/verses/JHN.3.16");
    expect(url).toContain("content-type=text");
    expect(url).toContain("include-verse-numbers=false");
    expect(url).toContain("include-notes=false");
  });

  it("returns verse data", async () => {
    const payload = { id: "JHN.3.16", content: "For God so loved the world", reference: "John 3:16", copyright: "" };
    mockResponse(payload);
    const result = await BibleApi.getVerse("bible-id", "JHN.3.16");
    expect(result.content).toBe("For God so loved the world");
    expect(result.reference).toBe("John 3:16");
  });

  it("throws on HTTP error", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 404, json: async () => ({}) });
    await expect(BibleApi.getVerse("bible-id", "INVALID")).rejects.toThrow("api.bible 404");
  });
});

// ─────────────────────────────────────────────────────────────
// BibleApi.search
// ─────────────────────────────────────────────────────────────
describe("BibleApi.search", () => {
  it("calls the correct endpoint with query", async () => {
    mockResponse({ verses: [], total: 0 });
    await BibleApi.search("bible-id", "love");
    const url: string = mockFetch.mock.calls[0][0];
    expect(url).toContain("/bibles/bible-id/search");
    expect(url).toContain("query=love");
    expect(url).toContain("limit=10");
  });

  it("accepts a custom limit", async () => {
    mockResponse({ verses: [], total: 0 });
    await BibleApi.search("bible-id", "grace", "5");
    const url: string = mockFetch.mock.calls[0][0];
    expect(url).toContain("limit=5");
  });
});
