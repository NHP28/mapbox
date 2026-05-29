import { NextResponse } from "next/server";
import { getTrafficSigns } from "@/services/trafficSigns";

export async function GET() {
  try {
    const signs = await getTrafficSigns();
    return NextResponse.json({ signs });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown database error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
