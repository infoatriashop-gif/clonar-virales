import { NextRequest, NextResponse } from "next/server";
import { analyzeVideo } from "@/lib/gemini";

export const maxDuration = 300;

export async function POST(request: NextRequest) {
  try {
    const { filePath } = await request.json();

    if (!filePath) {
      return NextResponse.json(
        { error: true, message: "No se proporcionó la ruta del archivo" },
        { status: 400 }
      );
    }

    const analysis = await analyzeVideo(filePath);

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
