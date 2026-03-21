"use client";

const STEPS = [
  { num: 1, label: "Subir" },
  { num: 2, label: "Analizar" },
  { num: 3, label: "Editar" },
  { num: 4, label: "Modelo" },
  { num: 5, label: "Keyframes" },
  { num: 6, label: "Generar" },
  { num: 7, label: "Descargar" },
];

export function Stepper({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-center gap-1 mb-8">
      {STEPS.map((step, i) => (
        <div key={step.num} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                step.num === currentStep
                  ? "bg-purple-600 text-white"
                  : step.num < currentStep
                    ? "bg-green-500 text-white"
                    : "bg-gray-700 text-gray-400"
              }`}
            >
              {step.num < currentStep ? "\u2713" : step.num}
            </div>
            <span
              className={`text-xs mt-1 ${
                step.num === currentStep
                  ? "text-purple-400"
                  : step.num < currentStep
                    ? "text-green-400"
                    : "text-gray-500"
              }`}
            >
              {step.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              className={`w-6 h-0.5 mx-1 mt-[-16px] ${
                step.num < currentStep ? "bg-green-500" : "bg-gray-700"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
