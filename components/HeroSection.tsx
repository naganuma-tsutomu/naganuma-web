import Link from "next/link";

export default function HeroSection() {
  return (
    <section id="home" data-guide-section="top" className="scroll-mt-6 pt-4 pb-14 @min-[600px]/reader:pt-7" aria-labelledby="hero-title">
      <p className="m-0 font-[family-name:var(--mono)] text-[10px] tracking-[0.12em] text-[var(--text-sub)] sm:text-[11px]">PERSONAL WEBSITE / NAGANUMA</p>
      <h1 id="hero-title" className="mt-6 mb-0 font-[family-name:var(--font-oswald),sans-serif] text-[16.4cqw] leading-[.98] font-bold tracking-[-0.055em] whitespace-nowrap">
        NAGANUMA_WEB
      </h1>
      <span className="mt-8 block h-[3px] w-12 bg-[var(--red)]" aria-hidden="true" />
      <p className="mt-6 mb-0 text-[17px] leading-[1.9] tracking-[0.02em] sm:text-xl">Web開発と自作サーバー。<br />日々の実験と記録。</p>
      <div className="mt-8 flex flex-wrap gap-x-8 gap-y-2">
        <a href="#projects" className="inline-flex min-h-11 items-center gap-5 border-b border-[var(--ink)] font-[family-name:var(--mono)] text-xs font-bold">PROJECTS <span aria-hidden="true">↓</span></a>
        <Link href="/about" className="inline-flex min-h-11 items-center gap-5 border-b border-[var(--ink)] font-[family-name:var(--mono)] text-xs font-bold">ABOUT ME <span aria-hidden="true">↗</span></Link>
      </div>
    </section>
  );
}
