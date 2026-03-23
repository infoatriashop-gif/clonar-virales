import { NextRequest, NextResponse } from "next/server";
import { getJob, updateJob } from "@/lib/jobs";
import { generateClip } from "@/lib/veo";
import { concatenateClips } from "@/lib/ffmpeg";
import { buildClipPrompt } from "@/lib/prompts";
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

    if (!job.analysis || !job.keyframePaths) {
      return NextResponse.json(
        { error: true, message: "Faltan datos previos" },
        { status: 400 }
      );
    }

    const clips = job.analysis.clips;
    const keyframes = job.keyframePaths;
    const acento = job.acento || "neutral latinoamericano";

    updateJob(jobId, {
      status: "generating_clips",
      totalClips: clips.length,
      currentClip: 0,
      apiKey,
    });

    // Generate clips in background
    (async () => {
      try {
        const clipPaths: string[] = [];
        const outputDir = `/tmp/clonar-virales/jobs/${jobId}/clips`;

        for (let i = 0; i < clips.length; i++) {
          updateJob(jobId, { currentClip: i + 1 });

          const clip = clips[i];
          const firstFrame = keyframes[i];
          const lastFrame = keyframes[i + 1];

          // Get the Spanish dialogue for this clip
          const dialogoEspanol =
            job.analysis!.guion.dialogos.find(
              (d) => d.momento >= clip.inicio && d.momento <= clip.fin
            )?.textoEspanol || clip.dialogo;

          const prompt = buildClipPrompt(
            clip.promptClipVideo,
            acento,
            job.analysis!,
            dialogoEspanol
          );

          const clipPath = `${outputDir}/clip_${i + 1}.mp4`;
          await generateClip(apiKey, prompt, firstFrame, lastFrame, clipPath);
          clipPaths.push(clipPath);
        }

        updateJob(jobId, {
          status: "concatenating",
          clipPaths,
        });

        // Concatenate all clips
        const finalPath = `/tmp/clonar-virales/jobs/${jobId}/final_video.mp4`;
        concatenateClips(clipPaths, finalPath);

        updateJob(jobId, {
          status: "completed",
          finalVideoPath: finalPath,
        });
      } catch (err) {
        updateJob(jobId, {
          status: "error",
          error:
            err instanceof Error ? err.message : "Error generando clips",
        });
      }
    })();

    return NextResponse.json({
      jobId,
      status: "generating_clips",
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
