import { GoogleGenAI, PersonGeneration } from "@google/genai";
import * as fs from "fs";
import * as path from "path";

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY no está configurada");
  return new GoogleGenAI({ apiKey });
}

export async function generateImages(
  prompt: string,
  count: number = 4,
  outputDir: string
): Promise<string[]> {
  const ai = getClient();

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const response = await ai.models.generateImages({
    model: "imagen-4.0-generate-001",
    prompt,
    config: {
      numberOfImages: count as 1 | 2 | 3 | 4,
      aspectRatio: "9:16",
      personGeneration: PersonGeneration.ALLOW_ADULT,
    },
  });

  const savedPaths: string[] = [];

  if (response.generatedImages) {
    for (let i = 0; i < response.generatedImages.length; i++) {
      const img = response.generatedImages[i];
      if (img.image?.imageBytes) {
        const filePath = path.join(outputDir, `image_${i}.png`);
        const buffer = Buffer.from(img.image.imageBytes, "base64");
        fs.writeFileSync(filePath, buffer);
        savedPaths.push(filePath);
      }
    }
  }

  if (savedPaths.length === 0) {
    throw new Error("Imagen 4 no generó ninguna imagen");
  }

  return savedPaths;
}

export async function generateSingleImage(
  prompt: string,
  outputPath: string
): Promise<string> {
  const ai = getClient();

  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const response = await ai.models.generateImages({
    model: "imagen-4.0-generate-001",
    prompt,
    config: {
      numberOfImages: 1,
      aspectRatio: "9:16",
      personGeneration: PersonGeneration.ALLOW_ADULT,
    },
  });

  if (
    !response.generatedImages ||
    response.generatedImages.length === 0 ||
    !response.generatedImages[0].image?.imageBytes
  ) {
    throw new Error("Imagen 4 no generó la imagen");
  }

  const buffer = Buffer.from(
    response.generatedImages[0].image.imageBytes,
    "base64"
  );
  fs.writeFileSync(outputPath, buffer);

  return outputPath;
}
