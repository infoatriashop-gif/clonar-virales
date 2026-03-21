"use client";

import { useEffect, useState, useCallback } from "react";
import { usePolling } from "@/hooks/usePolling";
import { LoadingSpinner, ProgressBar } from "@/components/ui/ProgressBar";
import Image from "next/image";

interface Step5Props {
  jobId: string;
  selectedBaseImage: number;
  acento: string;
  productoEditado: { nombre: string; empaque: string; colores: string[] };
  onComplete: (keyframes: string[]) => void;
}

interface KeyframeResponse {
  status: string;
  keyframes?: (string | null)[];
  keyframeCount?: number;
  currentClip?: number;
  totalClips?: number;
  error?: string;
}

export function Step5Keyframes({
  jobId,
  selectedBaseImage,
  acento,
  productoEditado,
  onComplete,
}: Step5Props) {
  const [keyframes, setKeyframes] = useState<string[]>([]);
  const [triggered, setTriggered] = useState(false);

  // Trigger keyframe generation
  useEffect(() => {
    if (triggered) return;
    setTriggered(true);
    fetch("/api/generate-keyframes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId, selectedBaseImage, acento, productoEditado }),
    });
  }, [jobId, selectedBaseImage, acento, productoEditado, triggered]);

  const handleComplete = useCallback(
    (data: KeyframeResponse) => {
      if (data.keyframes) {
        const valid = data.keyframes.filter((k): k is string => k !== null);
        setKeyframes(valid);
        onComplete(valid);
      }
    },
    [onComplete]
  );

  const checkComplete = useCallback(
    (data: KeyframeResponse) => data.status === "completed",
    []
  );

  const { data, loading, error } = usePolling<KeyframeResponse>({
    url: `/api/generate-keyframes/${jobId}`,
    interval: 4000,
    onComplete: handleComplete,
    isComplete: checkComplete,
  });

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400">
          <p className="font-bold">Error generando fotogramas</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (loading && keyframes.length === 0) {
    return (
      <div className="max-w-lg mx-auto text-center">
        <LoadingSpinner text="Generando fotogramas clave..." />
        {data?.currentClip !== undefined && data?.totalClips !== undefined && (
          <div className="mt-4">
            <ProgressBar
              current={data.currentClip}
              total={data.totalClips}
              label="Fotogramas generados"
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-2 text-center">
        Fotogramas Clave
      </h2>
      <p className="text-gray-400 text-center mb-6">
        Estos son los fotogramas que se usaran para generar cada clip del video
      </p>

      <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
        {keyframes.map((src, i) => (
          <div key={i} className="relative aspect-[9/16] rounded-lg overflow-hidden bg-gray-800">
            <Image src={src} alt={`Keyframe ${i + 1}`} fill className="object-cover" />
            <div className="absolute bottom-1 left-1 bg-black/70 rounded px-1.5 py-0.5 text-xs text-white">
              {i + 1}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 bg-gray-800/50 border border-gray-700 rounded-lg p-3">
        <p className="text-gray-400 text-xs">
          Clip 1: Keyframe 1 → Keyframe 2 | Clip 2: Keyframe 2 → Keyframe 3 |
          ...y asi sucesivamente
        </p>
      </div>

      <button
        onClick={() => onComplete(keyframes)}
        className="mt-6 w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 rounded-lg transition-colors"
      >
        Generar Clips de Video
      </button>
    </div>
  );
}
