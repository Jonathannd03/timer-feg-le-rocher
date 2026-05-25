import { NextRequest, NextResponse } from "next/server";
import { BibleApi } from "@/lib/apiBible";

export async function GET(req: NextRequest) {
  const language = req.nextUrl.searchParams.get("language") ?? "deu";
  try {
    const bibles = await BibleApi.listBibles(language);
    return NextResponse.json(bibles.filter((b) => b.id));
  } catch (err) {
    const isLimit = (err as Error).message === "RATE_LIMIT";
    return NextResponse.json(
      { error: isLimit ? "RATE_LIMIT" : (err as Error).message },
      { status: isLimit ? 429 : 500 }
    );
  }
}
