// Offers scraper. No AI: plain fetch + regex over public press pages (bankygate.com).
// Output: data/offers.json
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const OUT = path.join(process.cwd(), "data", "offers.json");
const UA = "Mozilla/5.0 (compatible; OffersBot/1.0; +https://github.com)";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------- dictionaries ----------
const PROVIDERS = [
  { slug: "forsa", name: "فرصة (Forsa)", site: "https://www.forsaegypt.com/ar", keys: ["فرصة", "forsa"], q: "فرصة" },
  { slug: "souhoola", name: "سهولة (Souhoola)", site: "https://souhoola.com", keys: ["سهولة", "souhoola", "sohoola"], q: "سهولة" },
  { slug: "halan", name: "حالا (Halan)", site: "https://halan.com", keys: ["حالا", "halan"], q: "حالا تقسيط" },
  { slug: "valu", name: "valU", site: "https://valu.com.eg", keys: ["valu", "فاليو"], q: "valU" },
  { slug: "contact", name: "كونتاكت (Contact)", site: "https://contact.eg", keys: ["كونتاكت", "contact"], q: "كونتاكت تقسيط" },
  { slug: "aman", name: "أمان (Aman)", site: "https://www.amanholding.com", keys: ["أمان", "aman"], q: "أمان تقسيط" },
  { slug: "sympl", name: "سيمبل (Sympl)", site: "https://sympl.ai", keys: ["سيمبل", "sympl"], q: "سيمبل تقسيط" },
  { slug: "mogo", name: "موجو (Mogo)", site: "https://mogo.com.eg", keys: ["موجو", "mogo"], q: "موجو تقسيط" },
];
const STORE_ALIASES = [
  { slug: "miami-center", name: "Miami Center (ميامي سنتر)", site: "https://miamicenters.com", keys: ["miami center", "ميامي سنتر", "miamicenter"] },
  { slug: "2b", name: "2B (تو بي)", site: "https://2b.com.eg", keys: ["2b", "تو بي"] },
  { slug: "btech", name: "B.TECH (بي تك)", site: "https://btech.com", keys: ["b.tech", "b-tech", "btech", "بي تك"] },
  { slug: "dubai-phone", name: "Dubai Phone (دبي فون)", site: "https://www.dubaiphone.net", keys: ["dubai phone", "دبي فون"] },
  { slug: "raya", name: "Raya Shop (راية)", site: "https://rayashop.com", keys: ["raya", "راية"] },
  { slug: "amazon", name: "Amazon (أمازون)", site: "https://www.amazon.eg", keys: ["amazon", "أمازون"] },
  { slug: "noon", name: "Noon (نون)", site: "https://www.noon.com/egypt-ar", keys: ["noon", "نون"] },
  { slug: "carrefour", name: "Carrefour (كارفور)", site: "https://www.carrefouregypt.com", keys: ["carrefour", "كارفور"] },
  { slug: "dream2000", name: "Dream 2000 (دريم 2000)", site: "https://dream2000.com", keys: ["dream 2000", "دريم 2000", "dream2000"] },
  { slug: "jumia", name: "Jumia (جوميا)", site: "https://www.jumia.com.eg", keys: ["jumia", "جوميا"] },
  { slug: "vodafone", name: "Vodafone (فودافون)", site: "https://web.vodafone.com.eg", keys: ["vodafone", "فودافون"] },
  { slug: "orange", name: "Orange (أورنج)", site: "https://www.orange.eg", keys: ["orange", "أورنج", "اورنج"] },
  { slug: "tradeline", name: "Tradeline (تريد لاين)", site: "https://tradelinestores.com", keys: ["tradeline", "تريد لاين"] },
  { slug: "sharaf-dg", name: "Sharaf DG (شرف دي جي)", site: "https://egypt.sharafdg.com", keys: ["sharaf", "شرف"] },
  { slug: "oscar", name: "Oscar (أوسكار)", site: "https://oscarstores.com", keys: ["oscar", "أوسكار", "اوسكار"] },
  { slug: "elaraby", name: "العربي جروب (El Araby)", site: "https://www.elarabygroup.com", keys: ["العربي", "el araby", "elaraby"] },
];
const MONTHS = { يناير: 1, فبراير: 2, مارس: 3, أبريل: 4, ابريل: 4, مايو: 5, يونيو: 6, يوليو: 7, أغسطس: 8, اغسطس: 8, سبتمبر: 9, أكتوبر: 10, اكتوبر: 10, نوفمبر: 11, ديسمبر: 12 };
const MRE = Object.keys(MONTHS).join("|");

// ---------- helpers ----------
const arDigits = (s) => s.replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d));
const decode = (s) => s.replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&#39;|&#x27;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ");
const strip = (h) => decode(h.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, " ").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
const norm = (s) => arDigits(s).toLowerCase();
const pad = (n) => String(n).padStart(2, "0");
const iso = (y, m, d) => `${y}-${pad(m)}-${pad(d)}`;
async function get(url, tries = 3) {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url, { headers: { "user-agent": UA, "accept-language": "ar,en;q=0.8" } });
      if (r.ok) return await r.text();
      if (r.status === 429) await sleep(4000 * (i + 1));
    } catch {}
    await sleep(1000 * (i + 1));
  }
  return null;
}
function findProvider(text) {
  const t = norm(text);
  let best = null, pos = 1e9;
  for (const p of PROVIDERS) for (const k of p.keys) { const i = t.indexOf(k.toLowerCase()); if (i >= 0 && i < pos) { pos = i; best = p; } }
  return best;
}
function findStoreAlias(text) {
  const t = norm(text);
  let best = null, pos = 1e9;
  for (const s of STORE_ALIASES) for (const k of s.keys) {
    const re = new RegExp("(^|[^a-z0-9\\u0600-\\u06FF])" + k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "($|[^a-z0-9\\u0600-\\u06FF])");
    const m = re.exec(t); if (m && m.index < pos) { pos = m.index; best = s; }
  }
  return best;
}
const slugify = (name) => {
  const lat = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return lat.length >= 3 ? lat : "s-" + crypto.createHash("md5").update(name).digest("hex").slice(0, 8);
};
function field(text, label) {
  const m = new RegExp(label + "\\s*[:：]\\s*([^.؛]{1,160})").exec(text);
  return m ? m[1].trim() : null;
}
function parsePeriod(s, pubYear) {
  if (!s) return {};
  const t = arDigits(s);
  let m;
  // "من 7 إلى 10 نوفمبر 2026" / "من 7 وحتى 10 نوفمبر"
  if ((m = new RegExp(`(\\d{1,2})\\s*(?:(${MRE}))?\\s*(?:إلى|الى|وحتى|حتى|-|–)\\s*(\\d{1,2})\\s*(${MRE})\\s*(\\d{4})?`).exec(t))) {
    const y = +(m[5] || pubYear), m2 = MONTHS[m[4]], m1 = m[2] ? MONTHS[m[2]] : m2;
    return { from: iso(y, m1, +m[1]), to: iso(y, m2, +m[3]) };
  }
  if ((m = new RegExp(`حتى\\s*(?:يوم\\s*)?(\\d{1,2})\\s*(${MRE})\\s*(\\d{4})?`).exec(t))) return { to: iso(+(m[3] || pubYear), MONTHS[m[2]], +m[1]) };
  if ((m = new RegExp(`(\\d{1,2})\\s*(${MRE})\\s*(\\d{4})?`).exec(t))) { const d = iso(+(m[3] || pubYear), MONTHS[m[2]], +m[1]); return { from: d, to: d }; }
  return {};
}
const maxMonths = (t) => { const nums = [...arDigits(t).matchAll(/(\d{1,2})\s*(?:و\s*(\d{1,2})\s*)?(?:شهر|شهراً|شهرا|شهرًا|أشهر|اشهر)/g)].flatMap((m) => [+m[1], m[2] ? +m[2] : 0]); return nums.length ? Math.max(...nums) : null; };

// ---------- discovery ----------
async function search(q, pages) {
  const found = new Map();
  for (let p = 1; p <= pages; p++) {
    const h = await get(`https://www.bankygate.com/search?q=${encodeURIComponent(q)}${p > 1 ? "&page=" + p : ""}`);
    if (!h) break;
    let n = 0;
    for (const m of h.matchAll(/<a href="\/(\d{4,7})">[\s\S]*?alt="([^"]*)"/g)) { n++; found.set(m[1], decode(m[2])); }
    if (!n) break;
    await sleep(400);
  }
  return found;
}

// ---------- article parsing ----------
function parseArticle(id, html) {
  const og = (p) => { const m = new RegExp(`<meta property="${p}" content="([^"]*)"`).exec(html); return m ? decode(m[1]) : ""; };
  const title = og("og:title"), desc = og("og:description"), pub = og("article:published_time").slice(0, 10);
  if (!pub) return null;
  let body = strip(html);
  const a = body.indexOf(desc.slice(0, 40)); if (a >= 0) body = body.slice(a);
  const z = body.indexOf("هل أفادك"); if (z > 0) body = body.slice(0, z);
  const text = title + ". " + body.slice(0, 3500);
  if (!/تقسيط|خصم|عرض/.test(title)) return null;
  if (/^\s*(بنك|البنك|بنوك)/.test(title)) return null; // bank announcements, not provider offers
  const provTxt = field(body, "الشركة المقدمة للعرض") || title;
  const provider = findProvider(provTxt) || findProvider(title) || findProvider(desc);
  if (!provider) return null;
  const storeTxt = field(body, "المتجر المشارك") || field(body, "المتجر") || field(body, "الجهة المشاركة");
  let store = findStoreAlias(storeTxt || "") || findStoreAlias(title) || findStoreAlias(desc);
  if (!store) {
    let nm = storeTxt;
    if (!nm) { const m = /(?:على منتجات|من متجر|من|مع|في)\s+([A-Za-z0-9][A-Za-z0-9 .&'-]{1,30}?)(?=\s+(?:حتى|بدون|دون|وتقسيط|بخصم|خلال|عبر|و)|،|$)/.exec(title); nm = m ? m[1] : null; }
    if (!nm || findProvider(nm)) return null;
    nm = nm.replace(/^(متجر|شركة)\s+/, "").trim();
    store = { slug: slugify(nm), name: nm, site: null };
  }
  const discTxt = field(body, "نسبة الخصم") || "";
  const dm = /(\d{1,2}(?:\.\d+)?)\s*%/.exec(arDigits(discTxt)) || /خصم(?:\s*(?:يصل إلى|حتى|يصل الى))?\s*(\d{1,2})\s*%/.exec(arDigits(title + " " + desc));
  const discount = dm ? +dm[1] : null;
  const upTo = /حتى|يصل/.test(discTxt + title) && discount != null;
  const months = maxMonths(field(body, "مدة التقسيط") || "") || maxMonths(title + " " + desc);
  const dpT = field(body, "المقدم") || "";
  const down = /بدون|دون|0|صفر/.test(dpT) || /(بدون|دون) مقدم/.test(title + desc) ? "بدون مقدم" : dpT || null;
  const feeT = field(body, "المصاريف الإدارية") || "";
  const fees = /بدون|دون|^0|صفر/.test(feeT) || /(بدون|دون)\s+(?:أي\s+)?مصاريف/.test(title + desc) ? "بدون مصاريف إدارية" : feeT || null;
  const zeroInterest = /(بدون|دون|صفر)\s*(?:أي\s*)?(فوائد|فايدة|فائدة)/.test(title + desc + body.slice(0, 800));
  const pubYear = +pub.slice(0, 4);
  let per = parsePeriod(field(body, "فترة العرض"), pubYear);
  if (!per.to) per = parsePeriod(/(?:خلال الفترة|في الفترة|خلال|يستمر[^.]{0,30}?|ساري[^.]{0,30}?)\s*(?:من\s*)?([^.،]{3,60}?\d{4})/.exec(arDigits(body)) ?.[1] || "", pubYear);
  if (!per.to) per = parsePeriod(arDigits(title + " " + desc), pubYear);
  if (months == null && discount == null) return null;
  return {
    id, store: store.slug, storeName: store.name, storeSite: store.site, provider: provider.slug,
    title: title.replace(/\s*\|.*$/, ""), discount, discountUpTo: upTo, maxMonths: months, downPayment: down, adminFees: fees, zeroInterest,
    from: per.from || pub, to: per.to || null, endKnown: !!per.to, published: pub, source: `https://www.bankygate.com/${id}`,
  };
}

// ---------- main ----------
const prev = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, "utf8")) : { offers: [], seen: {} };
const seen = prev.seen || {};
const offers = new Map((prev.offers || []).map((o) => [o.id, o]));
const queries = [...PROVIDERS.map((p) => p.q), "فاليو عروض تقسيط", "valU عرض", "هالان تقسيط", "عروض حالا", "كونتاكت عروض", "كونتاكت للتقسيط", "أمان للتقسيط", "سهولة عرض", "فرصة عرض", "عروض تقسيط بدون مقدم ومصاريف", "تقسيط بدون فوائد عرض"];
const pages = +(process.env.PAGES || (prev.offers?.length ? 2 : 3));
const cands = new Map();
for (const q of queries) { for (const [id, t] of await search(q, pages)) if (!seen[id] && /تقسيط|خصم|عرض/.test(t)) cands.set(id, t); }
console.log("new candidates:", cands.size);
let ok = 0;
const MAXF = +(process.env.MAXFETCH || 1e9);
let fetched = 0;
for (const id of cands.keys()) {
  if (fetched++ >= MAXF) break;
  const html = await get(`https://www.bankygate.com/${id}`);
  seen[id] = 1;
  if (html) { const o = parseArticle(id, html); if (o) { offers.set(id, o); ok++; } }
  await sleep(350);
}
console.log("parsed offers:", ok, "total:", offers.size);

const today = new Date(Date.now() + 2 * 3600e3).toISOString().slice(0, 10);
const addDays = (d, n) => new Date(new Date(d).getTime() + n * 864e5).toISOString().slice(0, 10);
const list = [...offers.values()].map((o) => {
  const end = o.to || addDays(o.published, 3); // no end date announced: assume 3 days, flagged
  return { ...o, status: end >= today && o.from <= today ? "active" : end < today ? "ended" : "upcoming", endEstimated: !o.endKnown };
}).sort((a, b) => b.published.localeCompare(a.published) || b.id - a.id);

const storeMap = new Map();
for (const o of list) if (!storeMap.has(o.store)) storeMap.set(o.store, { slug: o.store, name: o.storeName, site: o.storeSite });
const stores = [...storeMap.values()].map((s) => ({ ...s, site: s.site || STORE_ALIASES.find((a) => a.slug === s.slug)?.site || null }));
const usedProv = new Set(list.map((o) => o.provider));
const providers = PROVIDERS.filter((p) => usedProv.has(p.slug)).map(({ slug, name, site }) => ({ slug, name, site }));
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify({ updatedAt: new Date().toISOString(), sources: ["https://www.bankygate.com"], stores, providers, offers: list, seen }, null, 1));
console.log("stores", stores.length, "providers", providers.length, "active", list.filter((o) => o.status === "active").length);
