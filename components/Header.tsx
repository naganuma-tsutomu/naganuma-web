"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import HamburgerMenu from "./HamburgerMenu";
import { launcherIconClass, wordmarkClass } from "./wordmarkStyles";

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
  const hours = now ? twoDigits(now.getHours()) : "--";
  const minutes = now ? twoDigits(now.getMinutes()) : "--";
  const time = `${hours}:${minutes}`;
  const date = now ? `${now.getFullYear()}/${twoDigits(now.getMonth() + 1)}/${twoDigits(now.getDate())}` : "----/--/--";

  return (
    <time className="flex min-h-[45px] min-w-[106px] flex-col items-center justify-center font-[family-name:var(--mono)] whitespace-nowrap tabular-nums" dateTime={now?.toISOString()} aria-label={now ? `現在の日時 ${date} ${time}` : "現在の日時を読み込み中"}>
      <span className="text-base leading-[1.2] font-bold" aria-hidden="true">{hours}<span className="header-clock-colon">:</span>{minutes}</span>
      <span className="text-[11px] leading-normal text-[#426b65]">{date}</span>
    </time>
  );
}

const Header = () => {
  const pathname = usePathname();

  const currentPage = (href: string): "page" | "location" | undefined => {
    if (pathname === href) return "page";
    if (href === "/projects" && pathname.startsWith("/projects/")) return "location";
    if (href === "/notes" && pathname.startsWith("/notes/")) return "location";
    return undefined;
  };

  return (
    <header className="site-header sticky top-0 z-50 border-b-2 border-[var(--ink)] bg-[#e8e9df] text-[var(--ink)] [&_a:focus-visible]:outline-[var(--red)] [&_button:focus-visible]:outline-[var(--red)]">
      <div className="site-shell flex min-h-20 items-center gap-[18px] max-[768px]:min-h-[78px] max-[768px]:gap-3">
        <Link href="/" className={wordmarkClass} aria-label="NAGANUMA ホーム">
          <span className={launcherIconClass} aria-hidden="true"><i /><i /><i /><i /></span>
          <span>NAGANUMA</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="flex items-center gap-2 border-l border-[#a3afa5] pl-[18px] font-[family-name:var(--mono)] text-[13px] uppercase max-[900px]:hidden" aria-label="メインナビゲーション">
          {links.map((link, index) => (
            <Link key={link.name} href={link.href} aria-current={currentPage(link.href)} className="group relative inline-flex min-h-[42px] min-w-[84px] items-center justify-start gap-2 border border-[#a9b5a9] bg-[#f7f5ea] px-[11px] text-[var(--ink)] whitespace-nowrap transition-colors duration-200 hover:border-[var(--ink)] hover:bg-[#fffaf0] aria-[current]:border-[var(--ink)] aria-[current]:bg-[#ffdfb8] aria-[current]:hover:bg-[#ffdfb8] aria-[current]:after:absolute aria-[current]:after:inset-x-0 aria-[current]:after:bottom-0 aria-[current]:after:h-[3px] aria-[current]:after:bg-[var(--red)] aria-[current]:after:content-['']">
              <span className="shrink-0 border-r border-[#b0bdb1] pr-2 font-[family-name:var(--mono)] text-[11px] leading-none text-[#426b65] group-aria-[current]:border-[#d5aa86] group-aria-[current]:text-[var(--red)]" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              <span>{link.name}</span>
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-5 max-[1024px]:hidden">
          <HeaderClock />
          <p className="m-0 border-l border-[#a3afa5] py-1 pl-4 font-[family-name:var(--mono)] text-xs leading-[1.55] whitespace-nowrap text-[#354641] max-[1200px]:hidden">PERSONAL WORKSPACE<br />WEB / SERVER / HOMELAB</p>
        </div>
        <HamburgerMenu />
      </div>
    </header>
  );
};

export default Header;
