export interface TocItem {
  id: string;
  text: string;
  level: number;
}

export interface TocResult {
  html: string;
  toc: TocItem[];
}

/**
 * HTMLタグを除去してプレーンテキストを抽出します。
 */
function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]+>/g, "").trim();
}

/**
 * 見出しテキストからURLセーフなアンカーIDを生成します。
 */
function generateSlug(text: string, fallbackIndex: number): string {
  // 特殊記号を取り除き、空白をハイフンに変換（日本語文字・英数字・ハイフン・アンダースコアを保持）
  const slug = text
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}\s_-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  return slug || `heading-${fallbackIndex}`;
}

/**
 * 記事HTMLから h2, h3, h4 の見出しを抽出し、一意な id 属性を付与したHTMLと目次一覧を返します。
 */
export function extractTocAndInjectIds(html: string): TocResult {
  const toc: TocItem[] = [];
  const usedIds = new Map<string, number>();

  // h2, h3, h4 タグを検索
  const headingRegex = /<h([2-4])(\s+[^>]*)?>([\s\S]*?)<\/h\1>/gi;

  const transformedHtml = html.replace(headingRegex, (match, levelStr, attrsStr = "", innerHtml) => {
    const level = Number(levelStr);
    const plainText = stripHtmlTags(innerHtml);

    if (!plainText) {
      return match;
    }

    // 既存の id 属性があるか確認
    const idMatch = attrsStr.match(/\bid\s*=\s*["']([^"']+)["']/i);
    let id = idMatch ? idMatch[1] : "";

    if (!id) {
      const baseSlug = generateSlug(plainText, toc.length + 1);
      const count = usedIds.get(baseSlug) ?? 0;
      usedIds.set(baseSlug, count + 1);
      id = count === 0 ? baseSlug : `${baseSlug}-${count + 1}`;
    } else {
      const count = usedIds.get(id) ?? 0;
      usedIds.set(id, count + 1);
      if (count > 0) {
        id = `${id}-${count + 1}`;
      }
    }

    toc.push({
      id,
      text: plainText,
      level,
    });

    if (idMatch) {
      // 既存の id を重複回避した id に置換
      const newAttrs = attrsStr.replace(/\bid\s*=\s*["'][^"']+["']/i, `id="${id}"`);
      return `<h${level}${newAttrs}>${innerHtml}</h${level}>`;
    }

    return `<h${level} id="${id}"${attrsStr}>${innerHtml}</h${level}>`;
  });

  return {
    html: transformedHtml,
    toc,
  };
}
