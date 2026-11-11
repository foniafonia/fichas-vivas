"""Planes de los videotutoriales de Fichas vivas (cadena de Graf-IA/Rub-IA adaptada).
Cada paso: texto (con | para los tiempos), foco por tiempo, selectores, js antes de capturar."""
import json, os
AQUI = os.path.dirname(os.path.abspath(__file__))
def P(id, texto, foco, sels, **k):
    d = {"id": id, "texto": texto, "foco": foco, "sels": sels}; d.update(k); return d
def V(id, titulo, pasos, fin1, fin2, publico=None):
    json.dump({"id": id, "titulo": titulo, "w": 768, "h": 1024, "publico": publico, "fin1": fin1, "fin2": fin2, "pasos": pasos},
              open(os.path.join(AQUI, f"{id}.json"), "w"), ensure_ascii=False, indent=1)

ESPIA = "(()=>{if(!window.__esp){window.__esp=1;const o=FV.habla;FV.habla=function(p,f){const u=[].concat(p||[]);const m=u.map(x=>x&&x.audio||'').join(' ').match(/voz\\/([a-z]\\d\\d)-q/);if(m)window.__obj=m[1];return o.call(FV,p,f)}}})();"
PREP = ESPIA + "FV.aj.n=4;FV.aj.r=4;FV.aj.tam='l';FV.aj.tranq=true;FV.aj.son=false;"
OBJ = "(window.__obj||null)"
DEMO = "document.getElementById('probarDemo').click();"
ESPERA = lambda ms: f"await new Promise(r=>setTimeout(r,{ms}));"
def asy(js): return "(async()=>{" + js + "})()"
HOJA = os.path.join(AQUI, "hoja-mascotas.jpg")
PALABRAS = "jaula\\ncomedero\\nhueso\\ncorrea\\narnés\\ncollar\\ncollar antipulgas\\nplaca identificativa\\ncaseta de perro\\ncamita\\npienso\\nabrigo de perro\\ngalletas para perros\\npelota\\njuguete para morder\\ntransportín"

# ---------- 1 · Empieza aquí ----------
V("v1", "1 · Empieza aquí", [
 P("a1", "Esto es Fichas vivas. | Convierte tus fichas de papel en juegos, | sin recortar nada.", [None, ["sel"], ["sel"]], {"sel": ["parent:#selectorTitulo"]}, scroll=0, wait=1500),
 P("a2", "Primero, elige para quién es: | niños o adultos. | La pantalla y los ajustes se adaptan.", [["ninos", "adultos"], ["ninos"], ["adultos"]], {"ninos": ["[data-publico=\"ninos\"]"], "adultos": ["[data-publico=\"adultos\"]"]}, misma=True, zmax=2.0),
 P("a3", "Para empezar, | prueba con el material de ejemplo.", [None, ["demo"]], {"demo": ["#probarDemo"]}, js="document.querySelector('[data-publico=\"ninos\"]').click();", scroll=0, zmax=2.4),
 P("a4", "Aquí están los 16 juegos. | Toca uno. | Por ejemplo, «Escucha y toca».", [["lista"], ["escucha"], ["escucha"]], {"lista": ["#listaJuegos"], "escucha": ["[data-j=\"escucha\"]"]}, js=PREP + DEMO, scroll="#listaJuegos", margen=120, zmax=2.4),
 P("a5", "La voz pregunta dónde está cada cosa | y se toca la carta.", [["cartas"], ["cartas"]], {"cartas": ["#escenario .cartas"], "oir": ["[data-oir]"]}, js=PREP + "FV.empieza('escucha');", wait=900),
 P("a6", "Si acierta, | se oye «¡Eso es!» | y pasa a la siguiente.", [["bien"], ["bien"], ["bien"]], {"bien": ["#escenario .carta.bien"]}, js="(()=>{const id=" + OBJ + ";document.querySelector('#escenario .carta[data-id=\"'+id+'\"]').click()})()", wait=350, zmax=2.4),
 P("a7", "Si se equivoca, | la voz le dice qué ha tocado | y qué tiene que buscar.", [["mal"], ["mal"], ["cartas"]], {"mal": ["#escenario .carta.mal"], "cartas": ["#escenario .cartas"]}, js=asy(ESPERA(1900) + "const id=" + OBJ + ";const o=[...document.querySelectorAll('#escenario .carta')].find(c=>c.dataset.id!==id);o.click();"), wait=500, zmax=2.4),
 P("a8", "Al segundo fallo, | se ilumina la carta buena. | Sin prisas y sin castigos.", [["sel"], ["sel"], ["sel"]], {"sel": ["#escenario .carta.sel"]}, js="(()=>{const id=" + OBJ + ";const o=[...document.querySelectorAll('#escenario .carta')].filter(c=>c.dataset.id!==id&&!c.classList.contains('mal'))[0];o.click()})()", wait=500, zmax=2.4),
 P("a9", "Para salir, pulsa «Salir». | «Empezar otra vez» repite el juego.", [["salir"], ["otra"]], {"salir": ["#jSalir"], "otra": ["#jOtra"]}, misma=True, zmax=2.6),
], "¡Ya sabes empezar!", "Siguiente: sube tu material")

# ---------- 2 · Sube tu material ----------
V("v2", "2 · Sube tu material", [
 P("b1", "Ahora, con tu material. | Pulsa «Subir mi material».", [None, ["subir"]], {"subir": ["#v-inicio [data-ir=\"subir\"]"]}, scroll=0, zmax=2.4),
 P("b2", "Pulsa «Hoja en cuadrícula». | Vale una foto, una imagen | o un PDF.", [["hoja"], ["hoja"], ["hoja"]], {"hoja": ["label:has(#fHoja)"]}, js="FV.ir('subir');", scroll=0, zmax=2.4),
 P("b3", "La hoja se corta sola: | encuentra la cuadrícula | y numera cada carta.", [["lienzo"], ["info"], ["lienzo"]], {"lienzo": ["#lienzoCorte"], "info": ["#cInfo", "#cFil", "#cCol"]}, archivo=["#fHoja", HOJA], esperaArchivo=2500, zmax=2.0),
 P("b4", "Escribe las palabras en orden, | una por línea, | y pulsa «Cortar y añadir».", [["pal"], ["pal"], ["cortar"]], {"pal": ["#cPal"], "cortar": ["#cCortar"]}, js="(()=>{const t=document.getElementById('cPal');t.value='" + PALABRAS + "';t.dispatchEvent(new Event('input'));document.getElementById('cCortar').scrollIntoView({block:'end'})})()", zmax=2.2),
 P("b5", "Ya tienes tus cartas. | Puedes cambiar la palabra | o ponerle una categoría.", [["c1"], ["txt"], ["cat"]], {"c1": ["#edc1"], "txt": ["#edc1 input[data-k=\"texto\"]"], "cat": ["#edc1 input[data-k=\"cat\"]"]}, js="document.getElementById('cCortar').click();setTimeout(()=>{document.querySelector('.ed-carta').id='edc1'},400);", scroll="#edCartas", margen=140, wait=1200, zmax=2.6),
 P("b6", "Con el micrófono | grabas tu propia voz | en cada carta.", [["mic"], ["mic"], ["mic"]], {"mic": ["#edc1 [data-a=\"grabar\"]"]}, misma=True, zmax=2.8),
 P("b7", "Se guarda solo en este aparato. | Para pasarlo a una compañera, | «Exportar».", [["estado"], ["estado"], ["exp"]], {"estado": ["#edEstado"], "exp": ["#edExportar"]}, scroll=0, zmax=2.4),
 P("b8", "Pulsa «Jugar con él» | y tu material ya funciona | en los 16 juegos.", [["jugar"], ["jugar"], ["jugar"]], {"jugar": ["#edJugar"]}, misma=True, zmax=2.6),
 P("b9", "Aquí lo tienes, | listo para jugar.", [["lista"], ["lista"]], {"lista": ["#listaJuegos"]}, js="FV.ir('juegos');", scroll="#listaJuegos", margen=120, zmax=1.6),
], "¡Tu material ya es un juego!", "Siguiente: ajusta a cada persona", publico="ninos")

# ---------- 3 · Ajusta a cada persona ----------
V("v3", "3 · Ajusta a cada persona", [
 P("c1", "En «Ajustes» | lo adaptas a cada persona.", [None, ["aj"]], {"aj": ["#ajustes"]}, js=DEMO + "document.getElementById('ajustes').open=true;", scroll="#ajustes", margen=80, zmax=1.8),
 P("c2", "Cuántas cartas se ven, | cuántas rondas, | y si se ve la imagen, la palabra o las dos.", [["n"], ["r"], ["ver"]], {"n": ["label:has(#aN)"], "r": ["label:has(#aR)"], "ver": ["label:has(#aVer)"]}, misma=True, zmax=2.6),
 P("c3", "Mayúsculas o minúsculas, | el tamaño de las cartas | y la velocidad de la voz.", [["letra"], ["tam"], ["vel"]], {"letra": ["label:has(#aLetra)"], "tam": ["label:has(#aTam)"], "vel": ["label:has(#aVel)"]}, misma=True, zmax=2.6),
 P("c4", "El modo tranquilo quita puntos y prisas: | el error se nombra con calma.", [["tr"], ["tr"]], {"tr": ["label:has(#aTranq)"]}, misma=True, zmax=2.6),
 P("c5", "En «Escucha y toca» | puedes pedir dos o tres palabras seguidas, | para trabajar la memoria auditiva.", [["sec"], ["sec"], ["sec"]], {"sec": ["label:has(#aSec)"]}, misma=True, zmax=2.6),
 P("c6", "Para adultos con afasia, | «Nombra con pistas»: | letra, primera sílaba o la palabra.", [["img"], ["ayudas"], ["ayudas"]], {"img": ["#escenario .grande"], "ayudas": ["#escenario .ayudas"]}, js=PREP + "FV.empieza('nombra');", wait=900, zmax=2.2),
 P("c7", "Y tú marcas cómo salió: | solo, con pista o repitiendo. | Queda en el registro de la sesión.", [["marcar"], ["marcar"], ["marcar"]], {"marcar": ["#escenario .marcar"]}, misma=True, zmax=2.2),
 P("c8", "Arriba cambias entre niños y adultos: | la pantalla y los ajustes | se adaptan.", [["sel"], ["sel"], ["sel"]], {"sel": ["parent:#selectorTitulo"]}, js="document.getElementById('jSalir').click();document.getElementById('btnPublico').click();", scroll=0, zmax=1.8),
], "¡Ya sabes ajustarlo!", "Siguiente: las escenas", publico="ninos")

# ---------- 4 · Escenas ----------
V("v4", "4 · Escenas", [
 P("d1", "En «¿Dónde está?» | la voz pide un objeto | y se busca en la lámina.", [["c"], ["lam"], ["lam"]], {"lam": ["#eW"], "c": ["#eC"]}, js=asy(PREP + DEMO + "FV.empieza('escena');" + ESPERA(300) + "document.querySelector('[data-e=\"0\"]').click();"), wait=1500, zmax=2.0),
 P("d2", "Al encontrarlo, | se ilumina | y se oye su nombre.", [["bien"], ["bien"], ["bien"]], {"bien": ["#eW .zona.bien"]}, js="(()=>{const id=" + OBJ + ";document.querySelector('#eW .zona[data-c=\"'+id+'\"]').click()})()", wait=400, zmax=2.6),
 P("d3", "En «Explora la escena» | se toca cualquier cosa | y dice cómo se llama.", [["lam"], ["z"], ["z"]], {"lam": ["#eW"], "z": ["#eW .zona.bien"]}, js=asy("FV.empieza('explora');" + ESPERA(300) + "document.querySelector('[data-e=\"1\"]').click();" + ESPERA(900) + "document.querySelector('#eW .zona[data-c=\"a04\"]').click();"), wait=600, zmax=2.6),
 P("d4", "Para usar tu propia lámina, | pulsa «Lámina de escena».", [None, ["lam"]], {"lam": ["label:has(#fEscena)"]}, js="document.getElementById('jSalir').click();FV.ir('editar');", scroll=0, zmax=2.4),
 P("d5", "Elige una carta | y arrastra un rectángulo | encima del objeto.", [["cartas"], ["lam"], ["lam"]], {"cartas": ["#zCartas"], "lam": ["#zWrap"]}, js="document.querySelector('[data-esc=\"0\"]').click();", wait=1200, zmax=1.8),
], "¡Ya sabes usar escenas!", "Siguiente: modo aire y más", publico="ninos")

# ---------- 5 · Modo aire, imprimir y compartir ----------
V("v5", "5 · Modo aire, imprimir y compartir", [
 P("e1", "Con el modo aire | se juega moviendo la mano | delante de la cámara.", [None, ["aire"], ["aire"]], {"aire": ["#btnAire"]}, scroll=0, zmax=2.8),
 P("e2", "El dedo índice mueve el puntero. | Para tocar, deja la mano quieta | o junta índice y pulgar.", [["aire"], ["aire"], ["aire"]], {"aire": ["#btnAire"]}, misma=True, zmax=2.8),
 P("e3", "¿Prefieres papel? | Imprime tarjetas, bingo, memoria | o la hoja de registro.", [None, ["imp"], ["imp"]], {"imp": ["[data-imp]"]}, js=DEMO, scroll="[data-imp=\"tarjetas\"]", margen=260, zmax=2.0),
 P("e4", "Y el registro de cada sesión, | sin nombres, | se puede descargar.", [["reg"], ["reg"], ["csv"]], {"reg": ["#registro"], "csv": ["#regCsv"]}, misma=True, zmax=2.2),
 P("e5", "En «Mi material» está todo lo tuyo. | Para recibir el de una compañera, | «Importar».", [["lib"], ["lib"], ["imp"]], {"lib": ["#v-biblioteca"], "imp": ["label:has(#fImportar)"]}, js="FV.ir('biblioteca');", scroll=0, zmax=2.4),
 P("e6", "Si echas algo en falta, | pídeselo a la abeja. | Lo que más se pide, se hace antes.", [["abeja"], ["chips"], ["chips"]], {"abeja": ["#mejora > *"], "chips": ["#mejChips"]}, js="FV.ir('inicio');FV.abreMejora();", scroll=0, wait=900, zmax=2.2),
 P("e7", "Y en ColmenIA, la comunidad de logopedas, | se pide, se hace, | se comparte y se mejora entre todos.", [["p"], ["p"], ["p"]], {"p": ["#v-inicio .puente"]}, js="document.getElementById('mejora').classList.add('oculto');", scroll="#v-inicio .puente", margen=300, zmax=2.0),
 P("e8", "Y lo que viene: | el modo historia y treinta juegos más. | Vota el que quieras primero.", [["h"], ["h"], ["h"]], {"h": ["[data-prox=\"p\"] .prox-hist"]}, scroll="[data-prox=\"p\"]", margen=40, zmax=1.8),
], "¡Ya lo sabes todo!", "Siguiente: perfiles e informe", publico="ninos")

# ---------- 6 · Perfiles e informe ----------
SIM = open(os.path.join(AQUI, "sim.js")).read()
V("v6", "6 · Perfiles e informe", [
 P("f1", "Para medir, crea un perfil: | un código, sin nombres. | Todo se queda en tu aparato.", [None, ["nuevo"], ["nuevo"]], {"nuevo": ["parent:#pfCrear"]}, js="localStorage.removeItem('fv-perfiles-v1');document.getElementById('btnPerfil').click();", scroll=0, wait=900, zmax=2.0),
 P("f2", "Con el perfil activo, | cada respuesta se apunta: | qué se pedía, qué tocó y cuánto tardó.", [["p"], ["p"], ["p"]], {"p": ["[data-pf]"]}, js="document.getElementById('pfObj').value='vocabulario y atención';document.getElementById('pfEdad').value='6-8 años';document.getElementById('pfCrear').click();", wait=900, zmax=2.2),
 P("f3", "El informe reúne todas las medidas: | velocidad, precisión, atención, | memoria auditiva y tipo de error.", [["res"], ["med"], ["med"]], {"res": ["#infCuerpo section"], "med": ["#infCuerpo .pf-t"]}, js=SIM, wait=1200, zmax=1.7),
 P("f4", "Gráficas de evolución entre sesiones, | por juego, por categoría | y las palabras que más cuestan.", [["evo"], ["evo"], ["evo"]], {"evo": ["#infCuerpo .pf-dos"]}, js="document.querySelector('#infCuerpo .pf-dos').scrollIntoView({block:'center'});", wait=600, zmax=1.8),
 P("f5", "Añade tus propias medidas, | imprímelo en PDF | o exporta los datos.", [["bot"], ["imp"], ["bot"]], {"bot": ["#infImp", "#infCsv", "#infJson"], "imp": ["#infImp"]}, js="document.getElementById('infImp').scrollIntoView({block:'center'});", wait=600, zmax=2.4),
], "¡Ya sabes medir!", "Más en ColmenIA", publico="ninos")
print("planes ok")
