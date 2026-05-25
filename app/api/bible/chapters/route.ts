import { NextRequest, NextResponse } from "next/server";
import { BibleApi } from "@/lib/apiBible";

export async function GET(req: NextRequest) {
  const bibleId = req.nextUrl.searchParams.get("bibleId");
  const bookId = req.nextUrl.searchParams.get("bookId");
  if (!bibleId || !bookId) {
    return NextResponse.json({ error: "bibleId and bookId required" }, { status: 400 });
  }
  try {
    const chapters = await BibleApi.listChapters(bibleId, bookId);
    // Remove intro chapter if present (id like "GEN.intro")
    const filtered = chapters.filter((c) => !c.id.includes("intro"));
    return NextResponse.json(filtered);
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
