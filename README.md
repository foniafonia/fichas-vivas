# Fichas vivas · ColmenIA

Herramienta web para logopedas y docentes: se sube material en cuadrícula (imágenes y palabras, imagen o PDF), se corta solo y se juega de 16 maneras. Sin IA, sin servidor, sin registro.

- `index.html` interfaz y estilos · `fv-datos.js` material de ejemplo, frases y novedades · `fv-app.js` cortador, editor, biblioteca (IndexedDB), voz, registro, impresión, contadores, abeja · `fv-juegos.js` juegos · `fv-aire.js` modo aire (MediaPipe, cámara local).
- Voz del ejemplo: Ximena (Microsoft, `es-ES-XimenaNeural`) en `demo/voz/` (palabra, con artículo, «¿dónde está?», primera sílaba, frases `f-*`). Material propio: grabación de la logopeda o voz del navegador (prefiere Ximena).
- Contadores: abacus `foniafonia-fichas`, claves `fv_*` y `fv_c_<canal>_*` con `?c=`. `?yo=1` deja de contar en ese aparato.
- Material de ejemplo: hojas de una compañera logopeda (mascotas y aseo), cortadas en `demo/`.
- Herramienta de apoyo: no sustituye la valoración ni la intervención de una logopeda.
