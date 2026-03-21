import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

export async function downloadTikTokVideo(
  url: string,
  outputDir: string
): Promise<string> {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, `tiktok_${Date.now()}.mp4`);

  try {
    // Try using yt-dlp directly (must be installed on the system)
    execSync(
      `yt-dlp -o "${outputPath}" --format mp4 "${url}"`,
      { stdio: "pipe", timeout: 60000 }
    );
  } catch {
    throw new Error(
      "No se pudo descargar el video de TikTok. Asegúrate de tener yt-dlp instalado, o sube el archivo directamente."
    );
  }

  if (!fs.existsSync(outputPath)) {
    throw new Error("El video no se descargó correctamente");
  }

  return outputPath;
}

export function isTikTokUrl(url: string): boolean {
  return (
    url.includes("tiktok.com") ||
    url.includes("vm.tiktok.com") ||
    url.includes("vt.tiktok.com")
  );
}
