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
    return NextResponse.json({
      status: "error",
      error: job.error,
    });
  }

  if (job.status === "analyzing") {
    return NextResponse.json({
      status: "analyzing",
    });
  }

  if (job.analysis) {
    return NextResponse.json({
      status: "completed",
      analysis: job.analysis,
    });
  }

  return NextResponse.json({
    status: job.status,
  });
}
