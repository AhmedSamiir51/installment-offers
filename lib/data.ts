import bundled from "../data/offers.json";
export type Store = { slug: string; name: string; site: string | null };
export type Provider = { slug: string; name: string; site: string | null };
export type Offer = {
  id: string; store: string; provider: string; title: string;
  discount: number | null; discountUpTo: boolean; maxMonths: number | null;
  downPayment: string | null; adminFees: string | null; zeroInterest: boolean;
  from: string; to: string | null; endKnown: boolean; endEstimated: boolean;
  published: string; source: string; status: "active" | "ended" | "upcoming";
};
export type Data = { updatedAt: string; stores: Store[]; providers: Provider[]; offers: Offer[] };
// Live data is the file the scheduled scraper commits to GitHub. Falls back to the copy bundled at build time.
const RAW = "https://raw.githubusercontent.com/AhmedSamiir51/installment-offers/main/data/offers.json";
export async function getData(): Promise<Data> {
  let d: any = bundled;
  try {
    const r = await fetch(RAW, { next: { revalidate: 1800 } });
    if (r.ok) { const j = await r.json(); if (j?.offers?.length) d = j; }
  } catch {}
  const { seen, ...rest } = d;
  return rest as Data;
}
export const activeCount = (o: Offer[]) => o.filter(x => x.status === "active").length;
export const fmtDate = (s: string) => new Date(s + "T00:00:00Z").toLocaleDateString("ar-EG", { day: "numeric", month: "short", timeZone: "UTC" });
export const initial = (name: string) => (name.match(/[A-Za-z0-9]/)?.[0] || name[0] || "؟").toUpperCase();
export function hue(slug: string) { let h = 0; for (const c of slug) h = (h * 31 + c.charCodeAt(0)) % 360; return h; }
