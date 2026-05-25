import { NextRequest, NextResponse } from "next/server";
import { BibleApi } from "@/lib/apiBible";

export async function GET(req: NextRequest) {
  const bibleId = req.nextUrl.searchParams.get("bibleId");
  const verseId = req.nextUrl.searchParams.get("verseId");
  if (!bibleId || !verseId) {
    return NextResponse.json(
      { error: "bibleId and verseId required" },
      { status: 400 }
    );
  }
  try {
    const verse = await BibleApi.getVerse(bibleId, verseId);
    return NextResponse.json(verse);
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
