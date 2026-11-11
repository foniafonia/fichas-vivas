/* Fichas vivas · datos del material de ejemplo, frases con voz y novedades.
   Material de ejemplo: hojas de una compañera logopeda (mascotas y aseo), cortadas
   en cartas. Voz: Ximena (Microsoft, es-ES-XimenaNeural) en demo/voz. */
var FV_VERSION = 3;

var FV_NOVEDADES = [
  { v: 3, f: '11 nov 2026', t: 'Ayuda, vídeos y copia de seguridad', d: 'Botón «Ayuda» con preguntas y 6 vídeos de un minuto. En «Perfiles», copia de seguridad: guarda en un archivo todos los perfiles y sus sesiones, y recupéralos en otro aparato. Próximamente: guardado online opcional para tenerlo en todos tus aparatos.' },
  { v: 2, f: '11 nov 2026', t: 'Más material de Almudena', d: 'Sonido /k/ con dos escenas, el cuerpo humano (cara, cuerpo y por dentro), el pelo, la piel y razas de perro. Máscaras para niños y para adultos. Videotutoriales.' },
  { v: 1, f: '11 nov 2026', t: 'Primera versión', d: 'Subir hojas en cuadrícula y PDF, corte automático, 15 juegos, escenas con zonas, grabar tu voz, modo aire con la mano, bingo y tarjetas para imprimir, exportar para compartir.' }
];

/* palabras: [texto, artículo] en el orden de la hoja */
var FV_DEMO_PAL = {
  masc: [['JAULA','la'],['COMEDERO','el'],['HUESO','el'],['CORREA','la'],['ARNÉS','el'],['COLLAR','el'],['COLLAR ANTIPULGAS','el'],['PLACA IDENTIFICATIVA','la'],['CASETA DE PERRO','la'],['CAMITA','la'],['PIENSO','el'],['ABRIGO DE PERRO','el'],['GALLETAS PARA PERROS','las'],['PELOTA','la'],['JUGUETE PARA MORDER','el'],['TRANSPORTÍN','el']],
  aseo: [['CREMA','la'],['CHAMPÚ','el'],['ESPONJA','la'],['CEPILLO DE PELO','el'],['CEPILLO DE DIENTES','el'],['PASTA DE DIENTES','la'],['PINZAS DE DEPILAR','las'],['CUCHILLA DE AFEITAR','la'],['PEINE','el'],['JABÓN','el'],['RULOS','los'],['COLUTORIO','el'],['DESODORANTE','el'],['COLONIA','la'],['CORTAÚÑAS','el'],['LIMA DE UÑAS','la']],
  cara: [['PELO','el'],['FRENTE','la'],['CEJAS','las'],['OJOS','los'],['PESTAÑAS','las'],['NARIZ','la'],['LABIOS','los'],['MEJILLA','la'],['DIENTES','los'],['LENGUA','la'],['BARBILLA','la'],['OREJA','la'],['FLEQUILLO','el'],['NUCA','la'],['CABEZA','la'],['CARA','la']],
  cuerpo: [['BIGOTE','el'],['BARBA','la'],['PATILLAS','las'],['HOMBROS','los'],['PECHO','el'],['TRIPA','la'],['ESPALDA','la'],['BRAZO','el'],['CODO','el'],['MANO','la'],['DEDO','el'],['MUÑECA','la'],['UÑA','la'],['PIERNA','la'],['RODILLA','la'],['PIE','el']],
  dentro: [['CRÁNEO','el'],['CEREBRO','el'],['INTESTINO','el'],['ESTÓMAGO','el'],['COSTILLAS','las'],['PULMONES','los'],['CORAZÓN','el'],['CAMPANILLA','la'],['TALÓN','el'],['CULO','el'],['TIBIA','la'],['PUÑO','el'],['VEJIGA','la'],['GENITALES','los'],['MUELA','la'],['ENCÍAS','las']],
  pelo: [['CALVO',''],['RAPADO',''],['RIZADO',''],['LISO',''],['RAÍCES','las'],['CANAS','las'],['MECHAS','las'],['PELUCA','la'],['EXTENSIONES','las'],['MOÑO','el'],['TRENZA','la'],['COLETA','la'],['MORENO',''],['RUBIO',''],['PELIRROJO',''],['CASTAÑO','']],
  piel: [['ARRUGAS','las'],['OJERAS','las'],['CICATRIZ','la'],['GRANOS','los'],['ARAÑAZO','el'],['HERIDA','la'],['PUNTOS NEGROS','los'],['CARIES','la'],['ROTURA','la'],['PECAS','las'],['TATUAJE','el'],['MORATÓN','el'],['LUNAR','el'],['AMPOLLAS','las'],['QUEMADURA','la'],['VENDAJE','el']],
  perros: [['TERRANOVA','el'],['ROTTWEILER','el'],['DÓBERMAN','el'],['AKITA INU','el'],['SHAR PEI','el'],['BORDER TERRIER','el'],['WEST HIGHLAND WHITE TERRIER','el'],['BICHÓN MALTÉS','el'],['GALGO ESPAÑOL','el'],['PODENCO ANDALUZ','el'],['SCHNAUZER MINIATURA','el'],['SHIBA INU','el'],['CHIHUAHUA','el'],['CORGI GALÉS','el'],['POMERANIA','el'],['TECKEL (SALCHICHA)','el']],
  k1: [['CASA','la'],['COCHE','el'],['CUCHILLO','el'],['COLACAO','el'],['COHETE','el'],['QUESO','el'],['CACA','la'],['CONEJO','el'],['CORONA','la'],['CAMA','la'],['COCO','el'],['COCODRILO','el'],['CUCHARA','la'],['COLLAR','el'],['COLA','la'],['CARRO','el'],['CAFÉ','el'],['CAÑA','la'],['KOALA','el'],['KILO','el']],
  k2: [['CAZO','el'],['CAMINO','el'],['CAMISA','la'],['CAVA','el'],['CAMIÓN','el'],['CORAZÓN','el'],['CONCHA','la'],['CORCHO','el'],['CAMISÓN','el'],['CODO','el'],['CUMBRE','la'],['CUNA','la'],['CASCABEL','el'],['CUCO','el'],['CULO','el'],['COLUMNA','la'],['COLACAO','el'],['CAPITÁN','el'],['KIWI','el'],['CABALLO','el']]
};
/* Cada tema: prefijo de las cartas (voz), categoría, escena y cartas apagadas al empezar. */
var FV_DEMO_INFO = {
  masc: { p: 'm', cat: 'Mascotas', esc: 'escena-mascotas', tesc: 'Mascotas en casa' },
  aseo: { p: 'a', cat: 'Aseo', esc: 'escena-aseo', tesc: 'El cuarto de baño' },
  cara: { p: 'c', cat: 'La cara' },
  cuerpo: { p: 'u', cat: 'El cuerpo' },
  dentro: { p: 'd', cat: 'Por dentro', apagadas: [13] },
  pelo: { p: 'p', cat: 'El pelo' },
  piel: { p: 'i', cat: 'La piel' },
  perros: { p: 'r', cat: 'Perros' },
  k1: { p: 'k', cat: 'Sonido /k/', esc: 'escena-k1', tesc: 'La casa del sonido /k/' },
  k2: { p: 'q', cat: 'Sonido /k/', esc: 'escena-k2', tesc: 'El capitán del sonido /k/' }
};

/* zonas de las escenas: [índice de carta, x, y, ancho, alto] en fracción de la lámina */
var FV_DEMO_ZONAS = {
  masc: [[0,.235,.0,.14,.235],[1,.18,.585,.25,.125],[2,.55,.70,.12,.09],[3,.01,.745,.195,.18],[4,.665,.225,.085,.14],[5,.255,.745,.165,.09],[6,.215,.85,.145,.085],[7,.745,.18,.05,.07],[8,.0,.205,.283,.37],[9,.27,.44,.255,.15],[10,.865,.34,.135,.31],[11,.65,.53,.19,.16],[12,.895,.61,.105,.21],[13,.44,.695,.065,.09],[14,.685,.78,.28,.19],[15,.0,.44,.18,.30]],
  aseo: [[0,.135,.70,.115,.11],[1,.065,.49,.07,.25],[2,.385,.75,.145,.13],[3,.165,.765,.19,.165],[4,.38,.36,.085,.05],[4,.15,.46,.055,.12],[6,.225,.885,.14,.07],[7,.395,.67,.2,.11],[8,.085,.82,.14,.085],[10,.165,.06,.145,.15],[10,.325,.675,.09,.08],[12,.493,.53,.043,.125],[13,.433,.545,.07,.16],[14,.553,.595,.08,.07],[14,.81,.43,.05,.06],[15,.36,.9,.14,.05]],
  k1: [[0,.0,.02,.71,.66],[15,.067,.47,.208,.29],[7,.315,.705,.13,.24],[14,.6,.75,.14,.14],[11,.648,.668,.167,.085],[9,.554,.41,.123,.12],[8,.135,.755,.122,.135],[17,.79,.4,.1,.08],[4,.625,.02,.095,.105],[18,.9,.08,.075,.15],[10,.835,.025,.08,.09],[10,.255,.41,.09,.105],[1,.717,.39,.055,.05],[2,.29,.505,.15,.055],[5,.357,.435,.07,.07],[16,.198,.44,.062,.06],[19,.445,.4,.088,.1],[3,.4,.35,.052,.1],[13,.33,.355,.04,.05]],
  k2: [[17,.225,.375,.26,.6],[1,.5,.375,.13,.21],[11,.775,.443,.217,.25],[13,.837,.04,.14,.32],[10,.47,.08,.26,.11],[19,.605,.33,.158,.17],[4,.715,.235,.11,.083],[2,.273,.143,.098,.24],[8,.37,.16,.074,.285],[3,.51,.48,.055,.265],[5,.127,.55,.073,.112],[6,.148,.31,.073,.1],[15,.065,.443,.048,.257],[16,.045,.287,.057,.125],[12,.133,.187,.044,.06],[7,.457,.693,.04,.092],[7,.19,.193,.03,.057],[18,.6,.7,.09,.095],[18,.655,.49,.07,.06],[9,.23,.65,.06,.09]]
};

var FV_DEMOS = [
  { id: 'demo-k', titulo: 'Sonido /k/', desc: '40 palabras con /k/ (ca, co, cu, que, ki) y dos escenas para buscar.', partes: ['k1', 'k2'] },
  { id: 'demo-cuerpo', titulo: 'El cuerpo humano', desc: 'La cara, el cuerpo y por dentro: 48 cartas en tres categorías.', partes: ['cara', 'cuerpo', 'dentro'] },
  { id: 'demo-cara', titulo: 'La cara', desc: '16 partes de la cara: de las cejas a la barbilla.', partes: ['cara'] },
  { id: 'demo-pelo', titulo: 'El pelo', desc: 'Peinados, colores y tipos de pelo. Ideal para adjetivos y descripción.', partes: ['pelo'] },
  { id: 'demo-piel', titulo: 'La piel', desc: 'Granos, heridas, pecas, moratones… Vocabulario de salud.', partes: ['piel'] },
  { id: 'demo-perros', titulo: 'Razas de perro', desc: '16 razas: del chihuahua al terranova.', partes: ['perros'] },
  { id: 'demo-masc', titulo: 'Mascotas', desc: '16 objetos de mascotas y una escena con perros, gato, conejo y pájaro.', partes: ['masc'] },
  { id: 'demo-aseo', titulo: 'Aseo personal', desc: '16 objetos de aseo y una escena de cuarto de baño en familia.', partes: ['aseo'] },
  { id: 'demo-todo', titulo: 'Mascotas y aseo', desc: 'Las 32 cartas juntas: ideal para Clasifica y El intruso.', partes: ['masc', 'aseo'] }
];

/* PRÓXIMAMENTE: se enseñan bloqueados, con voto «Lo quiero». Lista de Melífera (11-nov). */
var FV_HISTORIA = {
  t: 'Modo historia', ico: '🧭',
  d: 'Una evaluación inicial corta mide lo que ya domina (comprensión, vocabulario, memoria auditiva, atención, categorías, sonidos) y genera un camino paso a paso con tu propio material. Cada paso se desbloquea solo cuando se supera el anterior, y el informe enseña el avance.',
  pasos: ['Evaluación inicial de capacidades (5 minutos, jugando)', 'Camino a medida: qué juego, con qué cartas y con qué ayuda', 'Avanza solo al superar cada paso; si cuesta, baja un escalón', 'Informe de evolución para la familia o el equipo']
};
var FV_PROXIMO = [
  ['A', 'sino', '✅', '¿Sí o no?', 'Sale una carta y se oye «¿Es un gato?». Se toca sí o no.'],
  ['A', 'noes', '🚫', 'Toca la que NO es', 'Comprensión de frases negativas.'],
  ['A', 'articulos', '🚪', 'El, la, los, las', 'Cada carta entra por la puerta de su artículo.'],
  ['A', 'dobble', '👀', 'Encuentra la pareja', 'Dos cartas con muchos dibujos: solo uno se repite.'],
  ['A', 'duelo', '⚔️', 'Duelo de dos', 'Dos niños en la misma tableta: gana quien toca antes.'],
  ['A', 'frase', '💬', 'Haz una frase', 'Salen dos o tres cartas y hay que decir una frase con todas.'],
  ['A', 'ruletafrases', '🎰', 'Ruleta de frases', 'Tres rodillos: quién, cuándo y una carta.'],
  ['A', 'simon', '🔁', 'Repite la serie', 'Se encienden 2, 3, 4… cartas y se tocan en el mismo orden.'],
  ['A', 'paratoca', '✋', 'Para o toca', 'Solo se toca cuando sale la carta dicha: control de impulsos.'],
  ['A', 'linterna', '🔦', 'La linterna', 'Pantalla a oscuras: se busca la carta con una linterna.'],
  ['A', 'corta', '✂️', 'Corta las que son de…', 'Saltan cartas y se cortan solo las de una categoría.'],
  ['A', 'serpiente', '🐍', 'La serpiente come', 'Una serpiente se come solo las cartas de la categoría dicha.'],
  ['A', 'vuela', '🐝', 'Vuela y recoge', 'Una abeja recoge la carta que se ha dicho.'],
  ['A', 'muro', '🧱', 'Rompe el muro', 'Hay que romper el ladrillo de la carta dicha.'],
  ['A', 'crush', '💎', 'Crush de dibujos', 'Se juntan tres iguales y suena la palabra.'],
  ['A', 'cuerda', '🪢', 'Tira de la cuerda', 'Dos equipos: cada acierto tira de la cuerda.'],
  ['B', 'palmas', '👏', 'Palmas por sílabas', 'Una palmada por cada sílaba de la carta.'],
  ['B', 'sonido', '🔤', '¿Por qué sonido empieza?', 'Lotería por el primer sonido.'],
  ['B', 'completa', '🧩', 'Completa la palabra', 'Dibujo y palabra con un hueco: vocal, consonante o sílaba.'],
  ['B', 'arma', '🏗️', 'Arma la palabra', 'Las sílabas revueltas se ponen en orden.'],
  ['B', 'rimas', '🎵', 'Rimas', '¿Cuál termina como…?'],
  ['C', 'oca', '🎲', 'La oca de mis cartas', 'Al caer en una casilla se dice la palabra.'],
  ['C', 'parchis', '🟡', 'Parchís de mis cartas', 'Una pregunta en cada casilla.'],
  ['C', 'domino', '🁫', 'Dominó de mis cartas', 'Se encadenan dibujos y palabras.'],
  ['C', 'raya', '🔴', 'Cuatro en raya', 'Para poner ficha hay que decir la carta.'],
  ['D', 'historia', '📚', 'Ordena la historia', 'Las cartas de una rutina, en orden.'],
  ['D', 'cuento', '📖', 'Cuento con mis cartas', 'Una frase o un cuento con las cartas como pictos.'],
  ['D', 'cuantos', '🔢', '¿Cuántos hay?', 'Contar cuántas veces sale la carta.'],
  ['D', 'tienda', '🛒', 'La tienda', 'Cada carta tiene precio y se paga con monedas.'],
  ['E', 'airesilabas', '🙌', 'Palabras en el aire', 'Construir la palabra con las sílabas moviendo la mano.']
];
var FV_PROX_GRUPOS = { A: 'Con dibujo y palabra', B: 'Sílabas y sonidos', C: 'Juegos de mesa', D: 'Lenguaje y comprensión', E: 'Modo aire' };

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
