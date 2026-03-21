import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { createJob, updateJob } from "@/lib/jobs";
import { downloadTikTokVideo, isTikTokUrl } from "@/lib/tiktok";
import * as fs from "fs";
import * as path from "path";

const UPLOAD_DIR = "/tmp/clonar-virales/uploads";

export async function POST(request: NextRequest) {
  try {
    const jobId = uuidv4();
    createJob(jobId);

    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      // File upload
      const formData = await request.formData();
      const file = formData.get("video") as File;

      if (!file) {
        return NextResponse.json(
          { error: true, message: "No se proporcionó ningún archivo" },
          { status: 400 }
        );
      }

      if (!fs.existsSync(UPLOAD_DIR)) {
        fs.mkdirSync(UPLOAD_DIR, { recursive: true });
      }

      const ext = path.extname(file.name) || ".mp4";
      const filePath = path.join(UPLOAD_DIR, `${jobId}${ext}`);
      const bytes = await file.arrayBuffer();
      fs.writeFileSync(filePath, Buffer.from(bytes));

      updateJob(jobId, { status: "pending", filePath });

      return NextResponse.json({
        jobId,
        fileName: file.name,
        filePath,
      });
    } else {
      // URL download
      const body = await request.json();
      const url = body.url as string;

      if (!url || !isTikTokUrl(url)) {
        return NextResponse.json(
          {
            error: true,
            message: "URL inválida. Debe ser una URL de TikTok.",
          },
          { status: 400 }
        );
      }

      updateJob(jobId, { status: "uploading" });

      try {
        const filePath = await downloadTikTokVideo(url, UPLOAD_DIR);
        updateJob(jobId, { status: "pending", filePath });

        return NextResponse.json({
          jobId,
          fileName: path.basename(filePath),
          filePath,
        });
      } catch (err) {
        updateJob(jobId, {
          status: "error",
          error: err instanceof Error ? err.message : "Error desconocido",
        });
        return NextResponse.json(
          {
            error: true,
            message:
              "No se pudo descargar el video. Intenta subir el archivo directamente.",
          },
          { status: 500 }
        );
      }
    }
  } catch (err) {
    return NextResponse.json(
      {
        error: true,
        message: err instanceof Error ? err.message : "Error del servidor",
      },
      { status: 500 }
    );
  }
}
