# ADR 0001 — Whisper corriendo 100% en el browser (sin nube, sin backend)

**Estado**: Aceptada
**Fecha**: 2026-05-26

## Contexto

Necesitamos transcribir archivos `.opus` (típicamente notas de voz de WhatsApp) a texto en español. Hay tres familias de soluciones viables:

1. **API en la nube** (OpenAI Whisper API, Deepgram, AssemblyAI). Requiere un mini-backend para no exponer la API key, sube el audio del usuario a un tercero, tiene costo por minuto, y mejor calidad / velocidad.
2. **Backend local con `whisper.cpp`**. Rapidísimo en Apple Silicon (Metal), maneja modelos grandes, pero exige correr un proceso aparte además de la UI.
3. **Whisper en el browser** (`transformers.js`). Cero backend, cero claves, cero infraestructura. Más lento y limitado por la RAM/CPU del browser; primera descarga del modelo es pesada (~250 MB con `whisper-small` cuantizado), pero queda cacheada.

## Decisión

Vamos con **opción 3: Whisper 100% en el browser** vía `@xenova/transformers`, modelo `Xenova/whisper-small`, ejecutándose en un Web Worker con auto-detección WebGPU y fallback a WASM.

## Razones

- **Privacidad**: el audio nunca sale del dispositivo. No hay que pensar en ToS, retención, ni cumplimiento.
- **Simplicidad operativa**: no hay servidor que mantener, ni API key que rotar, ni costo por uso. Un build estático sirve a cualquiera.
- **Offline tras primera carga**: el modelo queda en cache del browser; la app funciona sin red.
- **Suficiente para el caso de uso**: notas de voz típicas (< 5 min) en español. `whisper-small` da calidad muy buena para ese rango.

## Consecuencias

- **Primera carga lenta**: descargar ~250 MB. Tiene que haber UI clara de progreso de descarga del modelo.
- **No sirve para audios largos**: archivos de > ~15 min en el browser son incómodos. Si eso se vuelve un requisito, hay que migrar a backend local (opción 2) o nube (opción 1).
- **No hay diarización ni timestamps por segmento** en el MVP. Whisper puede dar timestamps, pero decidimos no exponerlos (ver scope del MVP en `CONTEXT.md`).
- **Soporte de browser**: WebGPU acelera mucho, pero solo Chrome/Edge estables lo tienen. El fallback WASM funciona en todos lados, más lento.

## Alternativas descartadas

- **OpenAI Whisper API**: descartada porque el usuario pidió "local". También evita la complejidad de un backend.
- **`whisper.cpp` local con servidor Node**: descartada por simplicidad — un solo `npm run dev` debería bastar.
- **Modelos más chicos (`tiny`, `base`)**: descartados por calidad insuficiente en español.
- **Modelos más grandes (`medium`, `large-v3`)**: descartados por tamaño de descarga (750 MB – 1.5 GB) y por velocidad inviable en browser sin WebGPU.
