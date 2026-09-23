import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site-metadata";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LoginIntro from "@/components/LoginIntro";
import PageTransition from "@/components/PageTransition";
import { LOGIN_INTRO_STORAGE_KEY } from "@/lib/login-intro";
import { PROJECT_PREVIEW_COOKIE } from "@/lib/project-preview";
import "./globals.css";
import { Oswald, Shippori_Mincho, Silkscreen } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-oswald",
});

const shipporiMincho = Shippori_Mincho({
  weight: ["400"],
  variable: "--font-shippori-mincho",
  preload: false,
  display: "swap",
});

const silkscreen = Silkscreen({
  subsets: ["latin"],
  weight: "700",
  variable: "--font-pixel",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  robots: { index: false, follow: false },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  const isProjectPreview = Boolean((await cookies()).get(PROJECT_PREVIEW_COOKIE));

  return (
    <html lang="ja" className={`${oswald.variable} ${shipporiMincho.variable} ${silkscreen.variable} scroll-smooth scroll-pt-28 [scrollbar-gutter:stable] max-[768px]:scroll-pt-[88px] motion-reduce:scroll-auto`} data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        {process.env.NODE_ENV === "production" && (
          <script nonce={nonce} dangerouslySetInnerHTML={{
            __html: `try { if (localStorage.getItem(${JSON.stringify(LOGIN_INTRO_STORAGE_KEY)}) === "1") document.documentElement.dataset.loginIntroSeen = "true"; } catch {}`,
          }} />
        )}
      </head>
      <body className="m-0 flex min-h-screen flex-col bg-[var(--paper)] font-[Arial,'Helvetica_Neue',var(--font-shippori-mincho),serif] text-[var(--ink)]">
        <LoginIntro />
        <noscript><style>{"[data-login-intro] { display: none !important; }"}</style></noscript>
        <a className="skip-link fixed -top-[100px] left-4 z-[100] bg-[var(--ink)] px-5 py-3 text-white focus:top-3" href="#main-content">本文へスキップ</a>
        <Header />
        <PageTransition>{children}</PageTransition>
        <Footer />
        {process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID && !isProjectPreview && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID} nonce={nonce} />
        )}
      </body>
    </html>
  );
}
