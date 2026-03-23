"use client";

import { useState, useEffect } from "react";

interface ApiKeyInputProps {
  onKeySet: (key: string) => void;
}

export function ApiKeyInput({ onKeySet }: ApiKeyInputProps) {
  const [key, setKey] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("gemini_api_key");
    if (stored) {
      setKey(stored);
      setSaved(true);
      onKeySet(stored);
    }
  }, [onKeySet]);

  const handleSave = () => {
    if (!key.trim()) return;
    localStorage.setItem("gemini_api_key", key.trim());
    setSaved(true);
    onKeySet(key.trim());
  };

  const handleClear = () => {
    localStorage.removeItem("gemini_api_key");
    setKey("");
    setSaved(false);
    onKeySet("");
  };

  if (saved) {
    return (
      <div className="flex items-center gap-2 text-xs">
        <span className="text-green-400">API Key configurada</span>
        <button
          onClick={handleClear}
          className="text-gray-500 hover:text-gray-300 underline"
        >
          Cambiar
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="password"
        value={key}
        onChange={(e) => setKey(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSave()}
        placeholder="Pega tu Gemini API Key"
        className="bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none w-64"
      />
      <button
        onClick={handleSave}
        disabled={!key.trim()}
        className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm px-3 py-1.5 rounded transition-colors"
      >
        Guardar
      </button>
    </div>
  );
}
