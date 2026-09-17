import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LoginIntro from "@/components/LoginIntro";
import PageTransition from "@/components/PageTransition";
import { LOGIN_INTRO_STORAGE_KEY } from "@/lib/login-intro";
import "./globals.css";
import { Oswald, Shippori_Mincho, Silkscreen } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-oswald",
});

const shipporiMincho = Shippori_Mincho({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-shippori-mincho",
});

const silkscreen = Silkscreen({
  subsets: ["latin"],
  weight: "700",
  variable: "--font-pixel",
  display: "swap",
});

export const metadata: Metadata = {
  title: "naganuma web site",
  description: "Welcome to My Site.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${oswald.variable} ${shipporiMincho.variable} ${silkscreen.variable}`} data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        {process.env.NODE_ENV === "production" && (
          <script dangerouslySetInnerHTML={{
            __html: `try { if (localStorage.getItem(${JSON.stringify(LOGIN_INTRO_STORAGE_KEY)}) === "1") document.documentElement.dataset.loginIntroSeen = "true"; } catch {}`,
          }} />
        )}
      </head>
      <body>
        <LoginIntro />
        <noscript><style>{"[data-login-intro] { display: none !important; }"}</style></noscript>
        <a className="skip-link" href="#main-content">本文へスキップ</a>
        <Header />
        <PageTransition>{children}</PageTransition>
        <Footer />
        {process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID} />
        )}
      </body>
    </html>
  );
}
