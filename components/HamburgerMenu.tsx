"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./HamburgerMenu.module.css";

const menuLinks = [
  { name: "HOME", href: "/#home", tag: "SYS_ROOT" },
  { name: "PROJECTS", href: "/projects", tag: "WORK / 02" },
  { name: "NOTES", href: "/#notes", tag: "BLOG / 03" },
  { name: "ABOUT", href: "/about", tag: "PROFILE / 04" },
  { name: "CONTACT", href: "/contact", tag: "INQUIRY / 05" },
];

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
      {" "}<span style={{ color: "#788e89", fontSize: "10px" }}>({date})</span>
    </time>
  );
}

export default function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const [hash, setHash] = useState("");

  useEffect(() => {
    const updateHash = () => setHash(window.location.hash);
    updateHash();
    window.addEventListener("hashchange", updateHash);
    return () => window.removeEventListener("hashchange", updateHash);
  }, [pathname]);

  const isCurrent = (href: string): boolean => {
    if (href === "/#home") return pathname === "/" && (hash === "" || hash === "#home");
    if (href === "/#notes") return pathname === "/" && hash === "#notes";
    if (pathname === href) return true;
    if (href === "/projects" && pathname.startsWith("/projects/")) return true;
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
    <div className={styles.mobileMenuWrapper}>
      <button
        ref={triggerRef}
        onClick={toggleMenu}
        className={styles.triggerButton}
        data-open={isOpen}
        aria-label={isOpen ? "ナビゲーションメニューを閉じる" : "ナビゲーションメニューを開く"}
        aria-expanded={isOpen}
        aria-controls="mobile-navigation-drawer"
      >
        <span className={styles.triggerIcon} aria-hidden="true">
          <i /><i /><i /><i />
        </span>
        <span>{isOpen ? "CLOSE" : "MENU"}</span>
      </button>

      {/* バックドロップ */}
      <div
        className={styles.backdrop}
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
        className={styles.drawer}
        data-open={isOpen}
      >
        {/* ウィンドウタイトルバー */}
        <div className={styles.titlebar}>
          <div className={styles.titlebarTitle}>
            <span className={styles.statusDot} aria-hidden="true" />
            <span>naganuma@home: navigation</span>
          </div>
          <button
            type="button"
            onClick={closeMenu}
            className={styles.closeButton}
            aria-label="メニューを閉じる"
          >
            ✕
          </button>
        </div>

        {/* システムヘッダー */}
        <div className={styles.systemHeader} aria-hidden="true">
          <span>
            <span className={styles.systemHeaderMarker} />
            WORKSPACE MENU
          </span>
          <span>01 → 05 ITEMS</span>
        </div>

        {/* ナビゲーションリスト */}
        <nav className={styles.navScroll} aria-label="モバイルナビゲーション">
          {menuLinks.map((link, index) => {
            const current = isCurrent(link.href);
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={closeMenu}
                className={styles.navItem}
                data-current={current}
                aria-current={current ? "page" : undefined}
              >
                <div className={styles.navItemLeading}>
                  <span className={styles.taskbarNumber} aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className={styles.navLabel}>{link.name}</span>
                </div>
                <div className={styles.navItemTrailing} aria-hidden="true">
                  <span>{link.tag}</span>
                  <span>→</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* システムフッター */}
        <div className={styles.systemFooter}>
          <div className={styles.footerClockRow}>
            <span className={styles.clockBadge}>
              <span className={styles.clockBadgeDot} aria-hidden="true" />
              SYSTEM CLOCK
            </span>
            <MenuClock />
          </div>
          <div className={styles.footerLinks}>
            <span style={{ color: "#526963", fontSize: "10px" }}>EXTERNAL:</span>
            <a href="https://github.com/naganuma-tsutomu" target="_blank" rel="noopener noreferrer">
              GITHUB ↗
            </a>
            <a href="https://x.com" target="_blank" rel="noopener noreferrer">
              X ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
