export const TARGET_SAMPLE_RATE = 16000;

export interface DecodedAudio {
  samples: Float32Array;
  sampleRate: typeof TARGET_SAMPLE_RATE;
}

export async function decodeAudio(input: File | ArrayBuffer): Promise<DecodedAudio> {
  const arrayBuffer = input instanceof ArrayBuffer ? input : await input.arrayBuffer();

  const audioContext = new AudioContext();
  let decoded: AudioBuffer;
  try {
    decoded = await audioContext.decodeAudioData(arrayBuffer.slice(0));
  } finally {
    audioContext.close();
  }

  const targetLength = Math.ceil(decoded.duration * TARGET_SAMPLE_RATE);
  const offline = new OfflineAudioContext(1, targetLength, TARGET_SAMPLE_RATE);

  const source = offline.createBufferSource();
  source.buffer = decoded;
  source.connect(offline.destination);
  source.start(0);

  const rendered = await offline.startRendering();
  const samples = rendered.getChannelData(0);

  return { samples: new Float32Array(samples), sampleRate: TARGET_SAMPLE_RATE };
}
