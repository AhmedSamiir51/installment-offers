"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
const items = [
  { href: "/", label: "الرئيسية", d: "M3 11l9-8 9 8v9a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z" },
  { href: "/stores", label: "المتاجر", d: "M4 7h16l-1 4a3 3 0 01-6 0 3 3 0 01-6 0zM5 13v7h14v-7" },
  { href: "/providers", label: "التقسيط", d: "M3 6h18v12H3zM3 10h18M7 15h4" },
  { href: "/calculator", label: "الحاسبة", d: "M6 3h12a1 1 0 011 1v16a1 1 0 01-1 1H6a1 1 0 01-1-1V4a1 1 0 011-1zM8 7h8M8 12h2M12 12h2M16 12h0M8 16h2M12 16h2" },
];
const on = (p: string, h: string) => (h === "/" ? p === "/" : p.startsWith("/" + h.split("/")[1]));
export default function Nav() {
  const p = usePathname();
  return (<>
    <header className="top"><div className="wrap">
      <Link href="/" className="logo"><i />عروض التقسيط</Link>
      <nav>{items.map(i => <Link key={i.href} href={i.href} className={on(p, i.href) ? "on" : ""}>{i.label}</Link>)}</nav>
    </div></header>
    <div className="tabs">{items.map(i => (
      <Link key={i.href} href={i.href} className={on(p, i.href) ? "on" : ""}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={i.d} /></svg>{i.label}
      </Link>))}</div>
  </>);
}
