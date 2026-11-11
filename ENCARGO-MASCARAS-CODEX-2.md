# Encargo para Codex · Segunda vuelta de las máscaras (Fichas vivas)

Tu primera vuelta funciona (selector «¿Para quién es?», clases `tema-ninos` / `tema-adultos`, ajustes por público), pero **visualmente casi no cambia nada**. José quiere un acabado MUY profesional, al nivel de nuestras apps Comunica y Graf-IA. Te adjunto imágenes:

- `_ref/ahora-portada-ninos.jpg`, `_ref/ahora-portada-adultos.jpg`, `_ref/ahora-juego.jpg`: cómo está ahora (publicado).
- `_ref/ref-comunica.png`: Comunica. **Esta es la referencia principal para Adultos** (y la base de calidad para las dos).
- `_ref/ref-grafia.jpg`: Graf-IA (cabecera de marca, botones de contorno, azul y rojo, letra amable). Referencia de tono para Niños.

## Qué tiene que cambiar (con decisión, no retoques tímidos)

### Común a las dos
- Cabecera tipo Comunica: fondo blanco con borde fino inferior, logo ColmenIA en cuadrado redondeado + «Fichas vivas.» con punto de color + subtítulo pequeño. Botones de cabecera de contorno, con icono SVG en línea y texto («Inicio», «Mi material», «Niños / Adultos», «Modo aire»). Nada del verde oscuro macizo actual.
- Etiquetas pequeñas en versalitas sobre los títulos (como «TU VOZ, A TU RITMO»).
- Tarjetas con borde fino, radio 16-20 px, sombra muy suave, y en las de juegos una franja de color arriba (cada juego su color, como las tarjetas de palabras de Comunica).
- Chips/píldoras para elegir y control segmentado donde tenga sentido.
- Tipografía: Inter (o Atkinson Hyperlegible) para Adultos; Nunito para Niños. Google Fonts permitido.
- **Pantalla de juego**: ahora las cartas salen pequeñas arriba y queda media pantalla vacía (mira `ahora-juego.jpg`). Las cartas tienen que **aprovechar el espacio**: centradas vertical y horizontalmente y grandes (que la rejilla crezca hasta llenar el alto disponible). La barra superior del juego, también al estilo Comunica (blanca, botones de contorno). Toca `.cartas`, `#escenario`, `#juego .barra` y la función `rejilla()` de `fv-juegos.js` si hace falta, sin cambiar la lógica.
- La portada: hero más limpio, con más aire; el bloque de #ponunlogopedaentuvida se mantiene (con su rosa) pero integrado con el resto.

### Adultos
- Paleta Comunica: blanco, gris pizarra (#0f172a / #475569 / #e2e8f0), acento verde ColmenIA #2FA866 y un toque oro #F2B33D. Sin emojis decorativos en los títulos de juego (puedes ocultar `.ico` o sustituirlos por iconos SVG de línea). Letra base 19-20 px.

### Niños
- Fondo crema muy claro, acentos vivos pero armónicos (verde, oro, azul cielo, coral), formas redondeadas, botones grandes, guiño discreto de hexágonos de colmena en el fondo de la portada (CSS, muy suave). Los emojis de los juegos se pueden quedar, dentro de un círculo de color.

## Reglas (las mismas que la primera vez)
- No cambies `id`, clases que usa el JS, ni la lógica. Todo encima. ES5 en el JS que añadas.
- Sigue funcionando todo: 16 juegos, cortador, editor de zonas, biblioteca, abeja, modo aire, imprimir.
- `prefers-reduced-motion`, contraste AA, foco visible, móvil 375 px.
- Español de España, sin voseo, sin «gratis». Logo ColmenIA, bloque de Almudena y botones «Entrar en ColmenIA» se mantienen.
- No hagas commit ni push. Al acabar, apunta en `CAMBIOS-MASCARAS.md` lo nuevo.
