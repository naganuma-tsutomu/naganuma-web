"use client";

import { useMemo, type RefObject } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import InteractiveTerminal, { type TerminalGuide } from "./InteractiveTerminal";
import HomelabStatus from "./HomelabStatus";
import { useWorkspace } from "./WorkspaceContext";
import { homeSections } from "@/lib/home-sections";
import { socialLinks } from "@/app/data/contact";
import { baseProfileSummary } from "@/app/data/about-base";

const paths = { top: "/", about: "/about", projects: "/projects", notes: "/notes" };

export default function PersistentSidebar({ statusRef }: { statusRef: RefObject<HTMLDivElement | null> }) {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const route = pathname + (search ? `?${search}` : "");
  const { layout, publication, homeSection } = useWorkspace();
  const matching = publication?.route === route ? publication : null;
  const selected = matching?.guide.id === "not-found" ? null : pathname === "/" ? homeSection : pathname === "/about" ? "about" : pathname === "/projects" || pathname.startsWith("/projects/") ? "projects" : pathname === "/notes" ? "notes" : null;
  const fallback = useMemo<TerminalGuide>(() => ({
    id: `page:${route}`,
    command: pathname === "/about" ? "whoami" : pathname === "/projects" ? "ls projects/" : pathname === "/notes" ? "ls notes/" : pathname === "/" ? "ls" : "pwd",
    output: <div className="space-y-3 py-2 text-xs leading-[1.8]">
      <p data-command-row className="text-[var(--aqua)] [overflow-wrap:anywhere]">{pathname === "/about" ? baseProfileSummary.name : pathname === "/" ? "Personal workspace" : pathname}</p>
      {pathname === "/about" && <p data-command-row>{baseProfileSummary.role}<br />{baseProfileSummary.focus}</p>}
      {pathname === "/contact" && socialLinks.map(link => <a key={link.url} data-command-row href={link.url} target="_blank" rel="noopener noreferrer" className="block text-[var(--aqua)] underline underline-offset-4">{link.name} ↗</a>)}
      <Link href={pathname.startsWith("/projects/") ? "/projects" : "/"} className="block text-[var(--aqua)] underline underline-offset-4">{pathname.startsWith("/projects/") ? "制作実績の一覧へ ↗" : "HOMEへ ↗"}</Link>
    </div>,
  }), [pathname, route]);
  return (
    <aside aria-label="スクロール連動ターミナル" className={`${layout.split ? "block" : "hidden"} min-w-0 print:hidden`}>
      <div data-terminal-sidebar>
        <div className="relative">
          <div className="grid gap-4 [&_.terminal-panel]:h-[calc(var(--workspace-height)-var(--workspace-status-height)-16px)]">
            <InteractiveTerminal guide={matching?.guide ?? fallback} projectOutput={matching?.projectOutput} noteOutput={matching?.noteOutput} enabled={layout.split} followScroll compact navigation={
              <nav aria-label={pathname === "/" ? "ターミナルのセクション" : "ターミナルのページ切替"} className="grid shrink-0 grid-cols-4 gap-1 border border-b-0 border-[var(--border)] bg-[#101f24] p-2 font-[family-name:var(--mono)] text-[10px] font-bold">
                {homeSections.map(({ id, target, label }) => <Link key={id} href={pathname === "/" ? `#${target}` : paths[id]} title={pathname === "/" ? `${label}：ページ内へ移動` : `${label}：ページを開く`} aria-current={selected === id ? pathname === "/" ? "location" : "page" : undefined} className={`flex min-h-10 min-w-0 items-center justify-center rounded-md border px-1 no-underline transition-colors duration-150 focus-visible:outline-[var(--aqua)] focus-visible:outline-offset-2 motion-reduce:transition-none ${selected === id ? "border-[var(--red)] bg-[var(--red)] text-white shadow-[inset_0_0_0_2px_#101f24]" : "border-transparent text-[#b9c7c9] hover:border-[#537175] hover:bg-[#1c3037] hover:text-white"}`}>{label}</Link>)}
              </nav>
            } />
            <div ref={statusRef} data-desktop-status tabIndex={-1} aria-label="ホームラボの稼働状態" className="focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--red)]"><HomelabStatus /></div>
          </div>
        </div>
      </div>
    </aside>
  );
}
