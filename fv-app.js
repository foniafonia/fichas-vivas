/* Fichas vivas · núcleo: material, cortador, editor, biblioteca, voz, registro,
   impresión, contadores, abeja de mejoras y puente a ColmenIA.
   Sin servidor: todo se guarda en el navegador (IndexedDB). Sin claves. */
(function () {
'use strict';
var FV = window.FV = {};
function $(id) { return document.getElementById(id); }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function baraja(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
FV.$ = $; FV.esc = esc; FV.baraja = baraja; FV.uid = uid;

/* ===================== Contadores (abacus) ===================== */
var Q = new URLSearchParams(location.search);
var CANAL = (Q.get('c') || '').replace(/[^a-z]/gi, '').slice(0, 6).toLowerCase();
var NO_CONTAR = Q.get('yo') === '1';
try { if (NO_CONTAR) localStorage.setItem('fv-no-contar', '1'); if (localStorage.getItem('fv-no-contar')) NO_CONTAR = true; } catch (e) {}
var CB = 'https://abacus.jasoncameron.dev/hit/foniafonia-fichas/';
function cuenta(k) {
  if (NO_CONTAR) return;
  k = String(k).toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 60);
  try { new Image().src = CB + 'fv_' + k; if (CANAL && /^(aperturas|personas|skool|juego_)/.test(k)) new Image().src = CB + 'fv_c_' + CANAL + '_' + k; } catch (e) {}
}
FV.cuenta = cuenta;
cuenta('aperturas');
try { if (!localStorage.getItem('fv-visto')) { localStorage.setItem('fv-visto', '1'); cuenta('personas'); } } catch (e) {}

/* ===================== Puente a ColmenIA ===================== */
var SK = 'https://www.skool.com/logopedia-7339/about';
function puentes(raiz) {
  (raiz || document).querySelectorAll('a[data-sk]').forEach(function (a) {
    if (a.dataset.skOk) return; a.dataset.skOk = '1'; a.href = SK;
    a.addEventListener('click', function () { cuenta('skool'); cuenta('skool_' + a.getAttribute('data-sk')); });
  });
}
FV.puentes = puentes; puentes();

/* ===================== Ajustes ===================== */
var AJ_DEF = { n: 4, r: 8, ver: 'img', letra: 'mayus', tam: 'm', vel: 9, voz: true, art: true, tranq: true, son: true, sec: 1, dwell: 10 };
var AJ = {};
try { AJ = JSON.parse(localStorage.getItem('fv-ajustes') || '{}') || {}; } catch (e) { AJ = {}; }
Object.keys(AJ_DEF).forEach(function (k) { if (AJ[k] === undefined) AJ[k] = AJ_DEF[k]; });
FV.aj = AJ;
var MAPA_AJ = { aN: 'n', aR: 'r', aVer: 'ver', aLetra: 'letra', aTam: 'tam', aVel: 'vel', aVoz: 'voz', aArt: 'art', aTranq: 'tranq', aSon: 'son', aSec: 'sec', aDwell: 'dwell' };
function pintaAj() {
  Object.keys(MAPA_AJ).forEach(function (id) { var e = $(id), k = MAPA_AJ[id]; if (!e) return; if (e.type === 'checkbox') e.checked = !!AJ[k]; else e.value = AJ[k]; });
  $('aNv').textContent = AJ.n + ' cartas'; $('aRv').textContent = AJ.r + ' rondas';
  $('aVelv').textContent = (AJ.vel / 10).toFixed(1) + '×'; $('aDwellv').textContent = (AJ.dwell / 10).toFixed(1) + ' s quieta la mano';
}
FV.pintaAj = pintaAj;
Object.keys(MAPA_AJ).forEach(function (id) {
  var e = $(id); if (!e) return;
  e.addEventListener(e.type === 'range' ? 'input' : 'change', function () {
    var k = MAPA_AJ[id];
    AJ[k] = e.type === 'checkbox' ? e.checked : (e.tagName === 'SELECT' && isNaN(+e.value) ? e.value : +e.value);
    try { localStorage.setItem('fv-ajustes', JSON.stringify(AJ)); } catch (er) {}
    pintaAj(); if (FV.aireDwell) FV.aireDwell(AJ.dwell * 100);
  });
});
pintaAj();

/* ===================== Texto de cartas ===================== */
FV.textoCarta = function (c) {
  var t = c.texto || '';
  if (AJ.letra === 'mayus') return t.toLocaleUpperCase('es');
  if (AJ.letra === 'minus') return t.toLocaleLowerCase('es');
  return t;
};
FV.dicho = function (c, conArt) {
  var t = (c.texto || '').toLocaleLowerCase('es');
  return (conArt && c.art ? c.art + ' ' : '') + t;
};
function adivinaArt(t) {
  var w = String(t || '').toLowerCase().trim().split(' ')[0];
  if (!w) return '';
  if (/as$/.test(w)) return 'las';
  if (/os$/.test(w)) return 'los';
  if (/(a|ión|dad|tud)$/.test(w)) return 'la';
  return 'el';
}
FV.adivinaArt = adivinaArt;

/* ===================== Voz ===================== */
var audio = new Audio(); audio.preload = 'auto';
var cola = [], hablando = false, finCola = null, vozNav = null;
function buscaVoz() {
  try {
    var vs = speechSynthesis.getVoices() || [];
    vozNav = vs.filter(function (v) { return /ximena/i.test(v.name); })[0] ||
      vs.filter(function (v) { return /^es[-_]ES/i.test(v.lang); })[0] ||
      vs.filter(function (v) { return /^es/i.test(v.lang); })[0] || null;
  } catch (e) {}
}
if ('speechSynthesis' in window) { buscaVoz(); try { speechSynthesis.onvoiceschanged = buscaVoz; } catch (e) {} }
function callar() {
  cola = []; hablando = false; finCola = null;
  try { audio.pause(); audio.onended = null; audio.onerror = null; } catch (e) {}
  try { if ('speechSynthesis' in window) speechSynthesis.cancel(); } catch (e) {}
}
FV.callar = callar;
function siguiente() {
  if (!cola.length) { hablando = false; var f = finCola; finCola = null; if (f) setTimeout(f, 60); return; }
  hablando = true;
  var p = cola.shift(), hecho = false;
  function sig() { if (hecho) return; hecho = true; setTimeout(siguiente, 90); }
  if (p.audio) {
    try {
      audio.onended = sig; audio.onerror = function () { if (p.texto) { cola.unshift({ texto: p.texto }); } sig(); };
      audio.src = p.audio; audio.playbackRate = Math.max(.6, Math.min(1.2, AJ.vel / 10 + .1));
      var pr = audio.play(); if (pr && pr.catch) pr.catch(function () { if (p.texto) cola.unshift({ texto: p.texto }); sig(); });
    } catch (e) { sig(); }
    setTimeout(sig, 8000);
  } else if (p.texto && 'speechSynthesis' in window) {
    try {
      var u = new SpeechSynthesisUtterance(p.texto); u.lang = 'es-ES'; if (vozNav) u.voice = vozNav;
      u.rate = AJ.vel / 10; u.onend = sig; u.onerror = sig; speechSynthesis.speak(u);
      setTimeout(sig, 1500 + p.texto.length * 120);
    } catch (e) { sig(); }
  } else sig();
}
/* habla([piezas], alTerminar). Pieza: {audio, texto} */
FV.habla = function (piezas, alFin) {
  callar();
  if (!AJ.voz) { if (alFin) setTimeout(alFin, 200); return; }
  cola = (piezas || []).filter(Boolean); finCola = alFin || null; siguiente();
};
FV.frase = function (k) { return { audio: 'demo/voz/f-' + k + '.mp3', texto: (window.FV_FRASES && FV_FRASES[k] || '').replace('…', '') }; };
/* tipo: 'w' palabra, 'q' ¿dónde está?, 's' primera sílaba */
FV.vozCarta = function (c, tipo) {
  var art = AJ.art, t = FV.dicho(c, art);
  if (tipo === 's') { var s = fvPrimeraSilaba(c.texto); return c.voz ? { audio: c.voz + '-s.mp3', texto: s } : { texto: s }; }
  if (tipo === 'q') {
    if (c.voz) return [{ audio: c.voz + '-q.mp3', texto: '¿Dónde está ' + FV.dicho(c, true) + '?' }];
    if (c.audio) return [FV.frase('donde'), { audio: c.audio }];
    var pl = c.art === 'los' || c.art === 'las';
    return [{ texto: '¿Dónde ' + (pl ? 'están ' : 'está ') + FV.dicho(c, true) + '?' }];
  }
  if (c.audio) return { audio: c.audio };
  if (c.voz) return { audio: c.voz + (art ? '-a' : '') + '.mp3', texto: t };
  return { texto: t };
};
FV.dice = function (c, tipo, alFin) { var v = FV.vozCarta(c, tipo); FV.habla([].concat(v), alFin); };

/* sonidos de acierto (Web Audio, sin archivos) */
var ctxA = null;
FV.suena = function (tipo) {
  if (!AJ.son) return;
  try {
    ctxA = ctxA || new (window.AudioContext || window.webkitAudioContext)();
    var notas = tipo === 'fin' ? [523, 659, 784, 1047] : tipo === 'bien' ? [660, 880] : [330];
    notas.forEach(function (f, i) {
      var o = ctxA.createOscillator(), g = ctxA.createGain(), t0 = ctxA.currentTime + i * .11;
      o.type = 'sine'; o.frequency.value = f; g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(tipo === 'mal' ? .05 : .16, t0 + .02); g.gain.exponentialRampToValueAtTime(0.0001, t0 + .22);
      o.connect(g); g.connect(ctxA.destination); o.start(t0); o.stop(t0 + .25);
    });
  } catch (e) {}
};
FV.confeti = function () {
  if (AJ.tranq || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) return;
  var cs = ['#F2B33D', '#2FA866', '#0E3524', '#D9534F', '#5BB0E0'];
  for (var i = 0; i < 28; i++) {
    var d = document.createElement('div'); d.className = 'confeti';
    d.style.left = Math.random() * 100 + 'vw'; d.style.background = cs[i % cs.length]; d.style.animationDelay = (Math.random() * .5) + 's';
    document.body.appendChild(d); setTimeout(function (x) { return function () { x.remove(); }; }(d), 2300);
  }
};

/* ===================== Material de ejemplo ===================== */
function setDemo(def) {
  var s = { id: def.id, titulo: def.titulo, demo: true, cartas: [], escenas: [] };
  def.partes.forEach(function (p) {
    var inf = FV_DEMO_INFO[p], pref = inf.p, apag = inf.apagadas || [];
    FV_DEMO_PAL[p].forEach(function (x, i) {
      var n = (i < 10 ? '0' : '') + i;
      s.cartas.push({ id: pref + n, img: 'demo/' + p + '-img-' + n + '.webp', pimg: 'demo/' + p + '-pal-' + n + '.webp', texto: x[0], art: x[1], cat: inf.cat, activa: apag.indexOf(i) < 0, voz: 'demo/voz/' + pref + n });
    });
    if (inf.esc && FV_DEMO_ZONAS[p]) s.escenas.push({ id: 'esc-' + p, img: 'demo/' + inf.esc + '.webp', titulo: inf.tesc,
      zonas: FV_DEMO_ZONAS[p].map(function (z) { return { c: pref + ((z[0] < 10 ? '0' : '') + z[0]), x: z[1], y: z[2], w: z[3], h: z[4] }; }) });
  });
  return s;
}
FV.demos = FV_DEMOS;
FV.set = null;
FV.cartas = function () { return FV.set ? FV.set.cartas.filter(function (c) { return c.activa !== false && (c.img || c.pimg || c.texto); }) : []; };

/* ===================== IndexedDB ===================== */
var db = null, dbCola = [];
try {
  var rq = indexedDB.open('fichas-vivas', 1);
  rq.onupgradeneeded = function () { rq.result.createObjectStore('sets', { keyPath: 'id' }); };
  rq.onsuccess = function () { db = rq.result; dbCola.forEach(function (f) { f(); }); dbCola = []; };
  rq.onerror = function () { db = false; dbCola.forEach(function (f) { f(); }); };
} catch (e) { db = false; }
function conDb(f) { if (db === null) dbCola.push(f); else f(); }
var memoria = {};
FV.guarda = function (s, cb) {
  s.mod = Date.now();
  conDb(function () {
    if (!db) { memoria[s.id] = JSON.parse(JSON.stringify(s)); if (cb) cb(true, 'solo mientras esté abierta la página'); return; }
    try { var tx = db.transaction('sets', 'readwrite'); tx.objectStore('sets').put(JSON.parse(JSON.stringify(s))); tx.oncomplete = function () { if (cb) cb(true); }; tx.onerror = function () { if (cb) cb(false); }; } catch (e) { if (cb) cb(false); }
  });
};
FV.lista = function (cb) {
  conDb(function () {
    if (!db) { cb(Object.keys(memoria).map(function (k) { return memoria[k]; })); return; }
    try { var r = db.transaction('sets').objectStore('sets').getAll(); r.onsuccess = function () { cb(r.result || []); }; r.onerror = function () { cb([]); }; } catch (e) { cb([]); }
  });
};
FV.borra = function (id, cb) {
  conDb(function () {
    if (!db) { delete memoria[id]; if (cb) cb(); return; }
    try { var tx = db.transaction('sets', 'readwrite'); tx.objectStore('sets').delete(id); tx.oncomplete = function () { if (cb) cb(); }; } catch (e) { if (cb) cb(); }
  });
};

/* ===================== Navegación ===================== */
var VISTAS = ['inicio', 'juegos', 'editar', 'biblioteca'];
FV.ir = function (v) {
  if (v === 'subir') { nuevoSet(); v = 'editar'; }
  VISTAS.forEach(function (x) { $('v-' + x).classList.toggle('oculto', x !== v); });
  if (v === 'juegos') pintaJuegos();
  if (v === 'editar') pintaEditor();
  if (v === 'biblioteca') pintaBiblioteca();
  window.scrollTo(0, 0);
};
document.querySelectorAll('[data-ir]').forEach(function (b) { b.addEventListener('click', function () { FV.ir(b.dataset.ir); }); });
function abreSet(s, vista) { FV.set = s; cuenta('abre_' + (s.demo ? s.id.replace(/-/g, '_') : 'propio')); FV.ir(vista || 'juegos'); }
FV.abreSet = abreSet;
/* La caja de una escena mide exactamente lo que el dibujo (para que las zonas caigan encima). */
FV.ajustaEscena = function (w, altoMax) {
  var im = w && w.querySelector('img'); if (!im) return;
  function hazlo() { if (!im.naturalWidth || !w.isConnected) return; var r = im.naturalWidth / im.naturalHeight, padre = w.parentNode.getBoundingClientRect().width || window.innerWidth, W = Math.min(padre, window.innerWidth * .96, 1100), H = window.innerHeight * (altoMax || .72), ancho = Math.min(W, H * r); w.style.width = Math.floor(ancho) + 'px'; im.style.width = '100%'; im.style.height = 'auto'; im.style.maxHeight = 'none'; }
  if (im.complete) hazlo(); else im.addEventListener('load', hazlo);
  if (!w._fvRes) { w._fvRes = 1; var t; window.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(hazlo, 120); }); }
};
function nuevoSet() { FV.set = { id: 'fv-' + uid(), titulo: 'Mi material', cartas: [], escenas: [], creado: Date.now() }; cuenta('material_nuevo'); }

/* ===================== Portada ===================== */
(function () {
  var mu = $('muestra'); ['m01', 'a04', 'm13', 'a10', 'm09', 'a02'].forEach(function (id) {
    var h = id[0] === 'm' ? 'masc' : 'aseo'; var i = document.createElement('img'); i.src = 'demo/' + h + '-img-' + id.slice(1) + '.webp'; i.alt = ''; mu.appendChild(i);
  });
  $('demos').innerHTML = FV_DEMOS.map(function (d) {
    return '<div class="caja"><b style="font-size:20px">' + esc(d.titulo) + '</b><p class="nota" style="margin:4px 0 10px">' + esc(d.desc) + '</p><button class="btn" data-demo="' + d.id + '" type="button">▶ Jugar</button></div>';
  }).join('');
  $('demos').addEventListener('click', function (e) { var b = e.target.closest('[data-demo]'); if (!b) return; abreSet(setDemo(FV_DEMOS.filter(function (d) { return d.id === b.dataset.demo; })[0])); });
  $('probarDemo').addEventListener('click', function () { abreSet(setDemo(FV_DEMOS.filter(function (d) { return d.id === 'demo-todo'; })[0])); });
})();

/* ===================== Vista de juegos ===================== */
function pintaJuegos() {
  if (!FV.set) { FV.ir('inicio'); return; }
  var cs = FV.cartas(), cats = {};
  cs.forEach(function (c) { if (c.cat) cats[c.cat] = 1; });
  $('jTitulo').textContent = FV.set.titulo || 'Material';
  $('jResumen').textContent = cs.length + ' cartas' + (Object.keys(cats).length ? ' · categorías: ' + Object.keys(cats).join(', ') : '') + (FV.set.escenas.length ? ' · ' + FV.set.escenas.length + ' escena(s)' : '');
  var html = (FV.JUEGOS || []).map(function (j) {
    var falta = j.req ? j.req(FV.set, cs) : '';
    return '<button class="juego-t tocable" type="button" data-j="' + j.id + '"' + (falta ? ' aria-disabled="true" title="' + esc(falta) + '"' : '') + '><span class="ico">' + j.ico + '</span><b>' + esc(j.nombre) + '</b><span>' + esc(j.desc) + '</span><i>' + (falta ? '⚠ ' + esc(falta) : 'Trabaja: ' + esc(j.trabaja)) + '</i></button>';
  }).join('');
  $('listaJuegos').innerHTML = html;
  pintaRegistro();
}
$('listaJuegos').addEventListener('click', function (e) {
  var b = e.target.closest('[data-j]'); if (!b) return;
  if (b.getAttribute('aria-disabled') === 'true') { alert(b.title); return; }
  FV.empieza(b.dataset.j);
});
$('irEditar').addEventListener('click', function () { FV.ir('editar'); });
$('pantallaC').addEventListener('click', pantallaCompleta);
function pantallaCompleta() {
  try { if (document.fullscreenElement) document.exitFullscreen(); else (document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullscreen).call(document.documentElement); } catch (e) {}
}
FV.pantallaCompleta = pantallaCompleta;

/* ===================== Registro de sesión ===================== */
function leeReg() { try { return JSON.parse(localStorage.getItem('fv-registro') || '[]') || []; } catch (e) { return []; } }
FV.registra = function (r) {
  var a = leeReg(); r.fecha = new Date().toISOString(); r.material = FV.set ? FV.set.titulo : ''; a.push(r);
  try { localStorage.setItem('fv-registro', JSON.stringify(a.slice(-300))); } catch (e) {}
};
function pintaRegistro() {
  var a = leeReg().slice(-12).reverse();
  if (!a.length) { $('registro').textContent = 'Aún no hay partidas.'; return; }
  $('registro').innerHTML = '<table style="width:100%;border-collapse:collapse;font-size:15px"><tr><th align="left">Cuándo</th><th align="left">Juego</th><th>Aciertos</th><th>Intentos</th><th>Ayudas</th><th>Tiempo</th></tr>' +
    a.map(function (r) { var d = new Date(r.fecha); return '<tr><td>' + d.toLocaleDateString('es-ES') + ' ' + d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) + '</td><td>' + esc(r.juego) + '</td><td align="center">' + (r.aciertos != null ? r.aciertos : '—') + '</td><td align="center">' + (r.intentos != null ? r.intentos : '—') + '</td><td align="center">' + (r.ayudas || 0) + '</td><td align="center">' + Math.round((r.seg || 0)) + ' s</td></tr>'; }).join('') + '</table>';
}
FV.pintaRegistro = pintaRegistro;
$('regCsv').addEventListener('click', function () {
  var a = leeReg(); var l = ['fecha;material;juego;aciertos;intentos;ayudas;segundos;detalle'];
  a.forEach(function (r) { l.push([r.fecha, r.material, r.juego, r.aciertos, r.intentos, r.ayudas || 0, Math.round(r.seg || 0), (r.detalle || '').replace(/;/g, ',')].join(';')); });
  descarga('registro-fichas-vivas.csv', '﻿' + l.join('\n'), 'text/csv');
});
$('regBorra').addEventListener('click', function () { if (confirm('¿Borrar el registro de este aparato?')) { try { localStorage.removeItem('fv-registro'); } catch (e) {} pintaRegistro(); } });
function descarga(nombre, contenido, tipo) {
  var b = new Blob([contenido], { type: tipo }); var a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = nombre;
  document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
}

/* ===================== Imágenes: redimensionar ===================== */
function aDataURL(canvas) {
  var u = '';
  try { u = canvas.toDataURL('image/webp', .82); } catch (e) {}
  if (u.indexOf('data:image/webp') !== 0) u = canvas.toDataURL('image/jpeg', .86);
  return u;
}
function cargaImagen(file, max, cb) {
  if (!/^image\//.test(file.type)) { cb(null); return; }
  if (file.size > 25e6) { alert('La imagen es demasiado grande (más de 25 MB).'); cb(null); return; }
  var url = URL.createObjectURL(file), im = new Image();
  im.onload = function () {
    var k = Math.min(1, max / Math.max(im.naturalWidth, im.naturalHeight)), cv = document.createElement('canvas');
    cv.width = Math.round(im.naturalWidth * k); cv.height = Math.round(im.naturalHeight * k);
    var cx = cv.getContext('2d'); cx.fillStyle = '#fff'; cx.fillRect(0, 0, cv.width, cv.height); cx.drawImage(im, 0, 0, cv.width, cv.height);
    URL.revokeObjectURL(url); cb(cv);
  };
  im.onerror = function () { URL.revokeObjectURL(url); alert('No se ha podido abrir esa imagen.'); cb(null); };
  im.src = url;
}
function palabraDeArchivo(n) { return String(n).replace(/\.[a-z0-9]+$/i, '').replace(/[_\-]+/g, ' ').replace(/\d+/g, '').replace(/\s+/g, ' ').trim(); }

/* ===================== Editor ===================== */
var guardaT = null;
function marcaCambio() {
  if (FV.set.demo) {
    FV.set = JSON.parse(JSON.stringify(FV.set)); FV.set.demo = false; FV.set.id = 'fv-' + uid(); FV.set.titulo = FV.set.titulo + ' (mi copia)'; FV.set.creado = Date.now();
    $('edTitulo').value = FV.set.titulo;
  }
  clearTimeout(guardaT); $('edEstado').textContent = 'Guardando…';
  guardaT = setTimeout(function () { FV.guarda(FV.set, function (ok, nota) { $('edEstado').textContent = ok ? 'Guardado en este aparato' + (nota ? ' (' + nota + ')' : '') + '.' : 'No se ha podido guardar.'; }); }, 700);
}
function pintaEditor() {
  if (!FV.set) nuevoSet();
  $('edTitulo').value = FV.set.titulo || '';
  $('edEstado').textContent = FV.set.demo ? 'Es el ejemplo: si cambias algo, se guarda una copia tuya.' : '';
  var cats = {}; FV.set.cartas.forEach(function (c) { if (c.cat) cats[c.cat] = 1; });
  var dl = '<datalist id="dlCats">' + Object.keys(cats).map(function (k) { return '<option value="' + esc(k) + '">'; }).join('') + '</datalist>';
  $('edCartas').innerHTML = dl + (FV.set.cartas.length ? FV.set.cartas.map(function (c, i) {
    return '<div class="ed-carta' + (c.activa === false ? ' apagada' : '') + '" data-i="' + i + '">' +
      '<div class="ims">' + (c.img ? '<img src="' + esc(c.img) + '" alt="">' : '') + (c.pimg ? '<img src="' + esc(c.pimg) + '" alt="">' : '') + (!c.img && !c.pimg ? '<div class="nota" style="padding:20px 4px">Solo palabra</div>' : '') + '</div>' +
      '<div class="fila" style="gap:4px;flex-wrap:nowrap"><select data-k="art" aria-label="Artículo" style="min-height:36px;padding:3px;font-size:14px;width:64px">' + ['', 'el', 'la', 'los', 'las', 'un', 'una'].map(function (a) { return '<option' + (a === (c.art || '') ? ' selected' : '') + ' value="' + a + '">' + (a || '—') + '</option>'; }).join('') + '</select>' +
      '<input type="text" data-k="texto" value="' + esc(c.texto) + '" placeholder="palabra" aria-label="Palabra"></div>' +
      '<input type="text" data-k="cat" list="dlCats" value="' + esc(c.cat || '') + '" placeholder="categoría (opcional)" aria-label="Categoría">' +
      '<div class="mini"><button type="button" data-a="oir" title="Escuchar">🔊</button><button type="button" data-a="grabar" class="' + (c.audio ? 'hay' : '') + '" title="Grabar mi voz">🎤</button>' +
      (c.audio ? '<button type="button" data-a="quitaVoz" title="Quitar mi grabación">🎤✕</button>' : '') +
      '<button type="button" data-a="act" title="Usar o no en los juegos">' + (c.activa === false ? '🙈' : '👁') + '</button>' +
      '<button type="button" data-a="sube" title="Mover antes">◀</button><button type="button" data-a="baja" title="Mover después">▶</button>' +
      '<button type="button" data-a="borra" title="Quitar carta">🗑</button></div></div>';
  }).join('') : '<p class="nota">Aún no hay cartas. Sube una hoja o imágenes sueltas.</p>');
  $('edEscenas').innerHTML = FV.set.escenas.map(function (s, i) {
    return '<div class="caja"><img src="' + esc(s.img) + '" alt=""><b>' + esc(s.titulo || 'Escena ' + (i + 1)) + '</b><p class="nota">' + s.zonas.length + ' zonas marcadas</p><button class="btn peq" type="button" data-esc="' + i + '">Marcar zonas</button></div>';
  }).join('') || '<p class="nota">Sin escenas. Sube una lámina para jugar a «¿Dónde está?».</p>';
}
$('edTitulo').addEventListener('change', function () { FV.set.titulo = this.value.trim() || 'Mi material'; marcaCambio(); });
$('edCartas').addEventListener('change', function (e) {
  var k = e.target.dataset.k, box = e.target.closest('[data-i]'); if (!k || !box) return;
  var c = FV.set.cartas[+box.dataset.i];
  c[k] = e.target.value.trim(); if (k === 'texto') { delete c.voz; if (!c.art) { c.art = adivinaArt(c.texto); } }
  marcaCambio(); if (k === 'texto' || k === 'cat') pintaEditor();
});
var grabador = null, grabandoI = -1;
$('edCartas').addEventListener('click', function (e) {
  var b = e.target.closest('[data-a]'), box = e.target.closest('[data-i]'); if (!b || !box) return;
  var i = +box.dataset.i, c = FV.set.cartas[i], a = b.dataset.a, L = FV.set.cartas;
  if (a === 'oir') { FV.dice(c, 'w'); return; }
  if (a === 'act') { c.activa = c.activa === false; }
  if (a === 'borra') { if (!confirm('¿Quitar esta carta?')) return; L.splice(i, 1); }
  if (a === 'sube' && i > 0) { L.splice(i - 1, 0, L.splice(i, 1)[0]); }
  if (a === 'baja' && i < L.length - 1) { L.splice(i + 1, 0, L.splice(i, 1)[0]); }
  if (a === 'quitaVoz') { delete c.audio; }
  if (a === 'grabar') { graba(i, b); return; }
  marcaCambio(); pintaEditor();
});
function graba(i, boton) {
  if (grabador && grabandoI === i) { grabador.stop(); return; }
  if (grabador) return;
  if (!navigator.mediaDevices || !window.MediaRecorder) { alert('Este navegador no permite grabar. Prueba con Chrome, Edge o Safari actualizados.'); return; }
  navigator.mediaDevices.getUserMedia({ audio: true }).then(function (st) {
    var trozos = [], mr; try { mr = new MediaRecorder(st); } catch (e) { st.getTracks().forEach(function (t) { t.stop(); }); alert('No se ha podido grabar.'); return; }
    grabador = mr; grabandoI = i; boton.classList.add('on'); boton.textContent = '⏹';
    var tope = setTimeout(function () { if (mr.state !== 'inactive') mr.stop(); }, 6000);
    mr.ondataavailable = function (ev) { if (ev.data && ev.data.size) trozos.push(ev.data); };
    mr.onstop = function () {
      clearTimeout(tope); st.getTracks().forEach(function (t) { t.stop(); });
      var bl = new Blob(trozos, { type: mr.mimeType || 'audio/webm' }), fr = new FileReader();
      fr.onload = function () { FV.set.cartas[i].audio = fr.result; grabador = null; grabandoI = -1; marcaCambio(); pintaEditor(); cuenta('voz_grabada'); };
      fr.readAsDataURL(bl);
    };
    mr.start();
  }).catch(function () { alert('Sin permiso para el micrófono.'); });
}
$('edGuardar').addEventListener('click', function () { if (FV.set.demo) marcaCambio(); else { FV.guarda(FV.set, function (ok) { $('edEstado').textContent = ok ? 'Guardado en este aparato.' : 'No se ha podido guardar.'; }); } });
$('edJugar').addEventListener('click', function () { if (!FV.cartas().length) { alert('Añade al menos dos cartas para jugar.'); return; } FV.ir('juegos'); });
$('edExportar').addEventListener('click', function () { exporta(FV.set); });
$('edEscenas').addEventListener('click', function (e) { var b = e.target.closest('[data-esc]'); if (b) abreZonas(+b.dataset.esc); });
$('edSoloPal').addEventListener('click', function () {
  var t = prompt('Escribe las palabras separadas por comas:', ''); if (!t) return;
  t.split(/[,\n;]/).map(function (x) { return x.trim(); }).filter(Boolean).forEach(function (w) { FV.set.cartas.push({ id: uid(), texto: w, art: adivinaArt(w), activa: true }); });
  marcaCambio(); pintaEditor();
});
$('fSueltas').addEventListener('change', function () { anadeSueltas([].slice.call(this.files)); this.value = ''; });
$('fFoto').addEventListener('change', function () { anadeSueltas([].slice.call(this.files)); this.value = ''; });
function anadeSueltas(fs) {
  var n = 0; fs = fs.slice(0, 60);
  (function sig() {
    if (n >= fs.length) { marcaCambio(); pintaEditor(); cuenta('material_sueltas'); return; }
    var f = fs[n++];
    cargaImagen(f, 480, function (cv) { if (cv) { var w = palabraDeArchivo(f.name); if (/^(img|image|dsc|whatsapp|foto|photo|captura|screenshot|pxl|imagen)\b/i.test(w)) w = ''; FV.set.cartas.push({ id: uid(), img: aDataURL(cv), texto: w, art: adivinaArt(w), activa: true }); } sig(); });
  })();
}
$('fEscena').addEventListener('change', function () {
  var f = this.files[0]; this.value = ''; if (!f) return;
  cargaImagen(f, 1600, function (cv) { if (!cv) return; FV.set.escenas.push({ id: uid(), img: aDataURL(cv), titulo: palabraDeArchivo(f.name) || 'Escena', zonas: [] }); marcaCambio(); pintaEditor(); cuenta('escena_subida'); abreZonas(FV.set.escenas.length - 1); });
});

/* ===================== Exportar / importar ===================== */
function exporta(s) {
  var limpio = JSON.parse(JSON.stringify(s)); delete limpio.demo;
  descarga((s.titulo || 'material').replace(/[^a-z0-9áéíóúñü ]/gi, '').trim().replace(/ +/g, '-') + '.fichas.json', JSON.stringify({ fv: 1, set: limpio }), 'application/json');
  cuenta('exportar');
}
function valida(o) {
  if (!o || o.fv !== 1 || !o.set || !Array.isArray(o.set.cartas)) return null;
  var okImg = function (u) { return typeof u === 'string' && (/^data:image\/(png|jpe?g|webp|gif);base64,/.test(u) || /^demo\/[a-z0-9\-]+\.webp$/.test(u)) ? u : undefined; };
  var okAud = function (u) { return typeof u === 'string' && /^data:audio\/[a-z0-9.+;=\-]+;base64,/.test(u) ? u : undefined; };
  var okVoz = function (u) { return typeof u === 'string' && /^demo\/voz\/[a-z]\d\d$/.test(u) ? u : undefined; };
  var txt = function (t, n) { return String(t == null ? '' : t).slice(0, n || 80); };
  var s = { id: 'fv-' + uid(), titulo: txt(o.set.titulo, 60) || 'Material importado', creado: Date.now(), cartas: [], escenas: [] };
  o.set.cartas.slice(0, 300).forEach(function (c) { s.cartas.push({ id: txt(c.id, 30) || uid(), img: okImg(c.img), pimg: okImg(c.pimg), texto: txt(c.texto), art: ['', 'el', 'la', 'los', 'las', 'un', 'una'].indexOf(c.art) > -1 ? c.art : '', cat: txt(c.cat, 40), activa: c.activa !== false, audio: okAud(c.audio), voz: okVoz(c.voz) }); });
  (o.set.escenas || []).slice(0, 20).forEach(function (e) {
    var img = okImg(e.img); if (!img && typeof e.img === 'string' && /^demo\/escena-[a-z]+\.webp$/.test(e.img)) img = e.img; if (!img) return;
    s.escenas.push({ id: uid(), img: img, titulo: txt(e.titulo, 60), zonas: (e.zonas || []).slice(0, 200).map(function (z) { return { c: txt(z.c, 30), x: +z.x || 0, y: +z.y || 0, w: +z.w || 0, h: +z.h || 0 }; }) });
  });
  return s;
}
$('fImportar').addEventListener('change', function () {
  var f = this.files[0]; this.value = ''; if (!f) return;
  if (f.size > 60e6) { alert('El archivo es demasiado grande.'); return; }
  var fr = new FileReader(); fr.onload = function () {
    var s = null; try { s = valida(JSON.parse(fr.result)); } catch (e) {}
    if (!s) { alert('Ese archivo no es un material de Fichas vivas.'); return; }
    FV.guarda(s, function () { cuenta('importar'); pintaBiblioteca(); });
  }; fr.readAsText(f);
});

/* ===================== Biblioteca ===================== */
function pintaBiblioteca() {
  FV.lista(function (L) {
    L.sort(function (a, b) { return (b.mod || 0) - (a.mod || 0); });
    $('libVacia').classList.toggle('oculto', L.length > 0);
    $('libLista').innerHTML = L.map(function (s) {
      var p = (s.cartas.filter(function (c) { return c.img || c.pimg; })[0] || {});
      return '<div class="caja" data-id="' + esc(s.id) + '">' + (p.img || p.pimg ? '<img src="' + esc(p.img || p.pimg) + '" alt="">' : '') + '<b>' + esc(s.titulo) + '</b><p class="nota">' + s.cartas.length + ' cartas · ' + s.escenas.length + ' escenas</p>' +
        '<div class="fila"><button class="btn peq" data-l="jugar" type="button">▶ Jugar</button><button class="btn sec peq" data-l="editar" type="button">✏</button><button class="btn sec peq" data-l="exportar" type="button">⬇</button><button class="btn sec peq" data-l="borrar" type="button">🗑</button></div></div>';
    }).join('');
    $('libLista').onclick = function (e) {
      var b = e.target.closest('[data-l]'), box = e.target.closest('[data-id]'); if (!b || !box) return;
      var s = L.filter(function (x) { return x.id === box.dataset.id; })[0]; if (!s) return;
      if (b.dataset.l === 'jugar') abreSet(s); else if (b.dataset.l === 'editar') abreSet(s, 'editar'); else if (b.dataset.l === 'exportar') exporta(s);
      else if (confirm('¿Borrar «' + s.titulo + '» de este aparato? No se puede deshacer.')) FV.borra(s.id, pintaBiblioteca);
    };
  });
}

/* ===================== Cortador de hojas ===================== */
var fuente = null, lineasX = [], lineasY = [], candX = [], candY = [], pdfDoc = null;
$('fHoja').addEventListener('change', function () {
  var f = this.files[0]; this.value = ''; if (!f) return;
  $('cortePdf').innerHTML = ''; pdfDoc = null;
  if (f.type === 'application/pdf' || /\.pdf$/i.test(f.name)) abrePdf(f);
  else cargaImagen(f, 2400, function (cv) { if (cv) abreCorte(cv); });
});
function cargaPdfJs(cb) {
  if (window.pdfjsLib) { cb(); return; }
  var s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
  s.onload = function () { pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'; cb(); };
  s.onerror = function () { alert('No se ha podido cargar el lector de PDF. Comprueba la conexión.'); };
  document.head.appendChild(s);
}
function abrePdf(f) {
  if (f.size > 60e6) { alert('El PDF es demasiado grande.'); return; }
  cargaPdfJs(function () {
    var fr = new FileReader(); fr.onload = function () {
      pdfjsLib.getDocument({ data: new Uint8Array(fr.result), isEvalSupported: false }).promise.then(function (doc) {
        pdfDoc = doc; var n = Math.min(doc.numPages, 40), h = '<b>Página:</b> ';
        for (var i = 1; i <= n; i++) h += '<button class="chip" type="button" data-pg="' + i + '" aria-pressed="' + (i === 1) + '">' + i + '</button> ';
        $('cortePdf').innerHTML = h; paginaPdf(1); cuenta('material_pdf');
      }, function () { alert('No se ha podido abrir el PDF.'); });
    }; fr.readAsArrayBuffer(f);
  });
}
$('cortePdf').addEventListener('click', function (e) {
  var b = e.target.closest('[data-pg]'); if (!b || !pdfDoc) return;
  $('cortePdf').querySelectorAll('[data-pg]').forEach(function (x) { x.setAttribute('aria-pressed', x === b); }); paginaPdf(+b.dataset.pg);
});
function paginaPdf(n) {
  pdfDoc.getPage(n).then(function (pg) {
    var v0 = pg.getViewport({ scale: 1 }), k = Math.min(3, 2200 / Math.max(v0.width, v0.height)), vp = pg.getViewport({ scale: k });
    var cv = document.createElement('canvas'); cv.width = Math.round(vp.width); cv.height = Math.round(vp.height);
    var cx = cv.getContext('2d'); cx.fillStyle = '#fff'; cx.fillRect(0, 0, cv.width, cv.height);
    pg.render({ canvasContext: cx, viewport: vp }).promise.then(function () { abreCorte(cv); });
  });
}
function abreCorte(cv) {
  fuente = cv; $('corte').classList.remove('oculto');
  var sinPal = FV.set.cartas.filter(function (c) { return c.img && !c.pimg; }).length;
  $('cTipo').value = sinPal ? 'pal' : 'img';
  $('cPal').value = '';
  detecta(true); cuenta('material_hoja');
}
$('corteX').addEventListener('click', function () { $('corte').classList.add('oculto'); });
['cFil', 'cCol', 'cMar', 'cTipo'].forEach(function (id) { $(id).addEventListener('input', function () { ajustaLineas(); dibujaCorte(); }); });
$('cDetectar').addEventListener('click', function () { detecta(true); });
$('cPal').addEventListener('input', infoPar);
function proyeccion(eje) {
  var W = fuente.width, H = fuente.height, d = fuente.getContext('2d').getImageData(0, 0, W, H).data;
  var n = eje === 'x' ? W : H, L = eje === 'x' ? H : W, paso = Math.max(1, Math.floor(L / 400)), res = [];
  for (var i = 0; i < n; i++) {
    var c = 0, t = 0;
    for (var j = 0; j < L; j += paso) {
      var p = eje === 'x' ? (j * W + i) * 4 : (i * W + j) * 4, r = d[p], g = d[p + 1], b = d[p + 2];
      var mx = Math.max(r, g, b), mn = Math.min(r, g, b), lum = .3 * r + .59 * g + .11 * b;
      if ((mx - mn > 110 && mx > 140) || lum < 70) c++; t++;
    }
    res.push(c / t);
  }
  return res;
}
function grupos(res, umbral) {
  var g = [], n = res.length;
  for (var i = 0; i < n; i++) if (res[i] > umbral) { if (g.length && i - g[g.length - 1][1] <= 3) g[g.length - 1][1] = i; else g.push([i, i]); }
  return g.map(function (x) { return (x[0] + x[1]) / 2; });
}
function detecta(adivinar) {
  candX = grupos(proyeccion('x'), .78); candY = grupos(proyeccion('y'), .78);
  if (adivinar) {
    var W = fuente.width, H = fuente.height;
    var cuenta2 = function (c, T) { c = c.slice(); if (!c.length || c[0] > T * .03) c.unshift(0); if (c[c.length - 1] < T * .97) c.push(T); var ds = []; for (var i = 1; i < c.length; i++) ds.push(c[i] - c[i - 1]); var med = ds.slice().sort(function (a, b) { return a - b; })[Math.floor(ds.length / 2)]; return Math.round(T / med); };
    var nc = candX.length >= 2 ? cuenta2(candX, W) : 0, nf = candY.length >= 2 ? cuenta2(candY, H) : 0;
    if (nc >= 1 && nc <= 12 && nf >= 1 && nf <= 12 && (candX.length >= 3 || candY.length >= 3)) { $('cCol').value = nc; $('cFil').value = nf; $('cInfo').textContent = 'He encontrado una cuadrícula de ' + nf + ' × ' + nc + '. Compruébala en el dibujo y corrige filas o columnas si hace falta.'; }
    else $('cInfo').textContent = 'No veo líneas claras: indica filas y columnas y corto en partes iguales.';
  }
  ajustaLineas(); dibujaCorte();
}
function ajustaLineas() {
  var W = fuente.width, H = fuente.height, nc = Math.max(1, Math.min(12, +$('cCol').value || 1)), nf = Math.max(1, Math.min(12, +$('cFil').value || 1));
  function encaja(cands, n, T) {
    var r = []; for (var k = 0; k <= n; k++) { var obj = k * T / n, mejor = obj, dm = T * .07; cands.forEach(function (c) { var d = Math.abs(c - obj); if (d < dm) { dm = d; mejor = c; } }); r.push(mejor); } return r;
  }
  lineasX = encaja(candX, nc, W); lineasY = encaja(candY, nf, H); infoPar();
}
function celdas() {
  var m = (+$('cMar').value || 0) / 100, r = [];
  for (var f = 0; f < lineasY.length - 1; f++) for (var c = 0; c < lineasX.length - 1; c++) {
    var x0 = lineasX[c], x1 = lineasX[c + 1], y0 = lineasY[f], y1 = lineasY[f + 1], mx = (x1 - x0) * m + 3, my = (y1 - y0) * m + 3;
    r.push([x0 + mx, y0 + my, x1 - x0 - 2 * mx, y1 - y0 - 2 * my]);
  }
  return r.filter(function (z) { return z[2] > 8 && z[3] > 8; });
}
function dibujaCorte() {
  var cv = $('lienzoCorte'), k = Math.min(1, 1400 / fuente.width); cv.width = fuente.width * k; cv.height = fuente.height * k;
  var cx = cv.getContext('2d'); cx.drawImage(fuente, 0, 0, cv.width, cv.height);
  cx.lineWidth = 3; cx.font = 'bold ' + Math.round(18) + 'px sans-serif';
  celdas().forEach(function (z, i) {
    cx.strokeStyle = 'rgba(14,53,36,.9)'; cx.setLineDash([8, 5]); cx.strokeRect(z[0] * k, z[1] * k, z[2] * k, z[3] * k);
    cx.setLineDash([]); cx.fillStyle = 'rgba(242,179,61,.95)'; cx.fillRect(z[0] * k, z[1] * k, 30, 24); cx.fillStyle = '#0E3524'; cx.fillText(i + 1, z[0] * k + 5, z[1] * k + 18);
  });
}
function infoPar() {
  var n = celdas().length, pal = $('cPal').value.split('\n').map(function (x) { return x.trim(); }).filter(Boolean).length;
  var sinPal = FV.set.cartas.filter(function (c) { return c.img && !c.pimg; }).length, t = n + ' cartas en esta hoja. ';
  if ($('cTipo').value === 'pal') t += sinPal ? 'Se emparejan por orden con las ' + sinPal + ' cartas que ya tienes sin palabra.' : 'Serán cartas de solo palabra.';
  if (pal) t += ' Has escrito ' + pal + ' palabras' + (pal !== n ? ' (no coincide con ' + n + ': las que falten quedarán en blanco)' : '') + '.';
  $('cPar').textContent = t;
}
$('cCortar').addEventListener('click', function () {
  var cs = celdas(), pal = $('cPal').value.split('\n').map(function (x) { return x.trim(); }).filter(Boolean), tipo = $('cTipo').value;
  var huecos = FV.set.cartas.filter(function (c) { return c.img && !c.pimg; });
  cs.forEach(function (z, i) {
    var cv = document.createElement('canvas'), k = Math.min(1, 480 / Math.max(z[2], z[3]));
    cv.width = Math.round(z[2] * k); cv.height = Math.round(z[3] * k);
    var cx = cv.getContext('2d'); cx.fillStyle = '#fff'; cx.fillRect(0, 0, cv.width, cv.height); cx.drawImage(fuente, z[0], z[1], z[2], z[3], 0, 0, cv.width, cv.height);
    var u = aDataURL(cv), w = pal[i] || '';
    if (tipo === 'pal' && huecos[i]) { huecos[i].pimg = u; if (w) { huecos[i].texto = w; huecos[i].art = adivinaArt(w); delete huecos[i].voz; } }
    else if (tipo === 'pal') FV.set.cartas.push({ id: uid(), pimg: u, texto: w, art: adivinaArt(w), activa: true });
    else FV.set.cartas.push({ id: uid(), img: u, texto: w, art: adivinaArt(w), activa: true });
  });
  $('corte').classList.add('oculto'); marcaCambio(); pintaEditor(); cuenta('hoja_cortada');
});

/* ===================== Editor de zonas de escena ===================== */
var zEsc = -1, zCarta = null;
function abreZonas(i) {
  zEsc = i; var e = FV.set.escenas[i]; $('zonasEd').classList.remove('oculto');
  var cs = FV.set.cartas.filter(function (c) { return c.texto; }); zCarta = zCarta && cs.some(function (c) { return c.id === zCarta; }) ? zCarta : (cs[0] && cs[0].id);
  $('zCartas').innerHTML = cs.map(function (c) { return '<button class="chip" type="button" data-zc="' + esc(c.id) + '" aria-pressed="' + (c.id === zCarta) + '">' + esc(c.texto.toLocaleLowerCase('es')) + '</button>'; }).join('') || '<p class="nota">Primero pon nombre a las cartas.</p>';
  $('zWrap').innerHTML = '<img src="' + esc(e.img) + '" alt="" draggable="false">'; FV.ajustaEscena($('zWrap'), .6);
  pintaZonas();
}
function pintaZonas() {
  var e = FV.set.escenas[zEsc], w = $('zWrap'); w.querySelectorAll('.zona').forEach(function (z) { z.remove(); });
  e.zonas.forEach(function (z, i) {
    var c = FV.set.cartas.filter(function (x) { return x.id === z.c; })[0];
    var d = document.createElement('div'); d.className = 'zona ver'; d.dataset.zi = i;
    d.style.left = z.x * 100 + '%'; d.style.top = z.y * 100 + '%'; d.style.width = z.w * 100 + '%'; d.style.height = z.h * 100 + '%';
    d.innerHTML = '<span class="et">' + esc(c ? c.texto.toLocaleLowerCase('es') : '?') + ' ✕</span>'; w.appendChild(d);
  });
}
$('zCartas').addEventListener('click', function (e) { var b = e.target.closest('[data-zc]'); if (!b) return; zCarta = b.dataset.zc; $('zCartas').querySelectorAll('[data-zc]').forEach(function (x) { x.setAttribute('aria-pressed', x === b); }); });
(function () {
  var w = $('zWrap'), ini = null, caja = null;
  function pos(ev) { var r = w.querySelector('img').getBoundingClientRect(); return { x: Math.max(0, Math.min(1, (ev.clientX - r.left) / r.width)), y: Math.max(0, Math.min(1, (ev.clientY - r.top) / r.height)) }; }
  w.addEventListener('pointerdown', function (ev) {
    var z = ev.target.closest('.zona');
    if (z) { FV.set.escenas[zEsc].zonas.splice(+z.dataset.zi, 1); marcaCambio(); pintaZonas(); return; }
    if (!zCarta) return; ini = pos(ev); caja = document.createElement('div'); caja.className = 'zona ver'; w.appendChild(caja);
    try { w.setPointerCapture(ev.pointerId); } catch (e) {}
  });
  w.addEventListener('pointermove', function (ev) {
    if (!ini) return; var p = pos(ev);
    caja.style.left = Math.min(p.x, ini.x) * 100 + '%'; caja.style.top = Math.min(p.y, ini.y) * 100 + '%'; caja.style.width = Math.abs(p.x - ini.x) * 100 + '%'; caja.style.height = Math.abs(p.y - ini.y) * 100 + '%';
  });
  w.addEventListener('pointerup', function (ev) {
    if (!ini) return; var p = pos(ev), z = { c: zCarta, x: Math.min(p.x, ini.x), y: Math.min(p.y, ini.y), w: Math.abs(p.x - ini.x), h: Math.abs(p.y - ini.y) };
    ini = null; if (caja) caja.remove(); caja = null;
    if (z.w > .015 && z.h > .015) { FV.set.escenas[zEsc].zonas.push(z); marcaCambio(); }
    pintaZonas();
  });
})();
$('zX').addEventListener('click', function () { $('zonasEd').classList.add('oculto'); pintaEditor(); });
$('zListo').addEventListener('click', function () { $('zonasEd').classList.add('oculto'); pintaEditor(); });
$('zBorrarEsc').addEventListener('click', function () { if (!confirm('¿Quitar esta escena?')) return; FV.set.escenas.splice(zEsc, 1); marcaCambio(); $('zonasEd').classList.add('oculto'); pintaEditor(); });

/* ===================== Imprimir ===================== */
document.querySelectorAll('[data-imp]').forEach(function (b) { b.addEventListener('click', function () { imprime(b.dataset.imp); }); });
function imprime(tipo) {
  var cs = FV.cartas(); if (!cs.length) return; cuenta('imprimir_' + tipo);
  var css = '@page{size:A4;margin:10mm}body{font-family:Nunito,system-ui,sans-serif;margin:0;color:#10231A}h1{font-size:18px;margin:0 0 6px}.g{display:grid;gap:4mm}.c{border:1.5px dashed #888;border-radius:4mm;padding:3mm;display:flex;flex-direction:column;align-items:center;justify-content:center;break-inside:avoid;text-align:center}.c img{max-width:100%;max-height:100%;object-fit:contain}.p{font-weight:800}.pie{font-size:9px;color:#666;margin-top:4mm;text-align:center}.b{border:2px solid #0E3524;border-radius:4mm;padding:3mm;break-inside:avoid;margin-bottom:6mm}.b .g{grid-template-columns:repeat(3,1fr)}.b .c{height:38mm;border-style:solid}table{border-collapse:collapse;width:100%;font-size:13px}td,th{border:1px solid #999;padding:5px}';
  var pie = '<p class="pie">Fichas vivas · ColmenIA (www.skool.com/logopedia-7339) · con #ponunlogopedaentuvida · Material de apoyo</p>', h = '';
  var img = function (c) { return c.img || c.pimg || ''; };
  var pal = function (c) { return esc(FV.textoCarta(c)); };
  if (tipo === 'tarjetas') {
    h = '<h1>' + esc(FV.set.titulo) + ' · tarjetas</h1><div class="g" style="grid-template-columns:repeat(3,1fr)">' + cs.map(function (c) { return '<div class="c" style="height:62mm">' + (img(c) ? '<img src="' + esc(img(c)) + '" style="height:42mm">' : '') + '<div class="p" style="font-size:' + (c.texto.length > 14 ? 14 : 18) + 'px">' + pal(c) + '</div></div>'; }).join('') + '</div>';
  } else if (tipo === 'bingo') {
    var n = Math.min(9, cs.length);
    for (var k = 0; k < 6; k++) { h += '<div class="b"><h1>Bingo ' + (k + 1) + ' · ' + esc(FV.set.titulo) + '</h1><div class="g">' + baraja(cs).slice(0, n).map(function (c) { return '<div class="c">' + (c.img ? '<img src="' + esc(c.img) + '" style="height:28mm">' : '<div class="p">' + pal(c) + '</div>') + '</div>'; }).join('') + '</div></div>'; }
    h += '<h1>Cartas para cantar</h1><div class="g" style="grid-template-columns:repeat(4,1fr)">' + cs.map(function (c) { return '<div class="c" style="height:34mm">' + (c.img ? '<img src="' + esc(c.img) + '" style="height:22mm">' : '') + '<div class="p" style="font-size:12px">' + pal(c) + '</div></div>'; }).join('') + '</div>';
  } else if (tipo === 'memoria') {
    var M = baraja(cs).slice(0, 12), pares = [];
    M.forEach(function (c) { pares.push('<div class="c" style="height:45mm">' + (c.img ? '<img src="' + esc(c.img) + '" style="height:38mm">' : '<div class="p">' + pal(c) + '</div>') + '</div>'); pares.push('<div class="c" style="height:45mm">' + (c.pimg ? '<img src="' + esc(c.pimg) + '" style="height:30mm">' : '<div class="p" style="font-size:20px">' + pal(c) + '</div>') + '</div>'); });
    h = '<h1>Memoria imagen–palabra · ' + esc(FV.set.titulo) + '</h1><div class="g" style="grid-template-columns:repeat(4,1fr)">' + pares.join('') + '</div>';
  } else {
    h = '<h1>Hoja de registro · ' + esc(FV.set.titulo) + '</h1><p style="font-size:12px">Marca: ✓ solo · P con pista · A con ayuda · ✗ no sale. Sin nombres: usa un código.</p><p style="font-size:13px">Código: ________ Fecha: ________ Objetivo: ______________________</p><table><tr><th>Palabra</th><th>S1</th><th>S2</th><th>S3</th><th>S4</th><th>S5</th><th>Notas</th></tr>' + cs.map(function (c) { return '<tr><td>' + pal(c) + '</td><td></td><td></td><td></td><td></td><td></td><td style="width:35%"></td></tr>'; }).join('') + '</table>';
  }
  var w = window.open('', '_blank'); if (!w) { alert('Permite las ventanas emergentes para imprimir.'); return; }
  var base = location.href.replace(/[#?].*$/, '').replace(/[^\/]*$/, '');
  w.document.write('<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><base href="' + base + '"><title>Imprimir · Fichas vivas</title><style>' + css + '</style></head><body>' + h + pie + '<script>window.onload=function(){setTimeout(function(){window.print()},400)}<\/script></body></html>');
  w.document.close();
}

/* ===================== Abeja: mejoras, novedades y fallos ===================== */
(function () {
  var m = $('mejora'), ok = $('mejOk');
  var CHIPS = [['juegos', 'Más juegos'], ['frases', 'Construir frases'], ['fonemas', 'Juegos por sonidos'], ['aire', 'Mejorar el modo aire'], ['voz', 'Más voces'], ['adultos', 'Más para adultos'], ['imprimir', 'Más cosas para imprimir'], ['nube', 'Guardar en la nube'], ['compartir', 'Banco de material compartido']];
  $('mejChips').innerHTML = CHIPS.map(function (c) { return '<button class="chip" type="button" data-m="' + c[0] + '" aria-pressed="false">' + c[1] + '</button>'; }).join('');
  $('novLista').innerHTML = FV_NOVEDADES.slice().reverse().map(function (n) { return '<li><b>' + esc(n.f) + ' · ' + esc(n.t) + '.</b> ' + esc(n.d) + '</li>'; }).join('');
  var visto = 0; try { visto = +localStorage.getItem('fv-nov-visto') || 0; } catch (e) {}
  if (visto < FV_VERSION) $('abejaPunto').classList.remove('oculto');
  function pest(p) { m.querySelectorAll('[data-p]').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.p === p); }); m.querySelectorAll('[data-pp]').forEach(function (d) { d.classList.toggle('oculto', d.dataset.pp !== p); }); ok.textContent = ''; if (p === 'nov') { try { localStorage.setItem('fv-nov-visto', FV_VERSION); } catch (e) {} $('abejaPunto').classList.add('oculto'); cuenta('novedades'); } }
  m.querySelector('.pest').addEventListener('click', function (e) { var b = e.target.closest('[data-p]'); if (b) pest(b.dataset.p); });
  function abre() { m.classList.remove('oculto'); ok.textContent = ''; cuenta('mejora_abrir'); pest(visto < FV_VERSION ? 'nov' : 'pide'); }
  $('abeja').addEventListener('click', abre);
  $('mejX').addEventListener('click', function () { m.classList.add('oculto'); });
  m.addEventListener('click', function (e) { if (e.target === m) m.classList.add('oculto'); });
  $('mejChips').addEventListener('click', function (e) { var b = e.target.closest('.chip'); if (!b || b.getAttribute('aria-pressed') === 'true') return; b.setAttribute('aria-pressed', 'true'); cuenta('mejora_' + b.dataset.m); cuenta('mejora_total'); ok.textContent = 'Voto sumado. Lo más votado es lo siguiente que hacemos.'; });
  function limpia(t) { return (t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z ]/g, '').trim().replace(/ +/g, '_').slice(0, 40); }
  var FALLOS = [['no_suena', 'No se oye la voz'], ['hoja', 'La hoja no se corta bien'], ['zonas', 'Las zonas de la escena no coinciden'], ['cuelga', 'Se queda colgado'], ['aire', 'El modo aire no va'], ['imprimir', 'No imprime'], ['otro', 'Otra cosa']];
  $('falChips').innerHTML = FALLOS.map(function (c) { return '<button class="chip" type="button" data-f="' + c[0] + '" aria-pressed="false">' + c[1] + '</button>'; }).join('');
  $('falChips').addEventListener('click', function (e) { var b = e.target.closest('.chip'); if (!b || b.getAttribute('aria-pressed') === 'true') return; b.setAttribute('aria-pressed', 'true'); cuenta('fallo_' + b.dataset.f); cuenta('fallo_total'); ok.textContent = 'Aviso apuntado. Para contarnos el detalle, escríbelo en ColmenIA.'; });
  FV.abreMejora = abre;
})();

})();
