import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  DecodeFailedError,
  SUPPORTED_EXTENSIONS,
  UnsupportedFormatError,
  decodeAudio,
} from "./audio-decoder";

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

let decodeImpl: (buf: ArrayBuffer) => Promise<FakeAudioBuffer>;

class FakeAudioContext {
  decodeAudioData = vi.fn(async (buf: ArrayBuffer) => decodeImpl(buf));
  close = vi.fn();
}

class FakeOfflineAudioContext {
  destination = {} as AudioDestinationNode;
  constructor(
    public channels: number,
    public length: number,
    public sampleRate: number,
  ) {}
  createBufferSource = vi.fn(() => ({
    buffer: null as FakeAudioBuffer | null,
    connect: vi.fn(),
    start: vi.fn(),
  }));
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
  decodeImpl = async () =>
    createFakeBuffer({ channels: 1, sampleRate: 48000, durationSeconds: 1 });
  vi.stubGlobal("AudioContext", FakeAudioContext);
  vi.stubGlobal("OfflineAudioContext", FakeOfflineAudioContext);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("audio-decoder — output shape", () => {
  it("acepta ArrayBuffer y devuelve sampleRate 16000", async () => {
    const result = await decodeAudio(new ArrayBuffer(8));
    expect(result.sampleRate).toBe(16000);
  });

  it("acepta File con extensión válida", async () => {
    const file = new File([new Uint8Array([1, 2, 3])], "voz.opus", {
      type: "audio/ogg",
    });
    const result = await decodeAudio(file);
    expect(result.sampleRate).toBe(16000);
    expect(result.samples).toBeInstanceOf(Float32Array);
  });

  it("devuelve Float32Array mono", async () => {
    const result = await decodeAudio(new ArrayBuffer(8));
    expect(result.samples.length).toBe(16000);
  });
});

describe("audio-decoder — multi-formato (slice 5)", () => {
  it.each(SUPPORTED_EXTENSIONS)(
    "acepta archivo con extensión %s",
    async (ext) => {
      const file = new File([new Uint8Array([1, 2, 3])], `voz${ext}`);
      const result = await decodeAudio(file);
      expect(result.sampleRate).toBe(16000);
    },
  );

  it("acepta extensiones en mayúsculas", async () => {
    const file = new File([new Uint8Array([1, 2, 3])], "VOZ.OPUS");
    const result = await decodeAudio(file);
    expect(result.sampleRate).toBe(16000);
  });
});

describe("audio-decoder — downmix estéreo a mono", () => {
  it("input estéreo es procesado por OfflineAudioContext con 1 canal", async () => {
    decodeImpl = async () =>
      createFakeBuffer({ channels: 2, sampleRate: 48000, durationSeconds: 1 });

    const oacSpy = vi.fn();
    class TrackingOAC extends FakeOfflineAudioContext {
      constructor(channels: number, length: number, sampleRate: number) {
        super(channels, length, sampleRate);
        oacSpy(channels, length, sampleRate);
      }
    }
    vi.stubGlobal("OfflineAudioContext", TrackingOAC);

    const result = await decodeAudio(new ArrayBuffer(8));

    const [channels] = oacSpy.mock.calls[0]!;
    expect(channels).toBe(1);
    expect(result.samples).toBeInstanceOf(Float32Array);
  });
});

describe("audio-decoder — resample preserva duración", () => {
  it("48kHz / 1s → 16000 samples (±1)", async () => {
    decodeImpl = async () =>
      createFakeBuffer({ channels: 1, sampleRate: 48000, durationSeconds: 1 });
    const result = await decodeAudio(new ArrayBuffer(8));
    expect(Math.abs(result.samples.length - 16000)).toBeLessThanOrEqual(1);
  });

  it("8kHz / 2s → 32000 samples (±1)", async () => {
    decodeImpl = async () =>
      createFakeBuffer({ channels: 1, sampleRate: 8000, durationSeconds: 2 });
    const result = await decodeAudio(new ArrayBuffer(8));
    expect(Math.abs(result.samples.length - 32000)).toBeLessThanOrEqual(1);
  });

  it("44.1kHz / 0.5s → 8000 samples (±1)", async () => {
    decodeImpl = async () =>
      createFakeBuffer({ channels: 1, sampleRate: 44100, durationSeconds: 0.5 });
    const result = await decodeAudio(new ArrayBuffer(8));
    expect(Math.abs(result.samples.length - 8000)).toBeLessThanOrEqual(1);
  });
});

describe("audio-decoder — errores", () => {
  it("File con extensión no soportada → UnsupportedFormatError", async () => {
    const file = new File([new Uint8Array([1, 2, 3])], "documento.txt");
    await expect(decodeAudio(file)).rejects.toThrow(UnsupportedFormatError);
  });

  it("UnsupportedFormatError expone la extensión rechazada", async () => {
    const file = new File([new Uint8Array([1])], "x.json");
    try {
      await decodeAudio(file);
      throw new Error("debió fallar");
    } catch (error) {
      expect(error).toBeInstanceOf(UnsupportedFormatError);
      if (error instanceof UnsupportedFormatError) {
        expect(error.extension).toBe(".json");
      }
    }
  });

  it("File sin extensión → UnsupportedFormatError", async () => {
    const file = new File([new Uint8Array([1])], "audio");
    await expect(decodeAudio(file)).rejects.toThrow(UnsupportedFormatError);
  });

  it("decodeAudioData falla → DecodeFailedError", async () => {
    decodeImpl = async () => {
      throw new Error("audio bytes corruptos");
    };
    const file = new File([new Uint8Array([0xff, 0xff])], "x.opus");
    await expect(decodeAudio(file)).rejects.toThrow(DecodeFailedError);
  });

  it("ArrayBuffer corrupto → DecodeFailedError", async () => {
    decodeImpl = async () => {
      throw new Error("invalid data");
    };
    await expect(decodeAudio(new ArrayBuffer(8))).rejects.toThrow(DecodeFailedError);
  });
});
