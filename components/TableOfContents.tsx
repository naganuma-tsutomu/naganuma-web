"use client";

import { useEffect, useState, useCallback } from "react";
import type { TocItem } from "@/lib/toc";

interface TableOfContentsProps {
  items: TocItem[];
  mode?: "sidebar" | "inline";
}

export default function TableOfContents({ items, mode = "sidebar" }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");

  // スクロール位置に応じてアクティブな見出しを判定
  const updateActiveHeading = useCallback(() => {
    if (items.length === 0) return;

    const headingElements = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);

    if (headingElements.length === 0) return;

    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    // ページ末尾に到達している場合は最後の見出しをアクティブにする
    if (scrollY + windowHeight >= documentHeight - 60) {
      const lastId = items[items.length - 1].id;
      setActiveId(lastId);
      return;
    }

    // Use the same CSS offsets as native anchor navigation.
    const offset = (parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0)
      + (parseFloat(getComputedStyle(headingElements[0]).scrollMarginTop) || 0) + 1;
    let currentId = items[0].id;

    for (const el of headingElements) {
      const top = el.getBoundingClientRect().top;
      if (top <= offset) {
        currentId = el.id;
      } else {
        break;
      }
    }

    setActiveId(currentId);
  }, [items]);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    let rafId: number | null = null;

    const handleScroll = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        updateActiveHeading();
      });
    };
    const stopListening = () => {
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      rafId = null;
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
    const syncViewport = () => {
      stopListening();
      if (desktop.matches !== (mode === "sidebar")) return;
      handleScroll();
      window.addEventListener("scroll", handleScroll, { passive: true });
      window.addEventListener("resize", handleScroll, { passive: true });
    };

    syncViewport();
    desktop.addEventListener("change", syncViewport);
    return () => {
      stopListening();
      desktop.removeEventListener("change", syncViewport);
    };
  }, [mode, updateActiveHeading]);

  useEffect(() => {
    // On a fresh URL, streamed article markup may arrive after native hash scrolling.
    if (window.matchMedia("(min-width: 1024px)").matches !== (mode === "sidebar")) return;
    const initialHash = window.location.hash;
    if (!initialHash) return;
    let id: string;
    try {
      id = decodeURIComponent(initialHash.slice(1));
    } catch {
      return;
    }
    if (!items.some(item => item.id === id)) return;

    let cancelled = false;
    let rafId: number | null = null;
    void document.fonts.ready.then(() => {
      if (cancelled) return;
      rafId = window.requestAnimationFrame(() => {
        if (window.location.hash !== initialHash || document.documentElement.dataset.pageTransition === "active") return;
        document.getElementById(id)?.scrollIntoView({ block: "start", behavior: "instant" });
      });
    });
    return () => {
      cancelled = true;
      if (rafId !== null) window.cancelAnimationFrame(rafId);
    };
  }, [items, mode]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;

    // Closing the inline TOC changes the heading position, so do it before scrolling.
    const details = e.currentTarget.closest("details");
    if (details) details.open = false;
    el.tabIndex = -1;
    el.focus({ preventScroll: true });
    el.scrollIntoView({
      block: "start",
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
    });

    history.pushState(null, "", `#${encodeURIComponent(id)}`);
    setActiveId(id);
  };

  if (items.length === 0) return null;

  if (mode === "inline") {
    return (
      <details className="toc-mobile-accordion mb-8 border-2 border-[var(--ink)] bg-[var(--surface)] p-3 text-[var(--ink)] shadow-[3px_3px_0_var(--ink)] lg:hidden group">
        <summary className="flex cursor-pointer items-center justify-between font-[family-name:var(--font-oswald),sans-serif] text-sm tracking-wider font-bold select-none list-none [&::-webkit-details-marker]:none">
          <span className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-[var(--red)]" aria-hidden="true" />
            <span>INDEX // 目次 ({items.length})</span>
          </span>
          <span className="text-xs text-[var(--text-sub)] group-open:rotate-180 transition-transform duration-200">
            ▼
          </span>
        </summary>
        <nav className="mt-3 pt-3 border-t border-[var(--border)]" aria-label="モバイル用目次">
          <ul className="space-y-1.5 font-[family-name:var(--mono)] text-xs">
            {items.map((item) => {
              const isActive = activeId === item.id;
              const indentClass =
                item.level === 3 ? "pl-3" : item.level === 4 ? "pl-6" : "pl-0";

              return (
                <li key={item.id} className={indentClass}>
                  <a
                    href={`#${encodeURIComponent(item.id)}`}
                    onClick={(e) => handleClick(e, item.id)}
                    aria-current={isActive ? "location" : undefined}
                    className={`block py-1 pr-2 leading-relaxed transition-colors border-l-2 ${
                      isActive
                        ? "border-[var(--red)] pl-2 font-bold text-[var(--red)]"
                        : "border-transparent pl-2 text-[var(--text-sub)] hover:text-[var(--ink)]"
                    }`}
                  >
                    {item.text}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </details>
    );
  }

  return (
    <nav
      className="toc-sidebar rounded-none border-2 border-[var(--ink)] bg-[var(--surface)] p-4 shadow-[5px_5px_0_var(--ink)] text-[var(--ink)]"
      aria-label="記事の目次"
    >
      <div className="mb-3 flex items-center justify-between border-b border-[var(--border)] pb-2 font-[family-name:var(--font-oswald),sans-serif] text-xs font-bold tracking-widest">
        <span className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 bg-[var(--red)]" aria-hidden="true" />
          <span>INDEX // 目次</span>
        </span>
        <span className="font-[family-name:var(--mono)] text-[10px] text-[var(--text-sub)]">
          {items.length} SECTIONS
        </span>
      </div>

      <div className="max-h-[calc(100vh-220px)] overflow-y-auto pr-1 [scrollbar-width:thin]">
        <ul className="space-y-1 font-[family-name:var(--mono)] text-[12px] leading-snug">
          {items.map((item) => {
            const isActive = activeId === item.id;
            const indentClass =
              item.level === 3 ? "ml-3" : item.level === 4 ? "ml-6" : "ml-0";

            return (
              <li key={item.id} className={indentClass}>
                <a
                  href={`#${encodeURIComponent(item.id)}`}
                  onClick={(e) => handleClick(e, item.id)}
                  aria-current={isActive ? "location" : undefined}
                  title={item.text}
                  className={`block py-1 border-l-2 transition-all duration-150 ${
                    isActive
                      ? "border-[var(--red)] bg-[#ffbd76]/20 pl-2 font-bold text-[var(--ink)]"
                      : "border-transparent pl-2 text-[var(--text-sub)] hover:border-[var(--teal)] hover:text-[var(--ink)]"
                  }`}
                >
                  <span className="line-clamp-2">{item.text}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
