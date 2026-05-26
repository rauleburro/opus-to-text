# opus-to-text

App web que transcribe archivos `.opus` (y otros formatos de audio) a texto en **español**, usando **Whisper corriendo 100% en el browser**. No hay backend. No se envía el audio a ningún servicio externo.

## Stack

- Vite + React + TypeScript
- [`@xenova/transformers`](https://github.com/xenova/transformers.js) — Whisper en el browser
- Modelo: `Xenova/whisper-small` (multilingüe, ~250 MB cuantizado)
- Web Worker para inferencia (UI no se congela)
- Auto-detección WebGPU con fallback a WASM
- Tailwind CSS

## Cómo funciona

1. Arrastrás un archivo `.opus` (o `.ogg`, `.mp3`, `.wav`, `.m4a`).
2. La primera vez se descarga el modelo (~250 MB). Queda cacheado en el browser.
3. El audio se decodifica con la Web Audio API y se transcribe en un Web Worker.
4. Aparece el texto, con botones para **copiar** y **descargar `.txt`**.

## Privacidad

Todo corre en tu dispositivo. El audio nunca se sube a ningún servidor.

## Limitaciones

- Audios largos (> ~15 min) son incómodos en el browser.
- Sin WebGPU (Safari/Firefox), la transcripción es notablemente más lenta.
- No produce timestamps, subtítulos, ni diarización (por ahora).

## Desarrollo

```bash
npm install        # instala dependencias
npm run dev        # levanta Vite en modo dev
npm run build      # build de producción a dist/
npm run preview    # sirve el build
npm test           # corre Vitest (modo CI)
npm run test:watch # Vitest en watch mode
npm run typecheck  # tsc -b --noEmit
```

Stack: Vite 6 + React 19 + TypeScript + Tailwind 4 + Vitest 3 + React Testing Library + happy-dom.

## Decisiones de diseño

Ver [`CONTEXT.md`](./CONTEXT.md) y [`docs/adr/`](./docs/adr/).

## Licencia

MIT
