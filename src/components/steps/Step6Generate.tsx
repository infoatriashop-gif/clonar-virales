"use client";

import { useEffect, useState, useCallback } from "react";
import { usePolling } from "@/hooks/usePolling";
import { LoadingSpinner, ProgressBar } from "@/components/ui/ProgressBar";

interface Step6Props {
  jobId: string;
  onComplete: (downloadUrl: string) => void;
}

interface ClipResponse {
  status: string;
  currentClip?: number;
  totalClips?: number;
  downloadUrl?: string;
  error?: string;
}

const MESSAGES = [
  "Preparando escenas...",
  "Generando clip de video...",
  "Aplicando transiciones...",
  "Anadiendo audio y voz...",
  "Procesando frames...",
  "Renderizando video...",
];

export function Step6Generate({ jobId, onComplete }: Step6Props) {
  const [msgIndex, setMsgIndex] = useState(0);
  const [triggered, setTriggered] = useState(false);

  // Trigger clip generation
  useEffect(() => {
    if (triggered) return;
    setTriggered(true);
    fetch("/api/generate-clips", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId }),
    });
  }, [jobId, triggered]);

  // Rotate messages
  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((i) => (i + 1) % MESSAGES.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleComplete = useCallback(
    (data: ClipResponse) => {
      if (data.downloadUrl) onComplete(data.downloadUrl);
    },
    [onComplete]
  );

  const checkComplete = useCallback(
    (data: ClipResponse) => data.status === "completed",
    []
  );

  const { data, error } = usePolling<ClipResponse>({
    url: `/api/generate-clips/${jobId}`,
    interval: 10000,
    onComplete: handleComplete,
    isComplete: checkComplete,
  });

  if (error) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400">
          <p className="font-bold">Error generando video</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  const currentClip = data?.currentClip || 0;
  const totalClips = data?.totalClips || 0;
  const isConcatenating = data?.status === "concatenating";

  return (
    <div className="max-w-lg mx-auto text-center">
      <h2 className="text-2xl font-bold text-white mb-6">
        Generando tu Video
      </h2>

      <LoadingSpinner
        text={isConcatenating ? "Uniendo todos los clips..." : MESSAGES[msgIndex]}
      />

      {totalClips > 0 && (
        <div className="mt-6 space-y-3">
          <ProgressBar
            current={currentClip}
            total={totalClips}
            label={isConcatenating ? "Concatenando clips" : "Clips generados"}
          />
          <p className="text-gray-500 text-xs">
            Cada clip toma aproximadamente 1-3 minutos en generarse
          </p>
        </div>
      )}
    </div>
  );
}
