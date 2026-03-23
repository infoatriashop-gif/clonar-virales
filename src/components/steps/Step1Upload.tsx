"use client";

import { useState, useRef } from "react";

const CHUNK_SIZE = 4 * 1024 * 1024; // 4MB per chunk (within Vercel 4.5MB body limit)

interface Step1Props {
  apiKey: string;
  onUploaded: (jobId: string, geminiFileName: string) => void;
}

export function Step1Upload({ apiKey, onUploaded }: Step1Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [statusText, setStatusText] = useState("Subiendo video...");
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File) => {
    setLoading(true);
    setError(null);
    setProgress(0);
    setStatusText("Iniciando subida...");

    try {
      // 1. Init resumable upload session via our API (server creates session with Gemini)
      const initRes = await fetch("/api/upload/init", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-gemini-api-key": apiKey,
        },
        body: JSON.stringify({
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type || "video/mp4",
        }),
      });

      if (!initRes.ok) {
        const data = await initRes.json().catch(() => ({}));
        throw new Error(data.message || `Error al iniciar subida (${initRes.status})`);
      }

      const { uploadUrl } = await initRes.json();
      if (!uploadUrl) throw new Error("No se recibió URL de subida");

      // 2. Upload file in chunks via our chunk proxy
      setStatusText("Subiendo video...");
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
      let offset = 0;

      for (let i = 0; i < totalChunks; i++) {
        const isLast = i === totalChunks - 1;
        const chunk = file.slice(offset, offset + CHUNK_SIZE);
        const chunkBuffer = await chunk.arrayBuffer();

        const chunkRes = await fetch("/api/upload/chunk", {
          method: "POST",
          headers: {
            "x-upload-url": uploadUrl,
            "x-upload-offset": String(offset),
            "x-upload-last": isLast ? "true" : "false",
            "Content-Type": "application/octet-stream",
          },
          body: chunkBuffer,
        });

        if (!chunkRes.ok) {
          const data = await chunkRes.json().catch(() => ({}));
          throw new Error(data.message || `Error al subir fragmento ${i + 1}`);
        }

        const chunkData = await chunkRes.json();

        if (isLast && chunkData.done) {
          if (!chunkData.geminiFileName) {
            throw new Error("No se recibió el archivo de Gemini");
          }

          setProgress(100);
          const jobId = crypto.randomUUID();
          onUploaded(jobId, chunkData.geminiFileName);
          return;
        }

        offset = chunkData.nextOffset ?? offset + chunkBuffer.byteLength;
        // Progress: 0-95% during upload
        setProgress(Math.round(((i + 1) / totalChunks) * 95));
      }
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
        Sube el video de TikTok que quieres replicar (sin limite de tamaño)
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
              {statusText} {progress}%
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
