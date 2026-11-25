import Link from "next/link";
import { getData, activeCount } from "../lib/data";
import Reveal from "../components/Reveal";
import OfferCard from "../components/OfferCard";
export const revalidate = 1800;
export default async function Home() {
  const d = await getData();
  const active = d.offers.filter(o => o.status === "active");
  const shown = (active.length ? active : d.offers).slice(0, 6);
  const S = (s: string) => d.stores.find(x => x.slug === s)!, P = (s: string) => d.providers.find(x => x.slug === s)!;
  const upd = new Date(d.updatedAt).toLocaleString("ar-EG", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Cairo" });
  return (<>
    <section className="hero">
      <div className="blob b1" /><div className="blob b2" /><div className="blob b3" />
      <span className="pill"><span className="upd"><i />بيتحدث تلقائي · آخر تحديث {upd}</span></span>
      <h1>كل عروض التقسيط.<br /><span className="grad">في مكان واحد.</span></h1>
      <p className="lead">شوف أي شركة تقسيط شغالة مع أي متجر، وإيه العرض، وإنت بتشتري. من غير ما تفتح ألف تطبيق.</p>
      <div className="btns"><Link className="btn p" href="/stores">تصفح المتاجر</Link><Link className="btn s" href="/providers">شركات التقسيط</Link></div>
    </section>
    <Reveal><div className="grid" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
      <div className="card stat"><b>{activeCount(d.offers)}</b><span>عرض ساري</span></div>
      <div className="card stat"><b>{d.stores.length}</b><span>متجر</span></div>
      <div className="card stat"><b>{d.providers.length}</b><span>شركة تقسيط</span></div>
    </div></Reveal>
    <div className="sec">{active.length ? "ساري الآن" : "آخر العروض"}</div>
    <div className="grid two">{shown.map(o => <Reveal key={o.id}><OfferCard o={o} show="both" store={S(o.store)} provider={P(o.provider)} /></Reveal>)}</div>
    <div className="sec">تصفح من ناحيتين</div>
    <div className="grid two">
      <Reveal><Link href="/stores" className="card" style={{ display: "block" }}><div className="avatar">M</div><span className="arrow">←</span><h3>من المتجر</h3><div className="muted">اختار المتجر وشوف كل شركات التقسيط وعروضها عنده.</div></Link></Reveal>
      <Reveal delay={100}><Link href="/providers" className="card" style={{ display: "block" }}><div className="avatar g">F</div><span className="arrow">←</span><h3>من شركة التقسيط</h3><div className="muted">اختار الشركة وشوف كل المتاجر الشريكة وعروضها.</div></Link></Reveal>
    </div>
    <Reveal><Link href="/calculator" className="card" style={{ display: "block", marginTop: 14 }}><span className="arrow">←</span><h3>حاسبة القسط</h3><div className="muted">السعر والمقدم والفايدة والمصاريف والشهور، والقسط يتحسب قدامك.</div></Link></Reveal>
    <p className="note">العروض مجمعة تلقائي من إعلانات منشورة للعامة (بنكي)، مش من حسابك داخل التطبيقات. تأكد من الشروط جوه تطبيق الشركة قبل ما تشتري.</p>
  </>);
}
