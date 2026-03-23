import { GoogleGenAI } from "@google/genai";
import * as fs from "fs";
import * as path from "path";

function getClient(apiKey: string) {
  if (!apiKey) throw new Error("Gemini API Key no proporcionada");
  return new GoogleGenAI({ apiKey });
}

export async function generateClip(
  apiKey: string,
  prompt: string,
  firstFramePath: string,
  lastFramePath: string,
  outputPath: string
): Promise<string> {
  const ai = getClient(apiKey);

  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Read frame images
  const firstFrameBytes = fs.readFileSync(firstFramePath);
  const lastFrameBytes = fs.readFileSync(lastFramePath);

  const firstFrameImage = {
    imageBytes: firstFrameBytes.toString("base64"),
    mimeType: "image/png",
  };
  const lastFrameImage = {
    imageBytes: lastFrameBytes.toString("base64"),
    mimeType: "image/png",
  };

  // Generate video with first + last frame
  let operation = await ai.models.generateVideos({
    model: "veo-3.1-fast-generate-001",
    prompt,
    image: firstFrameImage,
    config: {
      aspectRatio: "9:16",
      lastFrame: lastFrameImage,
    },
  });

  // Poll until done
  while (!operation.done) {
    await new Promise((r) => setTimeout(r, 10000));
    operation = await ai.operations.getVideosOperation({ operation });
  }

  // Download result
  if (
    !operation.response?.generatedVideos ||
    operation.response.generatedVideos.length === 0
  ) {
    throw new Error("Veo no generó ningún video");
  }

  const video = operation.response.generatedVideos[0];
  if (video.video) {
    // Download the video file
    await ai.files.download({
      file: video.video,
      downloadPath: outputPath,
    });
  }

  return outputPath;
}

export async function generateAllClips(
  apiKey: string,
  clips: {
    prompt: string;
    firstFramePath: string;
    lastFramePath: string;
  }[],
  outputDir: string,
  onProgress?: (current: number, total: number) => void
): Promise<string[]> {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const clipPaths: string[] = [];

  for (let i = 0; i < clips.length; i++) {
    if (onProgress) onProgress(i + 1, clips.length);

    const outputPath = path.join(outputDir, `clip_${i + 1}.mp4`);
    await generateClip(
      apiKey,
      clips[i].prompt,
      clips[i].firstFramePath,
      clips[i].lastFramePath,
      outputPath
    );
    clipPaths.push(outputPath);
  }

  return clipPaths;
}
