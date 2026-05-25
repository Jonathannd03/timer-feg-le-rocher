import { NextRequest, NextResponse } from "next/server";
import { BibleApi } from "@/lib/apiBible";

export async function GET(req: NextRequest) {
  const bibleId = req.nextUrl.searchParams.get("bibleId");
  const chapterId = req.nextUrl.searchParams.get("chapterId");
  if (!bibleId || !chapterId) {
    return NextResponse.json(
      { error: "bibleId and chapterId required" },
      { status: 400 }
    );
  }
  try {
    const verses = await BibleApi.listVerses(bibleId, chapterId);
    return NextResponse.json(verses);
  } catch (err) {
    const isLimit = (err as Error).message === "RATE_LIMIT";
    return NextResponse.json(
      { error: isLimit ? "RATE_LIMIT" : (err as Error).message },
      { status: isLimit ? 429 : 500 }
    );
  }
}
