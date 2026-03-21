"use client";

import { useCallback } from "react";
import { Stepper } from "@/components/stepper/Stepper";
import { Step1Upload } from "@/components/steps/Step1Upload";
import { Step2Analysis } from "@/components/steps/Step2Analysis";
import { Step3Edit } from "@/components/steps/Step3Edit";
import { Step4BaseImage } from "@/components/steps/Step4BaseImage";
import { Step5Keyframes } from "@/components/steps/Step5Keyframes";
import { Step6Generate } from "@/components/steps/Step6Generate";
import { Step7Download } from "@/components/steps/Step7Download";
import { useWizard } from "@/hooks/useWizard";
import { VideoAnalysis } from "@/lib/types";

export default function Home() {
  const {
    state,
    setStep,
    setJobId,
    setAnalysis,
    setBaseImages,
    selectBaseImage,
    setKeyframes,
    setProduct,
    setAcento,
    setFinalVideo,
    reset,
  } = useWizard();

  const handleUpload = useCallback(
    (jobId: string, filePath: string) => {
      setJobId(jobId, filePath);
      setStep(2);
    },
    [setJobId, setStep]
  );

  const handleAnalysis = useCallback(
    (analysis: VideoAnalysis) => {
      setAnalysis(analysis);
      setStep(3);
    },
    [setAnalysis, setStep]
  );

  const handleEditContinue = useCallback(
    (name: string, packaging: string, colors: string[], acento: string) => {
      setProduct(name, packaging, colors);
      setAcento(acento);
      setStep(4);
    },
    [setProduct, setAcento, setStep]
  );

  const handleBaseSelected = useCallback(
    (index: number, images: string[]) => {
      selectBaseImage(index);
      setBaseImages(images);
      setStep(5);
    },
    [selectBaseImage, setBaseImages, setStep]
  );

  const handleKeyframesComplete = useCallback(
    (keyframes: string[]) => {
      setKeyframes(keyframes);
      setStep(6);
    },
    [setKeyframes, setStep]
  );

  const handleGenerateComplete = useCallback(
    (downloadUrl: string) => {
      setFinalVideo(downloadUrl);
      setStep(7);
    },
    [setFinalVideo, setStep]
  );

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="border-b border-gray-800 py-4">
        <div className="max-w-5xl mx-auto px-4">
          <h1 className="text-xl font-bold text-white">
            Clonar Virales
          </h1>
          <p className="text-xs text-gray-500">
            Replica videos virales de TikTok Shop con IA
          </p>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        <Stepper currentStep={state.currentStep} />

        {state.currentStep === 1 && (
          <Step1Upload onUploaded={handleUpload} />
        )}

        {state.currentStep === 2 && state.jobId && state.filePath && (
          <Step2Analysis jobId={state.jobId} filePath={state.filePath} onAnalyzed={handleAnalysis} />
        )}

        {state.currentStep === 3 && state.analysis && (
          <Step3Edit
            analysis={state.analysis}
            initialName={state.productName}
            initialPackaging={state.packagingDetails}
            initialColors={state.productColors}
            initialAcento={state.acento}
            onContinue={handleEditContinue}
          />
        )}

        {state.currentStep === 4 && state.jobId && (
          <Step4BaseImage
            jobId={state.jobId}
            onSelected={handleBaseSelected}
          />
        )}

        {state.currentStep === 5 && state.jobId && (
          <Step5Keyframes
            jobId={state.jobId}
            selectedBaseImage={state.selectedBaseImage ?? 0}
            acento={state.acento}
            productoEditado={{
              nombre: state.productName,
              empaque: state.packagingDetails,
              colores: state.productColors,
            }}
            onComplete={handleKeyframesComplete}
          />
        )}

        {state.currentStep === 6 && state.jobId && (
          <Step6Generate
            jobId={state.jobId}
            onComplete={handleGenerateComplete}
          />
        )}

        {state.currentStep === 7 && state.finalVideoUrl && (
          <Step7Download
            downloadUrl={state.finalVideoUrl}
            onReset={reset}
          />
        )}
      </main>
    </div>
  );
}
