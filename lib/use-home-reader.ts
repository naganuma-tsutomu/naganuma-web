"use client";

import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { readWorkspaceLayout } from "./workspace-layout";
import { READER_LAYOUT_EVENT } from "./reading-viewport";
import { homeSections, type HomeSection } from "./home-sections";

type Bookmark = { section: HomeSection; offset: number; atEnd?: boolean };
const positionKey = "naganumaHomePosition";

export function useHomeReader() {
  const rootRef = useRef<HTMLDivElement>(null);
  const readerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [split, setSplit] = useState(false);
  const [active, setActive] = useState<HomeSection>("top");

  useEffect(() => {
    const root = rootRef.current!;
    const reader = readerRef.current!;
    const content = contentRef.current!;
    const header = document.querySelector<HTMLElement>(".site-header");
    let divided = false;
    let initialized = false;
    let current: HomeSection = "top";
    let frame = 0;
    let resizeFrame = 0;
    let bookmark: Bookmark = { section: "top", offset: 0 };
    let pendingHash: string | null = null;
    let observedHash = window.location.hash;
    let lastWidth = 0;
    let lastHeight = 0;
    const sections = () => Array.from(content.querySelectorAll<HTMLElement>("[data-guide-section]"));
    const viewportTop = () => divided ? reader.getBoundingClientRect().top : header?.getBoundingClientRect().bottom ?? 80;
    const viewportHeight = () => divided ? reader.clientHeight : window.innerHeight - viewportTop();
    const sectionTop = (element: HTMLElement) => element.getBoundingClientRect().top - viewportTop();
    const remainingScroll = () => {
      const scroller = divided ? reader : document.documentElement;
      return scroller.scrollHeight - scroller.clientHeight - scroller.scrollTop;
    };
    const atEnd = () => remainingScroll() <= 2 && (divided ? reader.scrollTop : window.scrollY) > 0;
    const save = () => {
      const nodes = sections();
      const section = nodes.find(element => element.dataset.guideSection === current) ?? nodes[0];
      if (section) bookmark = { section: section.dataset.guideSection as HomeSection, offset: -sectionTop(section), atEnd: current === homeSections.at(-1)?.id && atEnd() };
      // Keep the entry's reading position without adding history entries or changing its hash.
      if (!root.closest("[inert]") && observedHash === window.location.hash) window.history.replaceState({ ...window.history.state, [positionKey]: { ...bookmark, hash: window.location.hash } }, "");
    };
    const update = () => {
      frame = 0;
      if (!initialized || root.closest("[inert]") || window.location.pathname !== "/") return;
      const nodes = sections();
      const line = viewportHeight() * 0.3;
      // A short final section may never reach the usual reading line before scrolling ends.
      const next = (atEnd() ? nodes.at(-1) : nodes.filter(element => sectionTop(element) <= line - 32).at(-1))?.dataset.guideSection as HomeSection | undefined ?? "top";
      const currentNode = nodes.find(element => element.dataset.guideSection === current);
      const keepEnd = current === homeSections.at(-1)?.id && remainingScroll() < 64;
      if (next !== current && !keepEnd && (homeSections.findIndex(item => item.id === next) > homeSections.findIndex(item => item.id === current) || !currentNode || sectionTop(currentNode) > line + 32)) {
        current = next;
        setActive(next);
      }
      save();
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const restore = (position: Bookmark) => {
      if (position.atEnd === true) {
        if (divided) reader.scrollTo({ top: reader.scrollHeight, behavior: "instant" });
        else window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" });
        return;
      }
      const target = sections().find(element => element.dataset.guideSection === position.section);
      if (!target) return;
      const offset = Math.min(Math.max(position.offset, -viewportHeight()), Math.max(0, target.offsetHeight - 32));
      const delta = sectionTop(target) + offset;
      if (divided) reader.scrollTo({ top: reader.scrollTop + delta, behavior: "instant" });
      else window.scrollTo({ top: window.scrollY + delta, behavior: "instant" });
    };
    const fromHistory = (): Bookmark | null => {
      const value = window.history.state?.[positionKey];
      return value && value.hash === window.location.hash && homeSections.some(item => item.id === value.section) && Number.isFinite(value.offset) ? value : null;
    };
    const navigate = (hash: string, instant = false) => {
      let id: string;
      try { id = decodeURIComponent(hash.replace(/^#/, "")); } catch { return false; }
      const target = id === "main-content" ? reader : id === "homelab" && divided ? document.querySelector<HTMLElement>("[data-desktop-status]") : document.getElementById(id);
      if (!target || (!root.contains(target) && !(id === "homelab" && divided))) return false;
      if (divided && !reader.contains(target)) {
        target.focus({ preventScroll: true });
      } else {
        const delta = sectionTop(target) - 20;
        const behavior = instant || window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth";
        if (divided) reader.scrollTo({ top: reader.scrollTop + delta, behavior });
        else window.scrollTo({ top: window.scrollY + delta, behavior });
      }
      schedule();
      return true;
    };
    const resize = () => {
      resizeFrame = 0;
      if (root.closest("[inert]")) { resizeFrame = requestAnimationFrame(resize); return; }
      const { ready, split: next, height: available } = readWorkspaceLayout();
      if (!ready) return;
      const changed = next !== divided;
      const resized = lastWidth !== window.innerWidth || lastHeight !== available;
      lastWidth = window.innerWidth;
      lastHeight = available;
      const initial = !initialized;
      initialized = true;
      const saved = initial ? fromHistory() : bookmark;
      divided = next;
      flushSync(() => setSplit(next));
      if (initial || changed || resized) {
        if (divided) window.scrollTo({ top: 0, behavior: "instant" });
        if (saved) restore(saved);
        else if (window.location.hash) pendingHash = window.location.hash;
      }
      if (pendingHash && navigate(pendingHash, true)) pendingHash = null;
      update();
    };
    const scheduleResize = () => { if (!resizeFrame) resizeFrame = requestAnimationFrame(resize); };
    const click = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey || !(event.target instanceof Element)) return;
      const link = event.target.closest<HTMLAnchorElement>("a[href]");
      if (!link || link.hasAttribute("download") || (link.target && link.target !== "_self")) return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== location.origin || url.pathname !== "/" || !url.hash) return;
      if (!navigate(url.hash)) return;
      event.preventDefault();
      const state = { ...window.history.state };
      delete state[positionKey];
      if (location.hash !== url.hash) window.history.pushState(state, "", url.hash);
      observedHash = window.location.hash;
      // The skip link must also move keyboard focus into the actual reading region.
      if (link.classList.contains("skip-link")) reader.focus({ preventScroll: true });
    };
    const history = () => {
      const saved = fromHistory();
      if (saved) restore(saved);
      else if (location.hash) navigate(location.hash, true);
      else restore({ section: "top", offset: 0 });
      observedHash = window.location.hash;
      schedule();
    };
    const transitionAnchor = (event: Event) => {
      if (!initialized || root.closest("[inert]")) {
        pendingHash = (event as CustomEvent<string>).detail;
        scheduleResize();
        event.preventDefault();
        return;
      }
      if (navigate((event as CustomEvent<string>).detail)) event.preventDefault();
    };
    const observer = new ResizeObserver(scheduleResize);
    observer.observe(content);
    if (header) observer.observe(header);
    document.addEventListener(READER_LAYOUT_EVENT, resize);
    window.addEventListener("resize", scheduleResize);
    window.addEventListener("scroll", schedule, { passive: true });
    reader.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("popstate", history);
    window.addEventListener("hashchange", history);
    document.addEventListener("click", click);
    document.addEventListener("naganuma:home-anchor", transitionAnchor);
    scheduleResize();
    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(resizeFrame);
      observer.disconnect();
      document.removeEventListener(READER_LAYOUT_EVENT, resize);
      window.removeEventListener("resize", scheduleResize);
      window.removeEventListener("scroll", schedule);
      reader.removeEventListener("scroll", schedule);
      window.removeEventListener("popstate", history);
      window.removeEventListener("hashchange", history);
      document.removeEventListener("click", click);
      document.removeEventListener("naganuma:home-anchor", transitionAnchor);
    };
  }, []);

  return { rootRef, readerRef, contentRef, split, active };
}
