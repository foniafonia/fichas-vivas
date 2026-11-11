/* Fichas vivas · datos del material de ejemplo, frases con voz y novedades.
   Material de ejemplo: hojas de una compañera logopeda (mascotas y aseo), cortadas
   en cartas. Voz: Ximena (Microsoft, es-ES-XimenaNeural) en demo/voz. */
var FV_VERSION = 1;

var FV_NOVEDADES = [
  { v: 1, f: '11 nov 2026', t: 'Primera versión', d: 'Subir hojas en cuadrícula y PDF, corte automático, 15 juegos, escenas con zonas, grabar tu voz, modo aire con la mano, bingo y tarjetas para imprimir, exportar para compartir.' }
];

/* palabras: [texto, artículo] en el orden de la hoja */
var FV_DEMO_PAL = {
  masc: [['JAULA','la'],['COMEDERO','el'],['HUESO','el'],['CORREA','la'],['ARNÉS','el'],['COLLAR','el'],['COLLAR ANTIPULGAS','el'],['PLACA IDENTIFICATIVA','la'],['CASETA DE PERRO','la'],['CAMITA','la'],['PIENSO','el'],['ABRIGO DE PERRO','el'],['GALLETAS PARA PERROS','las'],['PELOTA','la'],['JUGUETE PARA MORDER','el'],['TRANSPORTÍN','el']],
  aseo: [['CREMA','la'],['CHAMPÚ','el'],['ESPONJA','la'],['CEPILLO DE PELO','el'],['CEPILLO DE DIENTES','el'],['PASTA DE DIENTES','la'],['PINZAS DE DEPILAR','las'],['CUCHILLA DE AFEITAR','la'],['PEINE','el'],['JABÓN','el'],['RULOS','los'],['COLUTORIO','el'],['DESODORANTE','el'],['COLONIA','la'],['CORTAÚÑAS','el'],['LIMA DE UÑAS','la']]
};

/* zonas de las escenas: [índice de carta, x, y, ancho, alto] en fracción de la lámina */
var FV_DEMO_ZONAS = {
  masc: [[0,.235,.0,.14,.235],[1,.18,.585,.25,.125],[2,.55,.70,.12,.09],[3,.01,.745,.195,.18],[4,.665,.225,.085,.14],[5,.255,.745,.165,.09],[6,.215,.85,.145,.085],[7,.745,.18,.05,.07],[8,.0,.205,.283,.37],[9,.27,.44,.255,.15],[10,.865,.34,.135,.31],[11,.65,.53,.19,.16],[12,.895,.61,.105,.21],[13,.44,.695,.065,.09],[14,.685,.78,.28,.19],[15,.0,.44,.18,.30]],
  aseo: [[0,.135,.70,.115,.11],[1,.065,.49,.07,.25],[2,.385,.75,.145,.13],[3,.165,.765,.19,.165],[4,.38,.36,.085,.05],[4,.15,.46,.055,.12],[6,.225,.885,.14,.07],[7,.395,.67,.2,.11],[8,.085,.82,.14,.085],[10,.165,.06,.145,.15],[10,.325,.675,.09,.08],[12,.493,.53,.043,.125],[13,.433,.545,.07,.16],[14,.553,.595,.08,.07],[14,.81,.43,.05,.06],[15,.36,.9,.14,.05]]
};

var FV_DEMOS = [
  { id: 'demo-masc', titulo: 'Mascotas', desc: '16 objetos de mascotas y una escena con perros, gato, conejo y pájaro.', partes: ['masc'] },
  { id: 'demo-aseo', titulo: 'Aseo personal', desc: '16 objetos de aseo y una escena de cuarto de baño en familia.', partes: ['aseo'] },
  { id: 'demo-todo', titulo: 'Mascotas y aseo', desc: 'Las 32 cartas juntas: ideal para Clasifica y El intruso.', partes: ['masc', 'aseo'] }
];

/* Frases con voz Ximena (demo/voz/f-<clave>.mp3). El texto también sirve de respaldo. */
var FV_FRASES = {
  eso_es: '¡Eso es!',
  muy_bien: '¡Muy bien!',
  ese_es: 'Ese es…',
  busca: 'Ahora busca…',
  donde: '¿Dónde está…?',
  otra_vez: 'Prueba otra vez.',
  falta: '¿Qué falta?',
  mira: 'Mira bien todas las cartas.',
  intruso: '¿Cuál no va con los demás?',
  donde_va: '¿Dónde va?',
  como_se_llama: '¿Cómo se llama?',
  empieza: 'Empieza por…',
  en_orden: 'Toca en orden.',
  lee: 'Lee la palabra y toca su dibujo.',
  sombra: '¿De quién es esta sombra?',
  quien: '¿Qué será? Se va descubriendo.',
  parejas: 'Busca las parejas.',
  une: 'Une cada dibujo con su palabra.',
  terminado: '¡Terminado! Lo has hecho genial.',
  para_que: '¿Para qué sirve?',
  donde_guarda: '¿Dónde lo guardas?',
  frase: 'Inventa una frase con esta palabra.',
  describe: 'Dime cómo es.',
  quien_usa: '¿Quién lo usa?',
  y: 'y',
  luego: 'y luego'
};

/* Sílaba inicial calculada para la voz de pista (español; aproximación clínica sencilla). */
function fvPrimeraSilaba(w) {
  w = String(w || '').toLowerCase().split(' ')[0];
  var V = 'aeiouáéíóúü', DEB = 'iuü';
  function esV(c) { return V.indexOf(c) > -1; }
  var i = 0; while (i < w.length && !esV(w[i])) i++;
  if (i >= w.length) return w;
  var fin = i + 1;
  while (fin < w.length && esV(w[fin]) && (DEB.indexOf(w[fin]) > -1 || DEB.indexOf(w[fin - 1]) > -1)) fin++;
  var j = fin; while (j < w.length && !esV(w[j])) j++;
  if (j >= w.length) return w;
  var cons = w.slice(fin, j);
  var uni = []; for (var k = 0; k < cons.length; k++) { var d = cons.substr(k, 2); if (d === 'ch' || d === 'll' || d === 'rr') { uni.push(d); k++; } else uni.push(cons[k]); }
  var INS = ['pl','pr','bl','br','fl','fr','tr','dr','cl','cr','gl','gr','kr','tl'];
  var quedan;
  if (uni.length <= 1) quedan = 0;
  else if (uni.length === 2) quedan = INS.indexOf(uni.join('')) > -1 ? 0 : 1;
  else quedan = INS.indexOf(uni.slice(-2).join('')) > -1 ? uni.length - 2 : uni.length - 1;
  return w.slice(0, fin) + uni.slice(0, quedan).join('');
}
