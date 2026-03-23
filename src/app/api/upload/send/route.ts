import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 300;

export async function POST(request: NextRequest) {
  try {
    const uploadUrl = request.headers.get("x-upload-url");

    if (!uploadUrl) {
      return NextResponse.json(
        { error: true, message: "Falta la URL de subida" },
        { status: 400 }
      );
    }

    const res = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        "X-Goog-Upload-Command": "upload, finalize",
        "X-Goog-Upload-Offset": "0",
        "Content-Type": request.headers.get("content-type") || "application/octet-stream",
      },
      body: request.body,
      // @ts-expect-error duplex is needed for streaming request bodies
      duplex: "half",
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: true, message: `Error de Gemini (${res.status}): ${text.slice(0, 300)}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      {
        error: true,
        message: err instanceof Error ? err.message : "Error al subir el archivo",
      },
      { status: 500 }
    );
  }
}
