// Ordered newest first, like the CMS list endpoint. Thirteen records span three pages.
export const cmsProjects = Array.from({ length: 13 }, (_, index) => {
  const number = String(index + 1).padStart(2, "0");
  return {
    id: `e2e-project-${number}`,
    title: `E2E Project ${number}`,
    description: `固定データのプロジェクト ${number}。制作内容と検証結果を紹介します。`,
    publishedAt: new Date(Date.UTC(2026, 8, 20 - index)).toISOString(),
    content: `<h2>プロジェクト ${number} の概要</h2><p>これはE2Eテスト用の記事本文です。</p><h2>検証結果</h2><p>記事の表示とページ遷移を確認します。</p>`,
  };
});
