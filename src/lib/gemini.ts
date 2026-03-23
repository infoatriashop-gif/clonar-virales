import { GoogleGenAI } from "@google/genai";
import { ANALYSIS_PROMPT } from "./prompts";
import { VideoAnalysis } from "./types";

function getClient(apiKey: string) {
  if (!apiKey) throw new Error("Gemini API Key no proporcionada");
  return new GoogleGenAI({ apiKey });
}

export async function uploadToGemini(
  apiKey: string,
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  const ai = getClient(apiKey);

  const uint8 = new Uint8Array(buffer);
  const uploadedFile = await ai.files.upload({
    file: new Blob([uint8], { type: mimeType }),
    config: { mimeType },
  });

  if (!uploadedFile.name) {
    throw new Error("Error al subir el archivo a Gemini");
  }

  return uploadedFile.name;
}

export async function analyzeGeminiFile(
  apiKey: string,
  geminiFileName: string
): Promise<VideoAnalysis> {
  const ai = getClient(apiKey);

  // Wait for file processing
  let fileStatus = await ai.files.get({ name: geminiFileName });
  while (fileStatus.state === "PROCESSING") {
    await new Promise((r) => setTimeout(r, 5000));
    fileStatus = await ai.files.get({ name: geminiFileName });
  }

  if (fileStatus.state === "FAILED") {
    throw new Error("Gemini no pudo procesar el video");
  }

  // Analyze with generateContent
  const result = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          {
            fileData: {
              fileUri: fileStatus.uri!,
              mimeType: fileStatus.mimeType!,
            },
          },
          { text: ANALYSIS_PROMPT },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
    },
  });

  const text = result.text;
  if (!text) {
    throw new Error("Gemini no devolvió respuesta");
  }

  try {
    return JSON.parse(text) as VideoAnalysis;
  } catch {
    throw new Error("Error al parsear la respuesta de Gemini como JSON");
  }
}
