import type { Metadata } from "next";

export const SITE_URL = "https://naganuma-web.com";
export const SITE_NAME = "NAGANUMA";
export const SITE_DESCRIPTION = "Web制作、サーバー構築、ホームラボ。NAGANUMAのプロフィールと、つくったもの・学んだことの記録です。";

interface PageMetadataOptions {
  title: string;
  description: string;
  path: string;
  imageUrl?: string;
  publishedAt?: string;
  article?: boolean;
}

export function createPageMetadata({ title, description, path, imageUrl, publishedAt, article = false }: PageMetadataOptions): Metadata {
  const url = new URL(path, SITE_URL).href;
  const image = imageUrl && imageUrl !== "/images/no-image.jpg"
    ? { url: new URL(imageUrl, SITE_URL).href, alt: title }
    : { url: `${SITE_URL}/og`, width: 1200, height: 630, alt: "NAGANUMA — WEB / SERVER / HOMELAB" };
  const socialTitle = title === SITE_NAME ? SITE_NAME : `${title} | ${SITE_NAME}`;
  return {
    title: title === SITE_NAME ? { absolute: SITE_NAME } : title,
    description,
    alternates: { canonical: url },
    robots: { index: false, follow: false },
    openGraph: {
      title: socialTitle,
      description,
      url,
      siteName: SITE_NAME,
      locale: "ja_JP",
      images: [image],
      ...(article ? {
        type: "article" as const,
        ...(publishedAt && Number.isFinite(Date.parse(publishedAt)) ? { publishedTime: publishedAt } : {}),
      } : { type: "website" as const }),
    },
    twitter: { card: "summary_large_image", title: socialTitle, description, images: [image] },
  };
}
