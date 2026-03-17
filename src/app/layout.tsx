import type { Metadata } from "next";
import { IBM_Plex_Mono, Manrope, Playfair_Display } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  weight: ["400", "500"],
  subsets: ["latin"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
  weight: ["700"],
  style: ["italic"],
});

export const metadata: Metadata = {
  title: "mText | Secure, fast text sharing",
  description: "Share notes and snippets instantly with expiry controls and optional live collaboration.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico" },
    ],
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${manrope.variable} ${ibmPlexMono.variable} ${playfairDisplay.variable} min-h-screen antialiased`}
      >
        <div className="page-bg" />
        <header className="sticky top-0 z-30 border-b border-[var(--line)] backdrop-blur-md bg-[color:var(--surface-frost)]">
          <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link href="/" className="group flex items-center gap-3 text-[var(--ink)]">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--ink)] text-[var(--surface)] shadow-sm transition-transform duration-200 group-hover:rotate-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
              </span>
              <span className="leading-tight">
                <span className="block text-base font-extrabold tracking-tight">
                  <span className="brand-mark mr-0.5">m</span>
                  <span>Text</span>
                </span>
                <span className="block text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--muted)]">Private by default</span>
              </span>
            </Link>
            <p className="hidden text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)] sm:block sm:text-sm">
              Ship notes in seconds
            </p>
          </div>
        </header>

        <main className="relative z-10 flex-1">{children}</main>

        <footer className="relative z-10 mt-auto border-t border-[var(--line)] bg-[var(--surface-soft)]/80">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-4 py-7 text-sm text-[var(--muted)] sm:flex-row sm:px-6 lg:px-8">
            <p>© {new Date().getFullYear()} mText</p>
            <p className="font-medium">Secure snippets. Zero setup.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
