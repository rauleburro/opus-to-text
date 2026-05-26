export const TARGET_SAMPLE_RATE = 16000;

export const SUPPORTED_EXTENSIONS = [
  ".opus",
  ".ogg",
  ".mp3",
  ".wav",
  ".m4a",
] as const;

export type SupportedExtension = (typeof SUPPORTED_EXTENSIONS)[number];

export interface DecodedAudio {
  samples: Float32Array;
  sampleRate: typeof TARGET_SAMPLE_RATE;
}

export class UnsupportedFormatError extends Error {
  constructor(public readonly extension: string) {
    super(`Formato no soportado: ${extension || "(sin extensión)"}`);
    this.name = "UnsupportedFormatError";
  }
}

export class DecodeFailedError extends Error {
  constructor(cause: unknown) {
    const detail = cause instanceof Error ? cause.message : String(cause);
    super(`No se pudo decodificar el audio: ${detail}`);
    this.name = "DecodeFailedError";
  }
}

const extractExtension = (fileName: string): string => {
  const lastDot = fileName.lastIndexOf(".");
  if (lastDot <= 0) return "";
  return fileName.slice(lastDot).toLowerCase();
};

const isSupportedExtension = (ext: string): ext is SupportedExtension =>
  (SUPPORTED_EXTENSIONS as readonly string[]).includes(ext);

export async function decodeAudio(input: File | ArrayBuffer): Promise<DecodedAudio> {
  let arrayBuffer: ArrayBuffer;
  if (input instanceof File) {
    const ext = extractExtension(input.name);
    if (!isSupportedExtension(ext)) {
      throw new UnsupportedFormatError(ext);
    }
    arrayBuffer = await input.arrayBuffer();
  } else {
    arrayBuffer = input;
  }

  const audioContext = new AudioContext();
  let decoded: AudioBuffer;
  try {
    decoded = await audioContext.decodeAudioData(arrayBuffer.slice(0));
  } catch (error) {
    throw new DecodeFailedError(error);
  } finally {
    audioContext.close();
  }

  const targetLength = Math.max(1, Math.round(decoded.duration * TARGET_SAMPLE_RATE));
  const offline = new OfflineAudioContext(1, targetLength, TARGET_SAMPLE_RATE);

  const source = offline.createBufferSource();
  source.buffer = decoded;
  source.connect(offline.destination);
  source.start(0);

  let rendered: AudioBuffer;
  try {
    rendered = await offline.startRendering();
  } catch (error) {
    throw new DecodeFailedError(error);
  }

  const samples = rendered.getChannelData(0);
  return { samples: new Float32Array(samples), sampleRate: TARGET_SAMPLE_RATE };
}
