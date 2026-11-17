/* Fichas vivas · CREAR CON IA (ChatGPT o Claude). Tres pasos: escribes qué quieres,
   la app copia un encargo ya preparado y abre la IA, pegas su respuesta (JSON) y se
   crea el material con los pictos del banco. No se envía nada a ningún servidor nuestro. */
(function () {
'use strict';
var FV = window.FV, $ = FV.$, esc = FV.esc;
var BANCO = window.FV_BANCO || [];
function norm(t) { return String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9ñ ]/g, ' ').replace(/\s+/g, ' ').trim(); }
var PORPAL = {}; BANCO.forEach(function (p) { PORPAL[norm(p[1])] = p; });
function buscaPicto(w) {
  var n = norm(w); if (!n) return null;
  if (PORPAL[n]) return PORPAL[n];
  var sing = [n.replace(/es$/, ''), n.replace(/s$/, ''), n.replace(/^(el|la|los|las|un|una) /, '')];
  for (var i = 0; i < sing.length; i++) if (PORPAL[sing[i]]) return PORPAL[sing[i]];
  return null;
}
var JUEGOS = 'Tablero que habla, Escucha y toca, Lee y toca, Une dibujo y palabra, Memoria de parejas, Memoria dibujo–palabra, ¿Qué falta?, Sombras, ¿Qué se esconde?, Clasifica (por categorías), El intruso (por categorías), Nombra con pistas, Ruleta de hablar y Bingo';
function encargo(pide) {
  return 'Eres un ayudante de logopedia. Preparas material para «Fichas vivas», una app donde cada carta tiene un dibujo y una palabra, y con ellas se juega a: ' + JUEGOS + '.\n\n' +
    'LO QUE NECESITO:\n' + pide + '\n\n' +
    'CÓMO RESPONDER (muy importante):\n' +
    '1. Responde SOLO con un bloque de código JSON, sin explicaciones antes ni después.\n' +
    '2. Usa exactamente este formato:\n' +
    '{"titulo": "Nombre corto del material", "cartas": [{"palabra": "perro", "articulo": "el", "categoria": "Animales"}]}\n' +
    '3. «articulo» puede ser "el", "la", "los", "las" o "" (vacío para verbos y adjetivos).\n' +
    '4. Pon «categoria» a todas las cartas, con al menos 2 categorías distintas y 3 cartas o más en alguna, para que funcionen Clasifica y El intruso.\n' +
    '5. Si no digo cuántas, haz entre 12 y 24 cartas.\n' +
    '6. Prioriza las palabras de esta lista, porque ya tienen pictograma en la app. Escríbelas tal cual. Si hace falta una palabra que no está, úsala igualmente (saldrá sin dibujo y yo le pondré una foto).\n' +
    '7. Nunca incluyas nombres de personas ni datos de pacientes.\n\n' +
    'PALABRAS CON PICTOGRAMA (' + BANCO.length + '):\n' + BANCO.map(function (p) { return p[1]; }).join(', ') + '\n';
}
function lee(txt) {
  var t = String(txt || '').replace(/[“”]/g, '"').replace(/[‘’]/g, "'");
  var a = t.indexOf('{'), b = t.lastIndexOf('}'), o = null;
  if (a > -1 && b > a) { try { o = JSON.parse(t.slice(a, b + 1)); } catch (e) { o = null; } }
  if (!o) { var a2 = t.indexOf('['), b2 = t.lastIndexOf(']'); if (a2 > -1 && b2 > a2) { try { o = { cartas: JSON.parse(t.slice(a2, b2 + 1)) }; } catch (e) {} } }
  if (!o) return null;
  if (o.fv === 1 && o.set) o = { titulo: o.set.titulo, cartas: o.set.cartas };
  var L = o.cartas || o.palabras || o.items || [];
  if (!Array.isArray(L)) return null;
  var cartas = L.slice(0, 200).map(function (c) {
    if (typeof c === 'string') c = { palabra: c };
    var w = String(c.palabra || c.texto || c.word || '').trim().slice(0, 80); if (!w) return null;
    var art = String(c.articulo || c.art || '').toLowerCase().trim();
    if (['', 'el', 'la', 'los', 'las', 'un', 'una'].indexOf(art) < 0) art = '';
    if (!art && FV.adivinaArt && !c.articulo && c.articulo !== '') art = FV.adivinaArt(w);
    var p = buscaPicto(w);
    return { id: FV.uid(), img: p ? 'pictos/' + p[0] + '.webp' : undefined, texto: w, art: art, cat: String(c.categoria || c.cat || '').trim().slice(0, 40), activa: true };
  }).filter(Boolean);
  if (!cartas.length) return null;
  return { titulo: String(o.titulo || 'Material con IA').slice(0, 60), cartas: cartas };
}
function copia(t, cb) {
  function viejo() { var ta = document.createElement('textarea'); ta.value = t; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select(); var ok = false; try { ok = document.execCommand('copy'); } catch (e) {} ta.remove(); cb(ok); }
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(function () { cb(true); }, viejo); else viejo();
}

var css = document.createElement('style');
css.textContent = '.ia-paso{background:#fff;border:2px solid #e6dcc8;border-radius:16px;padding:12px 14px;margin:10px 0}' +
  '.ia-paso h3{margin:0 0 6px;font-size:19px}.ia-n{display:inline-grid;place-items:center;width:28px;height:28px;border-radius:50%;background:var(--oro,#F2B33D);color:var(--noche,#0E3524);font-weight:900;margin-right:6px}' +
  '.ia-paso textarea{width:100%;font:inherit;font-size:17px}.ia-ej{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0}.ia-ej button{font-size:14px}';
document.head.appendChild(css);

function abre(modo) {
  FV.cuenta('ia_abrir');
  var anadir = modo === 'anadir' && FV.set && !FV.set.demo;
  var m = document.createElement('div'); m.className = 'modal'; m.style.zIndex = 90;
  m.innerHTML = '<div class="panel" style="max-width:720px"><button class="btn sec peq x" type="button" data-x>✕</button>' +
    '<h2 style="margin-top:0">✨ Crear material con IA</h2><p class="nota" style="margin:0">Con ChatGPT o Claude, en su web o en su app. Tres pasos y listo.</p>' +
    '<div class="ia-paso"><h3><span class="ia-n">1</span>¿Qué quieres trabajar?</h3>' +
    '<div class="ia-ej"><button class="chip" type="button" data-ej="Vocabulario de la cocina para un niño de 5 años, 16 palabras.">Cocina, 5 años</button><button class="chip" type="button" data-ej="Palabras con el sonido /r/ fuerte al principio, para 7 años.">Sonido /r/</button><button class="chip" type="button" data-ej="Acciones de la rutina de la mañana, para trabajar verbos.">Rutina de la mañana</button><button class="chip" type="button" data-ej="Animales de la granja y animales salvajes, para clasificar.">Animales para clasificar</button><button class="chip" type="button" data-ej="Vocabulario básico de comida para un adulto con afasia.">Adulto con afasia</button></div>' +
    '<textarea id="iaPide" rows="3" placeholder="Por ejemplo: ropa de invierno y de verano para un niño de 6 años, para clasificar"></textarea></div>' +
    '<div class="ia-paso"><h3><span class="ia-n">2</span>Copia el encargo y pégalo en la IA</h3><p class="nota" style="margin:0 0 8px">Se copia solo y se abre la IA. Allí, mantén pulsado (o Ctrl+V) para pegar y envía.</p>' +
    '<div class="fila"><button class="btn oro" type="button" data-ia="https://chatgpt.com/">📋 Copiar y abrir ChatGPT</button><button class="btn" type="button" data-ia="https://claude.ai/new">📋 Copiar y abrir Claude</button><button class="btn sec peq" type="button" data-ia="">Solo copiar</button></div><p class="nota" id="iaCop" role="status" style="margin:6px 0 0"></p></div>' +
    '<div class="ia-paso"><h3><span class="ia-n">3</span>Pega aquí lo que te conteste</h3><p class="nota" style="margin:0 0 8px">En la IA pulsa «Copiar» en su respuesta y pégala aquí tal cual.</p>' +
    '<textarea id="iaRes" rows="5" placeholder="Pega aquí la respuesta de la IA"></textarea>' +
    '<div class="fila" style="margin-top:8px"><button class="btn oro" type="button" data-crea>' + (anadir ? '✨ Añadir a «' + esc(FV.set.titulo) + '»' : '✨ Crear mi material') + '</button><span class="nota" id="iaOk" role="status"></span></div></div></div>';
  document.body.appendChild(m);
  var pide = m.querySelector('#iaPide');
  try { pide.value = localStorage.getItem('fv-ia-pide') || ''; } catch (e) {}
  m.addEventListener('click', function (e) {
    if (e.target === m || e.target.closest('[data-x]')) { m.remove(); return; }
    var ej = e.target.closest('[data-ej]'); if (ej) { pide.value = ej.dataset.ej; pide.focus(); return; }
    var ia = e.target.closest('[data-ia]');
    if (ia) {
      var p = pide.value.trim(); if (!p) { m.querySelector('#iaCop').textContent = 'Escribe primero qué quieres trabajar (paso 1).'; pide.focus(); return; }
      try { localStorage.setItem('fv-ia-pide', p); } catch (er) {}
      var url = ia.dataset.ia, ventana = url ? window.open('about:blank', '_blank') : null;
      copia(encargo(p), function (ok) {
        m.querySelector('#iaCop').textContent = ok ? '✅ Copiado. Pégalo en la IA y envíalo. Luego vuelve aquí con su respuesta.' : 'No se ha podido copiar solo: prueba con otro navegador.';
        if (ventana) { try { ventana.opener = null; ventana.location.href = url; } catch (er) { window.open(url, '_blank', 'noopener'); } }
        FV.cuenta('ia_copiar' + (url.indexOf('claude') > -1 ? '_claude' : url ? '_gpt' : ''));
      });
      return;
    }
    if (e.target.closest('[data-crea]')) {
      var r = lee(m.querySelector('#iaRes').value), ok = m.querySelector('#iaOk');
      if (!r) { ok.textContent = 'No encuentro el material en lo que has pegado. Copia la respuesta entera de la IA (el bloque que empieza por { ).'; return; }
      var conDibujo = r.cartas.filter(function (c) { return c.img; }).length, sin = r.cartas.length - conDibujo;
      m.remove(); FV.cuenta('ia_creado');
      var aviso = '✨ ' + r.cartas.length + ' cartas creadas' + (sin ? ': ' + conDibujo + ' con pictograma y ' + sin + ' sin dibujo (ponles una foto con 🖼 o 📷).' : ', todas con pictograma.');
      if (anadir) { r.cartas.forEach(function (c) { FV.set.cartas.push(c); }); FV.marcaCambio(); FV.pintaEditor(); $('edEstado').textContent = aviso; }
      else {
        var s = { id: 'fv-' + FV.uid(), titulo: r.titulo, cartas: r.cartas, escenas: [], creado: Date.now() };
        FV.guarda(s, function () { FV.abreSet(s, 'editar'); setTimeout(function () { $('edEstado').textContent = aviso; }, 300); });
      }
    }
  });
}
FV.abreIA = abre;

/* Botones: portada, biblioteca y editor */
function boton(txt, cls, modo) { var b = document.createElement('button'); b.type = 'button'; b.className = 'btn ' + cls; b.textContent = txt; b.addEventListener('click', function () { abre(modo); }); return b; }
var hero = document.querySelector('#v-inicio .hero .fila'); if (hero) hero.insertBefore(boton('✨ Crear con IA', 'oro', 'nuevo'), hero.children[1] || null);
var lib = document.querySelector('#v-biblioteca [data-ir="subir"]'); if (lib) lib.parentNode.insertBefore(boton('✨ Crear con IA', 'oro', 'nuevo'), lib.nextSibling);
var ed = $('edPictos'); if (ed) ed.parentNode.insertBefore(boton('✨ Con IA (ChatGPT o Claude)', 'oro', 'anadir'), ed.nextSibling);
})();
