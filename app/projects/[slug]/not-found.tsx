import Link from "next/link";

export default function ProjectNotFound() {
  return (
    <section className="article-state site-shell">
      <p className="article-meta">404 / NOT FOUND</p>
      <h1>記事が見つかりません</h1>
      <p>記事が削除されたか、まだ公開されていない可能性があります。</p>
      <Link href="/#projects">← PROJECTS 一覧へ戻る</Link>
    </section>
  );
}
