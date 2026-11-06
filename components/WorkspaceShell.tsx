"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { WorkspaceContext, type WorkspaceLayout, type WorkspacePublication } from "./WorkspaceContext";
import PersistentSidebar from "./PersistentSidebar";
import PageTransition from "./PageTransition";
import PageWindow from "./PageWindow";
import { READER_LAYOUT_EVENT } from "@/lib/reading-viewport";
import type { HomeSection } from "@/lib/home-sections";

export default function WorkspaceShell({ children, footer }: { children: ReactNode; footer: ReactNode }) {
  const statusRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<WorkspaceLayout>({ ready: false, split: false, height: 700, statusHeight: 222 });
  const [publication, setPublication] = useState<WorkspacePublication | null>(null);
  const [homeSection, setHomeSection] = useState<HomeSection>("top");
  const publish = useCallback((value: WorkspacePublication) => setPublication(value), []);

  useEffect(() => {
    let frame = 0;
    let measuredStatusHeight = 222;
    const measure = () => {
      frame = 0;
      const height = window.innerHeight - (document.querySelector<HTMLElement>(".site-header")?.offsetHeight ?? 80) - 48;
      measuredStatusHeight = statusRef.current?.offsetHeight || measuredStatusHeight;
      const split = window.innerWidth >= 960 && window.innerHeight >= 680 && height - 54 >= 450 && height >= measuredStatusHeight + 360;
      flushSync(() => setLayout(previous => previous.ready && previous.split === split && previous.height === height && previous.statusHeight === measuredStatusHeight ? previous : { ready: true, split, height, statusHeight: measuredStatusHeight }));
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(measure); };
    const observer = new ResizeObserver(schedule);
    const header = document.querySelector(".site-header");
    if (header) observer.observe(header);
    if (statusRef.current) observer.observe(statusRef.current);
    window.addEventListener("resize", schedule);
    schedule();
    return () => { cancelAnimationFrame(frame); observer.disconnect(); window.removeEventListener("resize", schedule); };
  }, []);

  useLayoutEffect(() => {
    queueMicrotask(() => document.dispatchEvent(new Event(READER_LAYOUT_EVENT)));
  }, [layout]);

  const value = useMemo(() => ({ layout, publication, publish, homeSection, setHomeSection }), [layout, publication, publish, homeSection]);
  return (
    <WorkspaceContext.Provider value={value}>
      <div data-workspace data-ready={layout.ready} data-layout={layout.split ? "split" : "flow"} data-height={layout.height} data-status-height={layout.statusHeight} data-active-section={homeSection} style={{ "--workspace-height": `${layout.height}px`, "--page-window-height": `${layout.height}px`, "--workspace-status-height": `${layout.statusHeight}px` } as CSSProperties} className="grid w-full items-start gap-8 px-4 py-6 min-[960px]:px-6 xl:px-8 data-[layout=split]:grid-cols-[minmax(0,1fr)_440px] print:block print:bg-none print:p-0">
        <PageTransition><PageWindow footer={footer}>{children}</PageWindow></PageTransition>
        <PersistentSidebar statusRef={statusRef} />
      </div>
    </WorkspaceContext.Provider>
  );
}
