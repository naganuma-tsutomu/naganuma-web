"use client";

import { useEffect, useRef, type PointerEvent, type KeyboardEvent } from "react";
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
      className="hero-grid site-shell"
      style={{ paddingTop: PANEL_TOP_GAP }}
      aria-labelledby="hero-title"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={(event) => endDrag(event.pointerId)}
      onPointerCancel={(event) => endDrag(event.pointerId)}
      onLostPointerCapture={(event) => endDrag(event.pointerId)}
      onKeyDown={handleKeyDown}
    >
      <InteractiveTerminal />
      <div className="manifesto-panel" data-hero-window data-drag-handle role="group" tabIndex={0} aria-label="BUILD TWEAK LEARN REPEAT window. Drag or use arrow keys to move.">
        <h1 id="hero-title">BUILD<br />TWEAK<br />LEARN<br />REPEAT.</h1>
        <div className="manifesto-caption">
          <p>WEB / SERVER / HOMELAB<br />CODE / DESIGN / LIFE</p>
          <span className="short-rule" aria-hidden="true" />
        </div>
        <span className="manifesto-underscore" aria-hidden="true">_</span>
      </div>
      <HomelabStatus configured={homelabConfigured} />
    </section>
  );
}
