import Logo from "../../../components/Logo";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getData, hue, initial } from "../../../lib/data";
import OfferList from "../../../components/OfferList";
export const revalidate = 1800;
export default async function ProviderPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const d = await getData();
  const p = d.providers.find(x => x.slug === slug); if (!p) notFound();
  const offers = d.offers.filter(o => o.provider === slug);
  const stores = d.stores.filter(s => offers.some(o => o.store === s.slug));
  return (<>
    <div className="head"><Logo slug={slug} ini={initial(p.name)} hue={hue(slug)} big /><div><h1>{p.name}</h1>{p.site && <a className="link" href={p.site} target="_blank" rel="noreferrer">{p.site.replace(/^https?:\/\//, "")} ↗</a>}</div></div>
    <div className="sec">المتاجر الشريكة ({stores.length})</div>
    <div className="chips">{stores.map(s => <Link key={s.slug} className="chip" href={"/stores/" + s.slug}>{s.name}</Link>)}</div>
    <div className="sec">العروض</div>
    {offers.length === 0 && <div className="card muted">{p.name} بتنشر عروضها جوه تطبيقها بس، والموقع الرسمي مفيهوش عروض معلنة نقدر نسحبها. أول ما تظهر في أي مصدر عام هتظهر هنا تلقائي.{p.offersPage && <> <a className="link" href={p.offersPage} target="_blank" rel="noreferrer">الصفحة الرسمية ↗</a></>}</div>}
    <OfferList offers={offers} show="provider" stores={d.stores} providers={d.providers} />
  </>);
}
