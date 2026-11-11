# Revisión Codex: ¿está Fichas vivas lista para entregarla como prototipo?

Fichas vivas es una web estática (GitHub Pages, sin servidor, sin IA) para Almudena, logopeda de #ponunlogopedaentuvida. Ella sube sus hojas de dibujos y palabras, se cortan solas y se juegan de 16 maneras, con modo aire (MediaPipe), perfiles anónimos con informe, copia de seguridad, ayuda con vídeos y una sección «Próximamente».
Se entrega como PROTOTIPO: no tiene que ser perfecta, pero no puede fallar en lo básico ni poner en riesgo datos.

## Qué revisar (solo leer el código de esta carpeta)
- index.html, fv-datos.js, fv-app.js, fv-juegos.js, fv-aire.js, fv-perfiles.js, fv-ayuda.js.
- No mires tutorial/ ni _ref/.

1. Fallos que rompan el uso básico: subir material, cortar, editar palabras, jugar los 16 juegos, escenas, imprimir, exportar/importar, perfiles, informe, copia de seguridad y recuperar copia, ayuda y vídeos.
2. Datos y privacidad: que nada del paciente ni del material salga del aparato (solo contadores anónimos de abacus, sin texto libre). Señala cualquier sitio donde se envíe algo fuera.
3. Compatibilidad: iPad antiguo y Safari (sintaxis moderna que rompa, APIs no soportadas), móvil en vertical, pizarra digital.
4. Accesibilidad y textos: botones sin nombre, textos en español con faltas, voseo (debe ser tú/vosotros), la palabra «gratis» (no debe aparecer).
5. Cosas que confundan a una logopeda que la abre por primera vez.

## Cómo responder
- Veredicto en una línea: LISTA / LISTA CON RETOQUES / NO LISTA.
- Lista de problemas ordenada por gravedad: archivo:línea, qué pasa, cómo arreglarlo en una frase.
- Máximo 25 puntos. Nada de relleno.

## Prohibido
- No modifiques ningún archivo, no hagas commit ni push.
- No envíes nada a internet ni uses datos personales de nadie.
