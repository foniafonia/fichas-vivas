(async () => {
  const W = ms => new Promise(r => setTimeout(r, ms));
  document.querySelectorAll('.modal').forEach(m => { if (!m.id) m.remove(); });
  FV.aj.voz = false; FV.aj.r = 5; FV.aj.n = 4; FV.aj.son = false;
  document.getElementById('probarDemo').click(); await W(300);
  let ult = []; const o = FV.habla; FV.habla = function (p, f) { ult = [].concat(p || []); return o.call(FV, p, f); };
  for (let s = 0; s < 3; s++) {
    FV.empieza('escucha'); await W(300);
    for (let r = 0; r < 5; r++) {
      const id = (ult.map(x => x && x.audio || '').join(' ').match(/voz\/([a-z]\d\d)-q/) || [])[1];
      const cards = [...document.querySelectorAll('#escenario .carta')];
      if ((r + s) % 3 === 0) { const m = cards.find(c => c.dataset.id !== id); if (m) { m.click(); await W(900 - s * 200); } }
      await W(700 - s * 150);
      const ok = cards.find(c => c.dataset.id === id); if (ok) ok.click(); await W(1650);
    }
    await W(300);
  }
  for (const juego of ['sombras', 'lee']) {
    FV.empieza(juego); await W(300);
    for (let r = 0; r < 5; r++) {
      const g = document.querySelector('#escenario .grande'), id = g && g.dataset.id;
      const cards = [...document.querySelectorAll('#escenario .cartas .carta')];
      if (r === 2) { const m = cards.find(c => c.dataset.id !== id); if (m) { m.click(); await W(400); } }
      await W(500);
      const ok = cards.find(c => c.dataset.id === id); if (ok) ok.click(); await W(1650);
    }
    await W(300);
  }
  FV.empieza('nombra'); await W(300);
  for (const k of ['solo', 'pista', 'solo', 'ayuda', 'solo']) { if (k === 'pista') document.getElementById('nS').click(); document.querySelector('[data-n="' + k + '"]').click(); await W(900); }
  await W(300); document.getElementById('jSalir').click(); await W(200);
  FV.abreInforme(FV.perfilActivo().codigo); await W(600);
})()
