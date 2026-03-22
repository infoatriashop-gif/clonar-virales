import { del, getDownloadUrl } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { blobUrl, fileName, mimeType } = await request.json();

    if (!blobUrl) {
      return NextResponse.json(
        { error: true, message: "Falta la URL del blob" },
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

    // 1. Download file from Vercel Blob (use signed URL for private stores)
    const downloadUrl = await getDownloadUrl(blobUrl);
    const blobRes = await fetch(downloadUrl);
    if (!blobRes.ok) {
      throw new Error("No se pudo descargar el archivo del blob");
    }

    const fileBuffer = await blobRes.arrayBuffer();
    const contentType = mimeType || "video/mp4";

    // 2. Upload to Gemini File API (simple raw upload, server-to-server has no body limit)
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/upload/v1beta/files?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": contentType,
          "X-Goog-Upload-Protocol": "raw",
          "X-Goog-Upload-File-Name": fileName || "video.mp4",
        },
        body: fileBuffer,
      }
    );

    if (!geminiRes.ok) {
      const text = await geminiRes.text();
      throw new Error(`Gemini upload failed (${geminiRes.status}): ${text}`);
    }

    const data = await geminiRes.json();
    const geminiFileName = data?.file?.name;

    if (!geminiFileName) {
      throw new Error("Gemini no devolvió el nombre del archivo");
    }

    // 3. Delete the blob (cleanup)
    try {
      await del(blobUrl);
    } catch {
      // Non-critical: blob will eventually be cleaned up
    }

    return NextResponse.json({ geminiFileName });
  } catch (err) {
    return NextResponse.json(
      {
        error: true,
        message:
          err instanceof Error ? err.message : "Error al procesar el video",
      },
      { status: 500 }
    );
  }
}
