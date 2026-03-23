import { NextRequest, NextResponse } from "next/server";

/**
 * Extract Gemini API key from request header, falling back to env var.
 * Returns the key or a NextResponse error.
 */
export function getApiKey(
  request: NextRequest
): string | NextResponse {
  const apiKey =
    request.headers.get("x-gemini-api-key") || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: true, message: "Gemini API Key no proporcionada. Configúrala en la app." },
      { status: 401 }
    );
  }

  return apiKey;
}
