/**
 * Server-side helpers for api.bible — only used in route handlers.
 * The API key never reaches the client.
 */

const BASE = process.env.BIBLE_API_BASE ?? "https://rest.api.bible/v1";
const KEY = process.env.BIBLE_API_KEY ?? "";

async function apiFetch<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${BASE}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  const res = await fetch(url.toString(), {
    headers: { "api-key": KEY },
    next: { revalidate: 3600 }, // cache 1h for static data
  });
  if (res.status === 429) throw new Error("RATE_LIMIT");
  if (!res.ok) {
    throw new Error(`api.bible ${res.status}: ${path}`);
  }
  const json = await res.json();
  return json.data as T;
}

export interface ApiBible {
  id: string;
  name: string;
  nameLocal: string;
  abbreviationLocal: string;
  language: { id: string; name: string };
}

export interface ApiBook {
  id: string;
  name: string;
  nameLong: string;
  abbreviation: string;
}

export interface ApiChapter {
  id: string;
  bookId: string;
  number: string;
  reference: string;
}

export interface ApiVerseItem {
  id: string;
  bookId: string;
  chapterId: string;
  reference: string;
}

export interface ApiVerse {
  id: string;
  reference: string;
  content: string;
  copyright: string;
}

export interface ApiSearchPassage {
  id: string;
  reference: string;
  content: string;
}

export interface ApiSearchResult {
  verses?: ApiVerseItem[];
  passages?: ApiSearchPassage[];
  total: number;
}

/** Strip HTML tags and leading verse numbers from api.bible content */
export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim()
    // Remove leading verse number (e.g. "16 Denn..." → "Denn...")
    .replace(/^\d+\s+/, "");
}

export const BibleApi = {
  listBibles: (language = "deu") =>
    apiFetch<ApiBible[]>("/bibles", { language }),

  listBooks: (bibleId: string) =>
    apiFetch<ApiBook[]>(`/bibles/${bibleId}/books`),

  listChapters: (bibleId: string, bookId: string) =>
    apiFetch<ApiChapter[]>(`/bibles/${bibleId}/books/${bookId}/chapters`),

  listVerses: (bibleId: string, chapterId: string) =>
    apiFetch<ApiVerseItem[]>(`/bibles/${bibleId}/chapters/${chapterId}/verses`),

  getVerse: (bibleId: string, verseId: string) =>
    apiFetch<ApiVerse>(`/bibles/${bibleId}/verses/${verseId}`, {
      "content-type": "text",
      "include-notes": "false",
      "include-titles": "false",
      "include-chapter-numbers": "false",
      "include-verse-numbers": "false",
    }),

  search: (bibleId: string, query: string, limit = "10") =>
    apiFetch<ApiSearchResult>(`/bibles/${bibleId}/search`, {
      query,
      limit,
      sort: "relevance",
    }),
};
