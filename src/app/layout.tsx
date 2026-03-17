import type { Metadata } from "next";
import { IBM_Plex_Mono, Manrope, Playfair_Display } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import InstallButton from "@/components/install-button";
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
    icon: [{ url: "/favicon-mText.png", type: "image/png" }],
    shortcut: "/favicon-mText.png",
    apple: "/favicon-mText.png",
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
              <Image
                src="/mText-logo.png"
                alt="mText logo"
                width={36}
                height={36}
                className="h-9 w-9 rounded-xl object-cover shadow-sm transition-transform duration-200 group-hover:rotate-3"
                priority
              />
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
          <InstallButton />

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
