import { NextRequest, NextResponse } from "next/server";
import { BibleApi, stripHtml } from "@/lib/apiBible";

export async function GET(req: NextRequest) {
  const bibleId = req.nextUrl.searchParams.get("bibleId");
  const query = req.nextUrl.searchParams.get("query");
  const limit = req.nextUrl.searchParams.get("limit") ?? "10";
  if (!bibleId || !query) {
    return NextResponse.json(
      { error: "bibleId and query required" },
      { status: 400 }
    );
  }
  try {
    const result = await BibleApi.search(bibleId, query, limit);
    // Return passages if found (reference lookup), else verses (text search)
    const items = (result.passages ?? result.verses ?? []).map((p) => ({
      id: p.id,
      reference: p.reference,
      text: "content" in p ? stripHtml(p.content) : "",
    }));
    return NextResponse.json({ items, total: result.total ?? items.length });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
