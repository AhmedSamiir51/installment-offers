"use client";
import { useState } from "react";
import Link from "next/link";
import Logo from "./Logo";
import OfferCard from "./OfferCard";
import { Data, hue, initial } from "../lib/data";
const nz = (s: string) => s.toLowerCase().replace(/[\u064B-\u0652\u0640]/g, "").replace(/[أإآ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي").replace(/[٠-٩]/g, d => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
export default function Search({ d, initialQ }: { d: Data; initialQ: string }) {
  const [q, setQ] = useState(initialQ);
  const t = nz(q.trim());
  const S = (s: string) => d.stores.find(x => x.slug === s)!, P = (s: string) => d.providers.find(x => x.slug === s)!;
  const stores = t ? d.stores.filter(s => nz(s.name + " " + s.slug).includes(t)) : [];
  const provs = t ? d.providers.filter(s => nz(s.name + " " + s.slug).includes(t)) : [];
  const offers = t ? d.offers.filter(o => nz(o.title + " " + S(o.store)?.name + " " + P(o.provider)?.name + (o.discount ? " " + o.discount + "%" : "")).includes(t)).sort((a, b) => (b.status === "active" ? 1 : 0) - (a.status === "active" ? 1 : 0)) : [];
  const none = t && !stores.length && !provs.length && !offers.length;
  return (<>
    <div className="sbox"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
      <input autoFocus={!initialQ} type="search" placeholder="دور على متجر أو شركة أو عرض" value={q} onChange={e => setQ(e.target.value)} />
      {q && <button aria-label="مسح" onClick={() => setQ("")}>×</button>}
    </div>
    {!t && <div className="card muted" style={{ marginTop: 16 }}>اكتب اسم متجر (ميامي سنتر)، شركة (فرصة، سهولة)، أو أي كلمة من العرض.</div>}
    {none && <div className="card muted" style={{ marginTop: 16 }}>مفيش نتائج لـ "{q}".</div>}
    {stores.length > 0 && <><div className="sec">المتاجر ({stores.length})</div><div className="grid two">{stores.slice(0, 8).map(s => (
      <Link key={s.slug} href={"/stores/" + s.slug} className="card row2"><Logo slug={s.slug} ini={initial(s.name)} hue={hue(s.slug)} /><div style={{ flex: 1 }}><h3>{s.name}</h3></div><span className="arrow">←</span></Link>))}</div></>}
    {provs.length > 0 && <><div className="sec">شركات التقسيط ({provs.length})</div><div className="grid two">{provs.map(s => (
      <Link key={s.slug} href={"/providers/" + s.slug} className="card row2"><Logo slug={s.slug} ini={initial(s.name)} hue={hue(s.slug)} /><div style={{ flex: 1 }}><h3>{s.name}</h3></div><span className="arrow">←</span></Link>))}</div></>}
    {offers.length > 0 && <><div className="sec">العروض ({offers.length})</div><div className="grid two">{offers.slice(0, 12).map(o => <OfferCard key={o.id} o={o} show="both" store={S(o.store)} provider={P(o.provider)} />)}</div></>}
  </>);
}
