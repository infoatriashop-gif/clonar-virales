"use client";

import Image from "next/image";

export function ImageGrid({
  images,
  selected,
  onSelect,
}: {
  images: string[];
  selected: number | null;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {images.map((src, i) => (
        <button
          key={i}
          onClick={() => onSelect(i)}
          className={`relative aspect-[9/16] rounded-lg overflow-hidden border-3 transition-all ${
            selected === i
              ? "border-purple-500 ring-2 ring-purple-500/50"
              : "border-gray-700 hover:border-gray-500"
          }`}
        >
          <Image
            src={src}
            alt={`Opcion ${i + 1}`}
            fill
            className="object-cover"
          />
          {selected === i && (
            <div className="absolute top-2 right-2 w-7 h-7 bg-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">{"\u2713"}</span>
            </div>
          )}
          <div className="absolute bottom-2 left-2 bg-black/60 rounded px-2 py-0.5 text-xs text-white">
            Opcion {i + 1}
          </div>
        </button>
      ))}
    </div>
  );
}
