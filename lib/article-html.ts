import "server-only";
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
