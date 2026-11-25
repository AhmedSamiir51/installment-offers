import json,re,sys,urllib.request,urllib.parse,os
UA={"User-Agent":"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120 Safari/537.36"}
def get(u,t=15):
    r=urllib.request.urlopen(urllib.request.Request(u,headers=UA),timeout=t);return r.read(),r.headers.get("content-type","")
d=json.load(open("data/offers.json"));res={}
for e in d["stores"]+d["providers"]:
    s=e.get("site")
    if not s: continue
    try:
        html=get(s)[0].decode("utf8","ignore")
    except Exception as ex:
        print("FAIL page",e["slug"],str(ex)[:50]);html=""
    cands=[]
    for m in re.finditer(r"<link[^>]+>",html,re.I):
        t=m.group(0)
        if re.search(r'rel=["\'][^"\']*(apple-touch-icon|icon)',t,re.I):
            h=re.search(r'href=["\']([^"\']+)',t)
            if h:
                sz=re.search(r'sizes=["\'](\d+)',t);cands.append((("apple" in t.lower())*1000+(int(sz.group(1)) if sz else 0),h.group(1)))
    cands.sort(reverse=True)
    urls=[urllib.parse.urljoin(s,u) for _,u in cands]
    m=re.search(r'<meta[^>]+property=["\']og:image["\'][^>]+content=["\']([^"\']+)',html,re.I)
    urls.append(urllib.parse.urljoin(s,"/favicon.ico"))
    ok=False
    for u in urls[:4]:
        try:
            b,ct=get(u)
            if len(b)<300 or b[:5]==b"<!DOC" or b[:5]==b"<html": continue
            ext=".svg" if b"<svg" in b[:300] else ".ico" if u.endswith(".ico") else ".png" if b[:4]==b"\x89PNG" else ".jpg" if b[:2]==b"\xff\xd8" else ".webp" if b[:4]==b"RIFF" else None
            if not ext: continue
            fn=f"public/logos/{e['slug']}{ext}";open(fn,"wb").write(b);res[e["slug"]]="/logos/"+e["slug"]+ext;print("OK",e["slug"],u[:80],len(b));ok=True;break
        except Exception as ex: pass
    if not ok: print("NONE",e["slug"])
json.dump(res,open("data/logos.json","w"),indent=1)
