"use client";

import { useState, useRef } from "react";

interface Step1Props {
  onUploaded: (jobId: string, geminiFileName: string) => void;
}

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
      // 1. Init resumable upload session via our API (small request)
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
      setProgress(10);

      // 2. Upload file directly to Google (bypasses Vercel size limit)
      const uploadRes = await new Promise<Response>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", uploadUrl);
        xhr.setRequestHeader("X-Goog-Upload-Command", "upload, finalize");
        xhr.setRequestHeader("X-Goog-Upload-Offset", "0");

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setProgress(10 + Math.round((e.loaded / e.total) * 85));
          }
        };

        xhr.onload = () => {
          resolve(new Response(xhr.responseText, {
            status: xhr.status,
            statusText: xhr.statusText,
          }));
        };

        xhr.onerror = () => reject(new Error("Error de red al subir el video"));
        xhr.send(file);
      });

      if (!uploadRes.ok) {
        const text = await uploadRes.text();
        throw new Error(`Error al subir video (${uploadRes.status}): ${text}`);
      }

      setProgress(95);

      const data = JSON.parse(await uploadRes.text());
      const geminiFileName = data?.file?.name;

      if (!geminiFileName) {
        throw new Error("Gemini no devolvió el nombre del archivo");
      }

      setProgress(100);
      const jobId = crypto.randomUUID();
      onUploaded(jobId, geminiFileName);
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
