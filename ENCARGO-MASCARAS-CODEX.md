# Encargo para Codex · Dos máscaras visuales para Fichas vivas (niños y adultos)

## Qué es
Fichas vivas (esta carpeta) es una web estática de ColmenIA para logopedas: se sube material en cuadrícula, se corta solo y se juega de 16 maneras. Publicada en https://foniafonia.github.io/fichas-vivas/ . Archivos: `index.html` (todo el CSS y el HTML), `fv-app.js`, `fv-juegos.js`, `fv-aire.js`, `fv-datos.js`.

## Qué quiere José
1. **Antes de nada, la web pregunta «¿Para quién es?»**: dos tarjetas grandes, **Niños** y **Adultos**. Se guarda en `localStorage` (`fv-publico` = `ninos` | `adultos`) y pone en `<body>` la clase `tema-ninos` o `tema-adultos`. Se puede cambiar después con un botón en la cabecera (`👤 Niños / Adultos`). Si ya eligió, no vuelve a preguntar.
2. **Dos máscaras visuales bonitas y MUY profesionales**, del estilo de nuestras apps Comunica y Grafía. Míralas antes de diseñar:
   - Comunica: `~/Developer/comunica/app`, `~/Developer/comunica/components` (Next.js; fíjate en paleta, tarjetas, tipografía, espaciado, botones).
   - Grafía / disgrafía: `~/Developer/fonia-ficha-opciones/lectoescritura/caligrafia.html` y la captura `~/Developer/COLMENIA_CAPTURAS_2026-09-09/L033_004--App-Disgrafia--mvht8kd5kesz89q715.png`.
3. **Máscara Niños**: cálida, alegre y limpia. Formas redondeadas, botones y cartas grandes y táctiles, guiño discreto a la colmena (hexágonos suaves, miel) sin recargar. Colores vivos pero armónicos.
4. **Máscara Adultos**: sobria y elegante, nada infantil (sin emojis decorativos, sin confeti, sin colores de juguete). Pensada para adultos con afasia o daño neurológico y para el profesional: mucho contraste, letra más grande, espacios amplios, tono respetuoso. Paleta neutra con acentos del verde y el oro de ColmenIA.
5. **Ajustes por defecto según la elección** (sin bloquear que se cambien en «Ajustes»): Adultos → modo tranquilo activado, «Imagen y palabra», letra «Como la escribí», cartas grandes, sin confeti. Niños → solo imagen, MAYÚSCULAS, cartas medianas. Usa `FV.aj` y `localStorage` `fv-ajustes` (mira `fv-app.js`, bloque «Ajustes»), y solo la primera vez que elige.
6. Pequeños textos que cambian con el público, por ejemplo en la portada: Niños «Tus fichas cobran vida» / Adultos «Tu material de trabajo, listo para cada sesión». Pon el texto en atributos `data-ninos` y `data-adultos` y cámbialo con JS.

## Reglas (no romper nada)
- No cambies ni borres los `id`, las clases que usa el JS (`.carta`, `.tocable`, `.zona`, `.caja-cat`, `.btn`, `.chip`, `.oculto`, `.grande`, `.sombra`, `.tapada`, `.hueco`, `.bien`, `.mal`, `.sel`, `.hecha`, `.marca`, `aire-on`, etc.) ni la lógica de los juegos. Todo lo nuevo, encima.
- Todo debe seguir funcionando: los 16 juegos, cortador, editor de zonas, biblioteca, abeja 🐝, modo aire, imprimir.
- Solo CSS y el JS imprescindible para el selector, escrito en **ES5** (var, function; sin flechas ni `?.`) porque se usa en iPad antiguos.
- Sin librerías nuevas. Fuentes: se puede usar Google Fonts (por ejemplo Nunito para niños, Atkinson Hyperlegible o Inter para adultos).
- Iconos, si hacen falta, en SVG en línea. Sin imágenes nuevas de niños ni de personas.
- Respeta `prefers-reduced-motion`, contraste WCAG AA, foco visible y teclado. Animaciones suaves y cortas, nada pesado.
- Debe verse bien en móvil (375 px), tableta y pizarra digital.
- Mantén el logo de ColmenIA, el bloque de #ponunlogopedaentuvida (Almudena) y los botones «Entrar en ColmenIA».
- Textos en español de España, sin voseo, sin la palabra «gratis».
- No hagas commit ni push: lo revisa Claude.

## Entrega
- Cambios en `index.html` (y lo mínimo en `fv-app.js` si hace falta).
- `CAMBIOS-MASCARAS.md` con qué has cambiado y cómo probarlo.
- Dos capturas si puedes (`captura-ninos.png`, `captura-adultos.png`), de la portada y de un juego.
