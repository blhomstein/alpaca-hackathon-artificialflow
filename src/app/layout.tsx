import type { Metadata } from "next";
import { Geist, Geist_Mono, Newsreader } from "next/font/google";
import "./globals.css";
import { Brand } from "@/components/shell/brand";
import { MobileNav, Sidebar } from "@/components/shell/sidebar";
import { Topbar } from "@/components/shell/topbar";
import { themeScript } from "@/components/shell/theme-toggle";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: "FlowGraph AI",
    template: "%s · FlowGraph AI",
  },
  description:
    "Autonomous AI-capital-flow options agent: evidence-grounded events, a verified supplier graph, and defined-risk debit spreads on Alpaca paper.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${newsreader.variable} h-full`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full">
        <div className="flex min-h-screen">
          <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-line bg-surface-2/60 lg:flex">
            <div className="flex h-14 items-center border-b border-line">
              <Brand />
            </div>
            <Sidebar />
          </aside>

          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex h-14 items-center border-b border-line bg-surface-2/60 px-2 lg:hidden">
              <Brand />
            </div>
            <MobileNav />
            <Topbar />
            <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-7 sm:px-6 lg:px-8">
              {children}
            </main>
            <footer className="border-t border-line px-4 py-4 text-[0.6875rem] text-ink-3 sm:px-6 lg:px-8">
              FlowGraph AI · Alpaca AI Trading Agents Hackathon · paper account, simulated
              fills. Four trading sessions cannot establish durable alpha.
            </footer>
          </div>
        </div>
      </body>
    </html>
  );
}
