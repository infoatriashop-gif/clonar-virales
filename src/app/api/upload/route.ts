import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { isTikTokUrl } from "@/lib/tiktok";
import { downloadTikTokVideo } from "@/lib/tiktok";
import * as fs from "fs";
import * as path from "path";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const url = body.url as string;

    if (!url || !isTikTokUrl(url)) {
      return NextResponse.json(
        {
          error: true,
          message: "URL inválida. Debe ser una URL de TikTok.",
        },
        { status: 400 }
      );
    }

    // Download to a temp directory first
    const tmpDir = "/tmp/clonar-virales/downloads";
    const localPath = await downloadTikTokVideo(url, tmpDir);

    // Upload to Vercel Blob
    const fileBuffer = fs.readFileSync(localPath);
    const fileName = path.basename(localPath);
    const blob = await put(fileName, fileBuffer, {
      access: "public",
      contentType: "video/mp4",
    });

    // Clean up temp file
    try {
      fs.unlinkSync(localPath);
    } catch {
      // ignore cleanup errors
    }

    const jobId = crypto.randomUUID();

    return NextResponse.json({
      jobId,
      fileName,
      blobUrl: blob.url,
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: true,
        message:
          err instanceof Error
            ? err.message
            : "No se pudo descargar el video. Intenta subir el archivo directamente.",
      },
      { status: 500 }
    );
  }
}
