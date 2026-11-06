"use client";

import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { readWorkspaceLayout } from "./workspace-layout";
import { READER_ANCHOR_EVENT, READER_LAYOUT_EVENT } from "./reading-viewport";

type Position = { route: string; hash: string; id: string | null; offset: number; atEnd: boolean };
const positionKey = "naganumaPagePosition";
const locationKey = () => window.location.pathname + (window.location.search ? `?${new URLSearchParams(window.location.search)}` : "");

export function usePageReader(route: string) {
  const rootRef = useRef<HTMLDivElement>(null);
  const readerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState({ fixed: false, height: 700 });

  useEffect(() => {
    const root = rootRef.current!;
    const reader = readerRef.current!;
    const content = contentRef.current!;
    const header = document.querySelector<HTMLElement>(".site-header");
    let fixed = false;
    let initialized = false;
    let observedHash = window.location.hash;
    let bookmark: Position | null = null;
    let pending: Position | null = null;
    let pendingHash = window.location.hash;
    let scrollTarget: HTMLElement | Window | null = null;
    let scrollFrame = 0;
    let resizeFrame = 0;
    let lastWidth = 0;
    let lastHeight = 0;

    const origin = () => fixed ? reader.getBoundingClientRect().top : header?.getBoundingClientRect().bottom ?? 80;
    // Bookmark layout positions, so a card's entrance/hover translation cannot shift restoration.
    const layoutTop = (element: HTMLElement) => {
      let top = 0;
      let node: HTMLElement | null = element;
      while (node && node !== reader) {
        top += node.offsetTop;
        node = node.offsetParent as HTMLElement | null;
      }
      return reader.getBoundingClientRect().top + top - reader.scrollTop;
    };
    const fromHistory = (): Position | null => {
      const value = window.history.state?.[positionKey];
      return value && value.route === route && value.hash === window.location.hash && (value.id === null || typeof value.id === "string") && Number.isFinite(value.offset) ? value : null;
    };
    const save = () => {
      scrollFrame = 0;
      if (!initialized || pending || pendingHash || root.closest("[inert]") || locationKey() !== route || observedHash !== window.location.hash) return;
      const candidates = Array.from(content.querySelectorAll<HTMLElement>("[id], h1")).filter(element => element.offsetHeight > 0);
      // Keep the first card in a row as its anchor when columns collapse on a narrow screen.
      const anchor = candidates.filter(element => layoutTop(element) <= origin() + 1).sort((left, right) => layoutTop(right) - layoutTop(left))[0] ?? content.querySelector<HTMLElement>("h1") ?? content;
      const scroller = fixed ? reader : document.documentElement;
      bookmark = { route, hash: window.location.hash, id: anchor.id || null, offset: origin() - layoutTop(anchor), atEnd: scroller.scrollTop > 0 && scroller.scrollHeight - scroller.clientHeight - scroller.scrollTop <= 2 };
      window.history.replaceState({ ...window.history.state, [positionKey]: bookmark }, "");
    };
    const scheduleSave = () => { if (!scrollFrame) scrollFrame = requestAnimationFrame(save); };
    const move = (top: number) => {
      if (fixed) reader.scrollTo({ top, behavior: "instant" });
      else window.scrollTo({ top, behavior: "instant" });
    };
    const restore = (position: Position) => {
      const anchor = position.id ? document.getElementById(position.id) : content.querySelector<HTMLElement>("h1") ?? content;
      if (!anchor || !content.contains(anchor)) return false;
      if (position.atEnd === true) move(fixed ? reader.scrollHeight : document.documentElement.scrollHeight);
      else move((fixed ? reader.scrollTop : window.scrollY) + layoutTop(anchor) - origin() + position.offset);
      return true;
    };
    const navigate = (hash: string, instant = false) => {
      let id: string;
      try { id = decodeURIComponent(hash.slice(1)); } catch { return false; }
      const target = id === "main-content" ? reader : id === "homelab" && fixed ? document.querySelector<HTMLElement>("[data-desktop-status]") : document.getElementById(id);
      if (!target || (!root.contains(target) && !(id === "homelab" && fixed))) return false;
      if (id === "homelab" && fixed) { target.focus({ preventScroll: true }); return true; }
      if (target === reader) move(0);
      else target.scrollIntoView({ block: "start", behavior: instant || window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
      scheduleSave();
      return true;
    };
    const settlePosition = () => {
      if (pending && restore(pending)) pending = null;
      if (!pending && pendingHash && navigate(pendingHash, true)) pendingHash = "";
      scheduleSave();
    };
    const resize = () => {
      resizeFrame = 0;
      if (root.closest("[inert]")) { resizeFrame = requestAnimationFrame(resize); return; }
      const { ready, split: next, height } = readWorkspaceLayout();
      if (!ready) return;
      const resized = lastWidth !== window.innerWidth || lastHeight !== height;
      const changed = next !== fixed;
      const initial = !initialized;
      const saved = initial ? fromHistory() : bookmark;
      fixed = next;
      lastWidth = window.innerWidth;
      lastHeight = height;
      flushSync(() => setLayout(previous => previous.fixed === next && previous.height === height ? previous : { fixed: next, height }));
      const nextTarget = fixed ? reader : window;
      if (scrollTarget !== nextTarget) {
        scrollTarget?.removeEventListener("scroll", scheduleSave);
        scrollTarget = nextTarget;
        scrollTarget.addEventListener("scroll", scheduleSave, { passive: true });
      }
      initialized = true;
      if (initial || changed || resized) {
        if (fixed) window.scrollTo({ top: 0, behavior: "instant" });
        if (saved) { pending = saved; pendingHash = ""; }
        else if (initial && !pendingHash) move(0);
      }
      if (initial || changed) requestAnimationFrame(() => document.dispatchEvent(new Event(READER_LAYOUT_EVENT)));
      settlePosition();
    };
    const scheduleResize = () => { if (!resizeFrame) resizeFrame = requestAnimationFrame(resize); };
    const history = () => {
      if (locationKey() !== route) return;
      observedHash = window.location.hash;
      pending = fromHistory();
      pendingHash = pending ? "" : window.location.hash;
      if (!pending && !pendingHash) move(0);
      settlePosition();
    };
    const click = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || !(event.target instanceof Element)) return;
      const link = event.target.closest<HTMLAnchorElement>("a[href]");
      if (!link || link.hasAttribute("download") || (link.target && link.target !== "_self")) return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== location.origin || url.pathname !== location.pathname || url.search !== location.search || !url.hash) return;
      save();
      if (!navigate(url.hash)) return;
      event.preventDefault();
      const state = { ...window.history.state };
      delete state[positionKey];
      if (location.hash !== url.hash) window.history.pushState(state, "", url.hash);
      observedHash = location.hash;
      if (link.classList.contains("skip-link")) reader.focus({ preventScroll: true });
      scheduleSave();
    };
    const anchor = (event: Event) => {
      if (!initialized || root.closest("[inert]")) {
        observedHash = location.hash;
        pending = null;
        pendingHash = (event as CustomEvent<string>).detail;
        scheduleResize();
        event.preventDefault();
        return;
      }
      if (!navigate((event as CustomEvent<string>).detail)) return;
      observedHash = location.hash;
      pending = null;
      pendingHash = "";
      event.preventDefault();
    };
    const observer = new ResizeObserver(scheduleResize);
    observer.observe(content);
    if (header) observer.observe(header);
    window.addEventListener("resize", scheduleResize);
    document.addEventListener(READER_LAYOUT_EVENT, resize);
    window.addEventListener("popstate", history);
    window.addEventListener("hashchange", history);
    document.addEventListener("click", click);
    document.addEventListener(READER_ANCHOR_EVENT, anchor);
    document.addEventListener("naganuma:home-anchor", anchor);
    scheduleResize();
    return () => {
      cancelAnimationFrame(scrollFrame);
      cancelAnimationFrame(resizeFrame);
      observer.disconnect();
      scrollTarget?.removeEventListener("scroll", scheduleSave);
      window.removeEventListener("resize", scheduleResize);
      document.removeEventListener(READER_LAYOUT_EVENT, resize);
      window.removeEventListener("popstate", history);
      window.removeEventListener("hashchange", history);
      document.removeEventListener("click", click);
      document.removeEventListener(READER_ANCHOR_EVENT, anchor);
      document.removeEventListener("naganuma:home-anchor", anchor);
    };
  }, [route]);

  return { rootRef, readerRef, contentRef, ...layout };
}
