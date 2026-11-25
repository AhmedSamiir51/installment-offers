import "./globals.css";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import Nav from "../components/Nav";
const font = IBM_Plex_Sans_Arabic({ subsets: ["arabic", "latin"], weight: ["400", "500", "700"], variable: "--font" });
export const metadata = { title: "عروض التقسيط", description: "كل عروض التقسيط في مكان واحد" };
export const viewport = { width: "device-width", initialScale: 1, themeColor: "#f5f5f7" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="ar" dir="rtl"><body className={font.variable}><Nav /><main className="wrap page">{children}</main></body></html>);
}
