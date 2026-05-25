import { NextRequest, NextResponse } from "next/server";
import { BibleApi } from "@/lib/apiBible";

export async function GET(req: NextRequest) {
  const bibleId = req.nextUrl.searchParams.get("bibleId");
  if (!bibleId) {
    return NextResponse.json({ error: "bibleId required" }, { status: 400 });
  }
  try {
    const books = await BibleApi.listBooks(bibleId);
    const sorted = [...books].sort((a, b) => a.name.localeCompare(b.name, "de"));
    return NextResponse.json(sorted);
  } catch (err) {
    const isLimit = (err as Error).message === "RATE_LIMIT";
    return NextResponse.json(
      { error: isLimit ? "RATE_LIMIT" : (err as Error).message },
      { status: isLimit ? 429 : 500 }
    );
  }
}
