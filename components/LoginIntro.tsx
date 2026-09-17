"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LOGIN_INTRO_STORAGE_KEY } from "@/lib/login-intro";
import styles from "./LoginIntro.module.css";

const INTRO_DURATION = 3800;
const EXIT_DURATION = 780;

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
    autoTimer.current = window.setTimeout(dismiss, INTRO_DURATION);
    return () => {
      if (autoTimer.current !== null) window.clearTimeout(autoTimer.current);
      if (exitTimer.current !== null) window.clearTimeout(exitTimer.current);
      restorePage.current?.();
      restorePage.current = null;
    };
  }, [dismiss]);

  if (phase === "hidden") return null;

  return (
    <div
      className={`${styles.screen} ${phase === "leaving" ? styles.leaving : ""}`}
      data-login-intro
      role="dialog"
      aria-modal="true"
      aria-label="ウェルカム画面"
    >
      <div className={styles.frame}>
        <div className={styles.topbar}>
          <div className={styles.brand}>
            <span className="site-wordmark">
              <span className="site-launcher-icon" aria-hidden="true"><i /><i /><i /><i /></span>
              <span>NAGANUMA</span>
            </span>
            <span className={styles.brandSuffix}>PERSONAL WORKSPACE</span>
          </div>
          <button ref={skipButton} className={styles.skip} type="button" onClick={dismiss}>
            SKIP INTRO <span aria-hidden="true">→</span>
          </button>
        </div>

        <div className={styles.center}>
          <div className={styles.loginWindow}>
            <div className={styles.titlebar}>
              <span>naganuma@home: login</span>
              <span className={styles.windowDots} aria-hidden="true"><i /><i /><i /></span>
            </div>
            <div className={styles.windowBody}>
              <div className={styles.identity}>
                <div className={styles.avatar} aria-hidden="true">N</div>
                <div>
                  <p className={styles.accountType}>LOCAL ACCOUNT / 01</p>
                  <h2 className={styles.accountName}>naganuma</h2>
                  <p className={styles.accountCaption}>WEB / SERVER / HOMELAB</p>
                </div>
              </div>
              <div className={styles.authStage}>
                <div className={styles.signIn} aria-hidden="true">
                  <span className={styles.fieldLabel}>PASSWORD</span>
                  <span className={styles.passwordField}>
                    <span className={styles.passwordDots}><i /><i /><i /><i /><i /><i /><i /><i /></span>
                    <span className={styles.signInArrow}>→</span>
                  </span>
                </div>
                <div className={styles.welcome} aria-live="polite">
                  <span className={styles.cursor} aria-hidden="true">&gt;_</span>
                  <span>WELCOME BACK</span>
                </div>
              </div>
              <div className={styles.progress} aria-hidden="true"><span /></div>
              <p className={styles.windowFoot}>INITIALIZING WORKSPACE <span>SESSION 01</span></p>
            </div>
          </div>
        </div>

        <div className={styles.bottomBar} aria-hidden="true">
          <span>© NAGANUMA</span>
          <span className={styles.connection}><i /> LOCAL SESSION</span>
        </div>
      </div>
    </div>
  );
}
