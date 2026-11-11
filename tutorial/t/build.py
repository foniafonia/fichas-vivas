import json, os, subprocess, sys
from PIL import Image, ImageDraw
S=os.path.dirname(os.path.dirname(os.path.abspath(__file__))); plan=json.load(open(sys.argv[1])); vid=plan["id"]; T=S+"/t"
OUT=f"{T}/{vid}"; os.makedirs(OUT+"/ui",exist_ok=True); os.makedirs(OUT+"/ring",exist_ok=True)
RECT=json.load(open(f"{T}/rects_{vid}.json")); DUR=json.load(open(f"{T}/voz/durs_{vid}.json"))
W,H=plan.get("w",768),plan.get("h",1024); K=1080/W
steps=plan["pasos"]; N=len(steps)
def union(st,names,pad):
    rs=[RECT[st["id"]][n] for n in names if RECT[st["id"]].get(n)]
    if not rs: return None
    x0=min(r[0] for r in rs);y0=min(r[1] for r in rs);x1=max(r[0]+r[2] for r in rs);y1=max(r[1]+r[3] for r in rs)
    x0=max(0,x0-pad);y0=max(0,y0-pad);x1=min(W,x1+pad);y1=min(H,y1+pad)
    if x1-x0<8 or y1-y0<8:
        print('AVISO foco fuera de pantalla',st['id'],names); return None
    return x0,y0,x1-x0,y1-y0
def cam(r,zmax):
    x,y,w,h=r; z=max(1.0,min(W/(w+60),H/(h+160),zmax)); cx=min(max(x+w/2,W/2/z),W-W/2/z); cy=min(max(y+h/2,H/2/z),H-H/2/z); return z,cx,cy
# imagen base de cada paso (los «misma» comparten captura con el anterior que no lo es)
base={}; prev=None
for st in steps:
    if not st.get("misma"): prev=st["id"]
    base[st["id"]]=prev
items=[]
for i,st in enumerate(steps,1):
    items.append(dict(file=f"ui/u{i:02d}.png",el=dict(kind="ui",num=i,total=N,video=plan["titulo"],texto=st["texto"].replace("|",""))))
items.append(dict(file="ui/fin.png",el=dict(kind="fin",t1=plan.get("fin1","¡Ya sabes empezar!"),t2=plan.get("fin2","Siguiente vídeo"),t3=plan.get("fin3","skool.com/logopedia-7339"))))
json.dump(items,open(OUT+"/items.json","w"))
subprocess.run(["node",T+"/render.mjs","file://"+T+"/overlay.html",OUT+"/items.json",OUT],check=True)
def smooth(keys):
    e=f"{keys[-1][1]:.4f}"
    for (ta,va),(tb,vb) in reversed(list(zip(keys,keys[1:]))):
        u=f"min(1,max(0,(T-{ta:.3f})/{tb-ta:.3f}))"
        e=f"if(lt(T,{tb:.3f}),{va:.4f}+({vb:.4f}-{va:.4f})*({u}*{u}*(3-2*{u})),{e})"
    return e
PRE=0.12; POST=0.15; XF=0.12; clips=[]; starts=[]; t0=0
def beats_de(st):
    frases=[f.strip() for f in st["texto"].split("|") if f.strip()]
    foco=st.get("foco")
    if foco is None: focos=[None]*len(frases)
    elif foco and isinstance(foco[0],list) or (foco and foco[0] is None): focos=foco+[foco[-1]]*(len(frases)-len(foco))
    else: focos=[foco]*len(frases)
    n=sum(len(f) for f in frases); acum=0; out=[]
    for f,fo in zip(frases,focos):
        out.append((acum/n,fo)); acum+=len(f)
    return out
for i,st in enumerate(steps,1):
    dur=DUR[st["id"]]; D=PRE+dur+POST; out=f"{OUT}/c{i:02d}.mp4"; clips.append((out,D)); starts.append(t0+PRE)
    t0+=D-XF
    cap=f"{T}/cap/{base[st['id']]}.png"
    cmd=["ffmpeg","-v","error","-y","-f","lavfi","-i",f"color=c=0xFFF8EA:s=1080x1920:r=25:d={D}","-loop","1","-framerate","25","-t",str(D),"-i",cap]
    fc=[]; cur="1:v"; idx=2
    zk=[(0,1.0)];xk=[(0,W/2)];yk=[(0,H/2)]
    bs=beats_de(st); rings=[]
    for k,(frac,fo) in enumerate(bs):
        tb=PRE+dur*frac
        r=union(st,fo,st.get("pad",14)) if fo else None
        z,cx,cy=cam(r,st.get("zmax",2.2)) if r else (1.0,W/2,H/2)
        tm=max(0.02,tb-0.12) if k else 0.02
        for kk,v in ((zk,z),(xk,cx),(yk,cy)):
            kk.append((max(tm,kk[-1][0]+0.01),kk[-1][1])); kk.append((max(tm,kk[-1][0]+0.01)+0.4,v))
        if r and st.get("anillo",True):
            x,y,w,h=r; sc=2
            im=Image.new("RGBA",(W*2,H*2),(0,0,0,0)); d=ImageDraw.Draw(im)
            d.rounded_rectangle([x*sc-6,y*sc-6,(x+w)*sc+6,(y+h)*sc+6],radius=36,outline=(255,255,255,170),width=28)
            d.rounded_rectangle([x*sc,y*sc,(x+w)*sc,(y+h)*sc],radius=32,outline=(242,179,61,255),width=16)
            im.save(f"{OUT}/ring/r{i:02d}_{k}.png")
            fin=(PRE+dur*bs[k+1][0]-0.1) if k+1<len(bs) else None
            rings.append((k,tm+0.3,fin))
    for (k,tin,tout) in rings:
        cmd+=["-loop","1","-framerate","25","-t",str(D),"-i",f"{OUT}/ring/r{i:02d}_{k}.png"]
        fo=f",fade=t=out:st={tout:.2f}:d=0.12:alpha=1" if tout else ""
        fc.append(f"[{idx}:v]format=rgba,fade=t=in:st={tin:.2f}:d=0.18:alpha=1{fo}[rg{idx}]"); fc.append(f"[{cur}][rg{idx}]overlay=0:0[q{idx}]"); cur=f"q{idx}"; idx+=1
    Tt="(on/25)"
    fc.append(f"[{cur}]zoompan=z='{smooth(zk).replace('T',Tt)}':x='2*({smooth(xk).replace('T',Tt)})-iw/zoom/2':y='2*({smooth(yk).replace('T',Tt)})-ih/zoom/2':d=1:s=1080x1440:fps=25[app]")
    fc.append("[0:v][app]overlay=0:170[v0]")
    cmd+=["-loop","1","-framerate","25","-t",str(D),"-i",f"{OUT}/ui/u{i:02d}.png"]
    fc.append(f"[v0][{idx}:v]overlay=0:0,format=yuv420p[vout]")
    open(OUT+"/fc.txt","w").write(";".join(fc))
    cmd+=["-filter_complex_script",OUT+"/fc.txt","-map","[vout]","-t",str(D),"-c:v","libx264","-preset","medium","-crf","21","-r","25",out]
    subprocess.run(cmd,check=True)
# cierre
D=3.0; out=f"{OUT}/cfin.mp4"; clips.append((out,D)); starts_fin=t0
subprocess.run(["ffmpeg","-v","error","-y","-loop","1","-framerate","25","-t",str(D),"-i",f"{OUT}/ui/fin.png","-vf","format=yuv420p","-c:v","libx264","-crf","21","-r","25",out],check=True)
total=t0+D
cmd=["ffmpeg","-v","error","-y"]
for c,_ in clips: cmd+=["-i",c]
fc=[];cur="0:v"
for i in range(1,len(clips)):
    off=sum(d for _,d in clips[:i])-XF*i
    fc.append(f"[{cur}][{i}:v]xfade=transition=fade:duration={XF}:offset={off}[x{i}]"); cur=f"x{i}"
cmd+=["-filter_complex",";".join(fc),"-map",f"[{cur}]","-c:v","libx264","-crf","21","-pix_fmt","yuv420p","-r","25",OUT+"/mudo.mp4"]
subprocess.run(cmd,check=True)
# audio: voz de cada paso en su sitio + música de fondo muy baja
MUS=os.path.expanduser("~/Developer/VIDEO_COLMENIA/musica/alexzavesa-dance-playful-night-510786.mp3")
cmd=["ffmpeg","-v","error","-y","-i",OUT+"/mudo.mp4","-i",MUS]
for st in steps: cmd+=["-i",f"{T}/voz/{vid}_{st['id']}.mp3"]
fc=[f"[{k+2}:a]adelay={int(starts[k]*1000)}|{int(starts[k]*1000)}[a{k}]" for k in range(N)]
fc.append("".join(f"[a{k}]" for k in range(N))+f"amix=inputs={N}:normalize=0:duration=longest[voz]")
fc.append(f"[1:a]atrim=0:{total:.2f},afade=t=in:d=1.5,afade=t=out:st={total-2.5:.2f}:d=2.5,volume=0.065[mus]")
fc.append("[voz][mus]amix=inputs=2:normalize=0:duration=first,loudnorm=I=-16:TP=-1.5:LRA=11[a]")
final=f"{T}/salida/{vid}.mp4"; os.makedirs(T+"/salida",exist_ok=True)
cmd+=["-filter_complex",";".join(fc),"-map","0:v","-map","[a]","-c:v","copy","-c:a","aac","-b:a","160k","-t",f"{total:.2f}","-movflags","+faststart",final]
subprocess.run(cmd,check=True); print("listo",final,round(total,1),"s")
