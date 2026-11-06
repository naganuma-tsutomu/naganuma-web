"use client";

import { useEffect, useMemo, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { baseProfileSummary } from "@/app/data/about-base";
import { homeSections } from "@/lib/home-sections";
import { useHomeReader } from "@/lib/use-home-reader";
import type { TerminalGuide } from "./InteractiveTerminal";
import { useWorkspace } from "./WorkspaceContext";
import { contentWindowFrame, contentWindowTitle } from "./contentWindowStyles";

export default function HomeWorkspace({ children, projectOutput, noteOutput }: { children: ReactNode; projectOutput: ReactNode; noteOutput: ReactNode }) {
  const { rootRef, readerRef, contentRef, split, active } = useHomeReader();
  const query = useSearchParams().toString();
  const { publish, setHomeSection } = useWorkspace();
  const selected = homeSections.find(section => section.id === active)!;
  const guide = useMemo<TerminalGuide>(() => ({
    id: active,
    command: selected.command,
    output: active === "projects" ? projectOutput : active === "notes" ? noteOutput : active === "top" ? (
      <ul className="m-0 list-none space-y-3 py-2 pl-0 text-sm">
        {homeSections.slice(1).map(section => <li key={section.id} data-command-row><a className="text-[var(--aqua)] underline underline-offset-4" href={`#${section.target}`}>{section.id}/ <span aria-hidden="true">↓</span></a></li>)}
      </ul>
    ) : (
      <div className="space-y-4 text-xs leading-[1.8]">
        <p data-command-row className="text-[var(--aqua)]">{baseProfileSummary.name}</p>
        <dl className="m-0 space-y-2">
          <div data-command-row><dt className="text-[#a5b6b9]">ROLE</dt><dd className="m-0">{baseProfileSummary.role}</dd></div>
          <div data-command-row><dt className="text-[#a5b6b9]">FOCUS</dt><dd className="m-0">{baseProfileSummary.focus}</dd></div>
        </dl>
        <a href="#about-base" className="inline-block text-[var(--aqua)] underline underline-offset-4">本文の自己紹介へ ↓</a>
        <Link href="/about" className="block text-[var(--aqua)] underline underline-offset-4">プロフィールを開く ↗</Link>
      </div>
    ),
  }), [active, selected.command, projectOutput, noteOutput]);

  useEffect(() => {
    publish({ route: "/" + (query ? `?${query}` : ""), guide, projectOutput, noteOutput });
    setHomeSection(active);
  }, [guide, projectOutput, noteOutput, active, publish, setHomeSection, query]);

  return (
    <div ref={rootRef} data-home-window data-layout={split ? "window" : "flow"}>
      <section aria-label="本文ウィンドウ" className={`${contentWindowFrame} ${split ? "h-[var(--workspace-height)]" : ""}`}>
        <div className={contentWindowTitle}>
          <span>HOME — naganuma-web</span><span className="ml-auto text-[var(--red)]" data-reader-title>{selected.label}</span>
          <span className="ml-1 flex gap-[6px] [&_i]:h-[9px] [&_i]:w-[9px] [&_i]:rounded-full [&_i]:border [&_i]:border-current" aria-hidden="true"><i /><i /><i /></span>
        </div>
        <div ref={readerRef} data-home-reader data-scroll={split ? "internal" : "document"} role="region" aria-label="サイトの本文" tabIndex={0} className={`relative min-h-0 bg-[var(--paper)] text-base leading-[1.9] [scrollbar-color:#537175_#e9e4d8] [scrollbar-width:thin] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--red)] ${split ? "flex-1 overflow-y-auto overscroll-contain" : ""} print:h-auto! print:overflow-visible!`}>
          <div ref={contentRef} className="@container/reader px-4 pt-4 pb-1 min-[600px]:px-6 print:p-0">{children}</div>
        </div>
      </section>
    </div>
  );
}
