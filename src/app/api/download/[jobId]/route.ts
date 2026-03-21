import { NextRequest, NextResponse } from "next/server";
import { getJob } from "@/lib/jobs";
import * as fs from "fs";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;
  const job = getJob(jobId);

  if (!job) {
    return NextResponse.json(
      { error: true, message: "Job no encontrado" },
      { status: 404 }
    );
  }

  if (!job.finalVideoPath || !fs.existsSync(job.finalVideoPath)) {
    return NextResponse.json(
      { error: true, message: "Video no disponible" },
      { status: 404 }
    );
  }

  const videoBuffer = fs.readFileSync(job.finalVideoPath);
  const fileName = `video_clonado_${jobId.slice(0, 8)}.mp4`;

  return new NextResponse(videoBuffer, {
    headers: {
      "Content-Type": "video/mp4",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Content-Length": videoBuffer.length.toString(),
    },
  });
}
