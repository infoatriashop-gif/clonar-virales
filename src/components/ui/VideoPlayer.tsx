"use client";

export function VideoPlayer({ src }: { src: string }) {
  return (
    <div className="relative aspect-[9/16] max-w-sm mx-auto rounded-lg overflow-hidden bg-black">
      <video
        src={src}
        controls
        className="w-full h-full object-contain"
        playsInline
      />
    </div>
  );
}
