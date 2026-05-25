import { NextRequest, NextResponse } from "next/server";
import { BibleApi } from "@/lib/apiBible";

export async function GET(req: NextRequest) {
  const language = req.nextUrl.searchParams.get("language") ?? "deu";
  try {
    const bibles = await BibleApi.listBibles(language);
    return NextResponse.json(bibles.filter((b) => b.id));
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
