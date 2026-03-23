import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 300;

export async function POST(request: NextRequest) {
  try {
    const uploadUrl = request.headers.get("x-upload-url");
    const offset = request.headers.get("x-upload-offset") || "0";
    const isLast = request.headers.get("x-upload-last") === "true";

    if (!uploadUrl) {
      return NextResponse.json(
        { error: true, message: "Falta la URL de subida" },
        { status: 400 }
      );
    }

    const chunkData = await request.arrayBuffer();
    const uploadCommand = isLast ? "upload, finalize" : "upload";

    const res = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        "X-Goog-Upload-Command": uploadCommand,
        "X-Goog-Upload-Offset": offset,
        "Content-Length": String(chunkData.byteLength),
      },
      body: chunkData,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Gemini chunk upload failed (${res.status}): ${text}`);
    }

    if (isLast) {
      // Final chunk — parse the response to get the file name
      const data = await res.json();
      const geminiFileName = data?.file?.name;

      if (!geminiFileName) {
        throw new Error("Gemini no devolvió el nombre del archivo");
      }

      return NextResponse.json({ done: true, geminiFileName });
    }

    return NextResponse.json({ done: false, nextOffset: Number(offset) + chunkData.byteLength });
  } catch (err) {
    return NextResponse.json(
      {
        error: true,
        message:
          err instanceof Error ? err.message : "Error al subir fragmento",
      },
      { status: 500 }
    );
  }
}
