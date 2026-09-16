"use client";

import Link from "next/link";

export default function ProjectError({ reset }: { reset: () => void }) {
  return (
    <section className="article-state site-shell">
      <p className="article-meta">TEMPORARILY UNAVAILABLE</p>
      <h1>記事を読み込めませんでした</h1>
      <p>時間をおいてもう一度お試しください。</p>
      <button type="button" onClick={reset}>再読み込み</button>
      <Link href="/projects">← PROJECTS 一覧へ戻る</Link>
    </section>
  );
}
