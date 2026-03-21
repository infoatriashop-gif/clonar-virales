"use client";

import { VideoPlayer } from "@/components/ui/VideoPlayer";

interface Step7Props {
  downloadUrl: string;
  onReset: () => void;
}

export function Step7Download({ downloadUrl, onReset }: Step7Props) {
  return (
    <div className="max-w-lg mx-auto text-center">
      <h2 className="text-2xl font-bold text-white mb-2">
        Video Listo!
      </h2>
      <p className="text-gray-400 mb-6">
        Tu video clonado esta listo para descargar
      </p>

      <VideoPlayer src={downloadUrl} />

      <div className="mt-6 space-y-3">
        <a
          href={downloadUrl}
          download
          className="block w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 rounded-lg transition-colors text-center"
        >
          Descargar Video
        </a>

        <button
          onClick={onReset}
          className="w-full bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-3 rounded-lg transition-colors"
        >
          Crear Otro Video
        </button>
      </div>
    </div>
  );
}
