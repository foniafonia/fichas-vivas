# Máscaras visuales de Fichas vivas

## Qué se ha cambiado

- La primera visita pregunta «¿Para quién es?» con dos tarjetas: **Niños** y **Adultos**.
- La elección se guarda en `localStorage` como `fv-publico` (`ninos` o `adultos`) y aplica `tema-ninos` o `tema-adultos` al `<body>`.
- La máscara se puede cambiar desde la cabecera con «👤 Niños / Adultos».
- Se han añadido dos tratamientos visuales encima del CSS existente:
  - Niños: cálido, luminoso, redondeado y táctil, con guiños muy suaves a la colmena.
  - Adultos: neutro, sobrio, contrastado y con más aire, usando verde y oro como acentos.
- La portada cambia el titular mediante `data-ninos` y `data-adultos`.
- En la primera elección se guardan los presets en `FV.aj` y `fv-ajustes`:
  - Adultos: modo tranquilo, imagen y palabra, como la escribí, cartas grandes y sin sonidos de acierto.
  - Niños: solo imagen, MAYÚSCULAS y cartas medianas.
- Se ha exportado internamente `FV.pintaAj()` para que el panel de ajustes refleje el preset al cambiar de público.

No se han cambiado los identificadores ni las clases de interacción de los juegos. Tampoco se han añadido librerías.

## Cómo probarlo

1. Abrir `index.html` en un navegador moderno o servir la carpeta con un servidor estático.
2. En una ventana privada o después de borrar `localStorage['fv-publico']`, comprobar el selector inicial.
3. Elegir **Niños** y verificar la portada, el botón de cabecera y `fv-ajustes`.
4. Recargar: el selector no debe volver a aparecer.
5. Pulsar «👤 Niños / Adultos», elegir **Adultos** y comprobar que cambian la paleta, el titular y los valores visibles de «Ajustes».
6. Probar «Probar con el ejemplo», abrir un juego, volver, abrir el cortador, editor, biblioteca, modo aire e impresión.
7. Comprobar foco con teclado y reducir movimiento desde las preferencias de accesibilidad.

## Capturas

No se han generado `captura-ninos.png` y `captura-adultos.png` porque el entorno de revisión no tenía navegador automatizable ni permitió abrir un servidor local. Se pueden obtener con el navegador al seguir los pasos anteriores.
