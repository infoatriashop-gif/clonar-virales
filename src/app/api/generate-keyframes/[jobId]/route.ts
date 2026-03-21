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

  if (job.status === "error") {
    return NextResponse.json({ status: "error", error: job.error });
  }

  if (job.status === "generating_keyframes") {
    return NextResponse.json({
      status: "generating_keyframes",
      currentClip: job.currentClip || 0,
      totalClips: job.totalClips || 0,
    });
  }

  if (job.keyframePaths && job.keyframePaths.length > 0) {
    // Convert file paths to base64 for the frontend
    const keyframesBase64 = job.keyframePaths.map((p) => {
      if (fs.existsSync(p)) {
        const buffer = fs.readFileSync(p);
        return `data:image/png;base64,${buffer.toString("base64")}`;
      }
      return null;
    });

    return NextResponse.json({
      status: "completed",
      keyframes: keyframesBase64,
      keyframeCount: job.keyframePaths.length,
    });
  }

  return NextResponse.json({ status: job.status });
}
