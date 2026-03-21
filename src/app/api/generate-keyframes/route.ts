import { NextRequest, NextResponse } from "next/server";
import { getJob, updateJob } from "@/lib/jobs";
import { generateSingleImage } from "@/lib/imagen";
import { buildKeyframePrompt } from "@/lib/prompts";

export async function POST(request: NextRequest) {
  try {
    const { jobId, selectedBaseImage, acento, productoEditado } =
      await request.json();

    const job = getJob(jobId);
    if (!job) {
      return NextResponse.json(
        { error: true, message: "Job no encontrado" },
        { status: 404 }
      );
    }

    if (!job.analysis || !job.baseImagePaths) {
      return NextResponse.json(
        { error: true, message: "Faltan datos previos" },
        { status: 400 }
      );
    }

    updateJob(jobId, {
      status: "generating_keyframes",
      selectedBaseImage,
      acento,
      productoEditado,
      totalClips: job.analysis.clips.length,
      currentClip: 0,
    });

    const clips = job.analysis.clips;
    const outputDir = `/tmp/clonar-virales/jobs/${jobId}/keyframes`;
    const producto = productoEditado || job.analysis.producto;

    // Generate keyframes in background
    (async () => {
      try {
        const keyframePaths: string[] = [];

        // For N clips we need N+1 keyframes
        // First keyframe = first frame of clip 1
        // Last keyframe = last frame of last clip
        for (let i = 0; i < clips.length; i++) {
          updateJob(jobId, { currentClip: i + 1 });

          // Generate initial frame of this clip
          const initialPrompt = buildKeyframePrompt(
            clips[i].promptFotogramaInicial,
            producto
          );
          const initialPath = `${outputDir}/keyframe_${i}_initial.png`;
          await generateSingleImage(initialPrompt, initialPath);
          keyframePaths.push(initialPath);
        }

        // Generate final frame of last clip
        const lastClip = clips[clips.length - 1];
        const finalPrompt = buildKeyframePrompt(
          lastClip.promptFotogramaFinal,
          producto
        );
        const finalPath = `${outputDir}/keyframe_${clips.length}_final.png`;
        await generateSingleImage(finalPrompt, finalPath);
        keyframePaths.push(finalPath);

        updateJob(jobId, {
          status: "pending",
          keyframePaths,
        });
      } catch (err) {
        updateJob(jobId, {
          status: "error",
          error:
            err instanceof Error
              ? err.message
              : "Error generando fotogramas clave",
        });
      }
    })();

    return NextResponse.json({
      jobId,
      status: "generating_keyframes",
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
