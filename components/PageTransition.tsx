"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { usePathname } from "next/navigation";
import { pageNumber } from "@/app/data/links";
import styles from "./PageTransition.module.css";

type Phase = "idle" | "closing" | "opening";

const CLOSE_DURATION = 460;
const OPEN_DURATION = 560;
const NAVIGATION_TIMEOUT = 4000;
const desktopChromeClass = "absolute right-[max(38px,calc((100vw-1400px)/2))] left-[max(38px,calc((100vw-1400px)/2))] flex justify-between gap-[18px] border-[#a8aaa0] font-[family-name:var(--mono)] text-[10px] tracking-[0.08em] whitespace-nowrap text-[#52605e] max-[768px]:right-[22px] max-[768px]:left-[22px]";

function routeLabel(pathname: string, hash = "") {
  const base = pathname === "/" ? "/home" : pathname;
  return hash ? `${base}${hash}` : base;
}

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>("idle");
  const [destination, setDestination] = useState("/home");
  const [pageNumbers, setPageNumbers] = useState({ from: pageNumber(pathname), to: pageNumber(pathname) });
  const previousPath = useRef(pathname);
  const startedAt = useRef(0);
  const timers = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
  }, []);

  const resetToIdle = useCallback(() => {
    clearTimers();
    startedAt.current = 0;
    setPhase("idle");
    delete document.documentElement.dataset.pageTransition;
  }, [clearTimers]);

  const startNavigation = useCallback((nextPath: string, nextHash = "") => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    clearTimers();
    startedAt.current = performance.now();
    document.documentElement.dataset.pageTransition = "active";
    flushSync(() => {
      setDestination(routeLabel(nextPath, nextHash));
      setPageNumbers({ from: pageNumber(window.location.pathname), to: pageNumber(nextPath) });
      setPhase("closing");
    });
    timers.current.push(window.setTimeout(() => {
      resetToIdle();
    }, NAVIGATION_TIMEOUT));
  }, [clearTimers, resetToIdle]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (!(event.target instanceof Element)) return;
      const link = event.target.closest<HTMLAnchorElement>("a[href]");
      if (!link || link.hasAttribute("download") || (link.target && link.target !== "_self")) return;
      const destinationUrl = new URL(link.href, window.location.href);
      if (destinationUrl.origin !== window.location.origin || destinationUrl.pathname === window.location.pathname) return;
      startNavigation(destinationUrl.pathname, destinationUrl.hash);
    };

    // Skip full-screen blocking overlay on browser back/forward (e.g. mobile swipe back)
    const onPopState = () => {
      previousPath.current = window.location.pathname;
      resetToIdle();
    };

    // Allow user to cancel overlay with Escape key if it feels stuck
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && phase !== "idle") {
        resetToIdle();
      }
    };

    document.addEventListener("click", onClick, true);
    window.addEventListener("popstate", onPopState);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [phase, resetToIdle, startNavigation]);

  useEffect(() => {
    if (pathname === previousPath.current) return;
    setPageNumbers({ from: pageNumber(previousPath.current), to: pageNumber(pathname) });
    previousPath.current = pathname;
    clearTimers();

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      timers.current.push(window.setTimeout(() => resetToIdle(), 0));
      return;
    }

    const remaining = Math.max(0, CLOSE_DURATION - (performance.now() - startedAt.current));
    timers.current.push(window.setTimeout(() => {
      setDestination(routeLabel(pathname, window.location.hash));
      setPhase("opening");
      timers.current.push(window.setTimeout(() => {
        resetToIdle();
        if (window.location.hash) {
          const target = document.querySelector(window.location.hash);
          if (target) {
            target.scrollIntoView({ behavior: "smooth" });
          }
        }
      }, OPEN_DURATION));
    }, startedAt.current ? remaining : 0));
  }, [pathname, clearTimers, resetToIdle]);

  useEffect(() => {
    return () => {
      clearTimers();
      delete document.documentElement.dataset.pageTransition;
    };
  }, [clearTimers]);

  return (
    <>
      <main
        id="main-content"
        className={`flex-grow ${phase === "closing" ? styles.mainClosing : ""} ${phase === "opening" ? styles.mainOpening : ""}`}
        inert={phase !== "idle"}
      >
        {children}
      </main>
      <div className={`${styles.overlay} fixed inset-0 z-40 grid place-items-center overflow-hidden bg-[#e9e4d8] px-7 pt-24 pb-[30px] font-[family-name:var(--mono)] text-[var(--ink)] opacity-0 invisible pointer-events-none max-[768px]:px-[18px] max-[768px]:pt-[100px] max-[768px]:pb-5 motion-reduce:hidden`} data-phase={phase} aria-hidden={phase === "idle"} role="status" aria-live="polite">
        <div className={`${desktopChromeClass} top-[108px] border-b pb-[14px] max-[768px]:top-[102px]`} aria-hidden="true">
          <span className="flex items-center gap-[9px]"><i className="h-[7px] w-[7px] bg-[var(--red)]" /> DESKTOP {phase === "opening" ? pageNumbers.to : pageNumbers.from} / WORKSPACE</span>
          <span className="max-[768px]:hidden">WINDOW MANAGER <b className="text-base text-[var(--red)]">↗</b></span>
        </div>
        <div className={`${styles.window} w-[min(100%,570px)] border-[3px] border-[var(--ink)] bg-[var(--ink)] p-[5px] text-[var(--paper)] shadow-[10px_10px_0_var(--ink)] max-[768px]:shadow-[5px_5px_0_var(--ink)]`} aria-hidden="true">
          <div className="flex min-h-[38px] items-center justify-between gap-3 border border-[#afbdba] px-3 py-[7px] text-xs">
            <span>naganuma@home: navigation</span>
            <span className="flex gap-[7px] [&_i]:h-[10px] [&_i]:w-[10px] [&_i]:rounded-full [&_i]:border [&_i]:border-[#c7d4cf] [&_i:first-child]:border-[var(--red)] [&_i:first-child]:bg-[var(--red)]" aria-hidden="true"><i /><i /><i /></span>
          </div>
          <div className="border border-t-0 border-[#afbdba] p-[clamp(24px,4vw,38px)] max-[768px]:px-5 max-[768px]:py-6">
            <div className="flex items-center gap-[9px] text-[10px] tracking-[0.11em] text-[#86cec2]"><span className="h-[7px] w-[7px] bg-[var(--orange)] shadow-[0_0_10px_var(--orange)]" /> SYSTEM / OPEN WINDOW <span className="ml-auto text-[#aebfbd]">{pageNumbers.from} → {pageNumbers.to}</span></div>
            <div className={`${styles.command} mt-6 flex min-w-0 items-baseline gap-[14px] text-[clamp(19px,4vw,31px)] leading-[1.3] max-[768px]:gap-[9px]`}><span className="shrink-0 text-[var(--orange)]" aria-hidden="true">&gt;_</span><span className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">open <strong className="font-normal text-[var(--paper)]">{destination}</strong></span></div>
            <div className="mt-[26px] mb-[18px] h-px bg-[#789195]" />
            <div className="mb-[9px] flex justify-between gap-3 text-[10px] tracking-[0.07em] text-[#b7c5c3]"><span>INITIALIZING WORKSPACE</span><span className="whitespace-nowrap text-[var(--orange)]">{phase === "opening" ? "OPENING" : "PLEASE WAIT"}</span></div>
            <div className={`${styles.progress} h-3 overflow-hidden border border-[#789195] bg-[#243d43]`} aria-hidden="true"><span /></div>
            <div className="mt-[13px] flex justify-between gap-3 text-[9px] tracking-[0.07em] text-[#aebfbd]"><span>SESSION 01</span><span className="max-[768px]:hidden">NAGANUMA / WEB SERVER HOMELAB</span></div>
          </div>
        </div>
        <p className="sr-only">ページを切り替えています</p>
        <div className={`${desktopChromeClass} bottom-7 border-t pt-[14px] max-[768px]:bottom-[22px]`} aria-hidden="true"><span>LOCAL ACCOUNT / NAGANUMA</span><span className="max-[768px]:hidden">CONNECTING TO {destination}</span></div>
      </div>
    </>
  );
}
