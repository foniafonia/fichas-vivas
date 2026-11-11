/* Fichas vivas · MODO AIRE. Se juega moviendo la mano delante de la cámara:
   el dedo índice mueve el puntero; se «toca» dejando la mano quieta sobre la
   carta (tiempo ajustable) o juntando índice y pulgar (pellizco).
   La imagen de la cámara se procesa en este aparato con MediaPipe: no se graba
   ni se envía. Se limita a ~20 fotogramas por segundo, se pausa con la pestaña
   oculta y se apaga la cámara al salir. */
(function () {
'use strict';
var FV = window.FV, $ = FV.$;
var VER = '0.10.14';
var BASE = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@' + VER;
var MODELO = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';
var turno = 0, activo = false, cargando = false, detector = null, video = null, stream = null, raf = 0, ultimo = 0;
var cursor = null, estado = null, aro = null, sx = -1, sy = -1, objetivo = null, desde = 0, bloqueado = null, pellizco = false, sinMano = 0;
var DWELL = (FV.aj.dwell || 10) * 100, FPS_MS = 50, CIRC = 2 * Math.PI * 25;
FV.aireDwell = function (ms) { DWELL = ms; };
var boton = $('btnAire');
function etiqueta(t) { var sv = boton.querySelector('svg'); boton.textContent = t; if (sv) boton.insertBefore(sv, boton.firstChild); }

function msg(t) { if (estado) estado.textContent = t; }
function crea() {
  video = document.createElement('video'); video.id = 'aireVideo'; video.playsInline = true; video.muted = true; video.setAttribute('playsinline', '');
  cursor = document.createElement('div'); cursor.id = 'aireCursor';
  cursor.innerHTML = '<svg viewBox="0 0 58 58" aria-hidden="true"><circle cx="29" cy="29" r="25" fill="none" stroke="#0E3524" stroke-width="5" stroke-dasharray="' + CIRC + '" stroke-dashoffset="' + CIRC + '"/></svg>';
  aro = cursor.querySelector('circle');
  estado = document.createElement('div'); estado.id = 'aireEstado'; estado.setAttribute('role', 'status');
  document.body.appendChild(video); document.body.appendChild(cursor); document.body.appendChild(estado);
}
function quita() { [video, cursor, estado].forEach(function (e) { if (e && e.parentNode) e.parentNode.removeChild(e); }); video = cursor = estado = aro = null; }

function enciende() {
  if (activo || cargando) return;
  var ok = true;
  try { ok = localStorage.getItem('fv-aire-ok') === '1'; } catch (e) { ok = false; }
  if (!ok) {
    if (!confirm('El modo aire usa la cámara para seguir tu mano.\n\nLa imagen no se graba ni se envía: se procesa en este aparato. Para funcionar descarga la herramienta de reconocimiento de manos de Google (MediaPipe).\n\n¿Activar el modo aire?')) return;
    try { localStorage.setItem('fv-aire-ok', '1'); } catch (e) {}
  }
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { alert('Este navegador no permite usar la cámara.'); return; }
  var mio = ++turno; function sigue(x) { if (mio !== turno) throw new Error('cancelado'); return x; }
  cargando = true; crea(); msg('Cargando el modo aire…'); boton.setAttribute('aria-pressed', 'true'); etiqueta('Cargando…');
  navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }, audio: false }).then(function (st) {
    if (mio !== turno) { st.getTracks().forEach(function (t) { t.stop(); }); throw new Error('cancelado'); } stream = st; video.srcObject = st; return video.play();
  }).then(function () {
    if (detector) return detector;
    return import(BASE + '/vision_bundle.mjs').then(function (mp) {
      return mp.FilesetResolver.forVisionTasks(BASE + '/wasm').then(function (fs) {
        var op = function (del) { return { baseOptions: { modelAssetPath: MODELO, delegate: del }, runningMode: 'VIDEO', numHands: 1, minHandDetectionConfidence: .6, minTrackingConfidence: .5 }; };
        return mp.HandLandmarker.createFromOptions(fs, op('GPU')).catch(function () { return mp.HandLandmarker.createFromOptions(fs, op('CPU')); });
      });
    }).then(function (d) { detector = d; return d; });
  }).then(sigue).then(function () {
    cargando = false; activo = true; document.body.classList.add('aire-on'); etiqueta('Aire: sí');
    msg('Levanta la mano y apunta con el dedo índice'); FV.cuenta('aire'); bucle();
  }).catch(function (e) {
    cargando = false; if (mio !== turno || /cancelado/.test(String(e && e.message))) return; apaga();
    alert(/Permission|NotAllowed/i.test(String(e && e.name || e)) ? 'Sin permiso para la cámara. Puedes darlo en el candado de la barra de direcciones.' : 'No se ha podido activar el modo aire. Comprueba la conexión y la cámara.');
  });
}
function apaga() {
  turno++; cargando = false; activo = false; cancelAnimationFrame(raf); raf = 0;
  if (stream) { stream.getTracks().forEach(function (t) { t.stop(); }); stream = null; }
  quita(); document.body.classList.remove('aire-on'); boton.setAttribute('aria-pressed', 'false'); etiqueta('Modo aire');
  objetivo = null; bloqueado = null; sx = sy = -1;
}
boton.addEventListener('click', function () { if (activo || cargando) apaga(); else enciende(); });
document.addEventListener('visibilitychange', function () {
  if (!activo) return;
  if (document.hidden) { cancelAnimationFrame(raf); raf = 0; } else if (!raf) bucle();
});
window.addEventListener('pagehide', apaga);

var SEL = '.tocable, button, a.btn, .chip, .carta, .zona, .caja-cat';
function bucle() {
  raf = requestAnimationFrame(bucle);
  var ahora = performance.now();
  if (ahora - ultimo < FPS_MS || !video || video.readyState < 2) return;
  ultimo = ahora;
  var r; try { r = detector.detectForVideo(video, ahora); } catch (e) { return; }
  var lm = r && r.landmarks && r.landmarks[0];
  if (!lm) { if (++sinMano > 6) { cursor.style.left = '-100px'; cursor.style.top = '-100px'; ponAro(0); objetivo = null; msg('No veo la mano'); } return; }
  sinMano = 0;
  var p = lm[8], pu = lm[4];
  var nx = (1 - p.x - .15) / .7, ny = (p.y - .12) / .66;
  nx = Math.max(0, Math.min(1, nx)); ny = Math.max(0, Math.min(1, ny));
  var x = nx * window.innerWidth, y = ny * window.innerHeight;
  if (sx < 0) { sx = x; sy = y; } else { sx += (x - sx) * .4; sy += (y - sy) * .4; }
  cursor.style.left = sx + 'px'; cursor.style.top = sy + 'px';
  var el = document.elementFromPoint(sx, sy), t = el && el.closest ? el.closest(SEL) : null;
  if (t && !$('juego').classList.contains('oculto') && (!t.closest('#juego') || t.matches('a[data-sk], #jSalir, #jOtra'))) t = null;
  if (t && (t.disabled || t.getAttribute('aria-disabled') === 'true' || t.classList.contains('hecha'))) t = null;
  var d = Math.hypot(p.x - pu.x, p.y - pu.y), mano = Math.hypot(lm[0].x - lm[9].x, lm[0].y - lm[9].y) || .2;
  var junto = d < mano * .32;
  if (junto && !pellizco && t) { pellizco = true; pulsa(t); return; }
  if (!junto) pellizco = false;
  if (t !== objetivo) { objetivo = t; desde = ahora; if (t !== bloqueado) bloqueado = null; }
  if (!t) { ponAro(0); msg('Mueve el dedo sobre una carta'); return; }
  if (t === bloqueado) { ponAro(0); return; }
  var f = (ahora - desde) / DWELL; ponAro(Math.min(1, f)); msg('Mantén la mano quieta…');
  if (f >= 1) pulsa(t);
}
function ponAro(f) { if (aro) aro.setAttribute('stroke-dashoffset', String(CIRC * (1 - f))); }
function pulsa(t) {
  bloqueado = t; objetivo = t; ponAro(0); msg('¡Tocado!');
  try { t.focus({ preventScroll: true }); } catch (e) {}
  t.click();
  cursor.style.background = 'rgba(47,168,102,.55)'; setTimeout(function () { if (cursor) cursor.style.background = ''; }, 250);
}
})();
