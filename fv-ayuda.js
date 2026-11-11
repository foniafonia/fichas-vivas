/* Fichas vivas · AYUDA. Botón «Ayuda» fijo, como en Comunica: pestaña de vídeos
   y pestaña de preguntas con la respuesta ya escrita (sin IA, no se envía nada).
   Cada pantalla tiene su «▶ Cómo se hace», que abre su vídeo en grande. */
(function () {
'use strict';
var FV = window.FV;
var VIDEOS = [
  ['oFuFC3LDnDE', 'Empieza aquí', 'Elegir niños o adultos, probar el ejemplo y jugar.'],
  ['dDsnpPnojFA', 'Sube tu material', 'Tu hoja se corta sola; escribes las palabras.'],
  ['oDj-WFoobuM', 'Ajusta a cada persona', 'Cartas, voz, mayúsculas y modo tranquilo.'],
  ['GLmaYvohIl8', 'Escenas', 'Sube una lámina y marca las cosas.'],
  ['xrSa1fySAMg', 'Modo aire, imprimir y compartir', 'Jugar con la mano, tarjetas en papel y pasarlo a otra.'],
  ['-lb65pbUSzE', 'Perfiles e informe', 'Seguir a cada persona con un código y ver su informe.']
];
var PREG = [
  ['¿Por dónde empiezo?', 'Pulsa «Probar con el ejemplo» y elige un juego. Cuando lo veas claro, sube tu propio material.', 1],
  ['¿Cómo subo mis hojas?', 'En «Subir mi material» eliges la hoja de dibujos en cuadrícula y, si la tienes, la de palabras. Vale PDF, foto o una foto hecha con la tableta. Se cortan solas: revisa los cortes y pulsa «Hecho».', 2],
  ['¿Cómo cambio una palabra o grabo mi voz?', 'En «Editar material» toca la carta: escribe la palabra, ponle categoría y, si quieres, graba tu voz.', 2],
  ['¿Cómo lo adapto a cada persona?', 'Con «Ajustes»: número de cartas, voz, mayúsculas y modo tranquilo (sin puntos ni prisas). Al elegir niños o adultos ya se ajusta solo.', 3],
  ['¿Cómo hago una escena?', 'En «Escenas» subes la lámina y marcas cada cosa con el dedo. Después se juega a «¿Dónde está?» y a «Explora la escena».', 4],
  ['¿Cómo se juega moviendo la mano?', 'Pulsa «Modo aire» y da permiso a la cámara. El dedo índice mueve el puntero; para tocar, deja la mano quieta o junta índice y pulgar. La imagen no se graba ni se envía.', 5],
  ['¿Cómo imprimo o se lo paso a una compañera?', 'En «Imprimir» salen las tarjetas y los cartones de bingo. Con «Exportar» guardas un archivo; tu compañera lo abre con «Importar».', 5],
  ['¿Cómo veo cómo va cada persona?', 'Crea un perfil con un código (P-01), nunca con su nombre. Cada partida se apunta y el informe enseña aciertos, tiempos y ayudas. Se puede descargar.', 6],
  ['¿Dónde se guarda lo que hago?', 'En este navegador, y no sale de este aparato. El material se pasa a otro aparato con «Exportar»; los perfiles, con la copia de seguridad.', 0],
  ['¿Cómo hago una copia de seguridad de mis pacientes?', 'En «Perfil» pulsa «Guardar copia»: se descarga un archivo con todos los perfiles y sus sesiones, sin nombres. Guárdalo en tu ordenador o tu nube. Si cambias de tablet o se borra el navegador, pulsa «Recuperar copia» y elige ese archivo. Cada 5 sesiones te lo recordamos. Próximamente habrá guardado online opcional.', 6],
  ['¿Puedo usar pictogramas?', 'Sí: en la portada está el «Banco de pictos ColmenIA», con 40 listos para jugar (animales, comida, ropa, acciones y emociones). Para mezclarlos con tus hojas, en «Editar material» pulsa «Pictos del banco». El banco entero tiene 889: si lo quieres, pídelo con la abeja.', 0]
];
var CLAVES = [
  'empiezo empezar inicio primero probar ejemplo funciona',
  'subir subo hoja hojas pdf foto fotos cuadricula cortar corte cortes material escanear',
  'palabra palabras cambiar escribir voz grabar grabo nombre carta categoria',
  'adaptar ajustar ajustes facil dificil cartas numero mayusculas tranquilo nino adulto afasia',
  'escena escenas lamina dibujo grande marcar zonas donde esta explora',
  'aire mano camara dedo gesto tocar sin tocar pizarra mediapipe',
  'imprimir papel tarjetas bingo cartones compartir pasar companera exportar importar archivo',
  'perfil perfiles informe progreso resultados medir aciertos evolucion paciente codigo registro',
  'guardar guarda datos privacidad borrar aparato navegador movil',
  'copia seguridad backup perder perdido recuperar pacientes nube online tablet cambiar',
  'picto pictos pictograma pictogramas banco dibujos arasaac imagenes'
];
function norm(t) { return String(t).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9ñ ]/g, ' '); }
function busca(t) {
  var w = norm(t).split(/\s+/).filter(function (x) { return x.length > 2 && !/^(como|que|quiero|para|una|uno|los|las|del|con|puedo|hago|hacer|esto|eso|mis|tus|por|donde|cuando|cual)$/.test(x); });
  var r = PREG.map(function (p, i) {
    var k = (CLAVES[i] + ' ' + norm(p[0])).split(/\s+/), n = 0;
    w.forEach(function (x) { if (k.some(function (y) { return y.length > 2 && (y.indexOf(x) === 0 || x.indexOf(y) === 0); })) n++; });
    return [n, i];
  }).filter(function (x) { return x[0] > 0; }).sort(function (a, b) { return b[0] - a[0]; });
  return r.slice(0, 2).map(function (x) { return x[1]; });
}

var css = document.createElement('style');
css.textContent =
  '#ayudaBtn{position:fixed;right:14px;bottom:78px;z-index:70;background:var(--oro);color:var(--noche);border:3px solid var(--noche);border-radius:999px;padding:10px 16px;font-weight:900;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,.25);min-height:52px;font-size:16px}' +
  '#juego:not(.oculto)~#ayudaBtn{display:none}' +
  '.ay-l{display:grid;gap:10px}' +
  '.ay-v{display:flex;gap:12px;align-items:center;text-align:left;background:#fff;border:2px solid #e6dcc8;border-radius:14px;padding:8px;cursor:pointer;font:inherit;color:var(--noche);min-height:72px}' +
  '.ay-v:hover,.ay-v:focus-visible{border-color:var(--oro)}' +
  '.ay-v .mini{width:54px;height:72px;border-radius:10px;background:#0E3524 center/cover;flex:none;position:relative}' +
  '.ay-v .mini:after{content:"▶";position:absolute;inset:0;display:grid;place-items:center;color:#fff;font-size:20px;text-shadow:0 1px 4px #000}' +
  '.ay-v b{display:block;font-size:16px}.ay-v span{font-size:14px;opacity:.8}' +
  '.ay-p{background:#fff;border:2px solid #e6dcc8;border-radius:14px;margin:0}' +
  '.ay-p summary{cursor:pointer;font-weight:800;padding:12px 14px;min-height:48px;display:flex;align-items:center}' +
  '.ay-p p{margin:0;padding:0 14px 12px}' +
  '#verVideo .panel{max-width:none;width:auto;padding:12px;background:#0E3524;border-color:var(--oro)}' +
  '#verVideo iframe{display:block;height:min(84vh,calc((100vw - 48px)*16/9));aspect-ratio:9/16;width:auto;max-width:calc(100vw - 48px);border:0;border-radius:12px}' +
  '#verVideo .vt{color:#fff;font-weight:800;margin:0 0 8px;display:flex;justify-content:space-between;gap:10px;align-items:center}' +
  '.como{margin-left:8px;vertical-align:middle}' +
  '#ayuda .panel{padding:0;overflow:hidden;display:flex;flex-direction:column}' +
  '#ayuda .ay-cab{background:var(--noche);color:#fff;padding:12px 16px;display:flex;justify-content:space-between;align-items:center;gap:10px}' +
  '#ayuda .ay-cab h2{margin:0;color:#fff;font-size:22px}' +
  '#ayuda .ay-cuerpo{padding:12px 16px;overflow:auto;flex:1}' +
  '.ay-chat{display:grid;gap:10px}' +
  '.bur{max-width:88%;padding:10px 14px;border-radius:16px;line-height:1.4}' +
  '.bur.el{background:#fff;border:2px solid #e6dcc8;justify-self:start;border-bottom-left-radius:4px}' +
  '.bur.yo{background:var(--noche);color:#fff;justify-self:end;border-bottom-right-radius:4px}' +
  '.bur .sug{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}' +
  '.bur .sug button{background:var(--crema);border:2px solid var(--noche);border-radius:999px;padding:6px 12px;font:inherit;font-weight:700;cursor:pointer;color:var(--noche);min-height:40px}' +
  '.ay-esc{display:flex;gap:8px;padding:10px 16px;border-top:2px solid #e6dcc8;background:#fff}' +
  '.ay-esc input{flex:1;font:inherit;padding:10px 14px;border:2px solid #cfc3aa;border-radius:999px;min-height:46px}' +
  '.ay-esc button{border-radius:999px;min-width:52px}';
document.head.appendChild(css);

function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

var m = document.createElement('div'); m.id = 'ayuda'; m.className = 'modal oculto';
m.innerHTML = '<div class="panel" style="max-width:560px;height:min(86vh,720px)" role="dialog" aria-label="Ayuda">' +
  '<div class="ay-cab"><h2>? ¿Cómo se hace?</h2><button class="btn sec peq" type="button" data-cierra>✕</button></div>' +
  '<div class="ay-cuerpo"><div class="pest" style="margin-bottom:10px"><button class="chip" data-ap="pre" aria-pressed="true" type="button">Preguntas</button><button class="chip" data-ap="vid" aria-pressed="false" type="button">▶ Vídeos</button></div>' +
  '<div data-app="pre"><div class="ay-chat" id="ayChat"></div></div>' +
  '<div data-app="vid" class="oculto"><p class="nota" style="margin:0 0 10px">Seis vídeos de un minuto. Empieza por el 1.</p><div class="ay-l">' +
  VIDEOS.map(function (v, i) { return '<button class="ay-v" type="button" data-video="' + (i + 1) + '"><span class="mini" style="background-image:url(https://i.ytimg.com/vi/' + v[0] + '/hqdefault.jpg)"></span><span><b>' + (i + 1) + '. ' + esc(v[1]) + '</b><span>' + esc(v[2]) + '</span></span></button>'; }).join('') +
  '</div></div></div>' +
  '<form class="ay-esc" id="ayForm" data-app="pre"><input id="ayIn" type="text" autocomplete="off" placeholder="Escribe tu duda…" aria-label="Escribe tu duda"><button class="btn oro" type="submit" aria-label="Preguntar">➤</button></form>' +
  '<p class="nota" style="margin:0;padding:6px 16px 10px;background:#fff">Respuestas ya escritas. Solo sale de tu aparato lo que tú decides enviar al equipo. No escribas nombres.</p>' +
  '</div>';
document.body.appendChild(m);

var vv = document.createElement('div'); vv.id = 'verVideo'; vv.className = 'modal oculto';
vv.innerHTML = '<div class="panel" role="dialog" aria-label="Vídeo"><p class="vt"><span id="vvT"></span><button class="btn sec peq" type="button" data-cierra>✕ Cerrar</button></p><div id="vvC"></div></div>';
document.body.appendChild(vv);

var b = document.createElement('button'); b.id = 'ayudaBtn'; b.type = 'button'; b.textContent = '? Ayuda';
var abeja = document.getElementById('abeja');
abeja.parentNode.insertBefore(b, abeja);

function pestana(p) {
  m.querySelectorAll('[data-ap]').forEach(function (x) { x.setAttribute('aria-pressed', String(x.dataset.ap === p)); });
  m.querySelectorAll('[data-app]').forEach(function (x) { x.classList.toggle('oculto', x.dataset.app !== p); }); if (p === 'pre') setTimeout(function () { try { document.getElementById('ayIn').focus(); } catch (e) {} }, 50);
}
function abre(p) { saluda(); pestana(p || 'pre'); m.classList.remove('oculto'); try { FV.cuenta('ayuda'); } catch (e) {} }
function video(n) {
  var v = VIDEOS[n - 1]; if (!v) return;
  m.classList.add('oculto');
  document.getElementById('vvT').textContent = n + '. ' + v[1];
  document.getElementById('vvC').innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + v[0] + '?autoplay=1&rel=0&playsinline=1&modestbranding=1" title="' + esc(v[1]) + '" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>';
  vv.classList.remove('oculto');
  try { FV.cuenta('tuto_' + n); } catch (e) {}
}
function cierraVideo() { vv.classList.add('oculto'); document.getElementById('vvC').innerHTML = ''; }
var chat = null;
function sug(lista) { return '<div class="sug">' + lista.map(function (i) { return '<button type="button" data-q="' + i + '">' + esc(PREG[i][0]) + '</button>'; }).join('') + '</div>'; }
function burbuja(cl, html) { var d = document.createElement('div'); d.className = 'bur ' + cl; d.innerHTML = html; chat.appendChild(d); d.scrollIntoView({ block: 'end' }); }
function saluda() { chat = document.getElementById('ayChat'); if (chat.childNodes.length) return; burbuja('el', 'Hola. Soy la ayuda de Fichas vivas. Escribe tu duda con tus palabras o toca una de estas:' + sug([0, 1, 2, 3, 7, 9])); }
function responde(i, visible) {
  var p = PREG[i]; burbuja('yo', esc(visible || p[0]));
  burbuja('el', esc(p[1]) + (p[2] ? '<div class="sug"><button type="button" data-video="' + p[2] + '">▶ Ver el vídeo</button></div>' : ''));
}
document.getElementById('ayForm').addEventListener('submit', function (e) {
  e.preventDefault(); var inp = document.getElementById('ayIn'), t = inp.value.trim(); if (!t) return; inp.value = '';
  var r = busca(t);
  if (r.length) { responde(r[0], t); if (r[1] != null) burbuja('el', 'Quizá también te sirve:' + sug([r[1]])); }
  else { burbuja('yo', esc(t)); var bd = 'd' + Date.now(); window.__ayDudas = window.__ayDudas || {}; window.__ayDudas[bd] = t; burbuja('el', 'Esa no la tengo escrita todavía. Si quieres, se la mando al equipo y te la contestamos:<div class="sug"><button type="button" data-envia="' + bd + '">🐝 Enviar esta duda al equipo</button></div>Mientras, mira si es alguna de estas:' + sug([0, 1, 3, 7])); }
  try { FV.cuenta('ayuda_' + (r.length ? 'q' + r[0] : 'sin')); } catch (x) {}
});
FV.ayuda = abre; FV.video = video;

b.addEventListener('click', function () { abre('pre'); });
document.addEventListener('click', function (e) {
  var t = e.target.closest ? e.target : null; if (!t) return;
  var ap = t.closest('[data-ap]'); if (ap) { pestana(ap.dataset.ap); return; }
  var q = t.closest('#ayuda [data-q]'); if (q) { responde(+q.dataset.q); return; }
  var en = t.closest('#ayuda [data-envia]'); if (en && !en.disabled) { en.disabled = true; en.textContent = 'Enviando…'; FV.enviaBuzon('duda de la ayuda', (window.__ayDudas || {})[en.dataset.envia] || '', '', function (bien) { en.textContent = bien ? '✓ Enviada al equipo' : 'Sin conexión: se enviará sola'; }); return; }
  var dv = t.closest('[data-video]'); if (dv) { e.preventDefault(); video(+dv.dataset.video); return; }
  if (t.closest('[data-ayuda]')) { e.preventDefault(); abre('vid'); return; }
  if (t.closest('#ayuda [data-cierra]') || t === m) { m.classList.add('oculto'); return; }
  if (t.closest('#verVideo [data-cierra]') || t === vv) { cierraVideo(); }
});
document.addEventListener('keydown', function (e) {
  if (e.key !== 'Escape') return;
  if (!vv.classList.contains('oculto')) cierraVideo(); else m.classList.add('oculto');
});
})();
