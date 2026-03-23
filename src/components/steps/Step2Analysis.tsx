"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { LoadingSpinner } from "@/components/ui/ProgressBar";
import { AnalysisCard } from "@/components/ui/AnalysisCard";
import { VideoAnalysis } from "@/lib/types";

interface Step2Props {
  apiKey: string;
  jobId: string;
  geminiFileName: string;
  onAnalyzed: (analysis: VideoAnalysis) => void;
}

export function Step2Analysis({ apiKey, jobId, geminiFileName, onAnalyzed }: Step2Props) {
  const [analysis, setAnalysis] = useState<VideoAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const startedRef = useRef(false);

  const runAnalysis = useCallback(async () => {
    if (startedRef.current) return;
    startedRef.current = true;

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-gemini-api-key": apiKey,
        },
        body: JSON.stringify({ geminiFileName }),
      });

      if (!res.ok) {
        const text = await res.text();
        let message = `Error del servidor (${res.status})`;
        try {
          const json = JSON.parse(text);
          if (json.message) message = json.message;
        } catch {
          // non-JSON response
        }
        throw new Error(message);
      }

      const data = await res.json();
      if (data.error) throw new Error(data.message);
      setAnalysis(data.analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error en el análisis");
    } finally {
      setLoading(false);
    }
  }, [apiKey, jobId, geminiFileName]);

  useEffect(() => {
    runAnalysis();
  }, [runAnalysis]);

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

  if (loading || !analysis) {
    return (
      <LoadingSpinner text="Analizando video con IA... Esto puede tomar unos minutos" />
    );
  }

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
