"use client";

import { useState } from "react";
import { VideoAnalysis } from "@/lib/types";

const ACENTOS = [
  "neutral latinoamericano",
  "mexicano",
  "colombiano",
  "argentino",
  "espanol de Espana",
  "peruano",
  "chileno",
  "venezolano",
];

interface Step3Props {
  analysis: VideoAnalysis;
  initialName: string;
  initialPackaging: string;
  initialColors: string[];
  initialAcento: string;
  onContinue: (
    name: string,
    packaging: string,
    colors: string[],
    acento: string
  ) => void;
}

export function Step3Edit({
  analysis,
  initialName,
  initialPackaging,
  initialColors,
  initialAcento,
  onContinue,
}: Step3Props) {
  const [name, setName] = useState(initialName);
  const [packaging, setPackaging] = useState(initialPackaging);
  const [colors, setColors] = useState(initialColors.join(", "));
  const [acento, setAcento] = useState(initialAcento);

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="text-2xl font-bold text-white mb-2 text-center">
        Editar Producto
      </h2>
      <p className="text-gray-400 text-center mb-6">
        Cambia el nombre y empaque para tu version del producto
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Nombre del Producto
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:border-purple-500 focus:outline-none"
            placeholder="Nombre de tu producto"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Descripcion del Empaque
          </label>
          <textarea
            value={packaging}
            onChange={(e) => setPackaging(e.target.value)}
            rows={3}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:border-purple-500 focus:outline-none resize-none"
            placeholder="Describe como debe verse el empaque..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Colores del Producto
          </label>
          <input
            type="text"
            value={colors}
            onChange={(e) => setColors(e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:border-purple-500 focus:outline-none"
            placeholder="rosa, blanco, dorado"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Acento de Voz
          </label>
          <p className="text-xs text-gray-500 mb-2">
            Todos los clips tendran exactamente el mismo acento para
            consistencia
          </p>
          <select
            value={acento}
            onChange={(e) => setAcento(e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:border-purple-500 focus:outline-none"
          >
            {ACENTOS.map((a) => (
              <option key={a} value={a}>
                {a.charAt(0).toUpperCase() + a.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Preview of translated script */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          <h4 className="text-sm font-medium text-purple-400 mb-2">
            Guion traducido al espanol
          </h4>
          <p className="text-gray-300 text-sm whitespace-pre-wrap">
            {analysis.transcripcion.español}
          </p>
        </div>

        <button
          onClick={() =>
            onContinue(
              name,
              packaging,
              colors.split(",").map((c) => c.trim()),
              acento
            )
          }
          disabled={!name.trim()}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium py-3 rounded-lg transition-colors"
        >
          Generar Imagen Base
        </button>
      </div>
    </div>
  );
}
