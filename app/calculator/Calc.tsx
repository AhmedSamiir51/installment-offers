"use client";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
const fmt = (n: number) => Math.round(n).toLocaleString("en-US");
function useCount(target: number) {
  const [v, setV] = useState(target), from = useRef(target);
  useEffect(() => {
    const a = from.current, t0 = performance.now(); let raf = 0;
    const step = (t: number) => { const k = Math.min((t - t0) / 450, 1), e = 1 - Math.pow(1 - k, 3); setV(a + (target - a) * e); if (k < 1) raf = requestAnimationFrame(step); else from.current = target; };
    raf = requestAnimationFrame(step); return () => cancelAnimationFrame(raf);
  }, [target]);
  return v;
}
function Field({ label, value, set, min, max, step, unit }: { label: string; value: number; set: (n: number) => void; min: number; max: number; step: number; unit: string }) {
  return (<div className="field"><div className="lab"><span>{label}</span>
    <span><input inputMode="decimal" value={value} onChange={e => set(Number(e.target.value.replace(/[^\d.]/g, "")) || 0)} /> {unit}</span></div>
    <input type="range" min={min} max={max} step={step} value={Math.min(value, max)} style={{ ["--p" as string]: ((Math.min(value, max) - min) / (max - min)) * 100 + "%" }} onChange={e => set(Number(e.target.value))} /></div>);
}
export default function Calc() {
  const q = useSearchParams();
  const [price, setPrice] = useState(Number(q.get("price")) || 30000);
  const [down, setDown] = useState(Number(q.get("down")) || 0);
  const [rate, setRate] = useState(Number(q.get("rate")) || 0);
  const [fees, setFees] = useState(Number(q.get("fees")) || 0);
  const [months, setMonths] = useState(Number(q.get("months")) || 36);
  const principal = Math.max(price - down, 0);
  const admin = principal * fees / 100, interest = principal * rate / 100 / 12 * months;
  const financed = principal + admin + interest, monthly = months ? financed / months : 0, total = down + financed, extra = total - price;
  const m = useCount(monthly), t = useCount(total), x = useCount(extra);
  const pct = total ? Math.min((price / total) * 100, 100) : 100;
  return (<>
    <div className="head"><div><h1>حاسبة القسط</h1><div className="muted">حرّك الأرقام وشوف القسط بيتغير لحظيا.</div></div></div>
    <div className="res" style={{ marginTop: 14 }}>
      <small>القسط الشهري</small>
      <div className="num">{fmt(m)} <span style={{ fontSize: 20, fontWeight: 600 }}>جنيه</span></div>
      <div className="sub"><div><small>إجمالي ما هتدفعه</small><b>{fmt(t)}</b></div><div><small>الزيادة عن السعر</small><b>{fmt(x)}</b></div></div>
      <div className="bar"><i style={{ width: pct + "%" }} /><i style={{ width: 100 - pct + "%" }} /></div>
      <div className="legend"><span>⚪ سعر الجهاز</span><span>🟡 فايدة ومصاريف</span></div>
      {extra < 1 && <div className="zero">✨ من غير أي زيادة عن السعر (تريبل زيرو)</div>}
    </div>
    <div className="card" style={{ marginTop: 14 }}>
      <Field label="سعر الجهاز" value={price} set={setPrice} min={1000} max={150000} step={500} unit="جنيه" />
      <Field label="المقدم" value={down} set={setDown} min={0} max={Math.max(price, 1)} step={500} unit="جنيه" />
      <Field label="الفايدة السنوية" value={rate} set={setRate} min={0} max={60} step={0.5} unit="%" />
      <Field label="المصاريف الإدارية" value={fees} set={setFees} min={0} max={10} step={0.25} unit="%" />
      <div className="field"><div className="lab"><span>عدد الشهور</span></div>
        <div className="seg">{[6, 12, 18, 24, 36, 48, 60].map(n => <button key={n} className={months === n ? "on" : ""} onClick={() => setMonths(n)}>{n}</button>)}</div></div>
    </div>
    <p className="note">فايدة بسيطة على المبلغ الممول، والمصاريف نسبة منه. الحساب الفعلي عند الشركة ممكن يختلف.</p>
  </>);
}
