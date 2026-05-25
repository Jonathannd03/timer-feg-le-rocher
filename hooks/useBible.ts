"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface BibleOption {
  id: string;
  name: string;
  nameLocal: string;
  abbreviationLocal: string;
}

interface BookOption {
  id: string;
  name: string;
  nameLong: string;
  abbreviation: string;
}

interface ChapterOption {
  id: string;
  number: string;
  reference: string;
}

interface VerseItem {
  id: string;
  reference: string;
}

interface VerseData {
  id: string;
  reference: string;
  content: string;
}

interface SearchResult {
  id: string;
  reference: string;
  text: string;
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json() as Promise<T>;
}

export function useBibles() {
  const [bibles, setBibles] = useState<BibleOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJson<BibleOption[]>("/api/bible/bibles")
      .then(setBibles)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { bibles, loading };
}

export function useBooks(bibleId: string) {
  const [books, setBooks] = useState<BookOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!bibleId) return;
    setLoading(true);
    fetchJson<BookOption[]>(`/api/bible/books?bibleId=${bibleId}`)
      .then(setBooks)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [bibleId]);

  return { books, loading };
}

export function useChapters(bibleId: string, bookId: string) {
  const [chapters, setChapters] = useState<ChapterOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!bibleId || !bookId) return;
    setLoading(true);
    fetchJson<ChapterOption[]>(
      `/api/bible/chapters?bibleId=${bibleId}&bookId=${bookId}`
    )
      .then(setChapters)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [bibleId, bookId]);

  return { chapters, loading };
}

export function useVerseList(bibleId: string, chapterId: string) {
  const [verses, setVerses] = useState<VerseItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!bibleId || !chapterId) return;
    setLoading(true);
    fetchJson<VerseItem[]>(
      `/api/bible/verses?bibleId=${bibleId}&chapterId=${chapterId}`
    )
      .then(setVerses)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [bibleId, chapterId]);

  return { verses, loading };
}

export function useFetchVerse() {
  const [data, setData] = useState<VerseData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch_ = useCallback(async (bibleId: string, verseId: string) => {
    setLoading(true);
    setError(null);
    try {
      const v = await fetchJson<VerseData>(
        `/api/bible/verse?bibleId=${bibleId}&verseId=${encodeURIComponent(verseId)}`
      );
      setData(v);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, fetch: fetch_ };
}

export function useSearch() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback((bibleId: string, query: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim() || !bibleId) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await fetchJson<{ items: SearchResult[]; total: number }>(
          `/api/bible/search?bibleId=${bibleId}&query=${encodeURIComponent(query)}&limit=12`
        );
        setResults(data.items);
        setTotal(data.total);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }, 500);
  }, []);

  return { results, loading, total, search };
}
