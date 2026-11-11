import asyncio, json, os, subprocess, sys, edge_tts
plan = json.load(open(sys.argv[1])); out = sys.argv[2]; os.makedirs(out, exist_ok=True)
SUBS = [("ChatGPT", "Chat ge pe té"), ("Claude", "Claud"), ("Gemini", "Yémini"), ("JSON", "yéison"), ("#ponunlogopedaentuvida", "pon un logopeda en tu vida"), ("PDF","pe de efe"), ("ColmenIA", "Colmenia"), (" IA", " I A"), ("|", ""), ("«", ""), ("»", "")]
def habla(t):
    for a, b in SUBS: t = t.replace(a, b)
    return t
async def uno(st):
    f = f"{out}/{plan['id']}_{st['id']}.mp3"
    if not os.path.exists(f):
        for intento in range(3):
            try: await edge_tts.Communicate(habla(st["texto"]), "es-ES-XimenaNeural", rate="-2%").save(f); break
            except Exception as e:
                if intento == 2: raise
                await asyncio.sleep(2)
async def main():
    for st in plan["pasos"]: await uno(st)
asyncio.run(main())
durs = {}
for st in plan["pasos"]:
    f = f"{out}/{plan['id']}_{st['id']}.mp3"
    durs[st["id"]] = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).decode().strip())
json.dump(durs, open(f"{out}/durs_{plan['id']}.json", "w")); print("voz ok", round(sum(durs.values()), 1), "s")
