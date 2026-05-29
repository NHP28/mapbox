import { NextResponse } from "next/server";
import { getImageQueue, addImageToQueue } from "@/services/imageQueue";

export async function GET() {
  try {
    const queue = await getImageQueue();
    return NextResponse.json({ queue });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown database error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { filename, bronze_path } = body;

    if (!filename) {
      return NextResponse.json({ error: "filename là bắt buộc" }, { status: 400 });
    }

    const bronzePath = bronze_path || `/bronze/${filename}`;
    const result = await addImageToQueue(filename, bronzePath);

    return NextResponse.json({ success: true, result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown database error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
