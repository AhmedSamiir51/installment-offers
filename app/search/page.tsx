import { getData } from "../../lib/data";
import Search from "../../components/Search";
export const revalidate = 1800;
export default async function Page({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams; const d = await getData();
  return (<><div className="head"><div><h1 style={{ fontSize: 32 }}>بحث</h1></div></div><Search d={d} initialQ={q || ""} /></>);
}
