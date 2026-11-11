import { spawn } from "node:child_process"; import fs from "node:fs";
const [,, htmlUrl, itemsFile, outDir] = process.argv;
const items = JSON.parse(fs.readFileSync(itemsFile, "utf8")); fs.mkdirSync(outDir, { recursive: true });
const port = 9700 + Math.floor(Math.random() * 200), prof = outDir + "/../prof_ov";
fs.rmSync(prof, { recursive: true, force: true });
const ch = spawn("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", ["--headless=new", "--disable-gpu", "--allow-file-access-from-files", `--user-data-dir=${prof}`, `--remote-debugging-port=${port}`, "--window-size=1080,1920", htmlUrl], { stdio: "ignore" });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let list; for (let i = 0; i < 40; i++) { try { list = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); break; } catch { await sleep(250); } }
const ws = new WebSocket(list.find((t) => t.type === "page").webSocketDebuggerUrl); await new Promise((r) => (ws.onopen = r));
let id = 0; const pend = new Map(); ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pend.has(d.id)) { pend.get(d.id)(d.result); pend.delete(d.id); } };
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
await send("Emulation.setDeviceMetricsOverride", { width: 1080, height: 1920, deviceScaleFactor: 1, mobile: false });
await send("Emulation.setDefaultBackgroundColorOverride", { color: { r: 0, g: 0, b: 0, a: 0 } });
await sleep(500);
for (const it of items) {
  await send("Runtime.evaluate", { expression: `render(${JSON.stringify(it.el)})`, awaitPromise: true }); await sleep(100);
  const r = await send("Page.captureScreenshot", { format: "png", fromSurface: true });
  fs.writeFileSync(`${outDir}/${it.file}`, Buffer.from(r.data, "base64"));
}
ws.close(); ch.kill(); await sleep(500); try { fs.rmSync(prof, { recursive: true, force: true }); } catch {}
console.log("ui", items.length);
