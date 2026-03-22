"use client";

import { useState, useRef } from "react";

interface Step1Props {
  onUploaded: (jobId: string, geminiFileName: string) => void;
}

const CHUNK_SIZE = 2 * 1024 * 1024; // 2MB per chunk

export function Step1Upload({ onUploaded }: Step1Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File) => {
    setLoading(true);
    setError(null);
    setProgress(0);

    try {
      // 1. Init resumable upload session
      const initRes = await fetch("/api/upload/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type || "video/mp4",
        }),
      });

      if (!initRes.ok) {
        const text = await initRes.text();
        let message = "Error al iniciar la subida";
        try {
          const json = JSON.parse(text);
          if (json.message) message = json.message;
        } catch { /* non-JSON */ }
        throw new Error(message);
      }

      const { uploadUrl } = await initRes.json();

      // 2. Upload chunks
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
      let offset = 0;

      for (let i = 0; i < totalChunks; i++) {
        const isLast = i === totalChunks - 1;
        const chunk = file.slice(offset, offset + CHUNK_SIZE);
        const chunkBuffer = await chunk.arrayBuffer();

        const chunkRes = await fetch("/api/upload/chunk", {
          method: "POST",
          headers: {
            "Content-Type": "application/octet-stream",
            "x-upload-url": uploadUrl,
            "x-upload-offset": String(offset),
            "x-upload-last": String(isLast),
          },
          body: chunkBuffer,
        });

        if (!chunkRes.ok) {
          const text = await chunkRes.text();
          let message = "Error al subir fragmento del video";
          try {
            const json = JSON.parse(text);
            if (json.message) message = json.message;
          } catch { /* non-JSON */ }
          throw new Error(message);
        }

        const chunkData = await chunkRes.json();

        if (chunkData.error) {
          throw new Error(chunkData.message);
        }

        offset += chunkBuffer.byteLength;
        setProgress(Math.round(((i + 1) / totalChunks) * 100));

        if (isLast && chunkData.geminiFileName) {
          const jobId = crypto.randomUUID();
          onUploaded(jobId, chunkData.geminiFileName);
          return;
        }
      }

      throw new Error("No se recibió el nombre del archivo de Gemini");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al subir el archivo"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  };

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="text-2xl font-bold text-white mb-2 text-center">
        Sube tu video viral
      </h2>
      <p className="text-gray-400 text-center mb-6">
        Sube el video de TikTok que quieres replicar
      </p>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => !loading && inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
          dragActive
            ? "border-purple-500 bg-purple-500/10"
            : "border-gray-600 hover:border-gray-500 bg-gray-800/50"
        }`}
      >
        <div className="text-4xl mb-3">{"🎬"}</div>
        <p className="text-white font-medium mb-1">Arrastra tu video aqui</p>
        <p className="text-gray-400 text-sm">
          o haz click para seleccionar (.mp4, .mov, .avi, .webm)
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="video/mp4,video/mov,video/avi,video/webm"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) uploadFile(file);
          }}
        />
      </div>

      {loading && (
        <div className="mt-6">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-gray-300">
              Subiendo video... {progress}%
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
