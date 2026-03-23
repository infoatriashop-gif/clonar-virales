import { NextRequest, NextResponse } from "next/server";
import { analyzeGeminiFile } from "@/lib/gemini";
import { getApiKey } from "@/lib/api-key";

export const maxDuration = 300;

export async function POST(request: NextRequest) {
  try {
    const apiKeyOrError = getApiKey(request);
    if (apiKeyOrError instanceof NextResponse) return apiKeyOrError;
    const apiKey = apiKeyOrError;

    const { geminiFileName } = await request.json();

    if (!geminiFileName) {
      return NextResponse.json(
        { error: true, message: "No se proporcionó el archivo de Gemini" },
        { status: 400 }
      );
    }

    const analysis = await analyzeGeminiFile(apiKey, geminiFileName);

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
