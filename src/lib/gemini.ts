import { GoogleGenAI } from "@google/genai";
import { ANALYSIS_PROMPT } from "./prompts";
import { VideoAnalysis } from "./types";

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY no está configurada");
  return new GoogleGenAI({ apiKey });
}

export async function analyzeVideo(blobUrl: string): Promise<VideoAnalysis> {
  const ai = getClient();

  // 1. Download video from blob URL
  const response = await fetch(blobUrl);
  if (!response.ok) {
    throw new Error(`No se pudo descargar el video: ${response.status}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  const videoBuffer = Buffer.from(arrayBuffer);

  // 2. Upload to Gemini File API
  const uploadedFile = await ai.files.upload({
    file: new Blob([videoBuffer], { type: "video/mp4" }),
    config: { mimeType: "video/mp4" },
  });

  if (!uploadedFile.name) {
    throw new Error("Error al subir el archivo a Gemini");
  }

  // 3. Wait for file processing
  let fileStatus = await ai.files.get({ name: uploadedFile.name });
  while (fileStatus.state === "PROCESSING") {
    await new Promise((r) => setTimeout(r, 5000));
    fileStatus = await ai.files.get({ name: uploadedFile.name });
  }

  if (fileStatus.state === "FAILED") {
    throw new Error("Gemini no pudo procesar el video");
  }

  // 4. Analyze with generateContent
  const result = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-05-20",
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
