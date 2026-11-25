import Link from "next/link";
import { Offer, Store, Provider, fmtDate } from "../lib/data";
export default function OfferCard({ o, show, store, provider }: { o: Offer; show: "store" | "provider" | "both"; store: Store; provider: Provider }) {
  const on = o.status === "active";
  const other = show === "store" || show === "both" ? { href: "/providers/" + provider.slug, name: provider.name, label: "شركة التقسيط" } : { href: "/stores/" + store.slug, name: store.name, label: "المتجر" };
  const big = o.discount != null ? `${o.discountUpTo ? "حتى " : ""}${o.discount}%` : o.maxMonths ? `${o.maxMonths} شهر` : "عرض";
  return (<div className={"card offer " + (on ? "" : "ended")}>
    <div className="top-row">
      <div><div className="big">{big}</div><div className="muted">{o.discount != null ? "خصم" : "تقسيط"}{o.discount != null && o.maxMonths ? ` · تقسيط حتى ${o.maxMonths} شهر` : ""}</div></div>
      <span className={"badge " + (on ? "on" : "off")}>{on ? "ساري الآن" : o.status === "upcoming" ? "قريبا" : "انتهى"}</span>
    </div>
    <div className="tags">
      {o.maxMonths && o.discount == null ? null : null}
      {o.downPayment && <span className="tag">{o.downPayment}</span>}
      {o.adminFees && <span className="tag">{o.adminFees}</span>}
      {o.zeroInterest && <span className="tag">بدون فوائد</span>}
    </div>
    <p className="otitle">{o.title}</p>
    <div className="muted">{show === "both" ? <><Link className="link" href={"/stores/" + store.slug}>{store.name}</Link>{" × "}<Link className="link" href={"/providers/" + provider.slug}>{provider.name}</Link></> : <>{other.label}: <Link className="link" href={other.href}>{other.name}</Link></>}</div>
    <div className="foot"><span className="muted">{o.to && o.to !== o.from ? `${fmtDate(o.from)} → ${fmtDate(o.to)}` : o.endKnown ? fmtDate(o.from) : `نُشر ${fmtDate(o.published)}`}{!o.endKnown && on ? " · الانتهاء غير معلن" : ""}</span>
      <span><a className="link" href={o.source} target="_blank" rel="noreferrer">المصدر ↗</a>{o.maxMonths ? <>{"  ·  "}<Link className="link" href={`/calculator?months=${o.maxMonths}`}>احسب القسط</Link></> : null}</span></div>
  </div>);
}
