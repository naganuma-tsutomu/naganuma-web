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
      <div className={styles.overlay} data-phase={phase} aria-hidden={phase === "idle"} role="status" aria-live="polite">
        <div className={styles.desktopFrame} aria-hidden="true">
          <span><i /> DESKTOP {phase === "opening" ? pageNumbers.to : pageNumbers.from} / WORKSPACE</span>
          <span>WINDOW MANAGER <b>↗</b></span>
        </div>
        <div className={styles.window} aria-hidden="true">
          <div className={styles.titlebar}>
            <span>naganuma@home: navigation</span>
            <span className={styles.windowDots} aria-hidden="true"><i /><i /><i /></span>
          </div>
          <div className={styles.windowBody}>
            <div className={styles.kicker}><span className={styles.statusDot} /> SYSTEM / OPEN WINDOW <span>{pageNumbers.from} → {pageNumbers.to}</span></div>
            <div className={styles.command}><span aria-hidden="true">&gt;_</span><span>open <strong>{destination}</strong></span></div>
            <div className={styles.divider} />
            <div className={styles.message}><span>INITIALIZING WORKSPACE</span><span>{phase === "opening" ? "OPENING" : "PLEASE WAIT"}</span></div>
            <div className={styles.progress} aria-hidden="true"><span /></div>
            <div className={styles.windowFooter}><span>SESSION 01</span><span>NAGANUMA / WEB SERVER HOMELAB</span></div>
          </div>
        </div>
        <p className={styles.screenReader}>ページを切り替えています</p>
        <div className={styles.desktopFooter} aria-hidden="true"><span>LOCAL ACCOUNT / NAGANUMA</span><span>CONNECTING TO {destination}</span></div>
      </div>
    </>
  );
}
