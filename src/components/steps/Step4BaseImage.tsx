"use client";

import { useEffect, useState, useCallback } from "react";
import { usePolling } from "@/hooks/usePolling";
import { LoadingSpinner } from "@/components/ui/ProgressBar";
import { ImageGrid } from "@/components/ui/ImageGrid";

interface Step4Props {
  jobId: string;
  onSelected: (index: number, images: string[]) => void;
}

interface BaseResponse {
  status: string;
  baseImages?: string[];
  error?: string;
}

export function Step4BaseImage({ jobId, onSelected }: Step4Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [triggered, setTriggered] = useState(false);

  // Trigger base image generation
  useEffect(() => {
    if (triggered) return;
    setTriggered(true);
    fetch("/api/generate-base", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId }),
    });
  }, [jobId, triggered]);

  const handleComplete = useCallback((data: BaseResponse) => {
    if (data.baseImages) setImages(data.baseImages);
  }, []);

  const checkComplete = useCallback(
    (data: BaseResponse) => data.status === "completed",
    []
  );

  // Poll for base image status - reuse the analyze endpoint since job status is shared
  const { loading, error } = usePolling<BaseResponse>({
    url: `/api/analyze/${jobId}`,
    interval: 3000,
    onComplete: handleComplete,
    isComplete: checkComplete,
  });

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400">
          <p className="font-bold">Error generando imagen base</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (loading || images.length === 0) {
    return (
      <LoadingSpinner text="Generando imagen base de la modelo... Esto puede tomar un minuto" />
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-2 text-center">
        Selecciona la Imagen Base
      </h2>
      <p className="text-gray-400 text-center mb-6">
        Elige la imagen que mejor represente a la modelo del video. Esta sera
        la referencia para todos los clips.
      </p>

      <ImageGrid
        images={images}
        selected={selected}
        onSelect={setSelected}
      />

      <button
        onClick={() => {
          if (selected !== null) onSelected(selected, images);
        }}
        disabled={selected === null}
        className="mt-6 w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium py-3 rounded-lg transition-colors"
      >
        Continuar con esta imagen
      </button>
    </div>
  );
}
