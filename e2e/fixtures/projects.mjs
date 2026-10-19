// A long article exercises anchor positioning without relying on live CMS content.
const tocContent = [
  ["intro", "導入"],
  ["2026-検証", "2026年の検証"],
  ["まとめ", "結果とまとめ"],
  ["a&amp;b", "A &amp; B"],
  ["$& onmouseover=window.pwned=1//", "安全なID"],
].map(([id, title]) => `<h2 id="${id}">${title}</h2>${
  `<p>目次から移動した見出しが固定ヘッダーに隠れず、直接アンカーと同じ位置で読めることを確認します。画面幅や動きを減らす設定が変わっても、内容と操作を保ちます。</p>`.repeat(14)
}`).join("");

// Ordered newest first, like the CMS list endpoint. Thirteen records span three pages.
export const cmsProjects = Array.from({ length: 13 }, (_, index) => {
  const number = String(index + 1).padStart(2, "0");
  return {
    id: `e2e-project-${number}`,
    title: `E2E Project ${number}`,
    description: `固定データのプロジェクト ${number}。制作内容と検証結果を紹介します。`,
    publishedAt: new Date(Date.UTC(2026, 8, 20 - index)).toISOString(),
    content: index === 12 ? tocContent : `<h2>プロジェクト ${number} の概要</h2><p>これはE2Eテスト用の記事本文です。</p><h2>検証結果</h2><p>記事の表示とページ遷移を確認します。</p>`,
  };
});
