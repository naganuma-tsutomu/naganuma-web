"use client";

import Image from "next/image";
import { useState } from "react";

interface ContentImageProps {
  src?: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  fallbackLabel?: string;
  loadingPlaceholder?: boolean;
}

export default function ContentImage({ src, alt, sizes, priority, fallbackLabel = "PROJECT", loadingPlaceholder = false }: ContentImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const loading = loadingPlaceholder && loadedSrc !== src;

  if (!src || src === "/images/no-image.jpg" || failedSrc === src) {
    return (
      <div data-image-fallback className="absolute inset-0 flex flex-col justify-between overflow-hidden bg-[var(--surface-alt)] p-4 font-[family-name:var(--mono)] text-[var(--teal)] [background-image:linear-gradient(#003f4708_1px,transparent_1px),linear-gradient(90deg,#003f4708_1px,transparent_1px)] [background-size:20px_20px]" aria-hidden="true">
        <span className="text-[10px] tracking-[.12em]">{fallbackLabel}</span>
        <span className="font-[family-name:var(--font-oswald),sans-serif] text-5xl leading-none font-bold tracking-[-.08em] text-[var(--ink)]">N<span className="text-[var(--red)]">_</span></span>
        <span className="text-[9px] tracking-[.08em]">NAGANUMA / JOURNAL</span>
      </div>
    );
  }

  return (
    <>
      {loading && <div data-project-image-loading className="absolute inset-0 z-10 animate-pulse bg-[var(--surface-alt)] motion-reduce:animate-none" />}
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        preload={priority}
        className={`object-cover transition-opacity duration-300 ${loading ? "opacity-0" : "opacity-100"}`}
        onLoad={() => setLoadedSrc(src)}
        onError={() => setFailedSrc(src)}
      />
    </>
  );
}
