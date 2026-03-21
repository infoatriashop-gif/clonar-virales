import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

export function concatenateClips(
  clipPaths: string[],
  outputPath: string
): string {
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Create concat list file
  const listPath = path.join(dir, "concat_list.txt");
  const listContent = clipPaths
    .map((p) => `file '${path.resolve(p)}'`)
    .join("\n");
  fs.writeFileSync(listPath, listContent);

  try {
    execSync(
      `ffmpeg -y -f concat -safe 0 -i "${listPath}" -c copy "${outputPath}"`,
      { stdio: "pipe" }
    );
  } catch (error) {
    // If copy fails (different codecs), try re-encoding
    execSync(
      `ffmpeg -y -f concat -safe 0 -i "${listPath}" -c:v libx264 -c:a aac "${outputPath}"`,
      { stdio: "pipe" }
    );
  } finally {
    // Clean up list file
    if (fs.existsSync(listPath)) {
      fs.unlinkSync(listPath);
    }
  }

  return outputPath;
}
