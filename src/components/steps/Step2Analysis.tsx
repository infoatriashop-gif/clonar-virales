"use client";

import { useEffect, useCallback } from "react";
import { usePolling } from "@/hooks/usePolling";
import { LoadingSpinner } from "@/components/ui/ProgressBar";
import { AnalysisCard } from "@/components/ui/AnalysisCard";
import { VideoAnalysis } from "@/lib/types";

interface Step2Props {
  jobId: string;
  onAnalyzed: (analysis: VideoAnalysis) => void;
}

interface AnalysisResponse {
  status: string;
  analysis?: VideoAnalysis;
  error?: string;
}

export function Step2Analysis({ jobId, onAnalyzed }: Step2Props) {
  // Trigger analysis
  useEffect(() => {
    fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId }),
    });
  }, [jobId]);

  const handleComplete = useCallback(
    (data: AnalysisResponse) => {
      if (data.analysis) onAnalyzed(data.analysis);
    },
    [onAnalyzed]
  );

  const checkComplete = useCallback(
    (data: AnalysisResponse) => data.status === "completed",
    []
  );

  const { data, loading, error } = usePolling<AnalysisResponse>({
    url: `/api/analyze/${jobId}`,
    interval: 3000,
    onComplete: handleComplete,
    isComplete: checkComplete,
  });

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400">
          <p className="font-bold">Error en el analisis</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (loading || !data?.analysis) {
    return (
      <LoadingSpinner text="Analizando video... Esto puede tomar unos minutos" />
    );
  }

  const analysis = data.analysis;

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">
        Analisis del Video
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnalysisCard title="Modelo / Persona">
          <p>
            <strong>Edad:</strong> {analysis.descripcionModelo.edad}
          </p>
          <p>
            <strong>Genero:</strong> {analysis.descripcionModelo.genero}
          </p>
          <p>
            <strong>Cabello:</strong> {analysis.descripcionModelo.cabello}
          </p>
          <p>
            <strong>Vestimenta:</strong> {analysis.descripcionModelo.vestimenta}
          </p>
          <p>
            <strong>Rasgos:</strong> {analysis.descripcionModelo.rasgos}
          </p>
        </AnalysisCard>

        <AnalysisCard title="Gancho (Hook)">
          <p>
            <strong>Tipo:</strong> {analysis.gancho.tipo}
          </p>
          <p>
            <strong>Texto:</strong> {analysis.gancho.texto}
          </p>
          <p>
            <strong>Duracion:</strong> {analysis.gancho.duracion}s
          </p>
        </AnalysisCard>

        <AnalysisCard title="Transcripcion">
          <p className="text-xs text-gray-400 mb-1">
            Idioma original: {analysis.transcripcion.idiomaOriginal}
          </p>
          <p className="text-xs text-gray-500 italic mb-2">
            {analysis.transcripcion.original}
          </p>
          <p className="text-xs text-gray-400 mb-1">Traduccion al espanol:</p>
          <p>{analysis.transcripcion.español}</p>
        </AnalysisCard>

        <AnalysisCard title="Producto">
          <p>
            <strong>Nombre:</strong> {analysis.producto.nombre}
          </p>
          <p>
            <strong>Empaque:</strong> {analysis.producto.empaque}
          </p>
          <p>
            <strong>Colores:</strong> {analysis.producto.colores.join(", ")}
          </p>
          <p>
            <strong>Presentacion:</strong> {analysis.producto.presentacion}
          </p>
        </AnalysisCard>

        <AnalysisCard title="Estilo General">
          <p>
            <strong>Personalidad:</strong> {analysis.estiloGeneral.personalidad}
          </p>
          <p>
            <strong>Energia:</strong> {analysis.estiloGeneral.energia}
          </p>
          <p>
            <strong>Tono:</strong> {analysis.estiloGeneral.tono}
          </p>
        </AnalysisCard>

        <AnalysisCard title="Audio">
          <p>
            <strong>Musica:</strong> {analysis.audio.musica}
          </p>
          <p>
            <strong>Efectos:</strong> {analysis.audio.efectosSonido.join(", ")}
          </p>
          <p>
            <strong>Tono:</strong> {analysis.audio.tono}
          </p>
        </AnalysisCard>

        <AnalysisCard title="Llamada a la Accion (CTA)">
          <p>
            <strong>Texto:</strong> {analysis.llamadaAccion.texto}
          </p>
          <p>
            <strong>Momento:</strong> {analysis.llamadaAccion.momento}s
          </p>
          <p>
            <strong>Tipo:</strong> {analysis.llamadaAccion.tipo}
          </p>
        </AnalysisCard>

        <AnalysisCard title={`Clips (${analysis.clips.length})`}>
          {analysis.clips.map((clip) => (
            <div
              key={clip.numero}
              className="border-b border-gray-700 pb-2 mb-2 last:border-0"
            >
              <p className="font-medium text-purple-300">
                Clip {clip.numero} ({clip.inicio}s - {clip.fin}s)
              </p>
              <p className="text-xs">{clip.descripcionAccion}</p>
            </div>
          ))}
        </AnalysisCard>
      </div>

      <button
        onClick={() => onAnalyzed(analysis)}
        className="mt-6 w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 rounded-lg transition-colors"
      >
        Continuar
      </button>
    </div>
  );
}
