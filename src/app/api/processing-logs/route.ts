import { NextResponse } from "next/server";
import { getProcessingLogs } from "@/services/processingLogs";

export async function GET() {
  try {
    const logs = await getProcessingLogs();
    return NextResponse.json({ logs });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown database error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
