import { NextRequest, NextResponse } from "next/server";
import { uploadToGemini } from "@/lib/gemini";

export const maxDuration = 60;

const MAX_FILE_SIZE = 3.5 * 1024 * 1024; // 3.5MB (safe margin for Vercel's 4.5MB body limit)

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("video") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: true, message: "No se proporcionó ningún archivo" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: true,
          message: `El archivo es demasiado grande (${(file.size / 1024 / 1024).toFixed(1)}MB). El tamaño máximo es 3.5MB.`,
        },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const mimeType = file.type || "video/mp4";
    const geminiFileName = await uploadToGemini(buffer, mimeType);
    const jobId = crypto.randomUUID();

    return NextResponse.json({ jobId, geminiFileName });
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
