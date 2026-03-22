import { NextResponse } from "next/server";

// This route is deprecated. Use /api/upload/init + /api/upload/chunk for chunked uploads.
export async function POST() {
  return NextResponse.json(
    {
      error: true,
      message: "Usa la subida por fragmentos: /api/upload/init y /api/upload/chunk",
    },
    { status: 410 }
  );
}
