"use client";
import Logo from "./Logo";
import { useState } from "react";
import Link from "next/link";
export type Entry = { slug: string; name: string; active: number; total: number; hue: number; ini: string };
export default function Directory({ entries, base, ph }: { entries: Entry[]; base: string; ph: string }) {
  const [q, setQ] = useState("");
  const list = entries.filter(e => e.name.toLowerCase().includes(q.toLowerCase()));
  return (<>
    <input className="search" placeholder={ph} value={q} onChange={e => setQ(e.target.value)} />
    <div className="grid two" style={{ marginTop: 14 }}>{list.map(e => (
      <Link key={e.slug} href={`${base}/${e.slug}`} className="card row2">
        <Logo slug={e.slug} ini={e.ini} hue={e.hue} />
        <div style={{ flex: 1 }}><h3>{e.name}</h3><div className="muted">{e.total} عروض{e.active ? <> · <b style={{ color: "var(--good)" }}>{e.active} ساري</b></> : null}</div></div>
        <span className="arrow">←</span>
      </Link>))}
      {list.length === 0 && <div className="card muted">مفيش نتائج.</div>}
    </div>
  </>);
}
