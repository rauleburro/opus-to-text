import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { decodeAudio } from "./audio-decoder";

/**
 * happy-dom no incluye Web Audio API. Stubbeamos AudioContext y
 * OfflineAudioContext con implementaciones mínimas que devuelven
 * AudioBuffers controlados, para verificar la orquestación del decoder.
 *
 * En slice #5 ampliamos esto con fixtures reales y validación funcional.
 */

type FakeAudioBuffer = {
  numberOfChannels: number;
  sampleRate: number;
  length: number;
  duration: number;
  getChannelData: (channel: number) => Float32Array;
};

const createFakeBuffer = (opts: {
  channels: number;
  sampleRate: number;
  durationSeconds: number;
  fillValue?: number;
}): FakeAudioBuffer => {
  const length = Math.floor(opts.sampleRate * opts.durationSeconds);
  const channelData: Float32Array[] = [];
  for (let c = 0; c < opts.channels; c++) {
    channelData.push(new Float32Array(length).fill(opts.fillValue ?? 0));
  }
  return {
    numberOfChannels: opts.channels,
    sampleRate: opts.sampleRate,
    length,
    duration: opts.durationSeconds,
    getChannelData: (channel: number) => channelData[channel]!,
  };
};

class FakeAudioContext {
  decodeAudioData = vi.fn(async (_buffer: ArrayBuffer): Promise<FakeAudioBuffer> => {
    return createFakeBuffer({
      channels: 1,
      sampleRate: 48000,
      durationSeconds: 1,
      fillValue: 0.5,
    });
  });
  close = vi.fn();
}

class FakeOfflineAudioContext {
  destination = {} as AudioDestinationNode;
  constructor(
    public channels: number,
    public length: number,
    public sampleRate: number,
  ) {}
  createBufferSource = vi.fn(() => {
    const source = {
      buffer: null as FakeAudioBuffer | null,
      connect: vi.fn(),
      start: vi.fn(),
    };
    return source;
  });
  startRendering = vi.fn(async (): Promise<FakeAudioBuffer> => {
    return createFakeBuffer({
      channels: 1,
      sampleRate: this.sampleRate,
      durationSeconds: this.length / this.sampleRate,
      fillValue: 0.25,
    });
  });
}

beforeEach(() => {
  vi.stubGlobal("AudioContext", FakeAudioContext);
  vi.stubGlobal("OfflineAudioContext", FakeOfflineAudioContext);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("audio-decoder", () => {
  it("acepta un ArrayBuffer y devuelve sampleRate 16000", async () => {
    const buffer = new ArrayBuffer(8);
    const result = await decodeAudio(buffer);
    expect(result.sampleRate).toBe(16000);
  });

  it("acepta un File y lo convierte a ArrayBuffer internamente", async () => {
    const file = new File([new Uint8Array([1, 2, 3, 4])], "voz.opus", {
      type: "audio/ogg",
    });
    const result = await decodeAudio(file);
    expect(result.sampleRate).toBe(16000);
    expect(result.samples).toBeInstanceOf(Float32Array);
  });

  it("devuelve un Float32Array mono (no estéreo)", async () => {
    const buffer = new ArrayBuffer(8);
    const result = await decodeAudio(buffer);
    // Para 1 segundo a 16000 Hz mono → 16000 samples
    expect(result.samples.length).toBe(16000);
  });

  it("usa OfflineAudioContext con (1 canal, length apropiado, 16000 Hz)", async () => {
    const oacSpy = vi.fn();
    class TrackingOAC extends FakeOfflineAudioContext {
      constructor(channels: number, length: number, sampleRate: number) {
        super(channels, length, sampleRate);
        oacSpy(channels, length, sampleRate);
      }
    }
    vi.stubGlobal("OfflineAudioContext", TrackingOAC);

    const buffer = new ArrayBuffer(8);
    await decodeAudio(buffer);

    expect(oacSpy).toHaveBeenCalledTimes(1);
    const [channels, , sampleRate] = oacSpy.mock.calls[0]!;
    expect(channels).toBe(1);
    expect(sampleRate).toBe(16000);
  });
});
