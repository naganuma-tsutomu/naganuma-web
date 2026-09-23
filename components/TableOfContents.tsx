"use client";

import { useEffect, useState, useCallback, useTransition } from "react";
import type { TocItem } from "@/lib/toc";

interface TableOfContentsProps {
  items: TocItem[];
  mode?: "sidebar" | "inline";
}

export default function TableOfContents({ items, mode = "sidebar" }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");
  const [, startTransition] = useTransition();

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

    // 固定ヘッダー（約80〜100px）を考慮した判定ライン
    const offset = 140;
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
    updateActiveHeading();

    let rafId: number | null = null;
    const handleScroll = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        updateActiveHeading();
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    return () => {
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [updateActiveHeading]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;

    // ヘッダー固定分の余白を考慮してスクロール
    const headerOffset = 100;
    const elementPosition = el.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    });

    history.pushState(null, "", `#${id}`);
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
                    href={`#${item.id}`}
                    onClick={(e) => handleClick(e, item.id)}
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

      <div className="max-h-[calc(100vh-220px)] overflow-y-auto pr-1 scrollbar-thin">
        <ul className="space-y-1 font-[family-name:var(--mono)] text-[12px] leading-snug">
          {items.map((item) => {
            const isActive = activeId === item.id;
            const indentClass =
              item.level === 3 ? "ml-3" : item.level === 4 ? "ml-6" : "ml-0";

            return (
              <li key={item.id} className={indentClass}>
                <a
                  href={`#${item.id}`}
                  onClick={(e) => handleClick(e, item.id)}
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
