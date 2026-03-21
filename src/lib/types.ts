export interface VideoAnalysis {
  descripcionModelo: {
    edad: string;
    genero: string;
    etnia: string;
    complexion: string;
    cabello: string;
    rasgos: string;
    vestimenta: string;
  };
  clips: ClipAnalysis[];
  gancho: {
    tipo: string;
    texto: string;
    duracion: number;
  };
  transcripcion: {
    original: string;
    idiomaOriginal: string;
    español: string;
  };
  guion: {
    dialogos: {
      momento: number;
      hablante: string;
      textoOriginal: string;
      textoEspanol: string;
    }[];
    voz_en_off_original: string;
    voz_en_off_español: string;
  };
  producto: {
    nombre: string;
    empaque: string;
    colores: string[];
    presentacion: string;
  };
  llamadaAccion: {
    texto: string;
    momento: number;
    tipo: string;
  };
  audio: {
    musica: string;
    efectosSonido: string[];
    tono: string;
  };
  estiloGeneral: {
    personalidad: string;
    energia: string;
    tono: string;
  };
}

export interface ClipAnalysis {
  numero: number;
  inicio: number;
  fin: number;
  duracion: number;
  descripcionAccion: string;
  poseInicial: string;
  poseFinal: string;
  expresionFacial: string;
  anguloCamara: string;
  fondo: string;
  iluminacion: string;
  productoVisible: boolean;
  textoEnPantalla: string;
  dialogo: string;
  promptFotogramaInicial: string;
  promptFotogramaFinal: string;
  promptClipVideo: string;
}

export interface Job {
  id: string;
  status:
    | "pending"
    | "uploading"
    | "analyzing"
    | "generating_base"
    | "generating_keyframes"
    | "generating_clips"
    | "concatenating"
    | "completed"
    | "error";
  filePath?: string;
  analysis?: VideoAnalysis;
  baseImagePaths?: string[];
  selectedBaseImage?: number;
  keyframePaths?: string[];
  clipPaths?: string[];
  finalVideoPath?: string;
  currentClip?: number;
  totalClips?: number;
  error?: string;
  createdAt: Date;
  acento?: string;
  productoEditado?: {
    nombre: string;
    empaque: string;
    colores: string[];
  };
}

export interface WizardState {
  currentStep: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  jobId: string | null;
  filePath: string | null;
  analysis: VideoAnalysis | null;
  baseImages: string[];
  selectedBaseImage: number | null;
  keyframes: string[];
  productName: string;
  packagingDetails: string;
  productColors: string[];
  acento: string;
  finalVideoUrl: string | null;
}
