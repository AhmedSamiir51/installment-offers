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
    <div className="head"><div className="avatar" style={{ margin: 0, background: `linear-gradient(135deg,hsl(${hue(slug)} 80% 55%),hsl(${(hue(slug) + 50) % 360} 85% 60%))` }}>{initial(p.name)}</div><div><h1>{p.name}</h1>{p.site && <a className="link" href={p.site} target="_blank" rel="noreferrer">{p.site.replace(/^https?:\/\//, "")} ↗</a>}</div></div>
    <div className="sec">المتاجر الشريكة ({stores.length})</div>
    <div className="chips">{stores.map(s => <Link key={s.slug} className="chip" href={"/stores/" + s.slug}>{s.name}</Link>)}</div>
    <div className="sec">العروض</div>
    <OfferList offers={offers} show="provider" stores={d.stores} providers={d.providers} />
  </>);
}
