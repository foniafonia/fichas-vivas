/* Fichas vivas · BANCO DE PICTOS COLMENIA. 40 pictogramas abiertos para jugar o añadir
   a tu material; el resto del banco se enseña bloqueado y se pide con la abeja. */
(function () {
'use strict';
var FV = window.FV, $ = FV.$, esc = FV.esc;
var GRUPOS = [];
FV_PICTOS.forEach(function (p) { if (GRUPOS.indexOf(p[2]) < 0) GRUPOS.push(p[2]); });
function carta(p) { return { id: 'bp-' + p[0], img: 'pictos/' + p[0] + '.webp', texto: p[1], art: FV.adivinaArt ? FV.adivinaArt(p[1]) : '', cat: p[2], activa: true }; }
function setDe(grupo) {
  var ps = FV_PICTOS.filter(function (p) { return !grupo || p[2] === grupo; });
  return { id: 'banco-' + (grupo ? grupo.toLowerCase() : 'todo'), titulo: grupo ? 'Pictos · ' + grupo : 'Pictos ColmenIA (40)', demo: true, cartas: ps.map(carta), escenas: [] };
}
var MAS = FV_PICTOS_TOTAL - FV_PICTOS.length;

var css = document.createElement('style');
css.textContent =
  '.bp{background:#fff;border:3px solid var(--oro);border-radius:20px;padding:16px;margin:18px 0}' +
  '.bp h2{margin:0 0 4px}.bp .gr{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px;margin:12px 0}' +
  '.bp .g{background:var(--crema);border:2px solid #e6dcc8;border-radius:14px;padding:10px;cursor:pointer;font:inherit;color:var(--noche);text-align:center}' +
  '.bp .g:hover,.bp .g:focus-visible{border-color:var(--oro)}' +
  '.bp .g .ims{display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-bottom:6px}.bp .g img{width:100%;aspect-ratio:1;object-fit:contain;background:#fff;border-radius:8px}' +
  '.bp .g b{display:block}.bp .g span{font-size:13px;opacity:.75}' +
  '.bp .lock{background:var(--noche);color:#fff;border-radius:16px;padding:14px;margin-top:10px}' +
  '.bp .lock .ws{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0 10px}.bp .lock .ws span{background:rgba(255,255,255,.12);border:1px dashed rgba(255,255,255,.45);border-radius:999px;padding:4px 10px;font-size:14px}' +
  '.bp-pick{display:grid;grid-template-columns:repeat(auto-fill,minmax(96px,1fr));gap:8px;margin:10px 0}' +
  '.bp-pick label{background:#fff;border:2px solid #e6dcc8;border-radius:12px;padding:6px;text-align:center;cursor:pointer;font-size:14px}' +
  '.bp-pick label:has(input:checked){border-color:var(--verde);background:#eaf7ef}.bp-pick img{width:100%;aspect-ratio:1;object-fit:contain}.bp-pick input{margin:0 4px 0 0}';
document.head.appendChild(css);

/* Portada */
var c = $('bancoPictos');
if (c) {
  c.innerHTML = '<div class="bp"><h2>🧩 Banco de pictos ColmenIA</h2><p class="nota" style="margin:0">Pictogramas propios de Fönia, listos para los 16 juegos. Úsalos solos o añádelos a tu material en «Editar material» → «Pictos del banco».</p>' +
    '<div class="gr">' + GRUPOS.map(function (g) {
      var ps = FV_PICTOS.filter(function (p) { return p[2] === g; });
      return '<button class="g" type="button" data-bp="' + esc(g) + '"><span class="ims">' + ps.slice(0, 4).map(function (p) { return '<img src="pictos/' + p[0] + '.webp" alt="" loading="lazy">'; }).join('') + '</span><b>' + esc(g) + '</b><span>' + ps.length + ' pictos · ▶ Jugar</span></button>';
    }).join('') + '<button class="g" type="button" data-bp=""><span class="ims">' + [0, 8, 16, 24].map(function (i) { return '<img src="pictos/' + FV_PICTOS[i][0] + '.webp" alt="" loading="lazy">'; }).join('') + '</span><b>Los 40 juntos</b><span>Ideal para Clasifica · ▶ Jugar</span></button></div>' +
    '<div class="lock"><b style="font-size:18px">🔒 ' + MAS + ' pictos más esperando</b><p style="margin:4px 0 0">Rutinas, lugares, personas, transportes, frases hechas… El banco entero se abre cuando lo pidáis.</p>' +
    '<div class="ws">' + FV_PICTOS_MAS.map(function (w) { return '<span>🔒 ' + esc(w) + '</span>'; }).join('') + '<span>+ ' + (MAS - FV_PICTOS_MAS.length) + ' más</span></div>' +
    '<button class="btn oro" type="button" id="bpQuiero">🐝 ¡Lo quiero entero!</button></div></div>';
  c.addEventListener('click', function (e) {
    var b = e.target.closest('[data-bp]'); if (b) { FV.abreSet(setDe(b.dataset.bp)); return; }
    if (e.target.closest('#bpQuiero')) {
      FV.cuenta('mejora_pictos'); FV.cuenta('mejora_total');
      if (FV.abreAbeja) FV.abreAbeja('Pedido apuntado: el banco entero de pictos. Cuéntanos qué palabras necesitas primero en ColmenIA y se abren antes.');
    }
  });
}

/* Editor: añadir pictos al material propio */
var bt = $('edPictos');
if (bt) bt.addEventListener('click', function () {
  if (!FV.set) return;
  var ya = {}; FV.set.cartas.forEach(function (x) { ya[x.id] = 1; });
  var m = document.createElement('div'); m.className = 'modal'; m.style.zIndex = 88;
  m.innerHTML = '<div class="panel" style="max-width:820px"><button class="btn sec peq x" type="button" data-x>✕</button><h2 style="margin-top:0">🧩 Pictos del banco</h2>' +
    '<p class="nota" style="margin:0">Marca los que quieras añadir a «' + esc(FV.set.titulo || 'tu material') + '». Llevan su palabra y su categoría.</p>' +
    GRUPOS.map(function (g) {
      return '<h3 style="margin:12px 0 0">' + esc(g) + ' <button class="btn sec peq" type="button" data-todos="' + esc(g) + '">Marcar todos</button></h3><div class="bp-pick">' + FV_PICTOS.filter(function (p) { return p[2] === g; }).map(function (p) {
        var dentro = ya['bp-' + p[0]];
        return '<label><img src="pictos/' + p[0] + '.webp" alt="" loading="lazy"><br><input type="checkbox" value="' + p[0] + '" data-g="' + esc(g) + '"' + (dentro ? ' checked disabled' : '') + '>' + esc(p[1]) + '</label>';
      }).join('') + '</div>';
    }).join('') +
    '<div class="fila" style="position:sticky;bottom:-16px;background:var(--crema);padding:10px 0"><button class="btn oro" type="button" id="bpAnade">Añadir los marcados</button><span class="nota">🔒 ' + MAS + ' más en el banco entero: pídelo con la abeja 🐝</span></div></div>';
  document.body.appendChild(m);
  m.addEventListener('click', function (e) {
    if (e.target === m || e.target.closest('[data-x]')) { m.remove(); return; }
    var t = e.target.closest('[data-todos]'); if (t) { m.querySelectorAll('input[data-g="' + t.dataset.todos + '"]:not(:disabled)').forEach(function (i) { i.checked = true; }); return; }
    if (e.target.closest('#bpAnade')) {
      var n = 0;
      m.querySelectorAll('input:checked:not(:disabled)').forEach(function (i) { var p = FV_PICTOS.filter(function (x) { return x[0] === i.value; })[0]; if (p) { FV.set.cartas.push(carta(p)); n++; } });
      m.remove(); if (n) { FV.marcaCambio(); FV.pintaEditor(); FV.cuenta('pictos_anadir'); }
    }
  });
});
})();
