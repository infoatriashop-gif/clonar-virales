import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 300;

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as HandleUploadBody;

    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: [
          "video/mp4",
          "video/quicktime",
          "video/x-msvideo",
          "video/webm",
          "video/avi",
        ],
        maximumSizeInBytes: 200 * 1024 * 1024, // 200MB
      }),
      onUploadCompleted: async () => {
        // no-op
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (err) {
    return NextResponse.json(
      {
        error: true,
        message:
          err instanceof Error ? err.message : "Error al preparar la subida",
      },
      { status: 500 }
    );
  }
}
