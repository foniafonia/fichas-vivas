// Captura los pasos de un vídeo: ejecuta cada paso en la app real, calcula rectángulos y hace la captura.
import { spawn } from "node:child_process"; import fs from "node:fs";
const [,, urlApp, planFile, outDir] = process.argv;
const plan = JSON.parse(fs.readFileSync(planFile, "utf8"));
const W = plan.w || 768, H = plan.h || 1024;
const port = 9333 + Math.floor(Math.random() * 300), prof = outDir + "/../prof_cap";
fs.rmSync(prof, { recursive: true, force: true }); fs.mkdirSync(outDir, { recursive: true });
const ch = spawn("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", ["--headless=new", "--disable-gpu", "--hide-scrollbars", "--allow-file-access-from-files", `--user-data-dir=${prof}`, `--remote-debugging-port=${port}`, `--window-size=${W},${H}`, "about:blank"], { stdio: "ignore" });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let list; for (let i = 0; i < 40; i++) { try { list = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); break; } catch { await sleep(250); } }
const ws = new WebSocket(list.find((t) => t.type === "page").webSocketDebuggerUrl); await new Promise((r) => (ws.onopen = r));
let id = 0; const pend = new Map(); ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pend.has(d.id)) { pend.get(d.id)(d.result); pend.delete(d.id); } };
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
await send("Runtime.enable"); await send("Page.enable"); await send("DOM.enable");
await send("Emulation.setDeviceMetricsOverride", { width: W, height: H, deviceScaleFactor: 2, mobile: false });
await send("Page.addScriptToEvaluateOnNewDocument", { source: "try{localStorage.setItem('fv-no-contar','1');localStorage.setItem('fv-nov-visto','99');localStorage.setItem('fv-aire-ok','1');"+(plan.publico?"localStorage.setItem('fv-publico','"+plan.publico+"');":"localStorage.removeItem('fv-publico');")+"}catch(e){}" });
await send("Page.navigate", { url: urlApp }); await sleep(2500);
const FIND = `(function(specs){
  const D=document;
  const vis=(e)=>{const r=e.getBoundingClientRect();return r.width>2&&r.height>2};
  function one(s){
    if(s.startsWith("parent:")){const e=one(s.slice(7));return e&&e[0].parentElement?[e[0].parentElement]:null}
    if(s.startsWith("mid:")){const e=D.querySelector(s.slice(4));if(!e||!vis(e))return null;const r=e.getBoundingClientRect();const b={left:r.left+r.width*0.2,right:r.left+r.width*0.8,top:r.top+r.height*0.2,bottom:r.top+r.height*0.8};return [{getBoundingClientRect:()=>b}]}
    if(s.startsWith("grupo:")){const e=one(s.slice(6));const g=e&&e[0].closest(".grupo");return g?[g]:null}
    if(s.startsWith("text:")){const n=s.slice(5).toLowerCase();let best=null,ba=1e12;
      for(const e of D.body.querySelectorAll("*")){if(["SCRIPT","STYLE","OPTION"].includes(e.tagName))continue;if(!(e.textContent||"").toLowerCase().includes(n)||!vis(e))continue;const r=e.getBoundingClientRect(),a=r.width*r.height;if(a<ba){ba=a;best=e}}
      return best?[best]:null}
    const l=[...D.querySelectorAll(s)].filter(vis);return l.length?l:null}
  const out={};
  for(const [name,sels] of Object.entries(specs)){
    if(typeof sels[0]==="number"){out[name]=sels;continue}
    let x0=1e9,y0=1e9,x1=-1,y1=-1,ok=false;
    for(const s of sels){const l=one(s);if(!l)continue;for(const e of l){const r=e.getBoundingClientRect();ok=true;x0=Math.min(x0,r.left);y0=Math.min(y0,r.top);x1=Math.max(x1,r.right);y1=Math.max(y1,r.bottom)}}
    out[name]=ok?[Math.round(x0),Math.round(y0),Math.round(x1-x0),Math.round(y1-y0)]:null}
  return out})`;
const rects = {}; let last = null;
for (const st of plan.pasos) {
  if (st.externa) { fs.copyFileSync(st.externa, `${outDir}/${st.id}.png`); const r0 = await send("Runtime.evaluate", { expression: `${FIND}(${JSON.stringify(st.sels || {})})`, returnByValue: true }); rects[st.id] = r0.result.value; console.log(st.id, "(externa) ok"); continue; }
  if (!st.misma) {
    if (st.archivo) { const d = await send("DOM.getDocument", { depth: -1 }); const q = await send("DOM.querySelector", { nodeId: d.root.nodeId, selector: st.archivo[0] }); await send("DOM.setFileInputFiles", { nodeId: q.nodeId, files: [st.archivo[1]] }); await sleep(st.esperaArchivo ?? 1800); }
    if (st.js) { const r = await send("Runtime.evaluate", { expression: st.js, awaitPromise: true, returnByValue: true }); if (r.exceptionDetails) console.log("ERR", st.id, r.exceptionDetails.exception?.description?.slice(0, 200)); }
    if (st.scroll !== undefined) {
      if (typeof st.scroll === "number") await send("Runtime.evaluate", { expression: `window.scrollTo(0,${st.scroll})` });
      else { const q = await send("Runtime.evaluate", { expression: `${FIND}(${JSON.stringify({ s: [st.scroll] })})`, returnByValue: true }); const rr = q.result.value.s; if (rr) await send("Runtime.evaluate", { expression: `window.scrollBy(0,${rr[1] - (st.margen ?? 60)})` }); else console.log("SCROLL sin objetivo", st.id); }
    }
    await sleep(st.wait ?? 700);
  }
  const r = await send("Runtime.evaluate", { expression: `${FIND}(${JSON.stringify(st.sels || {})})`, returnByValue: true });
  rects[st.id] = r.result.value;
  if (!st.misma) { const s = await send("Page.captureScreenshot", { format: "png" }); fs.writeFileSync(`${outDir}/${st.id}.png`, Buffer.from(s.data, "base64")); last = st.id; }
  const miss = Object.entries(rects[st.id]).filter(([, v]) => !v).map(([k]) => k);
  console.log(st.id, st.misma ? "(misma)" : "", miss.length ? "SIN: " + miss.join(",") : "ok");
}
fs.writeFileSync(outDir + "/../rects_" + plan.id + ".json", JSON.stringify(rects));
ws.close(); ch.kill(); await sleep(600); try { fs.rmSync(prof, { recursive: true, force: true }); } catch {}
