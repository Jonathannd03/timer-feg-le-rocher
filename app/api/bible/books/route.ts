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
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
