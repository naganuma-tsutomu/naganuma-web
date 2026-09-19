"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { githubProfileUrl, xProfileUrl } from "@/app/data/links";
import styles from "./HamburgerMenu.module.css";

const menuLinks = [
  { name: "HOME", href: "/", tag: "SYS_ROOT" },
  { name: "PROJECTS", href: "/projects", tag: "WORK / 02" },
  { name: "NOTES", href: "/notes", tag: "ARTICLES / 03" },
  { name: "ABOUT", href: "/about", tag: "PROFILE / 04" },
  { name: "CONTACT", href: "/contact", tag: "LINKS / 05" },
];
const externalLinkClass = "border-b border-current pb-px text-[var(--ink)] no-underline transition-colors duration-150 hover:text-[var(--red)]";

function MenuClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const update = () => setNow(new Date());
    update();
    const interval = window.setInterval(update, 1000);
    return () => window.clearInterval(interval);
  }, []);

  const twoDigits = (value: number) => String(value).padStart(2, "0");
  const hours = now ? twoDigits(now.getHours()) : "--";
  const minutes = now ? twoDigits(now.getMinutes()) : "--";
  const time = `${hours}:${minutes}`;
  const date = now ? `${now.getFullYear()}/${twoDigits(now.getMonth() + 1)}/${twoDigits(now.getDate())}` : "----/--/--";

  return (
    <time dateTime={now?.toISOString()} aria-label={now ? `現在の日時 ${date} ${time}` : "現在の日時を読み込み中"}>
      <span aria-hidden="true">
        {hours}<span className={styles.footerClockColon}>:</span>{minutes}
      </span>
      {" "}<span className="text-[10px] text-[#788e89]">({date})</span>
    </time>
  );
}

export default function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  const isCurrent = (href: string): boolean => {
    if (pathname === href) return true;
    if (href === "/projects" && pathname.startsWith("/projects/")) return true;
    if (href === "/notes" && pathname.startsWith("/notes/")) return true;
    return false;
  };

  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusFrame = requestAnimationFrame(() => {
      menuRef.current?.querySelector<HTMLButtonElement>("button")?.focus({ preventScroll: true });
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
      if (event.key === "Tab") {
        const items = menuRef.current?.querySelectorAll<HTMLElement>("a[href], button");
        if (!items?.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (!menuRef.current?.contains(document.activeElement)) {
          event.preventDefault();
          first.focus();
        } else if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    const triggerElement = triggerRef.current;
    const desktop = window.matchMedia("(min-width: 900px)");
    const closeOnDesktop = () => { if (desktop.matches) setIsOpen(false); };
    desktop.addEventListener("change", closeOnDesktop);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      cancelAnimationFrame(focusFrame);
      window.removeEventListener("keydown", handleKeyDown);
      desktop.removeEventListener("change", closeOnDesktop);
      document.body.style.overflow = previousOverflow;
      triggerElement?.focus({ preventScroll: true });
    };
  }, [isOpen]);

  return (
    <div className="ml-auto block min-[900px]:hidden">
      <button
        ref={triggerRef}
        onClick={toggleMenu}
        className="group inline-flex min-h-10 cursor-pointer items-center gap-[9px] border-2 border-[var(--ink)] bg-[#f7f5ea] px-[13px] py-[7px] font-[family-name:var(--mono)] text-[11px] font-bold tracking-[0.14em] text-[var(--ink)] uppercase shadow-[3px_3px_0_var(--ink)] transition-[transform,box-shadow,background-color] duration-150 hover:bg-[#fffaf0] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0_var(--ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--red)]"
        data-open={isOpen}
        aria-label={isOpen ? "ナビゲーションメニューを閉じる" : "ナビゲーションメニューを開く"}
        aria-expanded={isOpen}
        aria-controls="mobile-navigation-drawer"
      >
        <span className="grid grid-cols-[repeat(2,6px)] gap-[3px] rotate-[-7deg] [&_i]:block [&_i]:h-[6px] [&_i]:w-[6px] [&_i]:border [&_i]:border-[var(--ink)] [&_i]:bg-[var(--ink)] [&_i]:transition-colors [&_i]:duration-200 [&_i:nth-child(2)]:bg-transparent [&_i:nth-child(3)]:bg-transparent group-data-[open=true]:[&_i]:border-[var(--red)] group-data-[open=true]:[&_i]:bg-[var(--red)]" aria-hidden="true">
          <i /><i /><i /><i />
        </span>
        <span>{isOpen ? "CLOSE" : "MENU"}</span>
      </button>

      {/* バックドロップ */}
      <div
        className={`${styles.backdrop} pointer-events-none invisible fixed inset-0 z-[60] opacity-0 transition-[opacity,visibility] duration-250 data-[open=true]:pointer-events-auto data-[open=true]:visible data-[open=true]:opacity-100 motion-reduce:transition-none`}
        data-open={isOpen}
        onClick={closeMenu}
        aria-hidden="true"
      />

      {/* スライドインメニュー（ウィンドウ風ドロワー） */}
      <div
        id="mobile-navigation-drawer"
        ref={menuRef}
        inert={!isOpen}
        role="dialog"
        aria-modal="true"
        aria-label="サイト内ナビゲーション"
        className={`${styles.drawer} invisible fixed inset-y-0 right-0 z-[70] flex h-dvh w-[min(calc(100vw-32px),340px)] translate-x-full flex-col overflow-hidden border-l-[3px] border-[var(--ink)] font-[family-name:var(--mono)] text-[var(--ink)] shadow-[-8px_0_0_rgba(10,23,29,.35)] transition-[transform,visibility] duration-300 ease-[cubic-bezier(.16,1,.3,1)] data-[open=true]:visible data-[open=true]:translate-x-0 motion-reduce:transition-none`}
        data-open={isOpen}
      >
        {/* ウィンドウタイトルバー */}
        <div className="flex min-h-11 shrink-0 items-center justify-between gap-[10px] border-b-2 border-[var(--ink)] bg-[var(--ink)] px-3 py-[6px] text-[11px] tracking-[0.08em] text-[var(--paper)]">
          <div className="flex min-w-0 items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="h-[7px] w-[7px] shrink-0 rounded-full bg-[#57d7c3] shadow-[0_0_8px_#57d7c3]" aria-hidden="true" />
            <span>naganuma@home: navigation</span>
          </div>
          <button
            type="button"
            onClick={closeMenu}
            className="inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center border border-[#789195] bg-transparent font-[family-name:var(--mono)] text-[13px] font-bold text-[var(--paper)] transition-colors duration-150 hover:border-[var(--red)] hover:bg-[var(--red)] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--orange)]"
            aria-label="メニューを閉じる"
          >
            ✕
          </button>
        </div>

        {/* システムヘッダー */}
        <div className="flex shrink-0 items-center justify-between border-b border-[#afbbaa] bg-[#e9e5d8] px-4 py-[10px] text-[10px] tracking-[0.08em] text-[#526963]" aria-hidden="true">
          <span className="inline-flex items-center gap-[6px] font-bold text-[var(--ink)]">
            <span className="h-[5px] w-[5px] bg-[var(--red)]" />
            WORKSPACE MENU
          </span>
          <span>01 → 05 ITEMS</span>
        </div>

        {/* ナビゲーションリスト */}
        <nav className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-[18px]" aria-label="モバイルナビゲーション">
          {menuLinks.map((link, index) => {
            const current = isCurrent(link.href);
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={closeMenu}
                className="group relative flex min-h-[52px] items-center justify-between gap-3 border-2 border-[var(--ink)] bg-[#f7f5ea] px-[14px] py-[10px] text-[var(--ink)] no-underline shadow-[4px_4px_0_var(--ink)] transition-[transform,box-shadow,background-color] duration-150 hover:bg-[#fffaf0] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_var(--ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--red)] data-[current=true]:bg-[#ffdfb8] data-[current=true]:after:absolute data-[current=true]:after:inset-x-0 data-[current=true]:after:bottom-0 data-[current=true]:after:h-[3px] data-[current=true]:after:bg-[var(--red)] data-[current=true]:after:content-['']"
                data-current={current}
                aria-current={current ? "page" : undefined}
              >
                <div className="flex items-center gap-3">
                  <span className="border-r border-[#aebcaa] pr-[10px] text-[11px] font-bold tracking-[0.08em] text-[var(--teal)] group-data-[current=true]:text-[var(--red)]" aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="font-[family-name:var(--font-oswald)] text-[19px] font-bold tracking-[0.08em] uppercase">{link.name}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-[#526963] group-data-[current=true]:text-[var(--ink)]" aria-hidden="true">
                  <span>{link.tag}</span>
                  <span>→</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* システムフッター */}
        <div className="flex shrink-0 flex-col gap-[10px] border-t-2 border-[var(--ink)] bg-[#e8e9df] px-4 py-[14px]">
          <div className="flex items-center justify-between text-[11px] tracking-[0.06em] text-[var(--ink)]">
            <span className="inline-flex items-center gap-[6px] font-bold">
              <span className="h-[6px] w-[6px] bg-[var(--orange)] shadow-[0_0_6px_var(--orange)]" aria-hidden="true" />
              SYSTEM CLOCK
            </span>
            <MenuClock />
          </div>
          <div className="flex items-center gap-[14px] border-t border-[#bdc9bd] pt-2 text-[11px] tracking-[0.08em]">
            <span className="text-[10px] text-[#526963]">EXTERNAL:</span>
            <a className={externalLinkClass} href={githubProfileUrl} target="_blank" rel="noopener noreferrer">
              GITHUB ↗
            </a>
            <a className={externalLinkClass} href={xProfileUrl} target="_blank" rel="noopener noreferrer">
              X ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
