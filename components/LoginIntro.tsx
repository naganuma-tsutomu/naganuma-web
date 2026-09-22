"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LOGIN_INTRO_STORAGE_KEY } from "@/lib/login-intro";
import { launcherIconClass, wordmarkClass } from "./wordmarkStyles";
import styles from "./LoginIntro.module.css";

const INTRO_DURATION = 3800;
const EXIT_DURATION = 780;
const MOBILE_INTRO_DURATION = 1700;
const MOBILE_EXIT_DURATION = 500;

export default function LoginIntro() {
  const [phase, setPhase] = useState<"active" | "leaving" | "hidden">("active");
  const autoTimer = useRef<number | null>(null);
  const exitTimer = useRef<number | null>(null);
  const restorePage = useRef<(() => void) | null>(null);
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
    }, window.matchMedia("(max-width: 767px)").matches ? MOBILE_EXIT_DURATION : EXIT_DURATION);
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
      "body > .skip-link, body > .site-header, body > #main-content, body > footer",
    ));
    const previousInert = page.map((element) => element.inert);
    const previousOverflow = document.body.style.overflow;
    page.forEach((element) => { element.inert = true; });
    document.body.style.overflow = "hidden";
    restorePage.current = () => {
      page.forEach((element, index) => { element.inert = previousInert[index]; });
      document.body.style.overflow = previousOverflow;
    };

    skipButton.current?.focus({ preventScroll: true });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        dismiss();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    autoTimer.current = window.setTimeout(dismiss, window.matchMedia("(max-width: 767px)").matches ? MOBILE_INTRO_DURATION : INTRO_DURATION);
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
      className={`${styles.screen} fixed inset-0 z-[200] grid h-dvh w-full place-items-center overflow-hidden bg-[#e9e4d8] font-[family-name:var(--mono)] text-[var(--ink)] opacity-100 motion-reduce:hidden ${phase === "leaving" ? styles.leaving : ""}`}
      data-login-intro
      role="dialog"
      aria-modal="true"
      aria-label="ウェルカム画面"
    >
      <div className={`${styles.frame} grid h-full w-[min(calc(100%-72px),1464px)] grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden px-[18px] py-[clamp(18px,3vw,42px)] max-[1200px]:w-[calc(100%-48px)] max-[768px]:w-full`}>
        <div className={`${styles.topbar} flex items-center justify-between gap-5 border-b border-[#a8aaa0] pb-[14px] max-[375px]:gap-2`}>
          <div className="flex min-w-0 items-center gap-5">
            <span className={wordmarkClass}>
              <span className={launcherIconClass} aria-hidden="true"><i /><i /><i /><i /></span>
              <span>NAGANUMA</span>
            </span>
            <span className="font-[family-name:var(--mono)] text-[11px] leading-normal tracking-[0.13em] whitespace-nowrap text-[#52605e] max-[768px]:hidden">PERSONAL WORKSPACE</span>
          </div>
          <button ref={skipButton} className="shrink-0 border-2 border-[var(--ink)] bg-transparent px-[11px] py-2 font-[family-name:var(--mono)] text-[11px] leading-[1.3] tracking-[0.08em] whitespace-nowrap text-[var(--ink)] transition-colors duration-200 hover:bg-[var(--ink)] hover:text-[var(--paper)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--red)] max-[375px]:px-2 max-[375px]:py-[7px] max-[375px]:text-[10px]" type="button" onClick={dismiss}>
            SKIP INTRO <span className="ml-[10px] text-base max-[375px]:ml-[5px] max-[375px]:text-sm" aria-hidden="true">→</span>
          </button>
        </div>

        <div className={`${styles.center} grid min-h-0 place-items-center overflow-y-auto px-[10px] pt-[26px] pb-[34px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden max-[641px]:px-[5px]`}>
          <div className={`${styles.loginWindow} w-[min(100%,482px)] border-[3px] border-[var(--ink)] bg-[var(--ink)] p-[5px] text-[var(--paper)] shadow-[8px_8px_0_var(--ink)] max-[641px]:shadow-[5px_5px_0_var(--ink)]`}>
            <div className="flex min-h-[38px] items-center justify-between gap-3 border border-[#afbdba] px-3 py-[7px] text-xs">
              <span>naganuma@home: login</span>
              <span className="flex gap-[7px] [&_i]:h-[10px] [&_i]:w-[10px] [&_i]:rounded-full [&_i]:border [&_i]:border-[#c7d4cf]" aria-hidden="true"><i /><i /><i /></span>
            </div>
            <div className={`${styles.windowBody} border border-t-0 border-[#afbdba] p-[clamp(21px,3vw,34px)] max-[641px]:p-[21px]`}>
              <div className="flex items-center gap-[23px] max-[641px]:gap-[17px]">
                <div className={`${styles.avatar} grid h-[94px] w-[94px] shrink-0 place-items-center border-2 border-[var(--paper)] bg-[var(--orange)] font-[family-name:var(--font-pixel)] text-[56px] leading-none font-bold text-[var(--red)] shadow-[4px_4px_0_#86cec2] max-[641px]:h-[72px] max-[641px]:w-[72px] max-[641px]:text-[42px]`} aria-hidden="true">N</div>
                <div>
                  <p className="mb-[6px] text-[10px] tracking-[0.12em] text-[#86cec2]">LOCAL ACCOUNT / 01</p>
                  <h2 className="m-0 font-[family-name:var(--font-oswald)] text-[clamp(27px,3.5vw,35px)] leading-[1.2] font-bold tracking-[0.02em] max-[641px]:text-[28px]">naganuma</h2>
                  <p className="mt-[7px] text-[10px] tracking-[0.04em] text-[#b7c5c3] max-[641px]:text-[9px]">WEB / SERVER / HOMELAB</p>
                </div>
              </div>
              <div className={`${styles.authStage} relative mt-[30px] h-[90px] border-t border-[#789195]`}>
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

        <div className={`${styles.bottomBar} flex items-center justify-between gap-5 border-t border-[#a8aaa0] pt-[14px] text-[10px] leading-normal tracking-[0.06em] text-[#52605e] max-[641px]:justify-end max-[641px]:[&>span:first-child]:hidden`} aria-hidden="true">
          <span>© NAGANUMA</span>
          <span className="flex items-center gap-[9px] whitespace-nowrap"><i className="h-2 w-2 bg-[var(--red)]" /> LOCAL SESSION</span>
        </div>
      </div>
    </div>
  );
}
