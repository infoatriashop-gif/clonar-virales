import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        return {
          allowedContentTypes: [
            "video/mp4",
            "video/quicktime",
            "video/x-msvideo",
            "video/webm",
          ],
          maximumSizeInBytes: 100 * 1024 * 1024, // 100MB
        };
      },
      onUploadCompleted: async () => {
        // No-op: we don't need to do anything on completion
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      {
        error: true,
        message:
          error instanceof Error ? error.message : "Error al generar token",
      },
      { status: 400 }
    );
  }
}
