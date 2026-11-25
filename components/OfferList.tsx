"use client";
import { useState } from "react";
import OfferCard from "./OfferCard";
import { Offer, Store, Provider } from "../lib/data";
export default function OfferList({ offers, show, stores, providers }: { offers: Offer[]; show: "store" | "provider"; stores: Store[]; providers: Provider[] }) {
  const act = offers.filter(o => o.status === "active").length;
  const [only, setOnly] = useState(act > 0);
  const [n, setN] = useState(8);
  const list = only ? offers.filter(o => o.status === "active") : offers;
  const S = (slug: string) => stores.find(s => s.slug === slug)!, P = (slug: string) => providers.find(p => p.slug === slug)!;
  return (<>
    <div className="sw" data-i={only ? 0 : 1}>
      <button className={only ? "on" : ""} onClick={() => setOnly(true)}>ساري الآن <em>{act}</em></button>
      <button className={!only ? "on" : ""} onClick={() => setOnly(false)}>الكل <em>{offers.length}</em></button>
    </div>
    {list.length === 0 && <div className="card muted">مفيش عروض سارية دلوقتي. الموقع بيتحدث تلقائي كل كام ساعة.</div>}
    <div className="grid two">{list.slice(0, n).map(o => <OfferCard key={o.id} o={o} show={show} store={S(o.store)} provider={P(o.provider)} />)}</div>
    {list.length > n && <div style={{ textAlign: "center", marginTop: 16 }}><button className="btn s" onClick={() => setN(n + 8)}>عرض المزيد</button></div>}
  </>);
}
