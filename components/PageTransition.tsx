"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { usePathname } from "next/navigation";
import { pageNumber } from "@/app/data/links";
import styles from "./PageTransition.module.css";

type Phase = "idle" | "closing" | "opening";

const CLOSE_DURATION = 280;
const OPEN_DURATION = 360;
const NAVIGATION_TIMEOUT = 4000;
const desktopChromeClass = "absolute right-[22px] left-[22px] flex justify-between gap-3 border-[#a8aaa0] font-[family-name:var(--mono)] text-[10px] tracking-[0.08em] text-[#52605e]";

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
  const cancelled = useRef(false);
  const focus = useRef<{ element: Element | null; source: string; moved: boolean } | null>(null);

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

  const startNavigation = useCallback((nextPath: string, nextHash = "", source = "link") => {
    cancelled.current = false;
    focus.current = { element: document.activeElement, source, moved: false };
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
      cancelled.current = true;
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

    // History restores the reading position without the window opening animation.
    const onPopState = () => {
      previousPath.current = window.location.pathname;
      focus.current = null;
      resetToIdle();
    };

    // Allow user to cancel overlay with Escape key if it feels stuck
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && phase !== "idle") {
        cancelled.current = true;
        resetToIdle();
      }
    };

    const onNavigate = (event: Event) => {
      const { pathname, hash, source } = (event as CustomEvent<{ pathname: string; hash: string; source: string }>).detail;
      startNavigation(pathname, hash, source);
    };
    const onFocus = (event: FocusEvent) => {
      if (focus.current && event.target !== focus.current.element && event.target !== document.body) focus.current.moved = true;
    };
    document.addEventListener("naganuma:navigate", onNavigate);
    document.addEventListener("focusin", onFocus);
    document.addEventListener("click", onClick, true);
    window.addEventListener("popstate", onPopState);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("naganuma:navigate", onNavigate);
      document.removeEventListener("focusin", onFocus);
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

    const complete = () => {
      flushSync(resetToIdle);
      if (window.location.hash) {
        const anchor = new CustomEvent("naganuma:home-anchor", { detail: window.location.hash, cancelable: true });
        document.dispatchEvent(anchor);
      }
      const navigation = focus.current;
      focus.current = null;
      if (navigation && !navigation.moved && navigation.source !== "terminal") {
        document.querySelector<HTMLElement>("[data-home-reader], [data-page-reader]")?.focus({ preventScroll: true });
      }
    };
    if (cancelled.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      timers.current.push(window.setTimeout(complete, 0));
      return;
    }
    const remaining = Math.max(0, CLOSE_DURATION - (performance.now() - startedAt.current));
    timers.current.push(window.setTimeout(() => {
      setDestination(routeLabel(pathname, window.location.hash));
      setPhase("opening");
      timers.current.push(window.setTimeout(complete, OPEN_DURATION));
    }, startedAt.current ? remaining : 0));
  }, [pathname, clearTimers, resetToIdle]);

  useEffect(() => {
    return () => {
      clearTimers();
      delete document.documentElement.dataset.pageTransition;
    };
  }, [clearTimers]);

  return (
    <div data-transition-scope className="@container/transition relative isolate min-w-0 self-start [[data-layout=split]_&]:h-[var(--workspace-height)] print:h-auto!">
      <main
        id="main-content"
        data-main-phase={phase}
        tabIndex={-1}
        className={`min-w-0 focus:outline-none ${phase !== "idle" ? "invisible" : ""}`}
        inert={phase !== "idle"}
        aria-busy={phase !== "idle"}
      >
        {children}
      </main>
      <div className={`${styles.overlay} absolute inset-0 z-40 grid place-items-center overflow-hidden px-7 py-20 font-[family-name:var(--mono)] text-[var(--ink)] opacity-0 invisible pointer-events-none max-[899px]:px-[18px] max-[899px]:pt-20 max-[899px]:pb-5 motion-reduce:hidden`} data-phase={phase} aria-hidden={phase === "idle"} role="status" aria-live="polite">
        <div className={`${desktopChromeClass} top-6 border-b pb-[14px] max-[899px]:top-6`} aria-hidden="true">
          <span className="flex items-center gap-[9px]"><i className="h-[7px] w-[7px] bg-[var(--red)]" /> DESKTOP {phase === "opening" ? pageNumbers.to : pageNumbers.from} / WORKSPACE</span>
          <span className="@max-[600px]/transition:hidden">WINDOW MANAGER <b className="text-base text-[var(--red)]">↗</b></span>
        </div>
        <div className={`${styles.window} [--navigation-shadow:10px] max-[899px]:[--navigation-shadow:5px] w-[min(100%,570px)] border-[3px] border-[var(--ink)] bg-[var(--ink)] p-[5px] text-[var(--paper)] shadow-[10px_10px_0_var(--ink)] max-[899px]:shadow-[5px_5px_0_var(--ink)]`} aria-hidden="true">
          <div className="flex min-h-[38px] items-center justify-between gap-3 border border-[#afbdba] px-3 py-[7px] text-xs">
            <span>naganuma@home: navigation</span>
            <span className="flex gap-[7px] [&_i]:h-[10px] [&_i]:w-[10px] [&_i]:rounded-full [&_i]:border [&_i]:border-[#c7d4cf] [&_i:first-child]:border-[var(--red)] [&_i:first-child]:bg-[var(--red)]" aria-hidden="true"><i /><i /><i /></span>
          </div>
          <div className="border border-t-0 border-[#afbdba] p-[clamp(24px,4vw,38px)] max-[899px]:px-5 max-[899px]:py-6">
            <div className="flex items-center gap-[9px] text-[10px] tracking-[0.11em] text-[#86cec2]"><span className="h-[7px] w-[7px] bg-[var(--orange)] shadow-[0_0_10px_var(--orange)]" /> SYSTEM / OPEN WINDOW <span className="ml-auto text-[#aebfbd]">{pageNumbers.from} → {pageNumbers.to}</span></div>
            <div className={`${styles.command} mt-6 flex min-w-0 items-baseline gap-[14px] text-[clamp(19px,4vw,31px)] leading-[1.3] max-[899px]:gap-[9px]`}><span className="shrink-0 text-[var(--orange)]" aria-hidden="true">&gt;_</span><span className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">open <strong className="font-normal text-[var(--paper)]">{destination}</strong></span></div>
            <div className="mt-[26px] mb-[18px] h-px bg-[#789195]" />
            <div className="mb-[9px] flex justify-between gap-3 text-[10px] tracking-[0.07em] text-[#b7c5c3]"><span>INITIALIZING WORKSPACE</span><span className="whitespace-nowrap text-[var(--orange)]">{phase === "opening" ? "OPENING" : "PLEASE WAIT"}</span></div>
            <div className={`${styles.progress} h-3 overflow-hidden border border-[#789195] bg-[#243d43]`} aria-hidden="true"><span /></div>
            <div className="mt-[13px] flex justify-between gap-3 text-[9px] tracking-[0.07em] text-[#aebfbd]"><span>SESSION 01</span><span className="@max-[600px]/transition:hidden">naganuma / WEB SERVER HOMELAB</span></div>
          </div>
        </div>
        <p className="sr-only">ページを切り替えています</p>
        <div className={`${desktopChromeClass} bottom-6 border-t pt-[14px] max-[899px]:bottom-6`} aria-hidden="true"><span>LOCAL ACCOUNT / naganuma</span><span className="@max-[600px]/transition:hidden">CONNECTING TO {destination}</span></div>
      </div>
    </div>
  );
}
