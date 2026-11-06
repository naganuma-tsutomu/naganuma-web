import type { WorkspaceLayout } from "@/components/WorkspaceContext";

// Read the one layout decision made by the persistent shell, after its DOM commit.
export function readWorkspaceLayout(): WorkspaceLayout {
  const root = document.querySelector<HTMLElement>("[data-workspace]");
  return {
    ready: root?.dataset.ready === "true",
    split: root?.dataset.layout === "split",
    height: Number(root?.dataset.height) || 700,
    statusHeight: Number(root?.dataset.statusHeight) || 222,
  };
}
