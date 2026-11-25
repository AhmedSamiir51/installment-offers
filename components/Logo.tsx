import logos from "../data/logos.json";
const L = logos as Record<string, string>;
export default function Logo({ slug, ini, hue, big }: { slug: string; ini: string; hue: number; big?: boolean }) {
  const src = L[slug];
  if (src) return <div className={"avatar logo" + (big ? " big" : "")} style={{ margin: 0 }}><img src={src} alt="" loading="lazy" /></div>;
  return <div className="avatar" style={{ margin: 0, background: `linear-gradient(135deg,hsl(${hue} 80% 55%),hsl(${(hue + 50) % 360} 85% 60%))` }}>{ini}</div>;
}
