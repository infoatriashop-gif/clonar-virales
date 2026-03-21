import { NextRequest, NextResponse } from "next/server";
import { analyzeVideo } from "@/lib/gemini";

export const maxDuration = 300;

export async function POST(request: NextRequest) {
  try {
    const { blobUrl } = await request.json();

    if (!blobUrl) {
      return NextResponse.json(
        { error: true, message: "No se proporcionó la URL del video" },
        { status: 400 }
      );
    }

    const analysis = await analyzeVideo(blobUrl);

    return NextResponse.json({
      status: "completed",
      analysis,
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: true,
        message: err instanceof Error ? err.message : "Error en el análisis",
      },
      { status: 500 }
    );
  }
}
