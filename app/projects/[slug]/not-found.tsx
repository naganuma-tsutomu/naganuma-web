import { WorkspaceGuidePublisher } from "@/components/WorkspaceContext";
import Link from "next/link";

export default function ProjectNotFound() {
  return (
    <section className="article-state site-shell">
      <WorkspaceGuidePublisher path="*" guide={{ id: "not-found", command: "pwd", output: <p>記事が見つかりません。<Link href="/projects">制作実績の一覧へ ↗</Link></p> }} />
      <p className="article-meta">404 / NOT FOUND</p>
      <h1>記事が見つかりません</h1>
      <p>記事が削除されたか、まだ公開されていない可能性があります。</p>
      <Link href="/projects">← PROJECTS 一覧へ戻る</Link>
    </section>
  );
}
