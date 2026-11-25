import { getData, activeCount, hue, initial } from "../../lib/data";
import Directory from "../../components/Directory";
export const revalidate = 1800;
export default async function Page() {
  const d = await getData();
  const entries = d.providers.map(e => { const os = d.offers.filter(o => o.provider === e.slug); return { slug: e.slug, name: e.name, active: activeCount(os), total: os.length, hue: hue(e.slug), ini: initial(e.name) }; }).sort((a, b) => b.active - a.active || b.total - a.total);
  return (<><div className="head"><div><h1>شركات التقسيط</h1><div className="muted">{entries.length} · اختار واحدة وشوف عروضها</div></div></div><Directory entries={entries} base="/providers" ph="دور على شركة" /></>);
}
