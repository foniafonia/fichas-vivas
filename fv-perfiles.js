/* Fichas vivas · PERFILES ANÓNIMOS E INFORME.
   - Un perfil es un código (P-01), sin nombres. Todo se guarda solo en este aparato.
   - Con un perfil activo, cada respuesta de cada juego se apunta: qué se pedía, qué se
     tocó, si fue a la primera, cuánto tardó y si hubo ayuda.
   - El informe calcula todas las medidas del REGISTRO (FV.METRICAS). Para medir algo
     nuevo basta con añadir una entrada al registro (ver «Cómo añadir una medida»).
   - La logopeda puede crear MEDIDAS PROPIAS (escala 1-5, sí/no, número o texto) que se
     rellenan al acabar cada sesión, y escribir observaciones.
   - Exporta CSV de respuestas y JSON «fichas-vivas-v1» (pensado para Melífera).
   Orientativo: no es una prueba estandarizada ni tiene valor diagnóstico. ES5. */
(function () {
'use strict';
var FV = window.FV, $ = FV.$, esc = FV.esc;
var KEY = 'fv-perfiles-v1', MAXS = 300;
var D = carga(), S = null;
function carga() { try { var d = JSON.parse(localStorage.getItem(KEY) || 'null'); if (d && d.perfiles) return d; } catch (e) {} return { activo: '', perfiles: {} }; }
function guarda() { try { localStorage.setItem(KEY, JSON.stringify(D)); return true; } catch (e) { alert('No queda espacio en este aparato para guardar más sesiones. Exporta el perfil y borra sesiones antiguas.'); return false; } }
function activo() { return D.activo && D.perfiles[D.activo] ? D.perfiles[D.activo] : null; }
function sigCodigo() { var n = 1; while (D.perfiles['P-' + (n < 10 ? '0' : '') + n]) n++; return 'P-' + (n < 10 ? '0' : '') + n; }
FV.perfilActivo = activo;

/* ===================== Registro de respuestas (lo llaman los juegos) ===================== */
FV.mide = {
  inicio: function (juego) {
    S = null; var p = activo(); if (!p) return;
    var aj = FV.aj;
    S = { id: FV.uid(), t0: Date.now(), d: 0, juego: juego, material: FV.set ? FV.set.titulo : '', aj: { n: aj.n, ver: aj.ver, tranq: !!aj.tranq, sec: +aj.sec || 1, voz: !!aj.voz, aire: document.body.classList.contains('aire-on'), publico: (localStorage.getItem('fv-publico') || '') }, ev: [], extra: {}, nota: '' };
  },
  /* e: {o: carta objetivo, e: carta elegida|null, ok: 1/0, ms: latencia, ay: 0-3, k: tipo} */
  ev: function (e) {
    if (!S) return;
    S.ev.push({ t: Date.now() - S.t0, o: e.o ? e.o.texto : null, oc: e.o ? (e.o.cat || '') : '', e: e.e ? e.e.texto : null, ec: e.e ? (e.e.cat || '') : '', ok: e.ok ? 1 : 0, ms: e.ms == null ? null : Math.round(e.ms), ay: e.ay || 0, k: e.k || 'eleccion', x: e.x || null });
  },
  fin: function () {
    if (!S) return null; var p = activo(); if (!p) { S = null; return null; }
    S.d = Date.now() - S.t0; if (!S.ev.length) { S = null; return null; }
    p.sesiones.push(S); if (p.sesiones.length > MAXS) p.sesiones = p.sesiones.slice(-MAXS);
    guarda(); var s = S; S = null; FV.cuenta('perfil_sesion'); return s;
  },
  activo: function () { return !!S; }
};

/* ===================== Utilidades de cálculo ===================== */
function med(a) { a = a.filter(function (x) { return x != null; }); if (!a.length) return null; var s = a.slice().sort(function (x, y) { return x - y; }), m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; }
function media(a) { a = a.filter(function (x) { return x != null; }); return a.length ? a.reduce(function (x, y) { return x + y; }, 0) / a.length : null; }
function dt(a) { a = a.filter(function (x) { return x != null; }); if (a.length < 2) return null; var m = media(a); return Math.sqrt(a.reduce(function (s, x) { return s + (x - m) * (x - m); }, 0) / (a.length - 1)); }
function pct(n, d) { return d ? Math.round(n / d * 100) : null; }
function seg(ms) { return ms == null ? '—' : (ms / 1000).toFixed(1).replace('.', ',') + ' s'; }
function norm(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
function lev(a, b) { a = norm(a); b = norm(b); var m = [], i, j; for (i = 0; i <= a.length; i++) m[i] = [i]; for (j = 1; j <= b.length; j++) m[0][j] = j; for (i = 1; i <= a.length; i++) for (j = 1; j <= b.length; j++) m[i][j] = Math.min(m[i - 1][j] + 1, m[i][j - 1] + 1, m[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); return m[a.length][b.length]; }
function inicio(w) { var s = (window.fvPrimeraSilaba ? fvPrimeraSilaba(w) : String(w || '').slice(0, 2)); return norm(s); }
var NOMJ = {}; (FV.JUEGOS || []).forEach(function (j) { NOMJ[j.id] = j.nombre; });
function nomJ(id) { if (!NOMJ[id]) (FV.JUEGOS || []).forEach(function (j) { NOMJ[j.id] = j.nombre; }); return NOMJ[id] || id; }

/* «Respuestas por objetivo»: agrupa los eventos de una sesión por lo que se pedía, en orden. */
function intentos(ses) {
  var L = [];
  ses.forEach(function (s, si) {
    var cur = null;
    s.ev.forEach(function (e, i) {
      if (e.k === 'secuencia') return;
      if (e.k === 'nombrar') { L.push({ si: si, s: s, o: e.o, oc: e.oc, ok1: e.x === 'solo', ok: e.x !== 'no', ms: null, err: [], ay: e.ay, k: e.k, x: e.x }); return; }
      if (!cur || cur.o !== e.o || cur.cerrado) { cur = { si: si, s: s, o: e.o, oc: e.oc, ok1: false, ok: false, ms: null, err: [], ay: 0, k: e.k, t: e.t }; L.push(cur); }
      if (e.ay) cur.ay = Math.max(cur.ay, e.ay);
      if (e.ok) { cur.ok = true; cur.ok1 = !cur.err.length; cur.ms = e.ms; cur.cerrado = true; }
      else cur.err.push({ e: e.e, ec: e.ec, ms: e.ms, t: e.t });
    });
  });
  return L;
}

/* ===================== REGISTRO DE MEDIDAS =====================
   Cómo añadir una medida: FV.METRICAS.push({ id, area, nombre, calc: function (A) { return texto|null } })
   A trae: ses (sesiones), I (intentos por objetivo), E (todos los eventos) y las cuentas de abajo. */
FV.METRICAS = [
  { id: 'vel', area: 'Velocidad de procesamiento', nombre: 'Tiempo de respuesta correcta (mediana)', calc: function (A) { return A.medOk != null ? seg(A.medOk) + ' (media ' + seg(A.mediaOk) + ')' : null; } },
  { id: 'prec', area: 'Precisión', nombre: 'Aciertos a la primera', calc: function (A) { return A.nI ? A.ok1 + ' % (' + A.nOk1 + ' de ' + A.nI + ')' : null; } },
  { id: 'aten', area: 'Atención sostenida', nombre: 'Variabilidad del tiempo y cambio 1.ª/2.ª mitad', calc: function (A) { return A.cv != null ? 'coef. de variación ' + A.cv.toFixed(2).replace('.', ',') + (A.deriva != null ? ' · 2.ª mitad ' + (A.deriva >= 0 ? '+' : '') + Math.round(A.deriva) + ' % de tiempo' : '') : null; } },
  { id: 'fatiga', area: 'Fatiga', nombre: 'Aciertos 1.ª mitad frente a 2.ª mitad de la sesión', calc: function (A) { return A.fat ? A.fat[0] + ' % → ' + A.fat[1] + ' %' : null; } },
  { id: 'inhib', area: 'Control inhibitorio', nombre: 'Errores muy rápidos (<0,7 s) y errores repetidos', calc: function (A) { return A.nErr ? A.rapidos + ' de ' + A.nErr + ' errores en <0,7 s · ' + A.persev + ' repetidos en el mismo objetivo' : 'sin errores'; } },
  { id: 'memaud', area: 'Memoria auditiva de trabajo', nombre: 'Escucha y toca con 1, 2 o 3 palabras seguidas', calc: function (A) { var o = A.span; if (!o) return null; return Object.keys(o).sort().map(function (k) { return k + ' palabra' + (k > 1 ? 's' : '') + ': ' + pct(o[k].ok, o[k].n) + ' % (' + o[k].n + ')'; }).join(' · '); } },
  { id: 'lex', area: 'Acceso léxico', nombre: 'Nombra con pistas: cómo salió', calc: function (A) { var x = A.nombrar; if (!x.n) return null; return 'solo ' + pct(x.solo, x.n) + ' % · con pista ' + pct(x.pista, x.n) + ' % · repitiendo ' + pct(x.ayuda, x.n) + ' % · aún no ' + pct(x.no, x.n) + ' %'; } },
  { id: 'cat', area: 'Categorización', nombre: 'Clasifica y El intruso', calc: function (A) { var c = A.porJuego.clasifica, i = A.porJuego.intruso; var t = []; if (c) t.push('Clasifica ' + c.ok1 + ' %'); if (i) t.push('El intruso ' + i.ok1 + ' %'); return t.length ? t.join(' · ') : null; } },
  { id: 'vis', area: 'Percepción y memoria visual', nombre: 'Sombras, ¿Qué se esconde?, ¿Qué falta? y Memoria', calc: function (A) { var t = []; ['sombras', 'detective', 'falta', 'memoria', 'memoriap'].forEach(function (k) { var o = A.porJuego[k]; if (o) t.push(nomJ(k) + ' ' + o.ok1 + ' %'); }); return t.length ? t.join(' · ') : null; } },
  { id: 'err', area: 'Tipo de error', nombre: 'Misma categoría / suena parecido / otra', calc: function (A) { var t = A.tipos; return A.nErr ? 'misma categoría ' + pct(t.categoria, A.nErr) + ' % · suena parecido ' + pct(t.parecida, A.nErr) + ' % · otra ' + pct(t.otra, A.nErr) + ' %' : null; } },
  { id: 'ayuda', area: 'Necesidad de apoyo', nombre: 'Objetivos que necesitaron ayuda', calc: function (A) { return A.nI ? pct(A.conAyuda, A.nI) + ' % (' + A.conAyuda + ' de ' + A.nI + ')' : null; } },
  { id: 'aprend', area: 'Aprendizaje', nombre: 'Evolución entre la primera y la última sesión', calc: function (A) { var p = A.porSes; if (p.length < 2) return 'hacen falta al menos 2 sesiones'; var a = p[0], b = p[p.length - 1]; return 'aciertos ' + a.ok1 + ' % → ' + b.ok1 + ' % · tiempo ' + seg(a.med) + ' → ' + seg(b.med); } }
];

function analiza(p) {
  var ses = p.sesiones, I = intentos(ses), E = [];
  ses.forEach(function (s) { s.ev.forEach(function (e) { E.push(e); }); });
  var el = I.filter(function (x) { return x.k !== 'nombrar' && x.o != null; });
  var A = { ses: ses, I: I, E: E, nI: el.length, nOk1: el.filter(function (x) { return x.ok1; }).length };
  A.ok1 = pct(A.nOk1, A.nI);
  var tOk = el.filter(function (x) { return x.ms != null; }).map(function (x) { return x.ms; });
  A.medOk = med(tOk); A.mediaOk = media(tOk);
  A.conAyuda = el.filter(function (x) { return x.ay; }).length;
  /* errores */
  A.nErr = 0; A.rapidos = 0; A.persev = 0; A.tipos = { categoria: 0, parecida: 0, otra: 0 }; var conf = {};
  el.forEach(function (x) {
    var vistos = {};
    x.err.forEach(function (e) {
      if (e.e == null) return; A.nErr++;
      if (e.ms != null && e.ms < 700) A.rapidos++;
      if (vistos[e.e]) A.persev++; vistos[e.e] = 1;
      var tp = (x.oc && e.ec && x.oc === e.ec) ? 'categoria' : (lev(x.o, e.e) <= 2 || inicio(x.o) === inicio(e.e)) ? 'parecida' : 'otra';
      A.tipos[tp]++; var k = x.o + ' → ' + e.e; conf[k] = (conf[k] || 0) + 1;
    });
  });
  A.conf = Object.keys(conf).map(function (k) { return [k, conf[k]]; }).sort(function (a, b) { return b[1] - a[1]; }).slice(0, 10);
  /* atención y fatiga por sesión */
  var cvs = [], der = [], f1 = [0, 0], f2 = [0, 0];
  ses.forEach(function (s, si) {
    var xs = el.filter(function (x) { return x.si === si; }), t = xs.filter(function (x) { return x.ms != null; }).map(function (x) { return x.ms; });
    if (t.length >= 6) { var m = media(t); cvs.push(dt(t) / m); var h = Math.floor(t.length / 2), a = med(t.slice(0, h)), b = med(t.slice(h)); if (a) der.push((b - a) / a * 100); }
    if (xs.length >= 6) { var hh = Math.floor(xs.length / 2); xs.forEach(function (x, i) { var f = i < hh ? f1 : f2; f[1]++; if (x.ok1) f[0]++; }); }
  });
  A.cv = media(cvs); A.deriva = media(der); A.fat = f1[1] && f2[1] ? [pct(f1[0], f1[1]), pct(f2[0], f2[1])] : null;
  /* por juego, categoría, palabra, sonido inicial */
  function agrupa(clave) { var m = {}; el.forEach(function (x) { var k = clave(x); if (k == null || k === '') return; var o = m[k] || (m[k] = { n: 0, ok: 0, t: [] }); o.n++; if (x.ok1) o.ok++; if (x.ms != null) o.t.push(x.ms); }); Object.keys(m).forEach(function (k) { m[k].ok1 = pct(m[k].ok, m[k].n); m[k].med = med(m[k].t); }); return m; }
  A.porJuego = agrupa(function (x) { return x.s.juego; });
  A.porCat = agrupa(function (x) { return x.oc; });
  A.porPal = agrupa(function (x) { return x.o; });
  A.porSon = agrupa(function (x) { return inicio(x.o); });
  /* memoria auditiva (escucha con varias palabras) */
  var sp = {}; ses.forEach(function (s) { if (s.juego !== 'escucha') return; var k = s.aj.sec || 1; s.ev.forEach(function (e) { if (e.k !== 'secuencia' && k > 1) return; var o = sp[k] || (sp[k] = { n: 0, ok: 0 }); o.n++; if (e.ok) o.ok++; }); });
  A.span = Object.keys(sp).length ? sp : null;
  /* nombrar */
  A.nombrar = { n: 0, solo: 0, pista: 0, ayuda: 0, no: 0 }; I.forEach(function (x) { if (x.k === 'nombrar' && A.nombrar[x.x] != null) { A.nombrar.n++; A.nombrar[x.x]++; } });
  /* por sesión */
  A.porSes = ses.map(function (s, si) { var xs = el.filter(function (x) { return x.si === si; }); return { i: si, f: s.t0, juego: s.juego, n: xs.length, ok1: pct(xs.filter(function (x) { return x.ok1; }).length, xs.length), med: med(xs.filter(function (x) { return x.ms != null; }).map(function (x) { return x.ms; })), d: s.d, extra: s.extra, nota: s.nota, aj: s.aj, material: s.material }; });
  A.min = Math.round(ses.reduce(function (t, s) { return t + (s.d || 0); }, 0) / 60000);
  return A;
}
FV.analizaPerfil = analiza;

/* ===================== Gráficas SVG ===================== */
var VERDE = '#2FA866', ORO = '#E0A022', ROJO = '#D8604C', GRIS = '#9aa8a0';
function lineas(vals, opt) {
  opt = opt || {}; var W = opt.W || 620, H = opt.H || 190, pl = 46, pr = 12, pt = 14, pb = 28, v = vals.filter(function (x) { return x != null; });
  if (v.length < 2) return '<p class="pf-vacio">Hacen falta más datos para esta gráfica.</p>';
  var mx = opt.pct ? 100 : (Math.max.apply(null, v) * 1.1 || 1), mn = 0, n = vals.length;
  function X(i) { return pl + (W - pl - pr) * (n === 1 ? 0 : i / (n - 1)); } function Y(x) { return pt + (H - pt - pb) * (1 - (x - mn) / (mx - mn)); }
  var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(opt.t || '') + '">';
  for (var g = 0; g <= 4; g++) { var gv = mn + (mx - mn) * g / 4, gy = Y(gv); s += '<line x1="' + pl + '" y1="' + gy + '" x2="' + (W - pr) + '" y2="' + gy + '" stroke="#e5ece6"/><text x="' + (pl - 6) + '" y="' + (gy + 4) + '" font-size="11" text-anchor="end" fill="#4d6457">' + (opt.pct ? Math.round(gv) + '%' : opt.num ? (Math.round(gv * 10) / 10) : (gv / 1000).toFixed(1).replace('.', ',') + 's') + '</text>'; }
  var pts = [], xs = [], ys = []; vals.forEach(function (x, i) { if (x != null) { pts.push(X(i).toFixed(1) + ',' + Y(x).toFixed(1)); xs.push(i); ys.push(x); } });
  s += '<polyline fill="none" stroke="' + (opt.color || VERDE) + '" stroke-width="2.5" points="' + pts.join(' ') + '"/>';
  xs.forEach(function (i, k) { s += '<circle cx="' + X(i).toFixed(1) + '" cy="' + Y(ys[k]).toFixed(1) + '" r="3.2" fill="' + (opt.color || VERDE) + '"/>'; });
  if (xs.length >= 4) { var mx2 = media(xs), my2 = media(ys), num = 0, den = 0; xs.forEach(function (x, k) { num += (x - mx2) * (ys[k] - my2); den += (x - mx2) * (x - mx2); }); var b = den ? num / den : 0, a = my2 - b * mx2; s += '<line x1="' + X(0).toFixed(1) + '" y1="' + Y(Math.min(mx, Math.max(mn, a))).toFixed(1) + '" x2="' + X(n - 1).toFixed(1) + '" y2="' + Y(Math.min(mx, Math.max(mn, a + b * (n - 1)))).toFixed(1) + '" stroke="' + ORO + '" stroke-width="2" stroke-dasharray="6 5"/>'; }
  var paso = Math.ceil(n / 10); for (var i = 0; i < n; i += paso) s += '<text x="' + X(i).toFixed(1) + '" y="' + (H - 8) + '" font-size="11" text-anchor="middle" fill="#4d6457">' + (i + 1) + '</text>';
  return s + '</svg>';
}
function barras(items, opt) {
  opt = opt || {}; if (!items.length) return '<p class="pf-vacio">Todavía no hay datos suficientes.</p>';
  var W = opt.W || 620, fila = 26, H = items.length * fila + 8, pl = opt.pl || 200, pr = opt.pr || 120, mx = opt.max || Math.max.apply(null, items.map(function (i) { return i.v; })) || 1;
  var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(opt.t || '') + '">';
  items.forEach(function (it, k) { var y = 4 + k * fila, w = (W - pl - pr) * (it.v || 0) / mx; s += '<text x="' + (pl - 8) + '" y="' + (y + 16) + '" font-size="13" text-anchor="end" fill="#10231A">' + esc(it.l) + '</text><rect x="' + pl + '" y="' + (y + 3) + '" width="' + Math.max(2, w).toFixed(1) + '" height="17" rx="4" fill="' + (it.c || VERDE) + '"/><text x="' + (pl + Math.max(2, w) + 6).toFixed(1) + '" y="' + (y + 16) + '" font-size="12" fill="#4d6457">' + esc(it.t) + '</text>'; });
  return s + '</svg>';
}
function color(p) { return p == null ? GRIS : p < 60 ? ROJO : p < 80 ? ORO : VERDE; }

/* ===================== Informe ===================== */
function resumen(A, p) {
  if (!A.ses.length) return [];
  var L = [];
  L.push(A.ses.length + (A.ses.length > 1 ? ' sesiones' : ' sesión') + ', unos ' + Math.max(1, A.min) + ' min de juego y ' + A.nI + ' objetivos. Acierta a la primera el ' + (A.ok1 == null ? '—' : A.ok1 + ' %') + (A.medOk != null ? ' y tarda de mediana ' + seg(A.medOk) + ' en dar la respuesta correcta' : '') + '.');
  var pc = Object.keys(A.porCat).filter(function (k) { return A.porCat[k].n >= 3; }).sort(function (a, b) { return A.porCat[a].ok1 - A.porCat[b].ok1; });
  if (pc.length > 1) L.push('La categoría que más cuesta es «' + pc[0] + '» (' + A.porCat[pc[0]].ok1 + ' %) y la que menos, «' + pc[pc.length - 1] + '» (' + A.porCat[pc[pc.length - 1]].ok1 + ' %).');
  var dif = Object.keys(A.porPal).filter(function (k) { return A.porPal[k].n >= 2 && A.porPal[k].ok1 < 100; }).sort(function (a, b) { return A.porPal[a].ok1 - A.porPal[b].ok1; }).slice(0, 5);
  if (dif.length) L.push('Palabras que más cuestan: ' + dif.map(function (k) { return k.toLocaleLowerCase('es') + ' (' + A.porPal[k].ok1 + ' %)'; }).join(', ') + '.');
  if (A.nErr) { var t = A.tipos, mayor = Object.keys(t).sort(function (x, y) { return t[y] - t[x]; })[0]; L.push(A.nErr + ' toques equivocados; lo más frecuente es elegir ' + { categoria: 'algo de la misma categoría', parecida: 'una palabra que suena parecido', otra: 'algo sin relación' }[mayor] + ' (' + pct(t[mayor], A.nErr) + ' %).'); }
  if (A.deriva != null) L.push(A.deriva > 15 ? 'En la segunda mitad de las sesiones tarda un ' + Math.round(A.deriva) + ' % más (posible cansancio o bajada de atención).' : A.deriva < -15 ? 'En la segunda mitad es un ' + Math.round(-A.deriva) + ' % más rápido (se va ajustando a la tarea).' : 'El ritmo se mantiene parecido de principio a fin.');
  if (A.rapidos) L.push(A.rapidos + ' errores llegaron en menos de 0,7 s (respuesta muy rápida, posible impulsividad).');
  if (A.nombrar.n) L.push('En «Nombra con pistas» lo dijo solo el ' + pct(A.nombrar.solo, A.nombrar.n) + ' % de las veces y con pista el ' + pct(A.nombrar.pista, A.nombrar.n) + ' %.');
  var ps = A.porSes.filter(function (x) { return x.n; }); if (ps.length >= 2) L.push('De la primera a la última sesión, los aciertos a la primera pasan de ' + ps[0].ok1 + ' % a ' + ps[ps.length - 1].ok1 + ' %.');
  return L;
}
function informeHTML(p, A) {
  var f = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }), ses = A.ses;
  var d1 = ses.length ? new Date(ses[0].t0).toLocaleDateString('es-ES') : '—', d2 = ses.length ? new Date(ses[ses.length - 1].t0).toLocaleDateString('es-ES') : '—';
  var h = '<header class="pf-cab"><div><h1>Informe de sesiones · Fichas vivas</h1><p>Perfil <b>' + esc(p.codigo) + '</b>' + (p.edad ? ' · ' + esc(p.edad) : '') + (p.objetivo ? ' · objetivo: ' + esc(p.objetivo) : '') + ' · ' + d1 + ' a ' + d2 + '</p></div><div class="pf-ver">Anonimizado · ' + f + '</div></header>';
  var R = resumen(A, p);
  h += '<section><h2>Resumen</h2>' + (R.length ? '<ul>' + R.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' : '<p class="pf-vacio">Todavía no hay sesiones con este perfil. Actívalo y juega.</p>') + '</section>';
  if (!ses.length) return h;
  h += '<section><h2>Medidas</h2><table class="pf-t"><tr><th>Área</th><th>Medida</th><th>Resultado</th></tr>' + FV.METRICAS.map(function (m) { var v = null; try { v = m.calc(A); } catch (e) { v = null; } return v == null ? '' : '<tr><td>' + esc(m.area) + '</td><td>' + esc(m.nombre) + '</td><td>' + esc(v) + '</td></tr>'; }).join('') + '</table></section>';
  var ps = A.porSes;
  h += '<section><h2>Evolución entre sesiones</h2><div class="pf-dos"><div><h3>Aciertos a la primera</h3>' + lineas(ps.map(function (s) { return s.ok1; }), { pct: true, W: 340, t: 'Aciertos por sesión' }) + '</div><div><h3>Tiempo de respuesta (mediana)</h3>' + lineas(ps.map(function (s) { return s.med; }), { color: ORO, W: 340, t: 'Tiempo por sesión' }) + '</div></div></section>';
  var pj = Object.keys(A.porJuego).map(function (k) { var o = A.porJuego[k]; return { l: nomJ(k) + ' · ' + o.n, v: o.ok1, t: o.ok1 + ' % · ' + seg(o.med), c: color(o.ok1) }; });
  h += '<section><h2>Por juego</h2>' + barras(pj, { max: 100, t: 'Aciertos por juego' }) + '</section>';
  var pc = Object.keys(A.porCat).map(function (k) { var o = A.porCat[k]; return { l: k + ' · ' + o.n, v: o.ok1, t: o.ok1 + ' % · ' + seg(o.med), c: color(o.ok1) }; });
  if (pc.length) h += '<section><h2>Por categoría</h2>' + barras(pc, { max: 100, t: 'Aciertos por categoría' }) + '</section>';
  var pw = Object.keys(A.porPal).filter(function (k) { return A.porPal[k].n >= 2; }).sort(function (a, b) { return A.porPal[a].ok1 - A.porPal[b].ok1; }).slice(0, 14).map(function (k) { var o = A.porPal[k]; return { l: k.toLocaleLowerCase('es') + ' · ' + o.n, v: o.ok1, t: o.ok1 + ' % · ' + seg(o.med), c: color(o.ok1) }; });
  h += '<section><h2>Palabras que más cuestan</h2><p class="pf-peq">Solo palabras pedidas 2 veces o más, de menos a más aciertos a la primera.</p>' + barras(pw, { max: 100, t: 'Aciertos por palabra' }) + '</section>';
  var psn = Object.keys(A.porSon).filter(function (k) { return A.porSon[k].n >= 3; }).sort(function (a, b) { return A.porSon[a].ok1 - A.porSon[b].ok1; }).slice(0, 12).map(function (k) { var o = A.porSon[k]; return { l: 'empieza por «' + k + '» · ' + o.n, v: o.ok1, t: o.ok1 + ' %', c: color(o.ok1) }; });
  if (psn.length) h += '<section><h2>Por sílaba inicial</h2><p class="pf-peq">Útil en material de un fonema (por ejemplo, el sonido /k/).</p>' + barras(psn, { max: 100, t: 'Aciertos por sílaba inicial' }) + '</section>';
  h += '<section><h2>Qué se confunde</h2><div class="pf-dos"><div><h3>Tipo de error</h3>' + barras([{ l: 'Misma categoría', v: A.tipos.categoria, t: String(A.tipos.categoria), c: ORO }, { l: 'Suena parecido', v: A.tipos.parecida, t: String(A.tipos.parecida), c: ROJO }, { l: 'Otra', v: A.tipos.otra, t: String(A.tipos.otra), c: GRIS }], { W: 340, pl: 140, pr: 40, t: 'Tipos de error' }) + '</div><div><h3>Confusiones más repetidas</h3>' + (A.conf.length ? '<ol class="pf-conf">' + A.conf.map(function (c) { return '<li>' + esc(c[0].toLocaleLowerCase('es')) + ' <b>×' + c[1] + '</b></li>'; }).join('') + '</ol>' : '<p class="pf-vacio">Sin errores registrados.</p>') + '</div></div></section>';
  /* medidas propias */
  if ((p.medidas || []).length) {
    h += '<section><h2>Medidas propias de la logopeda</h2>';
    p.medidas.forEach(function (m) {
      var vals = ps.map(function (s) { var v = s.extra ? s.extra[m.id] : null; return v === '' || v == null ? null : v; });
      if (m.tipo === 'escala' || m.tipo === 'num') h += '<h3>' + esc(m.nombre) + (m.tipo === 'escala' ? ' (1-5)' : '') + '</h3>' + lineas(vals.map(function (v) { return v == null ? null : +v; }), { num: true, t: m.nombre });
      else h += '<h3>' + esc(m.nombre) + '</h3><p>' + vals.map(function (v, i) { return v == null ? '' : 'S' + (i + 1) + ': ' + esc(v); }).filter(Boolean).join(' · ') + '</p>';
    });
    h += '</section>';
  }
  h += '<section><h2>Sesiones</h2><table class="pf-t"><tr><th>#</th><th>Fecha</th><th>Juego</th><th>Material</th><th>Objetivos</th><th>1.ª</th><th>Mediana</th><th>Observaciones</th></tr>' + ps.map(function (s) { return '<tr><td>' + (s.i + 1) + '</td><td>' + new Date(s.f).toLocaleDateString('es-ES') + '</td><td>' + esc(nomJ(s.juego)) + (s.aj && s.aj.aire ? ' ✋' : '') + '</td><td>' + esc(s.material) + '</td><td>' + s.n + '</td><td>' + (s.ok1 == null ? '—' : s.ok1 + ' %') + '</td><td>' + seg(s.med) + '</td><td>' + esc(s.nota || '') + '</td></tr>'; }).join('') + '</table></section>';
  h += '<footer class="pf-pie"><p><b>Cómo leer este informe.</b> Son datos de juego, orientativos: no hay baremos ni valor diagnóstico y no sustituyen las pruebas estandarizadas ni la valoración clínica. «A la primera» es acertar sin ningún toque equivocado antes. El tiempo cuenta desde que aparece la pregunta hasta la respuesta correcta e incluye oír la consigna. «Suena parecido» es una estimación automática por la forma de la palabra. Sin nombres: el perfil es un código. Los datos se guardan solo en este aparato.</p><p>Fichas vivas · ColmenIA · con #ponunlogopedaentuvida</p></footer>';
  return h;
}
var CSS_INF = '.pf-cab{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;border-bottom:3px solid #2FA866;padding-bottom:10px;margin-bottom:10px}.pf-cab h1{font-size:24px;margin:0}.pf-cab p{margin:4px 0 0;color:#4d6457}.pf-ver{font-size:13px;color:#4d6457}section{margin:16px 0;break-inside:avoid}h2{font-size:19px;margin:0 0 8px}h3{font-size:15px;margin:6px 0}.pf-dos{display:grid;grid-template-columns:1fr 1fr;gap:16px}@media(max-width:700px){.pf-dos{grid-template-columns:1fr}}svg{width:100%;height:auto}.pf-t{width:100%;border-collapse:collapse;font-size:14px}.pf-t th,.pf-t td{border-bottom:1px solid #e5ece6;padding:6px;text-align:left;vertical-align:top}.pf-peq{font-size:13px;color:#4d6457;margin:0 0 6px}.pf-vacio{color:#4d6457;font-style:italic}.pf-conf{margin:0;padding-left:20px}.pf-pie{font-size:12px;color:#4d6457;border-top:1px solid #e5ece6;margin-top:18px;padding-top:8px}';

/* ===================== Exportar ===================== */
function baja(nombre, txt, tipo) { var b = new Blob([txt], { type: tipo }), a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = nombre; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1500); }
function csv(p) {
  var L = ['perfil;sesion;fecha;juego;material;tiempo_desde_inicio_ms;objetivo;categoria_objetivo;elegido;categoria_elegido;correcto;latencia_ms;ayuda;tipo;nivel'];
  p.sesiones.forEach(function (s, i) { s.ev.forEach(function (e) { L.push([p.codigo, i + 1, new Date(s.t0).toISOString(), s.juego, s.material, e.t, e.o, e.oc, e.e, e.ec, e.ok, e.ms, e.ay, e.k, e.x].map(function (v) { return v == null ? '' : String(v).replace(/;/g, ','); }).join(';')); }); });
  return '﻿' + L.join('\n');
}
function json(p) { return JSON.stringify({ formato: 'fichas-vivas-v1', exportado: new Date().toISOString(), perfil: { codigo: p.codigo, edad: p.edad, objetivo: p.objetivo, publico: p.publico, medidas: p.medidas }, sesiones: p.sesiones, nota: 'Sin datos personales. Eventos: o=objetivo, e=elegido, ok=acierto, ms=latencia, ay=ayuda, k=tipo, x=nivel (nombrar).' }, null, 1); }

/* ===================== Interfaz ===================== */
function modal(html, ancho) {
  var m = document.createElement('div'); m.className = 'modal'; m.style.zIndex = 88;
  m.innerHTML = '<div class="panel" style="max-width:' + (ancho || 760) + 'px"><button class="btn sec peq x" type="button" data-x>✕</button>' + html + '</div>';
  m.addEventListener('click', function (e) { if (e.target === m || e.target.closest('[data-x]')) m.remove(); });
  document.body.appendChild(m); return m;
}
function badge() {
  var b = $('btnPerfil'); if (!b) return; var p = activo();
  var t = b.querySelector('.pf-lbl'); if (t) t.textContent = p ? p.codigo : 'Perfil';
  b.classList.toggle('pf-on', !!p); b.setAttribute('aria-label', p ? 'Perfil activo ' + p.codigo : 'Perfiles');
  var j = $('jPerfil'); if (j) j.textContent = p ? 'Perfil ' + p.codigo : '';
}
FV.badgePerfil = badge;
function panel() {
  var codes = Object.keys(D.perfiles).sort();
  var h = '<h2 style="margin-top:0">👤 Perfiles anónimos</h2><p class="nota">Cada perfil es un código, sin nombres. Con un perfil activo se apunta cada respuesta para el informe. Todo se queda en este aparato.</p>' +
    '<div class="caja" style="margin:10px 0"><b>Nuevo perfil</b><div class="fila" style="margin-top:8px"><label>Código <input type="text" id="pfCod" maxlength="12" value="' + sigCodigo() + '" style="width:110px"></label>' +
    '<label>Edad <select id="pfEdad"><option value="">—</option><option>3-5 años</option><option>6-8 años</option><option>9-12 años</option><option>13-17 años</option><option>18-40 años</option><option>41-65 años</option><option>más de 65</option></select></label>' +
    '<label>Objetivo <input type="text" id="pfObj" maxlength="60" placeholder="p. ej. vocabulario del cuerpo" style="min-width:220px"></label><button class="btn" id="pfCrear" type="button">Crear y activar</button></div>' +
    '<p class="nota" style="margin:6px 0 0">No escribas nombres, iniciales ni datos que identifiquen a la persona.</p></div>';
  h += codes.length ? '<div class="lib">' + codes.map(function (c) { var p = D.perfiles[c]; return '<div class="caja" data-pf="' + esc(c) + '"><b style="font-size:20px">' + esc(c) + '</b>' + (D.activo === c ? ' <span class="chip" aria-pressed="true" style="font-size:12px;min-height:0;padding:2px 8px">activo</span>' : '') + '<p class="nota">' + (p.edad ? esc(p.edad) + ' · ' : '') + p.sesiones.length + ' sesiones' + (p.objetivo ? '<br>' + esc(p.objetivo) : '') + '</p><div class="fila"><button class="btn peq" data-a="activar" type="button">' + (D.activo === c ? 'Desactivar' : 'Activar') + '</button><button class="btn sec peq" data-a="informe" type="button">📊 Informe</button><button class="btn sec peq" data-a="medidas" type="button">＋ Medidas</button><button class="btn sec peq" data-a="exportar" type="button">⬇</button><button class="btn sec peq" data-a="borrar" type="button">🗑</button></div></div>'; }).join('') + '</div>' : '<p class="nota">Aún no hay perfiles.</p>';
  var m = modal(h, 900);
  m.querySelector('#pfCrear').onclick = function () {
    var c = (m.querySelector('#pfCod').value || '').trim().toUpperCase().replace(/[^A-Z0-9\-]/g, '').slice(0, 12) || sigCodigo();
    if (D.perfiles[c]) { alert('Ya existe ese código.'); return; }
    D.perfiles[c] = { codigo: c, edad: m.querySelector('#pfEdad').value, objetivo: m.querySelector('#pfObj').value.trim().slice(0, 60), publico: localStorage.getItem('fv-publico') || '', creado: Date.now(), medidas: [], sesiones: [] };
    D.activo = c; guarda(); badge(); FV.cuenta('perfil_nuevo'); m.remove(); panel();
  };
  m.addEventListener('click', function (e) {
    var b = e.target.closest('[data-a]'), box = e.target.closest('[data-pf]'); if (!b || !box) return;
    var c = box.dataset.pf, p = D.perfiles[c], a = b.dataset.a;
    if (a === 'activar') { D.activo = D.activo === c ? '' : c; guarda(); badge(); m.remove(); panel(); }
    if (a === 'informe') { m.remove(); abreInforme(c); }
    if (a === 'medidas') { m.remove(); editaMedidas(c); }
    if (a === 'exportar') { baja('perfil-' + c + '.json', json(p), 'application/json'); }
    if (a === 'borrar' && confirm('¿Borrar el perfil ' + c + ' y sus ' + p.sesiones.length + ' sesiones? No se puede deshacer.')) { delete D.perfiles[c]; if (D.activo === c) D.activo = ''; guarda(); badge(); m.remove(); panel(); }
  });
}
FV.abrePerfiles = panel;
function editaMedidas(c) {
  var p = D.perfiles[c];
  var h = '<h2 style="margin-top:0">Medidas propias · ' + esc(c) + '</h2><p class="nota">Lo que tú quieras observar en cada sesión (atención, fatiga, intención comunicativa, inteligibilidad…). Se rellena al acabar cada juego y sale en el informe.</p>' +
    '<ul>' + (p.medidas.length ? p.medidas.map(function (x, i) { return '<li>' + esc(x.nombre) + ' <span class="nota">(' + { escala: 'escala 1-5', sino: 'sí / no', num: 'número', texto: 'texto' }[x.tipo] + ')</span> <button class="btn sec peq" data-q="' + i + '" type="button">Quitar</button></li>'; }).join('') : '<li class="nota">Ninguna todavía.</li>') + '</ul>' +
    '<div class="fila"><input type="text" id="mdN" maxlength="40" placeholder="Nombre, p. ej. Atención" style="min-width:200px"><select id="mdT"><option value="escala">Escala 1-5</option><option value="sino">Sí / no</option><option value="num">Número</option><option value="texto">Texto</option></select><button class="btn" id="mdA" type="button">Añadir</button></div>' +
    '<p class="nota">Sugerencias: atención (1-5), fatiga (1-5), inteligibilidad (1-5), iniciativa comunicativa (sí/no), nº de producciones correctas (número).</p>';
  var m = modal(h, 640);
  m.querySelector('#mdA').onclick = function () { var n = m.querySelector('#mdN').value.trim(); if (!n) return; p.medidas.push({ id: 'm' + FV.uid(), nombre: n.slice(0, 40), tipo: m.querySelector('#mdT').value }); guarda(); FV.cuenta('perfil_medida'); m.remove(); editaMedidas(c); };
  m.addEventListener('click', function (e) { var b = e.target.closest('[data-q]'); if (b) { p.medidas.splice(+b.dataset.q, 1); guarda(); m.remove(); editaMedidas(c); } });
}
function abreInforme(c) {
  var p = D.perfiles[c]; var A = analiza(p); FV.cuenta('perfil_informe');
  var m = modal('<style>' + CSS_INF + '</style><div class="fila" style="margin-bottom:10px"><button class="btn" id="infImp" type="button">🖨 Imprimir o PDF</button><button class="btn sec peq" id="infCsv" type="button">⬇ Respuestas (CSV)</button><button class="btn sec peq" id="infJson" type="button">⬇ Datos (JSON)</button></div><div id="infCuerpo" style="background:#fff;border-radius:14px;padding:16px">' + informeHTML(p, A) + '</div>', 980);
  m.querySelector('#infCsv').onclick = function () { baja('respuestas-' + c + '.csv', csv(p), 'text/csv'); };
  m.querySelector('#infJson').onclick = function () { baja('perfil-' + c + '.json', json(p), 'application/json'); };
  m.querySelector('#infImp').onclick = function () {
    var w = window.open('', '_blank'); if (!w) { alert('Permite las ventanas emergentes para imprimir.'); return; }
    w.document.write('<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><title>Informe ' + esc(c) + ' · Fichas vivas</title><style>@page{size:A4;margin:12mm}body{font-family:system-ui,sans-serif;color:#10231A;margin:0}' + CSS_INF + '</style></head><body>' + informeHTML(p, A) + '<script>window.onload=function(){setTimeout(function(){window.print()},300)}<\/script></body></html>'); w.document.close();
  };
}
FV.abreInforme = abreInforme;

/* Tras cada juego con perfil: medidas propias y observaciones */
FV.cierreSesion = function (s, cont) {
  var p = activo(); if (!p || !s || !cont) return;
  var h = '<div class="caja" style="text-align:left;margin-top:12px"><b>Perfil ' + esc(p.codigo) + ' · esta sesión</b>' +
    p.medidas.map(function (x) {
      var inp = x.tipo === 'escala' ? '<select data-m="' + x.id + '"><option value="">—</option><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option></select>' : x.tipo === 'sino' ? '<select data-m="' + x.id + '"><option value="">—</option><option>sí</option><option>no</option></select>' : '<input type="' + (x.tipo === 'num' ? 'number' : 'text') + '" data-m="' + x.id + '" style="width:140px">';
      return '<div class="fila" style="margin-top:6px"><span style="min-width:150px">' + esc(x.nombre) + '</span>' + inp + '</div>';
    }).join('') +
    '<textarea id="pfNota" rows="2" maxlength="300" placeholder="Observaciones (sin nombres)" style="width:100%;margin-top:8px"></textarea><div class="fila" style="margin-top:6px"><button class="btn peq" id="pfGuarda" type="button">Guardar en el perfil</button><button class="btn sec peq" id="pfInf" type="button">📊 Ver informe</button><span class="nota" id="pfOk"></span></div></div>';
  var d = document.createElement('div'); d.innerHTML = h; cont.appendChild(d);
  d.querySelector('#pfGuarda').onclick = function () {
    d.querySelectorAll('[data-m]').forEach(function (i) { s.extra[i.dataset.m] = i.value; });
    s.nota = d.querySelector('#pfNota').value.trim().slice(0, 300); guarda(); d.querySelector('#pfOk').textContent = 'Guardado.';
  };
  d.querySelector('#pfInf').onclick = function () { abreInforme(p.codigo); };
};

document.addEventListener('DOMContentLoaded', badge); badge();
var b = $('btnPerfil'); if (b) b.addEventListener('click', panel);
})();
