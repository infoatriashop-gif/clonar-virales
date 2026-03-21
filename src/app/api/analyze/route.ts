import { NextRequest, NextResponse } from "next/server";
import { getJob, updateJob } from "@/lib/jobs";
import { analyzeVideo } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const { jobId } = await request.json();

    const job = getJob(jobId);
    if (!job) {
      return NextResponse.json(
        { error: true, message: "Job no encontrado" },
        { status: 404 }
      );
    }

    if (!job.filePath) {
      return NextResponse.json(
        { error: true, message: "No hay archivo de video asociado al job" },
        { status: 400 }
      );
    }

    updateJob(jobId, { status: "analyzing" });

    // Run analysis in background
    analyzeVideo(job.filePath)
      .then((analysis) => {
        updateJob(jobId, { status: "pending", analysis });
      })
      .catch((err) => {
        updateJob(jobId, {
          status: "error",
          error: err instanceof Error ? err.message : "Error en el análisis",
        });
      });

    return NextResponse.json({
      jobId,
      status: "analyzing",
    });
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
