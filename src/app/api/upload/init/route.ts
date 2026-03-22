import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { fileName, fileSize, mimeType } = await request.json();

    if (!fileName || !fileSize || !mimeType) {
      return NextResponse.json(
        { error: true, message: "Faltan datos del archivo" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: true, message: "GEMINI_API_KEY no configurada" },
        { status: 500 }
      );
    }

    // Create resumable upload session with Gemini
    const res = await fetch(
      `https://generativelanguage.googleapis.com/upload/v1beta/files?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Upload-Protocol": "resumable",
          "X-Goog-Upload-Command": "start",
          "X-Goog-Upload-Header-Content-Length": String(fileSize),
          "X-Goog-Upload-Header-Content-Type": mimeType,
          "X-Goog-Upload-File-Name": fileName,
        },
        body: JSON.stringify({ file: { displayName: fileName } }),
      }
    );

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Gemini upload init failed (${res.status}): ${text}`);
    }

    const uploadUrl = res.headers.get("x-goog-upload-url");
    if (!uploadUrl) {
      throw new Error("Gemini no devolvió URL de subida");
    }

    return NextResponse.json({ uploadUrl });
  } catch (err) {
    return NextResponse.json(
      {
        error: true,
        message:
          err instanceof Error ? err.message : "Error al iniciar la subida",
      },
      { status: 500 }
    );
  }
}
