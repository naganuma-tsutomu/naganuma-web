import "server-only";
import { marked } from "marked";
import sanitizeHtml from "sanitize-html";

export function sanitizeArticle(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [...sanitizeHtml.defaults.allowedTags, "img"],
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt", "width", "height", "loading", "decoding"],
      code: ["class"],
      h2: ["id"],
      h3: ["id"],
      h4: ["id"],
      th: ["colspan", "rowspan"],
      td: ["colspan", "rowspan"],
    },
    allowedClasses: { code: [/^language-[\w-]+$/] },
    allowedSchemes: ["https", "http", "mailto"],
    allowedSchemesByTag: { img: ["https"] },
    allowProtocolRelative: false,
    transformTags: {
      a: (tagName, attributes) => ({
        tagName,
        attribs: {
          ...attributes,
          ...(attributes.target === "_blank" ? { rel: "noopener noreferrer" } : { target: "_self" }),
        },
      }),
      img: (tagName, attributes) => ({ tagName, attribs: { ...attributes, loading: "lazy", decoding: "async" } }),
    },
  });
}

function stripFrontMatter(markdown: string): string {
  const match = markdown.match(/^---[ \t]*\n([\s\S]*?)\n---[ \t]*(?:\n|$)/);
  if (!match || !/^[a-zA-Z][\w-]*[ \t]*:/m.test(match[1])) return markdown;
  return markdown.slice(match[0].length).replace(/^\n+/, "");
}

function compactMarkdownBlocks(markdown: string): string {
  let current = markdown;
  let previous: string;
  do {
    previous = current;
    current = current
      .replace(/^(\|[^\n]*\|)[ \t]*\n[ \t]*\n(?=\|)/gm, "$1\n")
      .replace(/^(\s*(?:[-+*]|\d+\.)\s+[^\n]+)[ \t]*\n[ \t]*\n(?=\s*(?:[-+*]|\d+\.)\s+)/gm, "$1\n")
      .replace(/^(>[^\n]*)[ \t]*\n[ \t]*\n(?=>)/gm, "$1\n");
  } while (current !== previous);
  return current;
}

export function markdownToArticleHtml(markdown: string): string {
  const normalized = compactMarkdownBlocks(
    stripFrontMatter(
      markdown
        .replace(/\r\n?/g, "\n")
        .replace(/^[\u200B\u200C\u200D\u200E\u200F\uFEFF]/, ""),
    ),
  );
  const html = marked.parse(normalized, {
    async: false,
    breaks: false,
    gfm: true,
  });
  if (typeof html !== "string") throw new Error("Markdown rendering unexpectedly became asynchronous.");
  return sanitizeArticle(html);
}
