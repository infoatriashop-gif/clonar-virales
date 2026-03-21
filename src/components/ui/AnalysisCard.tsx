"use client";

export function AnalysisCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <h3 className="text-purple-400 font-bold text-sm uppercase tracking-wide mb-3">
        {title}
      </h3>
      <div className="text-gray-200 text-sm space-y-1">{children}</div>
    </div>
  );
}
