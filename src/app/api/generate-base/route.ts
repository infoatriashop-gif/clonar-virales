import { NextRequest, NextResponse } from "next/server";
import { getJob, updateJob } from "@/lib/jobs";
import { generateImages } from "@/lib/imagen";
import { buildBaseImagePrompt } from "@/lib/prompts";
import { getApiKey } from "@/lib/api-key";

export async function POST(request: NextRequest) {
  try {
    const apiKeyOrError = getApiKey(request);
    if (apiKeyOrError instanceof NextResponse) return apiKeyOrError;
    const apiKey = apiKeyOrError;

    const { jobId } = await request.json();

    const job = getJob(jobId);
    if (!job) {
      return NextResponse.json(
        { error: true, message: "Job no encontrado" },
        { status: 404 }
      );
    }

    if (!job.analysis) {
      return NextResponse.json(
        { error: true, message: "El video aún no ha sido analizado" },
        { status: 400 }
      );
    }

    updateJob(jobId, { status: "generating_base", apiKey });

    const prompt = buildBaseImagePrompt(job.analysis);
    const outputDir = `/tmp/clonar-virales/jobs/${jobId}/base`;

    generateImages(apiKey, prompt, 4, outputDir)
      .then((paths) => {
        updateJob(jobId, {
          status: "pending",
          baseImagePaths: paths,
        });
      })
      .catch((err) => {
        updateJob(jobId, {
          status: "error",
          error:
            err instanceof Error
              ? err.message
              : "Error generando imagen base",
        });
      });

    return NextResponse.json({
      jobId,
      status: "generating_base",
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
