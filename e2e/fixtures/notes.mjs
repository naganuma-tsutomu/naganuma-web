export const noteArticles = [
  { title: "自宅ラボの記録", url: "https://note.com/e2e_notes/n/n000000000001", publishedAt: "2026-11-01T03:00:00.000Z", description: "運用で気付いたことと検証の記録です。", thumbnailUrl: "https://assets.st-note.com/e2e-thumbnail.jpg" },
  { title: "小さなツールを作る", url: "https://note.com/e2e_notes/n/n000000000002", publishedAt: "2026-10-30T03:00:00.000Z", description: "普段の作業を助けるツールの制作メモです。" },
  { title: "公開前の確認", url: "https://note.com/e2e_notes/n/n000000000003", publishedAt: "2026-10-25T03:00:00.000Z", description: "表示と操作を見直したときのメモです。" },
];

export const noteRSS = `<?xml version="1.0"?><rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/"><channel><title>Test notes</title>${noteArticles.map(article => `<item><title>${article.title}</title><link>${article.url}</link><pubDate>${new Date(article.publishedAt).toUTCString()}</pubDate><description>${article.description}</description>${article.thumbnailUrl ? `<media:thumbnail url="${article.thumbnailUrl}" />` : ""}</item>`).join("")}</channel></rss>`;
