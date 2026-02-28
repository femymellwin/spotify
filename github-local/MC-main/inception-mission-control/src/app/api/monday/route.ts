import { NextResponse } from "next/server";
import { mondayGraphQL } from "@/lib/monday/client";
import { GET_ALL_BOARDS_WITH_TASKS } from "@/lib/monday/queries";
import { transformMondayResponse } from "@/lib/monday/transformers";
import type { RawMondayBoard } from "@/types/monday";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const data = await mondayGraphQL<{ boards: RawMondayBoard[] }>(
      GET_ALL_BOARDS_WITH_TASKS
    );

    const result = transformMondayResponse(data.boards);

    return NextResponse.json({ success: true, data: result }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[/api/monday]", message);

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
