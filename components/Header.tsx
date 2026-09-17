"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import HamburgerMenu from "./HamburgerMenu";

import { links } from "../app/data/links";

function HeaderClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    let timer: number;
    const update = () => {
      setNow(new Date());
      timer = window.setTimeout(update, 60_000 - (Date.now() % 60_000) + 50);
    };
    const updateWhenVisible = () => {
      if (document.visibilityState === "visible") {
        window.clearTimeout(timer);
        update();
      }
    };

    update();
    document.addEventListener("visibilitychange", updateWhenVisible);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", updateWhenVisible);
    };
  }, []);

  const twoDigits = (value: number) => String(value).padStart(2, "0");
  const time = now ? `${twoDigits(now.getHours())}:${twoDigits(now.getMinutes())}` : "--:--";
  const date = now ? `${now.getFullYear()}/${twoDigits(now.getMonth() + 1)}/${twoDigits(now.getDate())}` : "----/--/--";

  return (
    <time className="header-clock" dateTime={now?.toISOString()} aria-label={now ? `現在の日時 ${date} ${time}` : "現在の日時を読み込み中"}>
      <span className="header-clock-time">{time}</span>
      <span className="header-clock-date">{date}</span>
    </time>
  );
}

const Header = () => {
  const pathname = usePathname();
  const [hash, setHash] = useState("");

  useEffect(() => {
    const updateHash = () => setHash(window.location.hash);
    updateHash();
    window.addEventListener("hashchange", updateHash);
    return () => window.removeEventListener("hashchange", updateHash);
  }, [pathname]);

  const notesSelected = pathname === "/" && hash === "#notes";
  const currentPage = (href: string): "page" | "location" | undefined => {
    if (href === "/#notes") return notesSelected ? "location" : undefined;
    if (href === "/#home") return pathname === "/" && !notesSelected ? "page" : undefined;
    if (pathname === href) return "page";
    if (href === "/projects" && pathname.startsWith("/projects/")) return "location";
    return undefined;
  };

  return (
    <header className="site-header">
      <div className="site-shell header-inner">
        <Link href="/#home" className="site-wordmark" aria-label="NAGANUMA ホーム">
          <span className="site-launcher-icon" aria-hidden="true"><i /><i /><i /><i /></span>
          <span>NAGANUMA</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="desktop-nav" aria-label="メインナビゲーション">
          {links.map((link, index) => (
            <Link key={link.name} href={link.href} aria-current={currentPage(link.href)}>
              <span className="taskbar-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              <span>{link.name}</span>
            </Link>
          ))}
        </nav>

        <div className="header-system">
          <HeaderClock />
          <p className="header-caption">PERSONAL WORKSPACE<br />WEB / SERVER / HOMELAB</p>
        </div>
        <HamburgerMenu />
      </div>
    </header>
  );
};

export default Header;
