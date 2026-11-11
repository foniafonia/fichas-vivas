/* Fichas vivas · motor de juegos. Todo se juega tocando (dedo, ratón, pizarra
   digital o la mano en el aire): sin arrastrar, para que sirva a todos. */
(function () {
'use strict';
var FV = window.FV, $ = FV.$, esc = FV.esc, baraja = FV.baraja, AJ = FV.aj;

function conTexto(cs) { return cs.filter(function (c) { return c.texto; }); }
function conImg(cs) { return cs.filter(function (c) { return c.img; }); }
function categorias(cs) { var m = {}; cs.forEach(function (c) { if (c.cat) (m[c.cat] = m[c.cat] || []).push(c); }); return m; }
function minimo(n, cs, que) { return cs.length < n ? 'Necesita al menos ' + n + ' cartas' + (que ? ' ' + que : '') + '.' : ''; }

FV.JUEGOS = [
  { id: 'tablero', ico: '🗣️', nombre: 'Tablero que habla', desc: 'Toca una carta: se hace grande y se oye.', trabaja: 'vocabulario, comprensión, imitación', req: function (s, cs) { return minimo(1, cs); } },
  { id: 'escucha', ico: '👂', nombre: 'Escucha y toca', desc: 'Oye «¿Dónde está…?» y toca la carta. Con 2 o 3 palabras seguidas, en orden.', trabaja: 'comprensión auditiva, memoria auditiva', req: function (s, cs) { return minimo(2, conTexto(cs), 'con palabra'); } },
  { id: 'lee', ico: '📖', nombre: 'Lee y toca', desc: 'Sale la palabra escrita y hay que tocar su dibujo.', trabaja: 'lectura global, asociación palabra–imagen', req: function (s, cs) { return minimo(2, conImg(conTexto(cs)), 'con dibujo y palabra'); } },
  { id: 'une', ico: '🔗', nombre: 'Une dibujo y palabra', desc: 'Dos columnas: toca un dibujo y después su palabra.', trabaja: 'lectura, asociación, atención', req: function (s, cs) { return minimo(2, conImg(conTexto(cs)), 'con dibujo y palabra'); } },
  { id: 'memoria', ico: '🧠', nombre: 'Memoria de parejas', desc: 'Cartas boca abajo: encuentra las dos iguales.', trabaja: 'memoria visual, atención, turnos', req: function (s, cs) { return minimo(2, conImg(cs), 'con dibujo'); } },
  { id: 'memoriap', ico: '🧩', nombre: 'Memoria dibujo–palabra', desc: 'La pareja de cada dibujo es su palabra escrita.', trabaja: 'memoria, lectura', req: function (s, cs) { return minimo(2, conImg(conTexto(cs)), 'con dibujo y palabra'); } },
  { id: 'falta', ico: '❓', nombre: '¿Qué falta?', desc: 'Mira las cartas, se tapan y desaparece una. ¿Cuál era?', trabaja: 'memoria visual, evocación', req: function (s, cs) { return minimo(3, cs); } },
  { id: 'sombras', ico: '🌑', nombre: 'Sombras', desc: '¿De quién es esta sombra? Elige el dibujo.', trabaja: 'percepción visual, forma, vocabulario', req: function (s, cs) { return minimo(2, conImg(cs), 'con dibujo'); } },
  { id: 'detective', ico: '🔍', nombre: '¿Qué se esconde?', desc: 'El dibujo se destapa poco a poco. Adivina antes del final.', trabaja: 'cierre visual, anticipación, atención', req: function (s, cs) { return minimo(2, conImg(cs), 'con dibujo'); } },
  { id: 'clasifica', ico: '🗂️', nombre: 'Clasifica', desc: 'Cada carta a su caja: mascotas, aseo… (las categorías las pones tú).', trabaja: 'categorización semántica', req: function (s, cs) { return Object.keys(categorias(cs)).length < 2 ? 'Pon al menos 2 categorías en «Editar material».' : ''; } },
  { id: 'intruso', ico: '🕵️', nombre: 'El intruso', desc: 'Cuatro cartas, una no va con las demás.', trabaja: 'categorización, razonamiento verbal', req: function (s, cs) { var m = categorias(cs), k = Object.keys(m); return k.length < 2 || !k.some(function (x) { return m[x].length >= 3; }) ? 'Necesita 2 categorías y 3 cartas en una de ellas.' : ''; } },
  { id: 'nombra', ico: '💬', nombre: 'Nombra con pistas', desc: 'Sale un dibujo para decirlo. Pistas: letra, primera sílaba, palabra. Marcas cómo salió.', trabaja: 'denominación, acceso léxico (niños y adultos con afasia)', req: function (s, cs) { return minimo(1, conTexto(cs), 'con palabra'); } },
  { id: 'escena', ico: '🏞️', nombre: '¿Dónde está? En la escena', desc: 'En la lámina: oye «¿Dónde está…?» y toca el objeto.', trabaja: 'comprensión, búsqueda visual, vocabulario en contexto', req: function (s) { return s.escenas.some(function (e) { return e.zonas.length >= 2; }) ? '' : 'Sube una escena y marca al menos 2 zonas.'; } },
  { id: 'explora', ico: '🖐️', nombre: 'Explora la escena', desc: 'Toca las cosas de la lámina y escucha cómo se llaman.', trabaja: 'vocabulario, atención conjunta', req: function (s) { return s.escenas.some(function (e) { return e.zonas.length >= 1; }) ? '' : 'Sube una escena y marca alguna zona.'; } },
  { id: 'ruleta', ico: '🎡', nombre: 'Ruleta de hablar', desc: 'Gira y sale una carta con una pregunta: ¿para qué sirve?, ¿quién lo usa?, una frase…', trabaja: 'expresión, definición, discurso', req: function (s, cs) { return minimo(2, cs); } },
  { id: 'bingo', ico: '🎱', nombre: 'Bingo cantado', desc: 'Para grupo: la pantalla canta las cartas. Imprime los cartones abajo.', trabaja: 'atención auditiva, turnos, grupo', req: function (s, cs) { return minimo(4, cs); } }
];
var NOMBRE = {}; FV.JUEGOS.forEach(function (j) { NOMBRE[j.id] = j.nombre; });

/* ===================== Marco de partida ===================== */
var G = null, T = [];
function tarde(f, ms) { T.push(setTimeout(f, ms)); }
function limpia() { T.forEach(clearTimeout); T = []; if (G && G.intervalo) clearInterval(G.intervalo); FV.callar(); }
var E = $('escenario');
function prog(t) { $('jProg').textContent = t || ''; }
function cartaHTML(c, modo, cls) {
  var h = '';
  var img = function (u) { return '<img src="' + esc(u) + '" alt="' + esc(FV.textoCarta(c)) + '" draggable="false">'; };
  var txt = '<div class="pal">' + esc(FV.textoCarta(c)) + '</div>';
  if (modo === 'pal') h = c.pimg ? img(c.pimg) : txt;
  else if (modo === 'txt') h = txt;
  else if (modo === 'img+txt') h = (c.img ? img(c.img) : '') + txt;
  else h = c.img ? img(c.img) : (c.pimg ? img(c.pimg) : txt);
  return '<div class="carta tocable ' + (cls || '') + (modo === 'txt' || (modo === 'pal' && !c.pimg) || (!c.img && !c.pimg) ? ' solo-pal' : '') + '" role="button" tabindex="0" data-id="' + esc(c.id) + '">' + h + '</div>';
}
function modoVer() { return AJ.ver; }
function rejilla(n) {
  var w = AJ.tam === 's' ? 190 : AJ.tam === 'l' ? 340 : 260, aire = document.body.classList.contains('aire-on');
  if (aire) w = Math.max(w, 270);
  var anchoDisp = Math.min(window.innerWidth - 48, 1280), cols = Math.max(1, Math.min(n, Math.floor(anchoDisp / (w + 18))));
  if (n === 4 && cols === 3) cols = 2; if (n === 6 && cols === 4) cols = 3; if (n === 9 && cols > 3 && cols < 9) cols = 3;
  return 'grid-template-columns:repeat(' + cols + ',minmax(0,' + w + 'px))';
}
function porId(id) { return FV.set.cartas.filter(function (c) { return c.id === id; })[0]; }
function objetivos(lista, n) { var r = [], ult = null; while (r.length < n && lista.length) { var b = baraja(lista); b.forEach(function (c) { if (r.length < n && c !== ult) { r.push(c); ult = c; } }); if (lista.length === 1) break; } return r; }
function opciones(obj, pool, n) { return baraja([obj].concat(baraja(pool.filter(function (c) { return c !== obj && FV.textoCarta(c) !== FV.textoCarta(obj); })).slice(0, Math.max(1, n - 1)))); }
function abre(id) {
  limpia(); G = { id: id, ac: 0, int: 0, ay: 0, t0: Date.now(), tq: Date.now(), ayR: 0, det: '' }; if (FV.mide) FV.mide.inicio(id);
  $('juego').classList.remove('oculto'); $('jNombre').textContent = NOMBRE[id] || ''; document.body.style.overflow = 'hidden';
  E.innerHTML = ''; prog(''); FV.cuenta('juego_' + id); FV.cuenta('jugar');
}
function cierra() { if (FV.mide && FV.mide.activo()) FV.mide.fin(); limpia(); $('juego').classList.add('oculto'); document.body.style.overflow = ''; G = null; FV.pintaRegistro(); }
$('jSalir').addEventListener('click', cierra);
$('jOtra').addEventListener('click', function () { if (G) FV.empieza(G.id); });
document.addEventListener('keydown', function (e) {
  if ($('juego').classList.contains('oculto')) return;
  if (e.key === 'Escape') cierra();
  if ((e.key === 'Enter' || e.key === ' ') && e.target.classList && e.target.classList.contains('tocable') && e.target.tagName !== 'BUTTON') { e.preventDefault(); e.target.click(); }
});
function fin(texto) {
  limpia();
  var seg = (Date.now() - G.t0) / 1000;
  FV.registra({ juego: NOMBRE[G.id], aciertos: G.ac, intentos: G.int, ayudas: G.ay, seg: seg, detalle: G.det }); var sesP = FV.mide ? FV.mide.fin() : null;
  FV.suena('fin'); FV.confeti(); FV.habla([FV.frase('terminado')]); FV.cuenta('fin_' + G.id);
  var res = texto || (AJ.tranq ? 'Lo has hecho genial.' : G.ac + ' aciertos en ' + G.int + ' intentos' + (G.ay ? ' · ' + G.ay + ' ayudas' : '') + '.');
  E.innerHTML = '<div class="fin"><div class="gr">🎉</div><h2 style="margin:0 0 6px">¡Terminado!</h2><p style="font-size:20px">' + esc(res) + '</p>' +
    '<div class="fila" style="justify-content:center;margin:14px 0"><button class="btn oro tocable" id="fOtra" type="button">↻ Otra vez</button><button class="btn sec tocable" id="fOtro" type="button">Elegir otro juego</button></div>' +
    '<p class="nota" style="margin:10px 0 6px">¿Le falta algo a este juego? Pídelo a la abeja o cuéntalo en ColmenIA, la comunidad donde nació esta herramienta.</p>' +
    '<div class="fila" style="justify-content:center"><button class="btn sec peq tocable" id="fAbeja" type="button">🐝 Pedir una mejora</button><a class="btn peq tocable" data-sk="fin" target="_blank" rel="noopener">Entrar en ColmenIA</a></div></div>';
  FV.puentes(E); prog('');
  $('fOtra').onclick = function () { FV.empieza(G.id); }; if (sesP && FV.cierreSesion) FV.cierreSesion(sesP, E.querySelector('.fin')); $('fOtro').onclick = cierra; $('fAbeja').onclick = function () { FV.abreMejora(); };
}
function apunta(o, e, ok, k, x) { if (!FV.mide || !G) return; FV.mide.ev({ o: o, e: e, ok: ok, ms: Date.now() - G.tq, ay: G.ayR, k: k, x: x }); if (ok) G.ayR = 0; }
FV._apunta = apunta;
function bien(el, c, sig) {
  if (c) apunta(c, c, 1);
  G.ac++; G.int++; if (el) el.classList.add('bien'); FV.suena('bien');
  FV.habla([FV.frase(Math.random() < .5 ? 'eso_es' : 'muy_bien')].concat(c ? [FV.vozCarta(c, 'w')] : []));
  if (sig) tarde(function () { if (G) G.tq = Date.now(); sig(); }, 1500);
}
function mal(el, tocada, buscada) {
  if (buscada) apunta(buscada, tocada, 0);
  G.int++; if (el) { el.classList.remove('mal'); void el.offsetWidth; el.classList.add('mal'); }
  if (AJ.tranq && tocada && buscada) FV.habla([FV.frase('ese_es'), FV.vozCarta(tocada, 'w'), FV.frase('busca'), FV.vozCarta(buscada, 'w')]);
  else { FV.suena('mal'); FV.habla([FV.frase('otra_vez')]); }
}
function ayuda(cont, buscada) {
  G.ay++; G.ayR = 1; var e = cont.querySelector('[data-id="' + buscada.id + '"]'); if (e) e.classList.add('sel');
}
function oir(f) { return '<button class="btn sec peq tocable" type="button" data-oir="1" aria-label="Volver a oír">🔊 Oír</button>'; }
E.addEventListener('click', function (e) { var b = e.target.closest('[data-oir]'); if (b && G && G.repite) G.repite(); });

FV.empieza = function (id) {
  var cs = FV.cartas(); abre(id);
  var f = JUEGO[id]; if (f) f(cs); else E.innerHTML = '<p>Juego en preparación.</p>';
};
var JUEGO = {};

/* ---------- 1. Tablero que habla ---------- */
JUEGO.tablero = function (cs) {
  var L = cs.slice(0, 40);
  E.innerHTML = '<div class="consigna">Toca una carta</div><div class="cartas" style="' + rejilla(L.length) + '">' + L.map(function (c) { return cartaHTML(c, modoVer()); }).join('') + '</div>';
  var cont = E.querySelector('.cartas'); prog(L.length + ' cartas');
  cont.addEventListener('click', function (e) {
    var el = e.target.closest('.carta'); if (!el) return; var c = porId(el.dataset.id); G.int++;
    var ov = document.createElement('div'); ov.className = 'modal'; ov.style.zIndex = 85;
    ov.innerHTML = cartaHTML(c, 'img+txt', 'grande');
    ov.addEventListener('click', function () { ov.remove(); FV.callar(); }); document.body.appendChild(ov);
    FV.dice(c, 'w'); tarde(function () { if (ov.parentNode) ov.remove(); }, 6000);
  });
  G.repite = null;
};

/* ---------- 2. Escucha y toca (1-3 en orden) ---------- */
JUEGO.escucha = function (cs) {
  var pool = conTexto(cs), k = Math.max(1, Math.min(3, +AJ.sec || 1)), n = Math.max(k + 1, Math.min(AJ.n, pool.length)), R = AJ.r, ronda = 0, fallosR = 0;
  function nueva() {
    if (ronda >= R) { fin(); return; }
    ronda++; fallosR = 0; prog('Ronda ' + ronda + ' de ' + R);
    var vista = baraja(pool).slice(0, n), seq = baraja(vista).slice(0, k), paso = 0;
    E.innerHTML = '<div class="consigna">' + (k > 1 ? 'Toca en orden ' : '¿Dónde está?') + ' ' + oir() + '</div><div class="cartas" style="' + rejilla(n) + '">' + vista.map(function (c) { return cartaHTML(c, modoVer()); }).join('') + '</div>';
    var cont = E.querySelector('.cartas');
    G.repite = function () {
      if (k === 1) FV.habla(FV.vozCarta(seq[0], 'q'));
      else { var p = [FV.frase('en_orden')]; seq.forEach(function (c, i) { if (i) p.push(FV.frase(i === seq.length - 1 ? 'y' : 'luego')); p.push(FV.vozCarta(c, 'w')); }); FV.habla(p); }
    };
    G.repite();
    cont.onclick = function (e) {
      var el = e.target.closest('.carta'); if (!el || el.classList.contains('bien')) return;
      var c = porId(el.dataset.id), obj = seq[paso];
      if (c === obj) {
        paso++; el.classList.add('bien');
        if (k > 1) { var m = document.createElement('span'); m.className = 'marca'; m.style.background = 'var(--verde)'; m.textContent = paso; el.appendChild(m); }
        if (k > 1) apunta(obj, c, 1, 'paso'); if (paso >= seq.length) { if (k > 1) apunta(seq[0], null, 1, 'secuencia'); G.det += (G.det ? ',' : '') + seq.map(function (x) { return x.texto; }).join('+') + (fallosR ? '(' + fallosR + ')' : ''); bien(null, k === 1 ? obj : null, nueva); }
        else { FV.suena('bien'); }
      } else {
        fallosR++; if (k > 1) apunta(obj, c, 0, 'secuencia'); mal(el, c, obj);
        if (fallosR >= 2 && AJ.tranq) ayuda(cont, obj);
        if (k > 1 && !AJ.tranq) { paso = 0; cont.querySelectorAll('.carta').forEach(function (x) { x.classList.remove('bien'); var mm = x.querySelector('.marca'); if (mm) mm.remove(); }); }
      }
    };
  }
  nueva();
};

/* ---------- 3. Lee y toca ---------- */
JUEGO.lee = function (cs) {
  var pool = conImg(conTexto(cs)), n = Math.max(2, Math.min(AJ.n, pool.length)), objs = objetivos(pool, AJ.r), i = 0, fallos = 0;
  function nueva() {
    if (i >= objs.length) { fin(); return; }
    var obj = objs[i++]; fallos = 0; prog('Ronda ' + i + ' de ' + objs.length);
    var ops = opciones(obj, pool, n);
    E.innerHTML = '<div class="consigna">' + cartaHTML(obj, 'pal', 'grande').replace('tocable', '').replace('role="button" tabindex="0"', '') + '</div><div class="consigna" style="font-size:18px">Toca su dibujo ' + oir() + '</div><div class="cartas" style="' + rejilla(n) + '">' + ops.map(function (c) { return cartaHTML(c, 'img'); }).join('') + '</div>';
    E.querySelector('.grande').style.minHeight = '120px';
    var cont = E.querySelectorAll('.cartas')[0];
    G.repite = function () { FV.dice(obj, 'w'); };
    if (i === 1) FV.habla([FV.frase('lee')]);
    cont.onclick = function (e) {
      var el = e.target.closest('.carta'); if (!el) return; var c = porId(el.dataset.id);
      if (c === obj) bien(el, obj, nueva); else { fallos++; mal(el, c, obj); if (fallos >= 2 && AJ.tranq) ayuda(cont, obj); }
    };
  }
  nueva();
};

/* ---------- 4. Une dibujo y palabra ---------- */
JUEGO.une = function (cs) {
  var pool = conImg(conTexto(cs)), n = Math.max(2, Math.min(AJ.n, 6, pool.length)), tandas = Math.max(1, Math.round(AJ.r / n)), t = 0;
  var COL = ['#2FA866', '#F2B33D', '#5BB0E0', '#D9534F', '#8E6CC9', '#E07B39'];
  function nueva() {
    if (t >= tandas) { fin(); return; }
    t++; prog('Tanda ' + t + ' de ' + tandas);
    var sel = baraja(pool).slice(0, n), izq = baraja(sel), der = baraja(sel), elegido = null, hechas = 0;
    E.innerHTML = '<div class="consigna">Une cada dibujo con su palabra</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:18px;width:100%;max-width:900px">' +
      '<div class="cartas" id="uI" style="grid-template-columns:1fr">' + izq.map(function (c) { return cartaHTML(c, 'img').replace('data-id', 'data-lado="i" data-id'); }).join('') + '</div>' +
      '<div class="cartas" id="uD" style="grid-template-columns:1fr">' + der.map(function (c) { return cartaHTML(c, 'pal').replace('data-id', 'data-lado="d" data-id'); }).join('') + '</div></div>';
    E.querySelectorAll('.carta').forEach(function (x) { x.style.minHeight = '80px'; var im = x.querySelector('img'); if (im) im.style.maxHeight = Math.max(70, Math.floor((window.innerHeight - 200) / n) - 30) + 'px'; });
    if (t === 1) FV.habla([FV.frase('une')]);
    G.repite = null;
    E.onclick = function (e) {
      var el = e.target.closest('.carta'); if (!el || el.classList.contains('hecha')) return;
      if (!elegido || elegido.dataset.lado === el.dataset.lado) { if (elegido) elegido.classList.remove('sel'); elegido = el; el.classList.add('sel'); if (el.dataset.lado === 'i') FV.dice(porId(el.dataset.id), 'w'); return; }
      var a = porId(elegido.dataset.id), b = porId(el.dataset.id);
      if (a === b) {
        var col = COL[hechas % COL.length]; hechas++;
        [elegido, el].forEach(function (x) { x.classList.remove('sel'); x.classList.add('bien'); x.style.borderColor = col; var m = document.createElement('span'); m.className = 'marca'; m.style.background = col; m.textContent = hechas; x.appendChild(m); x.classList.add('hecha'); x.style.opacity = '.75'; });
        apunta(a, b, 1, 'une'); G.tq = Date.now(); elegido = null; G.ac++; G.int++; FV.suena('bien'); FV.dice(a, 'w');
        if (hechas >= n) tarde(nueva, 1400);
      } else { apunta(a, b, 0, 'une'); mal(el, null, null); elegido.classList.remove('sel'); elegido = null; }
    };
  }
  nueva();
};

/* ---------- 5 y 6. Memoria ---------- */
function memoria(cs, conPalabra) {
  var pool = conPalabra ? conImg(conTexto(cs)) : conImg(cs), n = Math.max(2, Math.min(AJ.n, 8, pool.length));
  var sel = baraja(pool).slice(0, n), cartas = [];
  sel.forEach(function (c) { cartas.push({ c: c, m: 'img' }); cartas.push({ c: c, m: conPalabra ? 'pal' : 'img' }); });
  cartas = baraja(cartas); var abiertas = [], hechas = 0, bloqueo = false;
  prog(n + ' parejas'); FV.habla([FV.frase('parejas')]);
  E.innerHTML = '<div class="consigna">Busca las parejas</div><div class="cartas" style="' + rejilla(cartas.length) + '">' + cartas.map(function (x, i) { return cartaHTML(x.c, x.m, 'tapada').replace('data-id', 'data-k="' + i + '" data-id'); }).join('') + '</div>';
  E.querySelectorAll('.carta').forEach(function (x) { x.style.minHeight = AJ.tam === 'l' ? '170px' : '120px'; });
  G.repite = null;
  E.querySelector('.cartas').onclick = function (e) {
    var el = e.target.closest('.carta'); if (!el || bloqueo || !el.classList.contains('tapada')) return;
    el.classList.remove('tapada'); abiertas.push(el);
    if (abiertas.length < 2) { if (cartas[+el.dataset.k].m === 'img') FV.dice(porId(el.dataset.id), 'w'); return; }
    G.int++; var a = abiertas[0], b = abiertas[1]; abiertas = [];
    if (a.dataset.id === b.dataset.id) {
      apunta(porId(a.dataset.id), porId(b.dataset.id), 1, 'pareja'); G.tq = Date.now(); hechas++; G.ac++; a.classList.add('bien'); b.classList.add('bien'); FV.suena('bien'); FV.dice(porId(a.dataset.id), 'w');
      if (hechas >= n) tarde(function () { fin(AJ.tranq ? 'Todas las parejas encontradas.' : 'Parejas en ' + G.int + ' intentos.'); }, 1500);
    } else { apunta(porId(a.dataset.id), porId(b.dataset.id), 0, 'pareja'); bloqueo = true; tarde(function () { a.classList.add('tapada'); b.classList.add('tapada'); bloqueo = false; }, 1100); }
  };
}
JUEGO.memoria = function (cs) { memoria(cs, false); };
JUEGO.memoriap = function (cs) { memoria(cs, true); };

/* ---------- 7. ¿Qué falta? ---------- */
JUEGO.falta = function (cs) {
  var n = Math.max(3, Math.min(AJ.n, 6, cs.length)), R = Math.max(3, Math.round(AJ.r / 2)), ronda = 0;
  function nueva() {
    if (ronda >= R) { fin(); return; }
    ronda++; prog('Ronda ' + ronda + ' de ' + R);
    var vista = baraja(cs).slice(0, n), quita = vista[Math.floor(Math.random() * n)], fallos = 0;
    E.innerHTML = '<div class="consigna">Mira bien todas las cartas <button class="btn oro tocable" id="fYa" type="button">Ya me las sé</button></div><div class="cartas" style="' + rejilla(n) + '">' + vista.map(function (c) { return cartaHTML(c, modoVer()); }).join('') + '</div>';
    FV.habla([FV.frase('mira')]); G.repite = null;
    $('fYa').onclick = function () {
      var cont = E.querySelector('.cartas'); cont.querySelectorAll('.carta').forEach(function (x) { x.classList.add('tapada'); });
      E.querySelector('.consigna').innerHTML = '…';
      tarde(function () {
        cont.querySelectorAll('.carta').forEach(function (x) { x.classList.remove('tapada'); if (x.dataset.id === quita.id) x.classList.add('hueco'); });
        var fuera = cs.filter(function (c) { return vista.indexOf(c) < 0; }), ops = baraja([quita].concat(baraja(fuera.length >= 2 ? fuera : vista.filter(function (c) { return c !== quita; })).slice(0, Math.min(3, AJ.n - 1))));
        E.querySelector('.consigna').innerHTML = '¿Qué falta?';
        var d = document.createElement('div'); d.className = 'cartas'; d.setAttribute('style', rejilla(ops.length) + ';border-top:3px dashed var(--linea);padding-top:12px'); d.innerHTML = ops.map(function (c) { return cartaHTML(c, modoVer()); }).join(''); E.appendChild(d);
        FV.habla([FV.frase('falta')]); G.tq = Date.now();
        d.onclick = function (e) {
          var el = e.target.closest('.carta'); if (!el) return; var c = porId(el.dataset.id);
          if (c === quita) { var h = cont.querySelector('.hueco'); if (h) h.classList.remove('hueco'); bien(el, quita, nueva); }
          else { fallos++; mal(el, c, quita); if (fallos >= 2 && AJ.tranq) ayuda(d, quita); }
        };
      }, 1200);
    };
  }
  nueva();
};

/* ---------- 8. Sombras ---------- */
/* Silueta real: se quita el fondo claro conectado con los bordes (relleno desde
   fuera) y lo demás se pinta oscuro. Así las fotos con fondo blanco no salen
   como un rectángulo negro. */
var SIL = {};
function silueta(c, cb) {
  if (SIL[c.id]) { cb(SIL[c.id]); return; }
  var im = new Image();
  im.onload = function () {
    var k = Math.min(1, 420 / Math.max(im.naturalWidth, im.naturalHeight)), w = Math.max(1, Math.round(im.naturalWidth * k)), h = Math.max(1, Math.round(im.naturalHeight * k));
    var cv = document.createElement('canvas'); cv.width = w; cv.height = h; var x = cv.getContext('2d'); x.drawImage(im, 0, 0, w, h);
    var d; try { d = x.getImageData(0, 0, w, h); } catch (e) { cb(null); return; }
    var p = d.data, fuera = new Uint8Array(w * h), pila = [];
    function claro(i) { var r = p[i * 4], g = p[i * 4 + 1], b = p[i * 4 + 2], a = p[i * 4 + 3]; return a < 30 || (r > 218 && g > 218 && b > 218 && Math.max(r, g, b) - Math.min(r, g, b) < 34); }
    for (var i = 0; i < w; i++) { pila.push(i, (h - 1) * w + i); } for (var j = 0; j < h; j++) { pila.push(j * w, j * w + w - 1); }
    while (pila.length) { var q = pila.pop(); if (fuera[q] || !claro(q)) continue; fuera[q] = 1; var qx = q % w, qy = (q - qx) / w; if (qx > 0) pila.push(q - 1); if (qx < w - 1) pila.push(q + 1); if (qy > 0) pila.push(q - w); if (qy < h - 1) pila.push(q + w); }
    var tinta = 0;
    for (var n = 0; n < w * h; n++) { if (fuera[n]) p[n * 4 + 3] = 0; else { p[n * 4] = 22; p[n * 4 + 1] = 38; p[n * 4 + 2] = 30; p[n * 4 + 3] = 255; tinta++; } }
    if (tinta < w * h * .02 || tinta > w * h * .97) { cb(null); return; }
    x.putImageData(d, 0, 0); SIL[c.id] = cv.toDataURL('image/png'); cb(SIL[c.id]);
  };
  im.onerror = function () { cb(null); };
  im.src = c.img;
}
JUEGO.sombras = function (cs) {
  var pool = conImg(cs), n = Math.max(2, Math.min(AJ.n, pool.length)), objs = objetivos(pool, AJ.r), i = 0;
  function nueva() {
    if (i >= objs.length) { fin(); return; }
    var obj = objs[i++], fallos = 0; prog('Ronda ' + i + ' de ' + objs.length);
    var ops = opciones(obj, pool, n);
    E.innerHTML = '<div class="consigna">¿De quién es esta sombra?</div>' + cartaHTML(obj, 'img', 'grande sombra').replace('tocable', '').replace('role="button" tabindex="0"', '') + '<div class="cartas" style="' + rejilla(n) + '">' + ops.map(function (c) { return cartaHTML(c, modoVer()); }).join('') + '</div>';
    var g = E.querySelector('.grande'), gi = g.querySelector('img'); g.style.minHeight = '0'; gi.style.maxHeight = '28vh';
    g.classList.remove('sombra'); gi.style.visibility = 'hidden';
    silueta(obj, function (u) { if (u) { gi.src = u; } else g.classList.add('sombra'); gi.style.visibility = ''; });
    if (i === 1) FV.habla([FV.frase('sombra')]);
    G.repite = null; var cont = E.querySelector('.cartas');
    cont.onclick = function (e) {
      var el = e.target.closest('.carta'); if (!el) return; var c = porId(el.dataset.id);
      if (c === obj) { g.classList.remove('sombra'); gi.src = obj.img; bien(el, obj, nueva); } else { fallos++; mal(el, c, obj); if (fallos >= 2 && AJ.tranq) ayuda(cont, obj); }
    };
  }
  nueva();
};

/* ---------- 9. ¿Qué se esconde? ---------- */
JUEGO.detective = function (cs) {
  var pool = conImg(cs), n = Math.max(2, Math.min(AJ.n, pool.length)), objs = objetivos(pool, AJ.r), i = 0;
  function nueva() {
    if (i >= objs.length) { fin(); return; }
    if (G.intervalo) clearInterval(G.intervalo);
    var obj = objs[i++], fallos = 0; prog('Ronda ' + i + ' de ' + objs.length);
    var ops = opciones(obj, pool, n);
    E.innerHTML = '<div class="consigna">¿Qué será?</div><div class="tablero-det tocable" id="dT"><img src="' + esc(obj.img) + '" alt=""><div class="tapas">' + new Array(13).join('<div></div>') + '</div></div><div class="cartas" style="' + rejilla(n) + '">' + ops.map(function (c) { return cartaHTML(c, AJ.ver === 'img' ? 'img+txt' : modoVer()); }).join('') + '</div>';
    var tapas = [].slice.call(E.querySelectorAll('.tapas div')), orden = baraja(tapas);
    function destapa() { var t = orden.shift(); if (t) t.classList.add('fuera'); else clearInterval(G.intervalo); }
    destapa(); destapa();
    G.intervalo = setInterval(destapa, AJ.tranq ? 2600 : 1700);
    $('dT').onclick = destapa;
    if (i === 1) FV.habla([FV.frase('quien')]);
    G.repite = null; var cont = E.querySelector('.cartas');
    cont.onclick = function (e) {
      var el = e.target.closest('.carta'); if (!el) return; var c = porId(el.dataset.id);
      if (c === obj) { clearInterval(G.intervalo); tapas.forEach(function (t) { t.classList.add('fuera'); }); G.det += (G.det ? ',' : '') + obj.texto + ':' + (12 - orden.length); bien(el, obj, nueva); }
      else { fallos++; mal(el, c, obj); }
    };
  }
  nueva();
};

/* ---------- 10. Clasifica ---------- */
JUEGO.clasifica = function (cs) {
  var m = categorias(cs), cats = Object.keys(m).sort(function (a, b) { return m[b].length - m[a].length; }).slice(0, 4);
  var cola = baraja(cs.filter(function (c) { return cats.indexOf(c.cat) > -1; })).slice(0, Math.max(AJ.r, 6)), i = 0;
  E.innerHTML = '<div class="consigna" id="cC">¿Dónde va?</div><div id="cCarta"></div><div class="cajas-cat" style="grid-template-columns:repeat(' + cats.length + ',1fr)">' + cats.map(function (k) { return '<div class="caja-cat tocable" role="button" tabindex="0" data-cat="' + esc(k) + '"><b>' + esc(k) + '</b><div class="dentro"></div></div>'; }).join('') + '</div>';
  var actual = null, fallos = 0;
  function nueva() {
    if (i >= cola.length) { fin(); return; }
    actual = cola[i++]; fallos = 0; prog((i) + ' de ' + cola.length);
    $('cCarta').innerHTML = cartaHTML(actual, modoVer(), 'grande').replace('tocable', '');
    var g = $('cCarta').firstChild; g.style.minHeight = '0'; g.style.width = 'min(60vw,300px)'; var im = g.querySelector('img'); if (im) im.style.maxHeight = '24vh';
    FV.habla([FV.vozCarta(actual, 'w'), FV.frase('donde_va')]); G.tq = Date.now();
  }
  G.repite = null;
  E.querySelector('.cajas-cat').onclick = function (e) {
    var b = e.target.closest('.caja-cat'); if (!b || !actual) return;
    if (b.dataset.cat === actual.cat) {
      var c = actual; apunta(c, c, 1, 'clasif'); actual = null; G.ac++; G.int++; FV.suena('bien'); b.classList.add('bien');
      var mini = document.createElement('img'); mini.src = c.img || c.pimg || ''; mini.alt = c.texto; if (mini.src) b.querySelector('.dentro').appendChild(mini);
      tarde(function () { b.classList.remove('bien'); nueva(); }, 900);
    } else { apunta(actual, { texto: 'caja ' + b.dataset.cat, cat: b.dataset.cat }, 0, 'clasif'); fallos++; G.int++; b.classList.remove('mal'); void b.offsetWidth; b.classList.add('mal'); FV.suena('mal'); if (fallos >= 2 && AJ.tranq) { G.ay++; var ok = E.querySelector('.caja-cat[data-cat="' + actual.cat.replace(/"/g, '') + '"]'); if (ok) ok.classList.add('sel'); tarde(function () { if (ok) ok.classList.remove('sel'); }, 2000); } }
  };
  nueva();
};

/* ---------- 11. El intruso ---------- */
JUEGO.intruso = function (cs) {
  var m = categorias(cs), grandes = Object.keys(m).filter(function (k) { return m[k].length >= 3; }), R = AJ.r, ronda = 0;
  function nueva() {
    if (ronda >= R) { fin(); return; }
    ronda++; prog('Ronda ' + ronda + ' de ' + R);
    var A = grandes[Math.floor(Math.random() * grandes.length)], otras = Object.keys(m).filter(function (k) { return k !== A; }), B = otras[Math.floor(Math.random() * otras.length)];
    var intr = baraja(m[B])[0], vista = baraja(baraja(m[A]).slice(0, 3).concat([intr])), fallos = 0;
    E.innerHTML = '<div class="consigna">¿Cuál no va con los demás? ' + oir() + '</div><div class="cartas" style="' + rejilla(4) + '">' + vista.map(function (c) { return cartaHTML(c, modoVer()); }).join('') + '</div>';
    G.repite = function () { FV.habla([FV.frase('intruso')]); }; G.repite();
    var cont = E.querySelector('.cartas');
    cont.onclick = function (e) {
      var el = e.target.closest('.carta'); if (!el) return; var c = porId(el.dataset.id);
      if (c === intr) { G.det += (G.det ? ',' : '') + intr.texto; bien(el, intr, nueva); E.querySelector('.consigna').textContent = FV.textoCarta(intr) + ' es de «' + B + '»; las demás, de «' + A + '».'; }
      else { apunta(intr, c, 0, 'intruso'); fallos++; G.int++; el.classList.remove('mal'); void el.offsetWidth; el.classList.add('mal'); FV.habla([FV.vozCarta(c, 'w')]); if (fallos >= 2 && AJ.tranq) ayuda(cont, intr); }
    };
  }
  nueva();
};

/* ---------- 12. Nombra con pistas ---------- */
JUEGO.nombra = function (cs) {
  var pool = conTexto(cs), objs = objetivos(pool, AJ.r), i = 0, cuenta = { solo: 0, pista: 0, ayuda: 0, no: 0 }, nivel = 0;
  function nueva() {
    if (i >= objs.length) { G.det = 'solo ' + cuenta.solo + ', con pista ' + cuenta.pista + ', con ayuda ' + cuenta.ayuda + ', aún no ' + cuenta.no; fin('Solo: ' + cuenta.solo + ' · con pista: ' + cuenta.pista + ' · con ayuda: ' + cuenta.ayuda + ' · aún no: ' + cuenta.no); return; }
    var obj = objs[i++]; nivel = 0; prog(i + ' de ' + objs.length);
    var w = FV.textoCarta(obj), hueco = w.replace(/[^\s]/g, '_').split('').join(' ');
    E.innerHTML = '<div class="consigna">¿Cómo se llama?</div>' + cartaHTML(obj, obj.img ? 'img' : 'pal', 'grande').replace('tocable', '') +
      '<div class="consigna" id="nP" style="letter-spacing:2px;min-height:44px">' + esc(hueco) + '</div>' +
      '<div class="ayudas"><button class="btn sec tocable" id="nL" type="button">🔤 Empieza por…</button><button class="btn sec tocable" id="nS" type="button">🗣 Primera sílaba</button><button class="btn sec tocable" id="nD" type="button">🔊 Dilo tú</button></div>' +
      '<div class="marcar"><button class="btn tocable" data-n="solo" type="button">✓ Lo dijo solo</button><button class="btn tocable" data-n="pista" type="button" style="background:#5BA36F">✓ Con pista</button><button class="btn tocable" data-n="ayuda" type="button" style="background:#8DAE6E">✓ Repitiendo</button><button class="btn sec tocable" data-n="no" type="button">Aún no · siguiente</button></div>';
    var g = E.querySelector('.grande'); g.style.minHeight = '0'; var im = g.querySelector('img'); if (im) im.style.maxHeight = '34vh';
    FV.habla([FV.frase('como_se_llama')]); G.repite = null;
    $('nL').onclick = function () { nivel = Math.max(nivel, 1); $('nP').textContent = w.charAt(0) + ' ' + hueco.slice(2); FV.habla([FV.frase('empieza')]); };
    $('nS').onclick = function () { nivel = Math.max(nivel, 2); var s = fvPrimeraSilaba(obj.texto); $('nP').textContent = (AJ.letra === 'mayus' ? s.toLocaleUpperCase('es') : s) + '…'; FV.habla([FV.vozCarta(obj, 's')]); };
    $('nD').onclick = function () { nivel = 3; $('nP').textContent = w; FV.dice(obj, 'w'); };
    E.querySelector('.marcar').onclick = function (e) {
      var b = e.target.closest('[data-n]'); if (!b) return; var k = b.dataset.n; G.ayR = nivel; apunta(obj, null, k !== 'no' ? 1 : 0, 'nombrar', k); G.tq = Date.now(); cuenta[k]++; G.int++;
      if (k !== 'no') G.ac++; if (k === 'pista' || k === 'ayuda') G.ay++;
      if (k === 'solo' || k === 'pista') FV.suena('bien');
      $('nP').textContent = w; tarde(nueva, k === 'no' ? 300 : 700);
    };
  }
  nueva();
};

/* ---------- 13 y 14. Escena ---------- */
function eligeEscena(s, cb) {
  var es = s.escenas.filter(function (e) { return e.zonas.length >= 1; });
  if (es.length === 1) { cb(es[0]); return; }
  E.innerHTML = '<div class="consigna">Elige la escena</div><div class="cartas" style="' + rejilla(es.length) + '">' + es.map(function (e, i) { return '<div class="carta tocable" role="button" tabindex="0" data-e="' + i + '"><img src="' + esc(e.img) + '" alt=""><div class="pal" style="font-size:18px">' + esc(e.titulo || '') + '</div></div>'; }).join('') + '</div>';
  E.querySelector('.cartas').onclick = function (ev) { var b = ev.target.closest('[data-e]'); if (b) cb(es[+b.dataset.e]); };
}
function pintaEscena(esc0, ver) {
  E.innerHTML = '<div class="consigna" id="eC"></div><div class="escena-wrap" id="eW"><img src="' + esc(esc0.img) + '" alt="" draggable="false"></div>';
  var w = $('eW');
  esc0.zonas.forEach(function (z, i) {
    var d = document.createElement('div'); d.className = 'zona tocable' + (ver ? ' ver' : ''); d.dataset.zi = i; d.dataset.c = z.c;
    d.style.left = z.x * 100 + '%'; d.style.top = z.y * 100 + '%'; d.style.width = z.w * 100 + '%'; d.style.height = z.h * 100 + '%'; w.appendChild(d);
  });
  var im = w.querySelector('img'); function ajusta() { var r = im.getBoundingClientRect(); w.style.width = r.width + 'px'; } im.onload = ajusta;
  return w;
}
JUEGO.escena = function () {
  eligeEscena(FV.set, function (e) {
    var ids = []; e.zonas.forEach(function (z) { if (ids.indexOf(z.c) < 0 && porId(z.c)) ids.push(z.c); });
    var objs = objetivos(ids.map(porId), Math.min(AJ.r, ids.length * 2)), i = 0, w = pintaEscena(e, false), fallos = 0, obj = null;
    function nueva() {
      if (i >= objs.length) { fin(); return; }
      obj = objs[i++]; fallos = 0; prog(i + ' de ' + objs.length);
      w.querySelectorAll('.zona').forEach(function (z) { z.classList.remove('bien', 'mal', 'ver'); });
      $('eC').innerHTML = (AJ.ver === 'img' ? '¿Dónde está?' : '¿Dónde está ' + esc(FV.dicho(obj, true)) + '?') + ' ' + oir();
      G.repite = function () { FV.habla(FV.vozCarta(obj, 'q')); }; G.repite();
    }
    w.onclick = function (ev) {
      var z = ev.target.closest('.zona'); if (!z || !obj) return; var c = porId(z.dataset.c);
      if (z.dataset.c === obj.id) { w.querySelectorAll('.zona[data-c="' + obj.id + '"]').forEach(function (x) { x.classList.add('bien'); }); var o = obj; obj = null; bien(null, o, nueva); }
      else { fallos++; z.classList.add('mal'); tarde(function () { z.classList.remove('mal'); }, 900); mal(null, c, obj); if (fallos >= 2 && AJ.tranq) { G.ay++; w.querySelectorAll('.zona[data-c="' + obj.id + '"]').forEach(function (x) { x.classList.add('ver'); }); } }
    };
    nueva();
  });
};
JUEGO.explora = function () {
  eligeEscena(FV.set, function (e) {
    var w = pintaEscena(e, false); $('eC').textContent = 'Toca las cosas de la lámina'; prog(e.zonas.length + ' cosas'); G.repite = null;
    w.onclick = function (ev) {
      var z = ev.target.closest('.zona'); if (!z) return; var c = porId(z.dataset.c); if (!c) return; G.int++;
      w.querySelectorAll('.zona').forEach(function (x) { x.classList.remove('bien'); x.innerHTML = ''; });
      w.querySelectorAll('.zona[data-c="' + c.id + '"]').forEach(function (x) { x.classList.add('bien'); });
      z.innerHTML = '<span class="et" style="font-size:18px;top:-34px">' + esc(FV.textoCarta(c)) + '</span>';
      FV.dice(c, 'w');
    };
  });
};

/* ---------- 15. Ruleta de hablar ---------- */
JUEGO.ruleta = function (cs) {
  var P = ['para_que', 'donde_guarda', 'quien_usa', 'describe', 'frase'], giros = 0;
  E.innerHTML = '<div class="consigna">Ruleta de hablar</div><div id="rC"></div><p class="consigna" id="rP" style="font-size:24px;min-height:40px"></p><div class="fila" style="justify-content:center"><button class="btn oro tocable" id="rG" type="button" style="font-size:22px;padding:14px 30px">🎡 ¡Gira!</button><button class="btn sec tocable" id="rF" type="button">Terminar</button></div>';
  G.repite = null; var actual = null;
  function muestra(c) { $('rC').innerHTML = cartaHTML(c, modoVer(), 'grande').replace('tocable', ''); var g = $('rC').firstChild; g.style.minHeight = '0'; var im = g.querySelector('img'); if (im) im.style.maxHeight = '36vh'; }
  muestra(cs[Math.floor(Math.random() * cs.length)]);
  $('rG').onclick = function () {
    if (G.intervalo) return; $('rP').textContent = ''; var paso = 0, total = 14 + Math.floor(Math.random() * 8);
    var reducido = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducido) total = 1;
    function gira() {
      actual = cs[Math.floor(Math.random() * cs.length)]; muestra(actual); paso++;
      if (paso >= total) { G.intervalo = null; giros++; G.int++; G.ac++; var p = P[Math.floor(Math.random() * P.length)]; $('rP').textContent = FV_FRASES[p]; FV.suena('bien'); FV.habla([FV.vozCarta(actual, 'w'), FV.frase(p)]); prog(giros + ' giros'); return; }
      G.intervalo = setTimeout(gira, 60 + paso * paso * 1.6);
    }
    G.intervalo = 1; gira();
  };
  $('rF').onclick = function () { fin(giros + ' giros. ¡Cuánto habéis hablado!'); };
};

/* ---------- 16. Bingo cantado ---------- */
JUEGO.bingo = function (cs) {
  var bolsa = baraja(cs), salidas = [];
  E.innerHTML = '<div class="consigna">Bingo cantado</div><div id="bC"></div><div class="fila" style="justify-content:center"><button class="btn oro tocable" id="bS" type="button" style="font-size:22px;padding:14px 30px">Sacar carta</button><button class="btn sec tocable" id="bR" type="button">Repetir</button><button class="btn sec tocable" id="bF" type="button">¡Bingo! Terminar</button></div><p class="nota" id="bQ"></p><div class="cartas" id="bH" style="grid-template-columns:repeat(auto-fill,minmax(90px,1fr));max-width:1000px"></div>';
  G.repite = null; var actual = null;
  $('bS').onclick = function () {
    if (!bolsa.length) { $('bQ').textContent = 'Ya han salido todas.'; return; }
    actual = bolsa.shift(); salidas.push(actual); G.int++;
    $('bC').innerHTML = cartaHTML(actual, 'img+txt', 'grande').replace('tocable', ''); var g = $('bC').firstChild; g.style.minHeight = '0'; var im = g.querySelector('img'); if (im) im.style.maxHeight = '32vh';
    FV.dice(actual, 'w'); $('bQ').textContent = 'Han salido ' + salidas.length + ' · quedan ' + bolsa.length;
    $('bH').innerHTML = salidas.slice().reverse().map(function (c) { return cartaHTML(c, 'img').replace('tocable', ''); }).join('');
    $('bH').querySelectorAll('.carta').forEach(function (x) { x.style.minHeight = '60px'; });
  };
  $('bR').onclick = function () { if (actual) FV.dice(actual, 'w'); };
  $('bF').onclick = function () { fin('Han salido ' + salidas.length + ' cartas.'); };
};

})();
