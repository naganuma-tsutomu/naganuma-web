"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LOGIN_INTRO_STORAGE_KEY } from "@/lib/login-intro";
import { launcherIconClass, wordmarkClass } from "./wordmarkStyles";
import { desktopBackgroundClass, desktopHeaderClass, desktopHeaderRowClass, desktopWorkspaceClass } from "./desktopStyles";
import WindowDots from "./WindowDots";
import { overlayWindowFrameClass } from "./overlayWindowStyles";
import styles from "./LoginIntro.module.css";

const INTRO_DURATION = 1700;
const EXIT_DURATION = 600;

export default function LoginIntro() {
  const [phase, setPhase] = useState<"active" | "leaving" | "hidden">("active");
  const autoTimer = useRef<number | null>(null);
  const exitTimer = useRef<number | null>(null);
  const restorePage = useRef<(() => void) | null>(null);
  const screen = useRef<HTMLDivElement>(null);
  const skipButton = useRef<HTMLButtonElement>(null);
  const shouldShow = useRef<boolean | null>(null);

  const dismiss = useCallback(() => {
    if (exitTimer.current !== null) return;
    if (autoTimer.current !== null) window.clearTimeout(autoTimer.current);
    setPhase("leaving");
    exitTimer.current = window.setTimeout(() => {
      restorePage.current?.();
      restorePage.current = null;
      setPhase("hidden");
    }, EXIT_DURATION);
  }, []);

  useEffect(() => {
    if (shouldShow.current === null) {
      if (process.env.NODE_ENV === "development") {
        shouldShow.current = true;
      } else {
        try {
          shouldShow.current = window.localStorage.getItem(LOGIN_INTRO_STORAGE_KEY) !== "1";
          if (shouldShow.current) window.localStorage.setItem(LOGIN_INTRO_STORAGE_KEY, "1");
        } catch {
          // The intro still works when browser storage is unavailable.
          shouldShow.current = true;
        }
      }
    }

    if (!shouldShow.current) {
      const frame = window.requestAnimationFrame(() => setPhase("hidden"));
      return () => window.cancelAnimationFrame(frame);
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const frame = window.requestAnimationFrame(() => setPhase("hidden"));
      return () => window.cancelAnimationFrame(frame);
    }

    const page = Array.from(document.querySelectorAll<HTMLElement>(
      "body > .skip-link, body > .site-header, [data-workspace]",
    ));
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousInert = page.map((element) => element.inert);
    const previousOverflow = document.body.style.overflow;
    let keyboardUsed = false;
    page.forEach((element) => { element.inert = true; });
    document.body.style.overflow = "hidden";
    restorePage.current = () => {
      window.removeEventListener("keydown", handleKeyDown);
      page.forEach((element, index) => { element.inert = previousInert[index]; });
      document.body.style.overflow = previousOverflow;
      if (screen.current?.contains(document.activeElement)) {
        const target = previousFocus && previousFocus !== document.body && previousFocus.isConnected && !previousFocus.closest("[data-login-intro]")
          ? previousFocus
          : document.querySelector<HTMLElement>(keyboardUsed ? "[data-home-reader], [data-page-reader]" : "#main-content");
        target?.focus({ preventScroll: true });
      }
    };

    screen.current?.focus({ preventScroll: true });

    const handleKeyDown = (event: KeyboardEvent) => {
      keyboardUsed = true;
      if (event.key === "Escape") {
        dismiss();
      }
      if (event.key === "Tab") {
        event.preventDefault();
        skipButton.current?.focus({ preventScroll: true });
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    autoTimer.current = window.setTimeout(dismiss, INTRO_DURATION);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (autoTimer.current !== null) window.clearTimeout(autoTimer.current);
      if (exitTimer.current !== null) window.clearTimeout(exitTimer.current);
      restorePage.current?.();
      restorePage.current = null;
    };
  }, [dismiss]);

  if (phase === "hidden") return null;

  return (
    <div
      ref={screen}
      tabIndex={-1}
      className={`${styles.screen} ${desktopBackgroundClass} fixed inset-0 z-[200] grid h-dvh w-screen grid-rows-[auto_minmax(0,1fr)] overflow-hidden font-[family-name:var(--mono)] text-[var(--ink)] opacity-100 outline-none motion-reduce:hidden print:hidden ${phase === "leaving" ? styles.leaving : ""}`}
      data-login-intro
      data-phase={phase}
      role="dialog"
      aria-modal="true"
      aria-label="ウェルカム画面"
    >
      <div className={desktopHeaderClass} data-intro-header>
        <div className={desktopHeaderRowClass}>
          <span className={wordmarkClass}>
            <span className={launcherIconClass} aria-hidden="true"><i /><i /><i /><i /></span>
            <span>naganuma</span>
          </span>
          <span className={`${styles.chrome} border-l border-[#a3afa5] pl-[18px] text-[11px] leading-normal tracking-[0.13em] whitespace-nowrap text-[var(--text-sub)] max-[768px]:hidden`}>PERSONAL WORKSPACE</span>
          <button ref={skipButton} className={`${styles.chrome} ml-auto shrink-0 border-2 border-[var(--ink)] bg-transparent px-[11px] py-2 font-[family-name:var(--mono)] text-[11px] leading-[1.3] tracking-[0.08em] whitespace-nowrap text-[var(--ink)] transition-colors duration-200 hover:bg-[var(--ink)] hover:text-[var(--paper)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--red)] max-[375px]:px-2 max-[375px]:py-[7px] max-[375px]:text-[10px]`} type="button" onClick={dismiss}>
            SKIP INTRO <span className="ml-[10px] text-base max-[375px]:ml-[5px] max-[375px]:text-sm" aria-hidden="true">→</span>
          </button>
        </div>
      </div>

      <div className={`${styles.center} ${desktopWorkspaceClass} grid min-h-0 place-items-center overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`} data-intro-stage>
        <div className={`${styles.loginWindow} dark-panel ${overlayWindowFrameClass} w-[min(100%,560px)]`} data-intro-card>
          <div className="panel-titlebar min-h-[37px] py-[6px] text-[13px] max-[768px]:px-3">
            <span>naganuma@home: login</span>
            <WindowDots />
          </div>
          <div className={`${styles.windowBody} border border-t-0 border-[var(--border)] p-[clamp(21px,3vw,40px)] max-[641px]:p-[21px]`}>
            <div className="flex items-center gap-[23px] max-[641px]:gap-[17px]">
              <div className={`${styles.avatar} grid h-[104px] w-[104px] shrink-0 place-items-center border-2 border-[var(--paper)] bg-[var(--orange)] font-[family-name:var(--font-pixel)] text-[62px] leading-none font-bold text-[var(--red)] shadow-[4px_4px_0_#86cec2] max-[641px]:h-[72px] max-[641px]:w-[72px] max-[641px]:text-[42px]`} aria-hidden="true">N</div>
              <div>
                <p className="mb-[6px] text-[10px] tracking-[0.12em] text-[#86cec2]">LOCAL ACCOUNT / 01</p>
                <h2 className="m-0 font-[family-name:var(--font-oswald)] text-[clamp(27px,3.5vw,40px)] leading-[1.2] font-bold tracking-[0.02em] max-[641px]:text-[28px]">naganuma</h2>
                <p className="mt-[7px] text-[10px] tracking-[0.04em] text-[#b7c5c3] max-[641px]:text-[9px]">WEB / SERVER / HOMELAB</p>
              </div>
            </div>
            <div className={`${styles.authStage} relative mt-[34px] h-[100px] border-t border-[#789195] max-[641px]:mt-[30px] max-[641px]:h-[90px]`}>
              <div className={`${styles.signIn} absolute inset-x-0 top-4`} aria-hidden="true">
                <span className="mb-[7px] block text-[10px] leading-none tracking-[0.1em] text-[#86cec2]">PASSWORD</span>
                <span className="flex h-[43px] items-center justify-between border border-[#a9b8b7] bg-[#12272d]">
                  <span className={`${styles.passwordDots} flex items-center gap-[7px] pl-[14px]`}><i /><i /><i /><i /><i /><i /><i /><i /></span>
                  <span className="grid w-[43px] self-stretch place-items-center bg-[var(--orange)] font-[family-name:var(--mono)] text-2xl leading-none text-[var(--ink)]">→</span>
                </span>
              </div>
              <div className={`${styles.welcome} absolute top-8 left-0 flex items-center gap-[13px] font-[family-name:var(--font-oswald)] text-lg leading-[1.3] font-bold tracking-[0.06em] text-[var(--paper)] opacity-0`} aria-live="polite">
                <span className={`${styles.cursor} font-[family-name:var(--mono)] text-xl leading-none text-[var(--orange)]`} aria-hidden="true">&gt;_</span>
                <span>WELCOME BACK</span>
              </div>
            </div>
            <div className="h-[10px] overflow-hidden border border-[#789195] bg-[#243d43]" aria-hidden="true"><span className={`${styles.progressBar} block h-full w-full bg-[repeating-linear-gradient(90deg,#86cec2_0_17px,#243d43_17px_20px)]`} /></div>
            <p className="mt-[11px] flex justify-between gap-3 text-[9px] leading-normal tracking-[0.06em] text-[#aebfbd]">INITIALIZING WORKSPACE <span className="whitespace-nowrap">SESSION 01</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
