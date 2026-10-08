"use client";

import { useEffect, useRef, type PointerEvent, type KeyboardEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import InteractiveTerminal from "@/components/InteractiveTerminal";
import HomelabStatus from "@/components/HomelabStatus";

type Position = { x: number; y: number };
type Drag = {
  pointerId: number;
  handle: HTMLElement;
  panel: HTMLElement;
  startX: number;
  startY: number;
  origin: Position;
};

const PANEL_TOP_GAP = 22;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function layoutSize(width: number) {
  return width <= 767 ? 0 : width <= 1023 ? 1 : 2;
}

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const positions = useRef(new Map<HTMLElement, Position>());
  const activeDrag = useRef<Drag | null>(null);
  const front = useRef(0);

  // Phase 2: Pointer Tracking / Multi-layer Parallax via requestAnimationFrame
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const motion = window.matchMedia(
      "(min-width: 1024px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)"
    );

    let frame = 0;

    const reset = () => {
      cancelAnimationFrame(frame);
      section.style.setProperty("--hero-norm-x", "0");
      section.style.setProperty("--hero-norm-y", "0");
    };

    const move = (event: globalThis.PointerEvent) => {
      if (!motion.matches || event.pointerType !== "mouse" || activeDrag.current) return;
      const rect = section.getBoundingClientRect();
      const x = clamp(((event.clientX - rect.left) / rect.width) * 2 - 1, -1, 1);
      const y = clamp(((event.clientY - rect.top) / rect.height) * 2 - 1, -1, 1);

      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        section.style.setProperty("--hero-norm-x", x.toFixed(4));
        section.style.setProperty("--hero-norm-y", y.toFixed(4));
      });
    };

    section.addEventListener("pointermove", move);
    section.addEventListener("pointerleave", reset);
    motion.addEventListener("change", reset);

    return () => {
      reset();
      section.removeEventListener("pointermove", move);
      section.removeEventListener("pointerleave", reset);
      motion.removeEventListener("change", reset);
    };
  }, []);

  function positionPanel(panel: HTMLElement, requestedX: number, requestedY: number) {
    const current = positions.current.get(panel) ?? { x: 0, y: 0 };
    const rect = panel.getBoundingClientRect();
    const baseLeft = rect.left - current.x;
    const baseTop = rect.top - current.y;
    const visibleWidth = Math.min(120, rect.width);
    const desktopInfoBottom = document.querySelector(".desktop-info")?.getBoundingClientRect().bottom;
    const headerBottom = document.querySelector(".site-header")?.getBoundingClientRect().bottom ?? 0;
    const barrierBottom =
      typeof desktopInfoBottom === "number" ? Math.max(headerBottom, desktopInfoBottom) : headerBottom;
    const minTop = Math.max(0, barrierBottom) + PANEL_TOP_GAP;
    const x = clamp(requestedX, visibleWidth - rect.width - baseLeft, window.innerWidth - visibleWidth - baseLeft);
    const y = clamp(requestedY, minTop - baseTop, Math.max(minTop, window.innerHeight - 36) - baseTop);

    positions.current.set(panel, { x, y });
    panel.style.translate = `${x}px ${y}px`;
  }

  function bringToFront(panel: HTMLElement) {
    panel.style.zIndex = String(++front.current);
  }

  function endDrag(pointerId: number) {
    const drag = activeDrag.current;
    if (!drag || drag.pointerId !== pointerId) return;
    delete drag.panel.dataset.dragging;
    activeDrag.current = null;
    if (drag.handle.hasPointerCapture(pointerId)) drag.handle.releasePointerCapture(pointerId);
  }

  function handlePointerDown(event: PointerEvent<HTMLElement>) {
    if (window.matchMedia("(max-width: 767px)").matches) return;
    if (!event.isPrimary || (event.pointerType === "mouse" && event.button !== 0) || activeDrag.current) return;
    const target = event.target;
    if (!(target instanceof Element)) return;
    const panel = target.closest<HTMLElement>("[data-hero-window]");
    if (!panel || !sectionRef.current?.contains(panel)) return;
    bringToFront(panel);

    const handle = target.closest<HTMLElement>("[data-drag-handle]");
    if (!handle || !panel.contains(handle)) return;
    if (event.pointerType === "touch" && panel.classList.contains("manifesto-panel") && !target.closest("h1")) return;

    event.preventDefault();
    const current = positions.current.get(panel) ?? { x: 0, y: 0 };
    positionPanel(panel, current.x, current.y);
    handle.focus({ preventScroll: true });
    handle.setPointerCapture(event.pointerId);
    panel.dataset.dragging = "";
    activeDrag.current = {
      pointerId: event.pointerId,
      handle,
      panel,
      startX: event.clientX,
      startY: event.clientY,
      origin: positions.current.get(panel) ?? { x: 0, y: 0 },
    };
  }

  function handlePointerMove(event: PointerEvent<HTMLElement>) {
    const drag = activeDrag.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    positionPanel(drag.panel, drag.origin.x + event.clientX - drag.startX, drag.origin.y + event.clientY - drag.startY);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (window.matchMedia("(max-width: 767px)").matches) return;
    const target = event.target;
    if (!(target instanceof HTMLElement) || !target.matches("[data-drag-handle]")) return;
    const panel = target.closest<HTMLElement>("[data-hero-window]");
    if (!panel) return;
    const distance = event.shiftKey ? 40 : 12;
    const movement: Record<string, Position> = {
      ArrowLeft: { x: -distance, y: 0 },
      ArrowRight: { x: distance, y: 0 },
      ArrowUp: { x: 0, y: -distance },
      ArrowDown: { x: 0, y: distance },
    };
    const delta = movement[event.key];
    if (!delta) return;
    event.preventDefault();
    bringToFront(panel);
    const current = positions.current.get(panel) ?? { x: 0, y: 0 };
    positionPanel(panel, current.x + delta.x, current.y + delta.y);
  }

  useEffect(() => {
    let previousWidth = window.innerWidth;
    const handleResize = () => {
      const width = window.innerWidth;
      if (width === previousWidth) return;
      const changedLayout = layoutSize(width) !== layoutSize(previousWidth);
      previousWidth = width;
      if (changedLayout) {
        if (activeDrag.current) endDrag(activeDrag.current.pointerId);
        positions.current.clear();
        sectionRef.current?.querySelectorAll<HTMLElement>("[data-hero-window]").forEach((panel) => {
          panel.style.translate = "";
        });
      } else {
        positions.current.forEach((position, panel) => positionPanel(panel, position.x, position.y));
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <section
      id="home"
      ref={sectionRef}
      className="relative z-[1] isolate mt-2 w-full max-w-[1720px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16"
      aria-labelledby="hero-title"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={(event) => endDrag(event.pointerId)}
      onPointerCancel={(event) => endDrag(event.pointerId)}
      onLostPointerCapture={(event) => endDrag(event.pointerId)}
      onKeyDown={handleKeyDown}
    >
      {/* ---------------------------------------------------- */}
      {/* L0: 大きな背景文字 (最背面 / マウス追従 ±4px) */}
      {/* ---------------------------------------------------- */}
      <div
        className="pointer-events-none absolute inset-x-0 -top-10 z-0 overflow-hidden select-none max-[768px]:hidden"
        style={{
          transform: "translate3d(calc(var(--hero-norm-x, 0) * 4px), calc(var(--hero-norm-y, 0) * 4px), 0)",
          transition: "transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        aria-hidden="true"
      >
        <div className="font-[family-name:var(--font-oswald)] text-[clamp(90px,15vw,250px)] font-black leading-[0.8] tracking-[-0.06em] whitespace-nowrap text-[#0a171d]/[0.05] min-[1400px]:text-[#0a171d]/[0.06]">
          NAGANUMA WEB
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* L1: 背景グリッド・ドット (最背面 / マウス追従 ±7px) */}
      {/* ---------------------------------------------------- */}
      <div
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden select-none max-[768px]:hidden"
        style={{
          transform: "translate3d(calc(var(--hero-norm-x, 0) * 7px), calc(var(--hero-norm-y, 0) * 7px), 0)",
          transition: "transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        aria-hidden="true"
      >
        {/* レトロ方眼グリッド */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0a171d0a_1px,transparent_1px),linear-gradient(to_bottom,#0a171d0a_1px,transparent_1px)] bg-[size:44px_44px]" />
        {/* レトロテクニカル表記 */}
        <div className="absolute top-1 left-2 font-[family-name:var(--mono)] text-[9px] tracking-[0.14em] text-[#0a171d]/35">
          DESKTOP_ENV // FULL_WIDTH // 3_LAYERS_DEPTH
        </div>
        <div className="absolute top-1 right-2 font-[family-name:var(--mono)] text-[9px] tracking-[0.14em] text-[#0a171d]/35">
          SYS:ONLINE · BASE_STATION
        </div>
      </div>

      {/* ==================================================== */}
      {/* 3D レイヤーステージ: L2 (中央ターミナル) + L3 (左右の手前ウィンドウ群) */}
      {/* ==================================================== */}
      <div className="relative z-10 min-[1024px]:min-h-[580px] xl:min-h-[620px] min-[1024px]:flex min-[1024px]:items-center min-[1024px]:justify-center">
        {/* ================================================== */}
        {/* L3-Left: ターミナルの「左側」の手前レイヤー (付箋メモ & アイコン) */}
        {/* ================================================== */}
        <div className="hidden min-[1024px]:block min-[1024px]:absolute min-[1024px]:left-0 xl:min-[1024px]:-left-6 min-[1024px]:top-10 min-[1024px]:z-20 min-[1024px]:w-[210px] xl:w-[230px]">
          {/* 左の付箋メモウィンドウ: README.txt (強度: ±11px / 浮遊3: 9.4s) */}
          <div
            style={{
              transform: "translate3d(calc(var(--hero-norm-x, 0) * 11px), calc(var(--hero-norm-y, 0) * 11px), 0)",
              transition: "transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <div className="hero-floating-3">
              <div
                data-hero-window
                data-drag-handle
                role="group"
                tabIndex={0}
                aria-label="README.txt memo. Drag or use arrow keys to move."
                className="-rotate-2 border-2 border-[var(--ink)] bg-[#fffdf7] px-4 pt-6 pb-4 shadow-[6px_6px_0_rgba(10,23,29,0.25)] transition-transform hover:rotate-0"
              >
                <div className="absolute inset-x-0 top-0 flex items-center justify-between border-b border-[#bcc8c9] bg-[var(--surface-alt)] px-2.5 py-1 text-[9px] text-[var(--text-sub)]">
                  <span className="font-[family-name:var(--mono)] font-bold">README.txt</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--red)]" aria-hidden="true" />
                </div>
                <p className="mt-1 font-[family-name:var(--font-pixel)] text-base font-bold tracking-tight text-[var(--red)]">
                  DISPATCH BASE
                </p>
                <p className="mt-1 text-[11px] leading-relaxed text-[#3f5553]">
                  Web開発と自作サーバー。<br />
                  日々の実験と記録。
                </p>
                <span className="mt-2 block font-[family-name:var(--mono)] text-xs text-[var(--red)]">_</span>
              </div>
            </div>
          </div>

          {/* デスクトップフォルダアイコン: ideas/ & archive/ (強度: ±7px) */}
          <div
            className="mt-6 flex flex-col gap-4 pl-4"
            style={{
              transform: "translate3d(calc(var(--hero-norm-x, 0) * 7px), calc(var(--hero-norm-y, 0) * 7px), 0)",
              transition: "transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <div className="flex items-center gap-2 text-xs font-[family-name:var(--mono)] text-[var(--ink)] opacity-85">
              <span className="relative block h-7 w-10 border-2 border-[var(--ink)] bg-[#d8b95c] shadow-[3px_3px_0_rgba(10,23,29,0.2)]">
                <i className="absolute -top-[6px] -left-0.5 block h-[6px] w-4 border-2 border-b-0 border-[var(--ink)] bg-[#d8b95c]" />
              </span>
              <span className="bg-[var(--paper)] px-1 font-bold">ideas/</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-[family-name:var(--mono)] text-[var(--ink)] opacity-85">
              <span className="relative flex h-8 w-8 items-end justify-center gap-0.5 border-2 border-[var(--ink)] bg-[#dce5dd] pb-1 shadow-[3px_3px_0_rgba(10,23,29,0.2)]">
                <i className="absolute -top-[5px] -left-[3px] block h-[5px] w-9 border-2 border-[var(--ink)] bg-[#dce5dd]" />
                <i className="h-4 w-0.5 bg-[var(--ink)] opacity-40" />
                <i className="h-4 w-0.5 bg-[var(--ink)] opacity-40" />
              </span>
              <span className="bg-[var(--paper)] px-1 font-bold">archive/</span>
            </div>
          </div>
        </div>

        {/* ================================================== */}
        {/* L2: メインターミナル (主役: マウス追従 0px / 浮遊なし) */}
        {/* 中央〜やや左寄りにドーンと配置 */}
        {/* ================================================== */}
        <div className="relative z-10 w-full min-[1024px]:w-[66%] xl:w-[62%] min-[1024px]:pr-6">
          <InteractiveTerminal />
        </div>

        {/* ================================================== */}
        {/* L3-Right: ターミナルの「右側」の手前レイヤー (マニフェスト + ステータス + 写真) */}
        {/* ターミナルの右肩に大胆にオーバーラップ！ */}
        {/* ================================================== */}
        <div className="mt-6 flex flex-col gap-5 min-[1024px]:pointer-events-none min-[1024px]:absolute min-[1024px]:top-0 min-[1024px]:right-0 min-[1024px]:mt-0 min-[1024px]:w-[46%] xl:w-[43%] min-[1024px]:z-20">
          {/* 小ウィンドウ 1: マニフェストパネル (強度: ±14px / 浮遊1: 6.5s) */}
          <div
            className="min-[1024px]:pointer-events-auto"
            style={{
              transform: "translate3d(calc(var(--hero-norm-x, 0) * 14px), calc(var(--hero-norm-y, 0) * 14px), 0)",
              transition: "transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <div className="hero-floating-1">
              <div
                className="manifesto-panel border-[3px] border-[var(--ink)] shadow-[8px_8px_0_var(--ink)]"
                data-hero-window
                data-drag-handle
                role="group"
                tabIndex={0}
                aria-label="BUILD TWEAK LEARN REPEAT window. Drag or use arrow keys to move."
              >
                <div className="mb-2 flex items-center justify-between border-b border-[var(--ink)]/20 pb-1.5 font-[family-name:var(--mono)] text-[10px] font-semibold tracking-[0.12em] text-[#354641]">
                  <span>NAGANUMA // BASE_MANIFESTO</span>
                  <span className="flex gap-1.5 text-xs" aria-hidden="true">■ ■</span>
                </div>
                <h1 id="hero-title">
                  <span className="manifesto-desktop-title">
                    BUILD<br />TWEAK<br />LEARN<br />REPEAT.
                  </span>
                  <span className="manifesto-mobile-title" aria-hidden="true">
                    BUILD. TWEAK.<br />LEARN. REPEAT.
                  </span>
                </h1>
                <div className="manifesto-caption">
                  <p>
                    WEB / SERVER / HOMELAB<br />
                    CODE / DESIGN / LIFE
                  </p>
                  <p className="mt-1 text-[10px] text-[#354641] max-[1024px]:hidden">
                    つくって、試して、記録する。
                  </p>
                  <span className="short-rule" aria-hidden="true" />
                </div>
                <p className="mobile-hero-copy">
                  <span>WEB / SERVER / HOMELAB / CODE</span>
                  <span>つくって、試して、記録する。</span>
                </p>
                <div className="mobile-hero-actions">
                  <a href="#about-base">BASE<span aria-hidden="true">↓</span></a>
                  <a href="#projects">PROJECTS<span aria-hidden="true">→</span></a>
                  <Link href="/about">ABOUT <span aria-hidden="true">↗</span></Link>
                </div>
                <span className="manifesto-underscore" aria-hidden="true">_</span>
              </div>
            </div>
          </div>

          {/* 小ウィンドウ 2 & 3: ホームラボステータス ＆ ハードウェア写真 */}
          <div className="grid grid-cols-1 gap-4 min-[640px]:grid-cols-12 min-[1024px]:pointer-events-auto">
            {/* ホームラボステータス (強度: ±18px / 浮遊2: 8.2s) */}
            <div
              className="min-[640px]:col-span-7 xl:col-span-7"
              style={{
                transform: "translate3d(calc(var(--hero-norm-x, 0) * 18px), calc(var(--hero-norm-y, 0) * 18px), 0)",
                transition: "transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              <div className="hero-floating-2 h-full">
                <div data-hero-window className="h-full shadow-[7px_7px_0_var(--ink)]">
                  <HomelabStatus />
                </div>
              </div>
            </div>

            {/* 写真ウィンドウ (強度: ±22px / 浮遊3: 9.4s) */}
            <div
              className="min-[640px]:col-span-5 xl:col-span-5"
              style={{
                transform: "translate3d(calc(var(--hero-norm-x, 0) * 22px), calc(var(--hero-norm-y, 0) * 22px), 0)",
                transition: "transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              <div className="hero-floating-3 h-full">
                <div
                  data-hero-window
                  className="flex h-full flex-col overflow-hidden border-[3px] border-[var(--ink)] bg-[var(--paper)] shadow-[7px_7px_0_var(--ink)]"
                >
                  <div
                    data-drag-handle
                    role="group"
                    tabIndex={0}
                    aria-label="WORKSPACE_SETUP.JPG window. Drag or use arrow keys to move."
                    className="flex items-center justify-between border-b-2 border-[var(--ink)] bg-[var(--surface-alt)] px-2.5 py-1 font-[family-name:var(--mono)] text-[10px] font-bold"
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      <span className="inline-block h-2 w-2 rounded-full bg-[var(--red)]" />
                      BASE_SETUP.JPG
                    </span>
                    <span className="text-[9px] font-normal text-[var(--text-sub)]">16:10</span>
                  </div>
                  <Link
                    href="/about"
                    className="group relative block aspect-[16/10] min-[640px]:flex-1 focus-visible:outline-4 focus-visible:-outline-offset-4 focus-visible:outline-[var(--red)]"
                  >
                    <Image
                      src="/images/workspace-preview.jpg"
                      alt="作業デスクと自宅サーバー環境について見る"
                      fill
                      sizes="(max-width: 1024px) 100vw, 320px"
                      className="object-cover motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--ink)]/80 via-transparent to-transparent opacity-60 transition-opacity group-hover:opacity-40" />
                    <span className="absolute right-1.5 bottom-1.5 flex items-center gap-1 border border-white/40 bg-[var(--ink)] px-2 py-0.5 font-[family-name:var(--mono)] text-[9px] font-bold tracking-[0.08em] text-white shadow-[2px_2px_0_rgba(0,0,0,0.5)] transition-colors group-hover:bg-[var(--red)]">
                      VISIT MY BASE ↗
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================================================== */}
        {/* L4: 前景のアクセント装飾 (最前面 / マウス追従 ±24px〜±20px) */}
        {/* 前バージョンで好評だった斜線オレンジブロック ＆ 赤いアスタリスク */}
        {/* ================================================== */}
        {/* 右上のオレンジ斜線ブロック */}
        <div
          className="pointer-events-none absolute -top-4 right-10 z-30 hidden min-[1024px]:block select-none"
          style={{
            transform: "translate3d(calc(var(--hero-norm-x, 0) * 24px), calc(var(--hero-norm-y, 0) * 24px), 0)",
            transition: "transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
          aria-hidden="true"
        >
          <div className="hero-floating-accent">
            <div className="h-16 w-16 border-[3px] border-[var(--ink)] bg-[repeating-linear-gradient(135deg,var(--orange)_0px,var(--orange)_6px,transparent_6px,transparent_12px)] shadow-[5px_5px_0_var(--ink)]" />
          </div>
        </div>

        {/* 左下の赤いアスタリスク (✳) */}
        <div
          className="pointer-events-none absolute bottom-4 -left-2 z-30 hidden min-[1024px]:block select-none font-bold text-[var(--red)] text-5xl leading-none"
          style={{
            transform: "translate3d(calc(var(--hero-norm-x, 0) * -20px), calc(var(--hero-norm-y, 0) * -20px), 0)",
            transition: "transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
          aria-hidden="true"
        >
          <div className="hero-floating-star">✳</div>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 下端の導線バー: Projects へのリンク */}
      {/* ---------------------------------------------------- */}
      <div className="relative z-10 mt-6 flex flex-wrap items-center justify-between gap-4 border-[3px] border-[var(--ink)] bg-[var(--paper)] p-3.5 font-[family-name:var(--mono)] text-[11px] shadow-[5px_5px_0_var(--ink)]">
        <div className="flex items-center gap-3">
          <span className="h-2 w-2 bg-[var(--aqua)]" />
          <span className="font-bold text-[var(--ink)]">つくって、試して、記録する。</span>
          <span className="text-[var(--text-sub)] max-[640px]:hidden">— 個人開発・ホームラボ・知見ログ</span>
        </div>
        <a
          href="#projects"
          className="inline-flex items-center gap-3 border-2 border-[var(--ink)] bg-[var(--paper)] px-5 py-2 font-bold transition-all hover:bg-[var(--red)] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--red)] active:translate-x-0.5 active:translate-y-0.5"
        >
          EXPLORE PROJECTS <span aria-hidden="true">↓</span>
        </a>
      </div>
    </section>
  );
}
