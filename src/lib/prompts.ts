import { VideoAnalysis } from "./types";

export const ANALYSIS_PROMPT = `Eres un experto en análisis de videos virales de TikTok Shop.
Analiza este video en profundidad y devuelve un JSON estructurado con el siguiente formato exacto.

IMPORTANTE: Responde SOLO con JSON válido, sin markdown ni texto adicional.

{
  "descripcionModelo": {
    "edad": "<edad aproximada, ej: 25 años>",
    "genero": "<masculino/femenino>",
    "etnia": "<etnia/raza aparente>",
    "complexion": "<delgada/media/robusta>",
    "cabello": "<color, largo, estilo, ej: castaño largo lacio>",
    "rasgos": "<rasgos faciales distintivos, forma de cara, ojos, nariz>",
    "vestimenta": "<descripción detallada de la ropa que lleva>"
  },
  "clips": [
    {
      "numero": 1,
      "inicio": 0,
      "fin": <segundo>,
      "duracion": <segundos>,
      "descripcionAccion": "<qué hace la modelo en este clip>",
      "poseInicial": "<descripción exacta de la pose al inicio del clip: posición del cuerpo, manos, dirección de la mirada>",
      "poseFinal": "<descripción exacta de la pose al final del clip>",
      "expresionFacial": "<expresión: sonrisa, sorpresa, seriedad, etc.>",
      "anguloCamara": "<ángulo: frontal, cenital, lateral, primer plano, plano medio, etc.>",
      "fondo": "<descripción del escenario/fondo detrás de la modelo>",
      "iluminacion": "<tipo de iluminación: natural, ring light, estudio, etc.>",
      "productoVisible": true/false,
      "textoEnPantalla": "<texto superpuesto visible, o vacío>",
      "dialogo": "<lo que dice la modelo en este clip, en el idioma original>",
      "promptFotogramaInicial": "<prompt en inglés para generar con Imagen 4 la imagen del inicio de este clip. Debe describir: la misma persona con las mismas características físicas, la pose inicial exacta, vestimenta, expresión, fondo, iluminación, ángulo de cámara. Formato: 'Realistic photograph of a [gender] [age] [ethnicity], [hair], [clothing], [pose], [expression], [background], [lighting], [camera angle], portrait 9:16 aspect ratio, high quality, photorealistic'>",
      "promptFotogramaFinal": "<prompt en inglés para generar la imagen del final de este clip. Mismo formato que el anterior pero con la pose final>",
      "promptClipVideo": "<prompt en inglés para Veo 3.1 describiendo la transición de la pose inicial a la pose final, la acción, la expresión, el movimiento. NO incluir descripción de audio aquí, eso se agrega después>"
    }
  ],
  "gancho": {
    "tipo": "<tipo: pregunta_impactante | afirmacion_polemica | demostracion_visual | antes_despues | testimonio | urgencia | curiosidad>",
    "texto": "<las palabras exactas del gancho en los primeros 3 segundos, en el idioma original>",
    "duracion": <duración del gancho en segundos>
  },
  "transcripcion": {
    "original": "<transcripción COMPLETA de todo el audio/diálogo del video en el idioma original, palabra por palabra>",
    "idiomaOriginal": "<idioma del video: inglés, chino, coreano, etc.>",
    "español": "<traducción COMPLETA al español de toda la transcripción, manteniendo el mismo tono, energía y estilo de habla>"
  },
  "guion": {
    "dialogos": [
      {
        "momento": <segundo>,
        "hablante": "<quién habla: modelo, voz en off, etc.>",
        "textoOriginal": "<lo que dice en el idioma original>",
        "textoEspanol": "<traducción al español>"
      }
    ],
    "voz_en_off_original": "<transcripción completa de la voz en off si existe, en idioma original>",
    "voz_en_off_español": "<traducción al español de la voz en off>"
  },
  "producto": {
    "nombre": "<nombre del producto>",
    "empaque": "<descripción detallada del empaque: forma, tamaño, material, etiqueta, colores>",
    "colores": ["<color1>", "<color2>"],
    "presentacion": "<cómo se presenta: unboxing, en uso, comparación, antes/después>"
  },
  "llamadaAccion": {
    "texto": "<texto exacto del CTA en idioma original>",
    "momento": <segundo>,
    "tipo": "<tipo: comprar_ahora | link_bio | comentar | compartir | agregar_carrito>"
  },
  "audio": {
    "musica": "<descripción de la música: género, tempo, mood, ej: pop energético 120bpm>",
    "efectosSonido": ["<efecto1>", "<efecto2>"],
    "tono": "<tono general: energético, calmado, urgente, ASMR, conversacional>"
  },
  "estiloGeneral": {
    "personalidad": "<personalidad de la modelo al presentar: carismática, profesional, cercana, divertida>",
    "energia": "<nivel de energía: alta, media, baja>",
    "tono": "<tono de comunicación: informal, profesional, entusiasta, educativo>"
  }
}

INSTRUCCIONES CRÍTICAS:
- Analiza CADA SEGUNDO del video con precisión.
- Divide el video en clips naturales (cada cambio de escena, corte o transición = nuevo clip).
- Los timestamps DEBEN ser exactos.
- Transcribe TODO el diálogo palabra por palabra.
- Los prompts de fotogramas deben ser en INGLÉS y extremadamente detallados.
- Cada prompt de fotograma debe describir a la MISMA persona con exactamente las mismas características físicas.
- Los prompts de clip de video deben describir el MOVIMIENTO y la TRANSICIÓN, no solo la pose estática.`;

export function buildBaseImagePrompt(analysis: VideoAnalysis): string {
  const m = analysis.descripcionModelo;
  return `Realistic photograph of a ${m.genero === "femenino" ? "woman" : "man"}, approximately ${m.edad}, ${m.etnia}, ${m.complexion} build, ${m.cabello} hair, ${m.rasgos}, wearing ${m.vestimenta}. Standing naturally, looking at the camera with a friendly expression. ${analysis.clips[0]?.fondo || "Clean neutral background"}. ${analysis.clips[0]?.iluminacion || "Soft natural lighting"}. Portrait orientation 9:16 aspect ratio. High quality, photorealistic, sharp focus, professional photography.`;
}

export function buildVoicePromptSuffix(
  acento: string,
  analysis: VideoAnalysis,
  dialogoEspanol: string
): string {
  const estilo = analysis.estiloGeneral;
  return `AUDIO: The person speaks in Spanish with a ${acento} accent. Voice tone is ${estilo.energia === "alta" ? "energetic and upbeat" : estilo.energia === "media" ? "moderate and natural" : "calm and soft"}. Speaking style is ${estilo.personalidad}, ${estilo.tono}. They say exactly: "${dialogoEspanol}"`;
}

export function buildClipPrompt(
  clipVideoPrompt: string,
  acento: string,
  analysis: VideoAnalysis,
  dialogoEspanol: string
): string {
  const voiceSuffix = buildVoicePromptSuffix(acento, analysis, dialogoEspanol);
  return `${clipVideoPrompt}. ${voiceSuffix}`;
}

export function buildKeyframePrompt(
  basePrompt: string,
  productoNuevo: { nombre: string; empaque: string; colores: string[] }
): string {
  // Replace product references in the keyframe prompt
  let prompt = basePrompt;
  if (productoNuevo.nombre) {
    prompt += `. The product shown is "${productoNuevo.nombre}" with packaging: ${productoNuevo.empaque}, colors: ${productoNuevo.colores.join(", ")}`;
  }
  return prompt;
}
