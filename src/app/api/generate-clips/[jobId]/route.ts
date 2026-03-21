import { NextRequest, NextResponse } from "next/server";
import { getJob } from "@/lib/jobs";

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

  if (job.status === "generating_clips") {
    return NextResponse.json({
      status: "generating_clips",
      currentClip: job.currentClip || 0,
      totalClips: job.totalClips || 0,
    });
  }

  if (job.status === "concatenating") {
    return NextResponse.json({
      status: "concatenating",
      currentClip: job.totalClips,
      totalClips: job.totalClips,
    });
  }

  if (job.status === "completed" && job.finalVideoPath) {
    return NextResponse.json({
      status: "completed",
      downloadUrl: `/api/download/${jobId}`,
    });
  }

  return NextResponse.json({ status: job.status });
}
