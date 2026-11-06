"use client";

import { usePathname, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import { links } from "@/app/data/links";
import { usePageReader } from "@/lib/use-page-reader";
import HomelabStatus from "./HomelabStatus";
import { contentWindowFrame, contentWindowTitle } from "./contentWindowStyles";

function RouteWindow({ route, title, children, footer }: { route: string; title: string; children: ReactNode; footer: ReactNode }) {
  const { rootRef, readerRef, contentRef, fixed } = usePageReader(route);
  return (
    <div ref={rootRef} data-page-window data-layout={fixed ? "window" : "flow"} className="w-full min-w-0">
      <noscript><style>{"[data-page-window] .project-card { opacity: 1 !important; translate: none !important; transform: none !important; } [data-page-window] .project-card img { opacity: 1 !important; } [data-page-window] [data-project-image-loading] { display: none !important; }"}</style></noscript>
      <section aria-label={`${title}の本文ウィンドウ`} className={`${contentWindowFrame} ${fixed ? "h-[var(--page-window-height)]" : ""}`}>
        <div className={contentWindowTitle}>
          <span>{title} — naganuma-web</span>
          <span className="ml-auto flex gap-[6px] [&_i]:h-[9px] [&_i]:w-[9px] [&_i]:rounded-full [&_i]:border [&_i]:border-current" aria-hidden="true"><i /><i /><i /></span>
        </div>
        <div ref={readerRef} data-page-reader data-scroll={fixed ? "internal" : "document"} role="region" aria-label="ページの本文" tabIndex={0} className={`relative min-h-0 bg-[var(--paper)] [scrollbar-color:#537175_#e9e4d8] [scrollbar-width:thin] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--red)] ${fixed ? "flex-1 overflow-y-auto overscroll-contain scroll-pt-5" : ""} print:h-auto! print:overflow-visible!`}>
          <div className="@container/reader"><div ref={contentRef}>{children}<div id="homelab" data-mobile-status className="site-shell mt-10 [[data-layout=split]_&]:hidden print:hidden" tabIndex={-1} aria-label="ホームラボの稼働状態"><HomelabStatus /></div>{footer}</div></div>
        </div>
      </section>
    </div>
  );
}

export default function PageWindow({ children, footer }: { children: ReactNode; footer: ReactNode }) {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  if (pathname === "/") return children;
  const route = pathname + (search ? `?${search}` : "");
  const title = links.find(link => pathname === link.href || (link.href !== "/" && pathname.startsWith(`${link.href}/`)))?.name ?? "PAGE";
  return <RouteWindow key={route} route={route} title={title} footer={footer}>{children}</RouteWindow>;
}
