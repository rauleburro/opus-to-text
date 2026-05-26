# opus-to-text — Contexto

App web cliente-only que transcribe archivos de audio (foco: `.opus`) a texto en español, usando Whisper corriendo localmente en el browser. No hay backend, no se envía audio a la nube.

## Glosario

- **Archivo de audio**: input del usuario. Foco en `.opus` (codec Ogg Opus, típico de WhatsApp y notas de voz), pero el decoder del browser acepta también `.ogg`, `.mp3`, `.wav`, `.m4a`.
- **Transcripción**: el texto en español que el modelo produce a partir del audio. Output plano, sin timestamps ni diarización.
- **Modelo**: instancia de Whisper (`Xenova/whisper-small`) descargada y cacheada en el browser. Se descarga una sola vez por dispositivo/navegador.
- **Pipeline**: la cadena `automatic-speech-recognition` de transformers.js que envuelve carga del modelo + inferencia.
- **Worker**: Web Worker que aísla la inferencia del thread principal para que la UI no se congele.
- **Backend de cómputo**: `webgpu` (preferido si está disponible) o `wasm` (fallback). No confundir con "backend de servidor" — acá no hay servidor.

## Lo que NO es

- No es un servicio multi-usuario. Corre íntegro en el browser de quien lo abre.
- No hace diarización (quién habla cuándo).
- No produce subtítulos (SRT/VTT) ni timestamps por segmento.
- No guarda historial de transcripciones.
