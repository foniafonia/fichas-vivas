/* Fichas vivas · RECORTAR UNA FOTO. FV.recorta(src, cb): src es un canvas o una dirección
   de imagen; cb(canvas recortado) o cb(null) si se cancela. Arrastra para marcar la zona. */
(function () {
'use strict';
var FV = window.FV;
var css = document.createElement('style');
css.textContent = '.rc-wrap{position:relative;display:inline-block;touch-action:none;user-select:none;max-width:100%}' +
  '.rc-wrap canvas{display:block;max-width:100%;max-height:62vh;border-radius:10px}' +
  '.rc-sel{position:absolute;border:3px dashed var(--oro,#F2B33D);box-shadow:0 0 0 9999px rgba(14,53,36,.55);pointer-events:none}';
document.head.appendChild(css);
FV.recorta = function (src, cb) {
  function conCanvas(cv) {
    var m = document.createElement('div'); m.className = 'modal'; m.style.zIndex = 95;
    m.innerHTML = '<div class="panel" style="max-width:820px;text-align:center"><h2 style="margin-top:0">✂ Recortar la foto</h2><p class="nota" style="margin:0 0 8px">Arrastra con el dedo o el ratón sobre la parte que quieres quedarte.</p>' +
      '<div class="rc-wrap"><div class="rc-sel" hidden></div></div>' +
      '<div class="fila" style="justify-content:center;margin-top:10px"><button class="btn oro" type="button" data-r="ok">✂ Recortar</button><button class="btn sec peq" type="button" data-r="cuad">Cuadrado centrado</button><button class="btn sec peq" type="button" data-r="tal">Dejarla entera</button><button class="btn sec peq" type="button" data-r="no">Cancelar</button></div></div>';
    document.body.appendChild(m);
    var wrap = m.querySelector('.rc-wrap'), sel = m.querySelector('.rc-sel'), vis = document.createElement('canvas');
    vis.width = cv.width; vis.height = cv.height; vis.getContext('2d').drawImage(cv, 0, 0); wrap.insertBefore(vis, sel);
    var r = null, ini = null;
    function pos(e) { var b = vis.getBoundingClientRect(); return { x: Math.max(0, Math.min(b.width, e.clientX - b.left)), y: Math.max(0, Math.min(b.height, e.clientY - b.top)), w: b.width, h: b.height }; }
    function pinta() { if (!r) { sel.hidden = true; return; } sel.hidden = false; sel.style.left = r.x + 'px'; sel.style.top = r.y + 'px'; sel.style.width = r.w + 'px'; sel.style.height = r.h + 'px'; }
    vis.addEventListener('pointerdown', function (e) { e.preventDefault(); vis.setPointerCapture(e.pointerId); ini = pos(e); r = null; pinta(); });
    vis.addEventListener('pointermove', function (e) { if (!ini) return; var p = pos(e); r = { x: Math.min(ini.x, p.x), y: Math.min(ini.y, p.y), w: Math.abs(p.x - ini.x), h: Math.abs(p.y - ini.y), W: p.w, H: p.h }; pinta(); });
    vis.addEventListener('pointerup', function () { ini = null; if (r && (r.w < 12 || r.h < 12)) { r = null; pinta(); } });
    function corta(x, y, w, h) {
      var o = document.createElement('canvas'); o.width = Math.max(1, Math.round(w)); o.height = Math.max(1, Math.round(h));
      var cx = o.getContext('2d'); cx.fillStyle = '#fff'; cx.fillRect(0, 0, o.width, o.height); cx.drawImage(cv, x, y, w, h, 0, 0, o.width, o.height); return o;
    }
    function fin(res) { m.remove(); cb(res); }
    m.addEventListener('click', function (e) {
      var b = e.target.closest('[data-r]'); if (!b) return; var a = b.dataset.r;
      if (a === 'no') fin(null);
      else if (a === 'tal') fin(cv);
      else if (a === 'cuad') { var l = Math.min(cv.width, cv.height); fin(corta((cv.width - l) / 2, (cv.height - l) / 2, l, l)); }
      else if (!r) { m.querySelector('.nota').textContent = 'Primero arrastra sobre la foto para marcar la zona (o pulsa «Dejarla entera»).'; }
      else { var k = cv.width / r.W; fin(corta(r.x * k, r.y * k, r.w * k, r.h * k)); }
    });
  }
  if (src && src.getContext) { conCanvas(src); return; }
  var im = new Image();
  im.onload = function () { var cv = document.createElement('canvas'); cv.width = im.naturalWidth; cv.height = im.naturalHeight; var cx = cv.getContext('2d'); cx.fillStyle = '#fff'; cx.fillRect(0, 0, cv.width, cv.height); cx.drawImage(im, 0, 0); conCanvas(cv); };
  im.onerror = function () { cb(null); };
  im.src = src;
};
})();
