"use client";

import { createContext, useContext, useEffect, type ReactNode } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import type { TerminalGuide } from "./InteractiveTerminal";
import type { HomeSection } from "@/lib/home-sections";

export type WorkspaceLayout = { ready: boolean; split: boolean; height: number; statusHeight: number };
export type WorkspacePublication = { route: string; guide: TerminalGuide; projectOutput?: ReactNode; noteOutput?: ReactNode };
export const WorkspaceContext = createContext<{
  layout: WorkspaceLayout;
  publication: WorkspacePublication | null;
  publish: (value: WorkspacePublication) => void;
  homeSection: HomeSection;
  setHomeSection: (value: HomeSection) => void;
} | null>(null);

export function useWorkspace() {
  const value = useContext(WorkspaceContext);
  if (!value) throw new Error("Workspace components require WorkspaceShell.");
  return value;
}

// Explicit page identity prevents an outgoing page from publishing into a new route.
export function WorkspaceGuidePublisher({ path, page, guide, projectOutput, noteOutput }: {
  path: string; page?: string; guide: TerminalGuide; projectOutput?: ReactNode; noteOutput?: ReactNode;
}) {
  const pathname = usePathname();
  const search = useSearchParams();
  const query = search.toString();
  const currentPage = search.get("page") ?? "";
  const { publish } = useWorkspace();
  useEffect(() => {
    if ((path !== "*" && pathname !== path) || (page !== undefined && currentPage !== page)) return;
    publish({ route: pathname + (query ? `?${query}` : ""), guide, projectOutput, noteOutput });
  }, [pathname, path, query, currentPage, page, guide, projectOutput, noteOutput, publish]);
  return null;
}
