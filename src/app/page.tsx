"use client";

import { useCallback, useState } from "react";
import { Stepper } from "@/components/stepper/Stepper";
import { ApiKeyInput } from "@/components/ApiKeyInput";
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
  const [apiKey, setApiKey] = useState("");

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
    (jobId: string, geminiFileName: string) => {
      setJobId(jobId, geminiFileName);
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

  const handleApiKeySet = useCallback((key: string) => {
    setApiKey(key);
  }, []);

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="border-b border-gray-800 py-4">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">
              Clonar Virales
            </h1>
            <p className="text-xs text-gray-500">
              Replica videos virales de TikTok Shop con IA
            </p>
          </div>
          <ApiKeyInput onKeySet={handleApiKeySet} />
        </div>
      </header>

      {/* Main */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        <Stepper currentStep={state.currentStep} />

        {!apiKey && (
          <div className="max-w-lg mx-auto mt-8 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 text-yellow-400 text-sm text-center">
            Configura tu <strong>Gemini API Key</strong> en la esquina superior derecha para comenzar.
            <br />
            <a
              href="https://aistudio.google.com/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-purple-400 hover:text-purple-300"
            >
              Obtener API Key gratis
            </a>
          </div>
        )}

        {apiKey && state.currentStep === 1 && (
          <Step1Upload apiKey={apiKey} onUploaded={handleUpload} />
        )}

        {apiKey && state.currentStep === 2 && state.jobId && state.geminiFileName && (
          <Step2Analysis apiKey={apiKey} jobId={state.jobId} geminiFileName={state.geminiFileName} onAnalyzed={handleAnalysis} />
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

        {apiKey && state.currentStep === 4 && state.jobId && (
          <Step4BaseImage
            apiKey={apiKey}
            jobId={state.jobId}
            onSelected={handleBaseSelected}
          />
        )}

        {apiKey && state.currentStep === 5 && state.jobId && (
          <Step5Keyframes
            apiKey={apiKey}
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

        {apiKey && state.currentStep === 6 && state.jobId && (
          <Step6Generate
            apiKey={apiKey}
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
