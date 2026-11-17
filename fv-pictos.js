/* Fichas vivas · BANCO DE PICTOS COLMENIA. Desde el 17-nov el banco entero (889 pictos
   propios de Fönia) está abierto: jugar con ellos o añadirlos al material, con buscador. */
(function () {
'use strict';
var FV = window.FV, $ = FV.$, esc = FV.esc;
var BANCO = window.FV_BANCO || FV_PICTOS;
var GRUPOS = [], INICIO = [];
BANCO.forEach(function (p) { if (GRUPOS.indexOf(p[2]) < 0) GRUPOS.push(p[2]); });
FV_PICTOS.forEach(function (p) { if (INICIO.indexOf(p[2]) < 0) INICIO.push(p[2]); });
function norm(t) { return String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
function carta(p) { return { id: 'bp-' + p[0], img: 'pictos/' + p[0] + '.webp', texto: p[1], art: FV.adivinaArt ? FV.adivinaArt(p[1]) : '', cat: p[2], activa: true }; }
function setDe(grupo) {
  var ps = FV_PICTOS.filter(function (p) { return !grupo || p[2] === grupo; });
  return { id: 'banco-' + (grupo ? grupo.toLowerCase() : 'todo'), titulo: grupo ? 'Pictos · ' + grupo : 'Pictos ColmenIA (40)', demo: true, cartas: ps.map(carta), escenas: [] };
}

var css = document.createElement('style');
css.textContent =
  '.bp{background:#fff;border:3px solid var(--oro);border-radius:20px;padding:16px;margin:18px 0}' +
  '.bp h2{margin:0 0 4px}.bp .gr{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px;margin:12px 0}' +
  '.bp .g{background:var(--crema);border:2px solid #e6dcc8;border-radius:14px;padding:10px;cursor:pointer;font:inherit;color:var(--noche);text-align:center}' +
  '.bp .g:hover,.bp .g:focus-visible{border-color:var(--oro)}' +
  '.bp .g .ims{display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-bottom:6px}.bp .g img{width:100%;aspect-ratio:1;object-fit:contain;background:#fff;border-radius:8px}' +
  '.bp .g b{display:block}.bp .g span{font-size:13px;opacity:.75}' +
  '.bp .todo{background:var(--noche);color:#fff;border-radius:16px;padding:14px;margin-top:10px}' +
  '.bp-pick{display:grid;grid-template-columns:repeat(auto-fill,minmax(96px,1fr));gap:8px;margin:10px 0}' +
  '.bp-pick label{background:#fff;border:2px solid #e6dcc8;border-radius:12px;padding:6px;text-align:center;cursor:pointer;font-size:14px}' +
  '.bp-pick label:has(input:checked){border-color:var(--verde);background:#eaf7ef}.bp-pick img{width:100%;aspect-ratio:1;object-fit:contain}.bp-pick input{margin:0 4px 0 0}' +
  '.bp-bus{width:100%;font:inherit;font-size:18px;padding:10px 12px;border:2px solid #e6dcc8;border-radius:12px;margin:8px 0}';
document.head.appendChild(css);

/* Selector del banco entero: modo 'jugar' (portada) o 'anadir' (editor) */
function selector(modo) {
  var ya = {}; if (modo === 'anadir' && FV.set) FV.set.cartas.forEach(function (x) { ya[x.id] = 1; });
  var m = document.createElement('div'); m.className = 'modal'; m.style.zIndex = 88;
  m.innerHTML = '<div class="panel" style="max-width:880px"><button class="btn sec peq x" type="button" data-x>✕</button><h2 style="margin-top:0">🧩 Banco de pictos · ' + BANCO.length + '</h2>' +
    '<p class="nota" style="margin:0">' + (modo === 'anadir' ? 'Marca los que quieras añadir a «' + esc(FV.set.titulo || 'tu material') + '». Llevan su palabra.' : 'Marca los que quieras y juega con ellos. Para guardarlos, ve a «Editar material» → «Pictos del banco».') + '</p>' +
    '<input class="bp-bus" type="search" placeholder="Busca una palabra: perro, comer, cocina…" aria-label="Buscar picto">' +
    '<div class="fila" data-grs><button class="chip" type="button" data-gr="" aria-pressed="true">Todos</button>' + GRUPOS.map(function (g) { return '<button class="chip" type="button" data-gr="' + esc(g) + '" aria-pressed="false">' + esc(g) + '</button>'; }).join('') + '</div>' +
    '<div class="bp-pick">' + BANCO.map(function (p) {
      var dentro = ya['bp-' + p[0]];
      return '<label data-n="' + esc(norm(p[1])) + '" data-g="' + esc(p[2]) + '"><img src="pictos/' + p[0] + '.webp" alt="" loading="lazy"><br><input type="checkbox" value="' + p[0] + '"' + (dentro ? ' checked disabled' : '') + '>' + esc(p[1]) + '</label>';
    }).join('') + '</div>' +
    '<div class="fila" style="position:sticky;bottom:-16px;background:var(--crema);padding:10px 0"><button class="btn oro" type="button" data-ok>' + (modo === 'anadir' ? 'Añadir los marcados' : '▶ Jugar con los marcados') + '</button><button class="btn sec peq" type="button" data-vis>Marcar los que se ven</button><span class="nota" data-cuantos></span></div></div>';
  document.body.appendChild(m);
  var bus = m.querySelector('.bp-bus'), gr = '', labels = [].slice.call(m.querySelectorAll('.bp-pick label'));
  function filtra() { var q = norm(bus.value.trim()); labels.forEach(function (l) { l.style.display = (!gr || l.dataset.g === gr) && (!q || l.dataset.n.indexOf(q) > -1) ? '' : 'none'; }); }
  function cuenta() { m.querySelector('[data-cuantos]').textContent = m.querySelectorAll('.bp-pick input:checked:not(:disabled)').length + ' marcados'; }
  bus.addEventListener('input', filtra); setTimeout(function () { bus.focus(); }, 50);
  m.addEventListener('change', cuenta);
  m.addEventListener('click', function (e) {
    if (e.target === m || e.target.closest('[data-x]')) { m.remove(); return; }
    var g = e.target.closest('[data-gr]'); if (g) { gr = g.dataset.gr; m.querySelectorAll('[data-gr]').forEach(function (b) { b.setAttribute('aria-pressed', b === g); }); filtra(); return; }
    if (e.target.closest('[data-vis]')) { labels.forEach(function (l) { var i = l.querySelector('input'); if (l.style.display !== 'none' && !i.disabled) i.checked = true; }); cuenta(); return; }
    if (e.target.closest('[data-ok]')) {
      var ps = [].slice.call(m.querySelectorAll('.bp-pick input:checked:not(:disabled)')).map(function (i) { return BANCO.filter(function (x) { return x[0] === i.value; })[0]; }).filter(Boolean);
      if (!ps.length) { m.querySelector('[data-cuantos]').textContent = 'Marca al menos uno.'; return; }
      m.remove();
      if (modo === 'anadir') { ps.forEach(function (p) { FV.set.cartas.push(carta(p)); }); FV.marcaCambio(); FV.pintaEditor(); FV.cuenta('pictos_anadir'); }
      else { FV.cuenta('banco_jugar'); FV.abreSet({ id: 'banco-eleccion', titulo: 'Mis pictos del banco', demo: true, cartas: ps.map(carta), escenas: [] }); }
    }
  });
}
FV.abreBanco = selector;

/* Portada */
var c = $('bancoPictos');
if (c) {
  c.innerHTML = '<div class="bp"><h2>🧩 Banco de pictos ColmenIA</h2><p class="nota" style="margin:0">' + BANCO.length + ' pictogramas propios de Fönia, listos para los 16 juegos. Úsalos solos o añádelos a tu material en «Editar material» → «Pictos del banco».</p>' +
    '<div class="gr">' + INICIO.map(function (g) {
      var ps = FV_PICTOS.filter(function (p) { return p[2] === g; });
      return '<button class="g" type="button" data-bp="' + esc(g) + '"><span class="ims">' + ps.slice(0, 4).map(function (p) { return '<img src="pictos/' + p[0] + '.webp" alt="" loading="lazy">'; }).join('') + '</span><b>' + esc(g) + '</b><span>' + ps.length + ' pictos · ▶ Jugar</span></button>';
    }).join('') + '</div>' +
    '<div class="todo"><b style="font-size:18px">🔓 El banco entero, abierto: ' + BANCO.length + ' pictos</b><p style="margin:4px 0 10px">Cosas, acciones, lugares, personas, cómo es, preguntas… Busca la palabra que necesites, marca y juega.</p>' +
    '<button class="btn oro" type="button" id="bpTodo">🔎 Abrir el banco entero</button></div></div>';
  c.addEventListener('click', function (e) {
    var b = e.target.closest('[data-bp]'); if (b) { FV.abreSet(setDe(b.dataset.bp)); return; }
    if (e.target.closest('#bpTodo')) { FV.cuenta('banco_abrir'); selector('jugar'); }
  });
}

/* Editor: añadir pictos al material propio */
var bt = $('edPictos');
if (bt) bt.addEventListener('click', function () { if (FV.set) selector('anadir'); });
})();
