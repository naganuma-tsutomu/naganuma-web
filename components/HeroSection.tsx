"use client";

import { useEffect, useRef, type PointerEvent, type KeyboardEvent } from "react";
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

export default function HeroSection({ homelabConfigured }: { homelabConfigured: boolean }) {
  const sectionRef = useRef<HTMLElement>(null);
  const positions = useRef(new Map<HTMLElement, Position>());
  const activeDrag = useRef<Drag | null>(null);
  const front = useRef(0);

  function positionPanel(panel: HTMLElement, requestedX: number, requestedY: number) {
    const current = positions.current.get(panel) ?? { x: 0, y: 0 };
    const rect = panel.getBoundingClientRect();
    const baseLeft = rect.left - current.x;
    const baseTop = rect.top - current.y;
    const visibleWidth = Math.min(120, rect.width);
    const desktopInfoBottom = document.querySelector(".desktop-info")?.getBoundingClientRect().bottom;
    const headerBottom = document.querySelector(".site-header")?.getBoundingClientRect().bottom ?? 0;
    const barrierBottom = typeof desktopInfoBottom === "number" ? Math.max(headerBottom, desktopInfoBottom) : headerBottom;
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
    // The orange panel has no titlebar. On touch, its heading is the handle so the rest can scroll.
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
      className="hero-grid site-shell pt-[22px]"
      aria-labelledby="hero-title"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={(event) => endDrag(event.pointerId)}
      onPointerCancel={(event) => endDrag(event.pointerId)}
      onLostPointerCapture={(event) => endDrag(event.pointerId)}
      onKeyDown={handleKeyDown}
    >
      <div className="pointer-events-none absolute inset-x-0 top-[22px] bottom-0 -z-10 grid grid-cols-[1.26fr_1fr] grid-rows-[290px_226px] gap-[18px] overflow-hidden font-[family-name:var(--mono)] text-[11px] leading-[1.4] tracking-[.04em] min-[1600px]:grid-rows-[316px_236px] max-[1200px]:grid-cols-[1.2fr_1fr] max-[1024px]:grid-cols-2 max-[1024px]:grid-rows-[295px_minmax(490px,auto)] max-[768px]:hidden" aria-hidden="true">
        <div className="row-span-2 flex w-[92px] flex-col items-center self-center justify-self-center gap-[9px] text-center text-[#3f5553] max-[1024px]:col-span-2 max-[1024px]:row-start-2 max-[1024px]:row-span-1">
          <span className="relative block h-10 w-[58px] border-2 border-[var(--ink)] bg-[#d8b95c] shadow-[4px_4px_0_rgb(10_23_29_/_16%)]">
            <i className="absolute -top-[9px] -left-0.5 block h-[10px] w-[27px] border-2 border-b-0 border-[var(--ink)] bg-[#d8b95c]" />
            <i className="absolute right-[7px] bottom-[7px] block h-0.5 w-4 bg-[var(--ink)] opacity-55" />
          </span>
          <span>ideas/</span>
        </div>
        <div className="relative col-start-2 row-start-1 w-[min(270px,72%)] self-center justify-self-center -rotate-[1.4deg] border-2 border-[var(--ink)] bg-[#fffdf7] px-6 pt-[30px] pb-[23px] shadow-[6px_6px_0_rgb(10_23_29_/_13%)] max-[1024px]:col-start-1 max-[1024px]:w-[min(250px,72%)]">
          <i className="absolute top-5 right-[18px] block h-[7px] w-[7px] bg-[var(--red)]" />
          <span className="absolute inset-x-0 top-0 border-b border-[#aeb7ad] px-[9px] py-1.5 text-[9px] text-[#526963]">README.txt</span>
          <p className="mt-[5px] mb-1 font-[family-name:var(--font-pixel)] text-[21px] leading-none font-bold tracking-[-.05em] text-[var(--red)]">YOU FOUND IT.</p>
          <small className="text-[10px] text-[#3f5553]">窓の下にも、まだ何かある。</small>
          <span className="mt-[7px] block text-lg leading-[.5] text-[var(--red)]">_</span>
        </div>
        <div className="col-start-2 row-start-2 flex w-[92px] flex-col items-center self-center justify-self-center gap-[9px] text-center text-[#3f5553] max-[1024px]:row-start-1">
          <span className="relative flex h-[47px] w-[42px] items-end justify-center gap-1 border-2 border-[var(--ink)] bg-[#dce5dd] pb-2 shadow-[4px_4px_0_rgb(10_23_29_/_13%)]">
            <i className="absolute -top-[7px] -left-[5px] block h-[7px] w-12 border-2 border-[var(--ink)] bg-[#dce5dd]" />
            <i className="h-[25px] w-0.5 bg-[var(--ink)] opacity-40" />
            <i className="h-[25px] w-0.5 bg-[var(--ink)] opacity-40" />
            <i className="h-[25px] w-0.5 bg-[var(--ink)] opacity-40" />
          </span>
          <span>archive/</span>
        </div>
      </div>
      <InteractiveTerminal />
      <div className="manifesto-panel" data-hero-window data-drag-handle role="group" tabIndex={0} aria-label="BUILD TWEAK LEARN REPEAT window. Drag or use arrow keys to move.">
        <span className="mobile-hero-eyebrow">NAGANUMA / PERSONAL WORKSPACE</span>
        <h1 id="hero-title"><span className="manifesto-desktop-title">BUILD<br />TWEAK<br />LEARN<br />REPEAT.</span><span className="manifesto-mobile-title" aria-hidden="true">BUILD. TWEAK.<br />LEARN. REPEAT.</span></h1>
        <div className="manifesto-caption">
          <p>WEB / SERVER / HOMELAB<br />CODE / DESIGN / LIFE</p>
          <span className="short-rule" aria-hidden="true" />
        </div>
        <p className="mobile-hero-copy"><span>WEB / SERVER / HOMELAB/ CODE</span><span>つくって、試して、記録する。</span></p>
        <div className="mobile-hero-actions">
          <a href="#projects">PROJECTS<span aria-hidden="true">→</span></a>
          <Link href="/about">ABOUT <span aria-hidden="true">↗</span></Link>
        </div>
        <span className="manifesto-underscore" aria-hidden="true">_</span>
      </div>
      <HomelabStatus configured={homelabConfigured} />
    </section>
  );
}
