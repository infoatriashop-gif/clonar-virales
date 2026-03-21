"use client";

import { useReducer, useCallback } from "react";
import { VideoAnalysis, WizardState } from "@/lib/types";

type WizardAction =
  | { type: "SET_STEP"; step: WizardState["currentStep"] }
  | { type: "SET_JOB_ID"; jobId: string; geminiFileName: string }
  | { type: "SET_ANALYSIS"; analysis: VideoAnalysis }
  | { type: "SET_BASE_IMAGES"; images: string[] }
  | { type: "SELECT_BASE_IMAGE"; index: number }
  | { type: "SET_KEYFRAMES"; keyframes: string[] }
  | {
      type: "SET_PRODUCT";
      name: string;
      packaging: string;
      colors: string[];
    }
  | { type: "SET_ACENTO"; acento: string }
  | { type: "SET_FINAL_VIDEO"; url: string }
  | { type: "RESET" };

const initialState: WizardState = {
  currentStep: 1,
  jobId: null,
  geminiFileName: null,
  analysis: null,
  baseImages: [],
  selectedBaseImage: null,
  keyframes: [],
  productName: "",
  packagingDetails: "",
  productColors: [],
  acento: "neutral latinoamericano",
  finalVideoUrl: null,
};

function reducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, currentStep: action.step };
    case "SET_JOB_ID":
      return { ...state, jobId: action.jobId, geminiFileName: action.geminiFileName };
    case "SET_ANALYSIS":
      return {
        ...state,
        analysis: action.analysis,
        productName: action.analysis.producto.nombre,
        packagingDetails: action.analysis.producto.empaque,
        productColors: action.analysis.producto.colores,
      };
    case "SET_BASE_IMAGES":
      return { ...state, baseImages: action.images };
    case "SELECT_BASE_IMAGE":
      return { ...state, selectedBaseImage: action.index };
    case "SET_KEYFRAMES":
      return { ...state, keyframes: action.keyframes };
    case "SET_PRODUCT":
      return {
        ...state,
        productName: action.name,
        packagingDetails: action.packaging,
        productColors: action.colors,
      };
    case "SET_ACENTO":
      return { ...state, acento: action.acento };
    case "SET_FINAL_VIDEO":
      return { ...state, finalVideoUrl: action.url };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

export function useWizard() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const setStep = useCallback(
    (step: WizardState["currentStep"]) =>
      dispatch({ type: "SET_STEP", step }),
    []
  );
  const setJobId = useCallback(
    (jobId: string, geminiFileName: string) => dispatch({ type: "SET_JOB_ID", jobId, geminiFileName }),
    []
  );
  const setAnalysis = useCallback(
    (analysis: VideoAnalysis) =>
      dispatch({ type: "SET_ANALYSIS", analysis }),
    []
  );
  const setBaseImages = useCallback(
    (images: string[]) => dispatch({ type: "SET_BASE_IMAGES", images }),
    []
  );
  const selectBaseImage = useCallback(
    (index: number) => dispatch({ type: "SELECT_BASE_IMAGE", index }),
    []
  );
  const setKeyframes = useCallback(
    (keyframes: string[]) => dispatch({ type: "SET_KEYFRAMES", keyframes }),
    []
  );
  const setProduct = useCallback(
    (name: string, packaging: string, colors: string[]) =>
      dispatch({ type: "SET_PRODUCT", name, packaging, colors }),
    []
  );
  const setAcento = useCallback(
    (acento: string) => dispatch({ type: "SET_ACENTO", acento }),
    []
  );
  const setFinalVideo = useCallback(
    (url: string) => dispatch({ type: "SET_FINAL_VIDEO", url }),
    []
  );
  const reset = useCallback(() => dispatch({ type: "RESET" }), []);

  return {
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
  };
}
