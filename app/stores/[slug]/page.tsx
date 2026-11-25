import Logo from "../../../components/Logo";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getData, hue, initial } from "../../../lib/data";
import OfferList from "../../../components/OfferList";
export const revalidate = 1800;
export default async function StorePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const d = await getData();
  const s = d.stores.find(x => x.slug === slug); if (!s) notFound();
  const offers = d.offers.filter(o => o.store === slug);
  const provs = d.providers.filter(p => offers.some(o => o.provider === p.slug));
  return (<>
    <div className="head"><Logo slug={slug} ini={initial(s.name)} hue={hue(slug)} big /><div><h1>{s.name}</h1>{s.site && <a className="link" href={s.site} target="_blank" rel="noreferrer">{s.site.replace(/^https?:\/\//, "")} ↗</a>}</div></div>
    <div className="sec">شركات التقسيط المتعاملة معاه</div>
    <div className="chips">{provs.map(p => <Link key={p.slug} className="chip" href={"/providers/" + p.slug}>{p.name}</Link>)}</div>
    <div className="sec">العروض</div>
    <OfferList offers={offers} show="store" stores={d.stores} providers={d.providers} />
  </>);
}
