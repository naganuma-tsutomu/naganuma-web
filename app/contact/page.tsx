import { createPageMetadata } from "@/lib/site-metadata";
import Link from "next/link";
import { contactLead, socialLinks } from "@/app/data/contact";

const profileLinkClass = "grid min-w-0 grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-[7px] border border-[#8ca6a7] bg-[#102c32] px-5 py-[18px] text-[var(--paper)] no-underline transition-colors duration-200 hover:border-[var(--aqua)] hover:bg-[#17383d] focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[var(--orange)]";
const profileLabelClass = "col-start-1 font-[family-name:var(--mono)] text-[11px] leading-normal tracking-[0.08em] text-[var(--aqua)]";
const profileUrlClass = "col-start-1 font-[family-name:var(--mono)] text-[15px] leading-normal font-bold [overflow-wrap:anywhere]";
const profileArrowClass = "col-start-2 row-span-2 row-start-1 self-center font-[family-name:var(--mono)] text-2xl leading-none text-[var(--orange)]";

export const metadata = createPageMetadata({
  title: "Contact",
  description: "GitHubとXのプロフィールへのリンクをまとめています。",
  path: "/contact",
});

export default function Contact() {
  return (
    <div className="interior-page site-shell">
      <nav className="interior-breadcrumb" aria-label="パンくずリスト">
        <Link href="/">HOME</Link><span aria-hidden="true">/</span><span>CONTACT</span>
      </nav>

      <header className="interior-hero">
        <div className="interior-hero-main">
          <span className="interior-kicker">LINKS / 002</span>
          <h1>CONTACT<span className="interior-title-period">.</span></h1>
          <p>制作の記録や日々の発信は、こちらからご覧いただけます。</p>
          <span className="interior-hero-underscore" aria-hidden="true">_</span>
        </div>
        <div className="interior-hero-side">
          <span>FIND ME ONLINE</span>
          <p>BUILD.<br />SHARE.<br />CONNECT.<br />REPEAT.</p>
          <span>GITHUB / X</span>
        </div>
      </header>

      <div className="contact-grid">
        <section className="contact-details" aria-labelledby="contact-intro-title">
          <div className="interior-section-heading">
            <span>01 / PROFILES</span>
            <span className="section-rule" aria-hidden="true" />
          </div>
          <h2 id="contact-intro-title" className="interior-section-title">FIND ME ONLINE<span>.</span></h2>
          <p className="mb-[55px] max-w-[570px] text-[15px] leading-[2] text-[var(--text-sub)] max-[768px]:mb-[34px]">{contactLead}</p>

          <div className="border-t-2 border-[var(--ink)]">
            {socialLinks.map((link, index) => (
              <div
                className="grid grid-cols-[125px_minmax(0,1fr)] items-start gap-[18px] border-b border-[#aeb7ad] py-6 max-[1024px]:grid-cols-1 max-[1024px]:gap-[7px] max-[768px]:grid-cols-[125px_minmax(0,1fr)] max-[768px]:gap-4 max-[480px]:grid-cols-1 max-[480px]:gap-[7px]"
                key={link.name}
              >
                <span className="pt-[5px] font-[family-name:var(--mono)] text-[11px] leading-[1.5] text-[var(--teal)] whitespace-nowrap">
                  {String(index + 1).padStart(2, "0")} / {link.name}
                </span>
                <p className="m-0 font-[family-name:var(--font-oswald),sans-serif] text-base leading-[1.6] font-bold">
                  {link.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="dark-panel" aria-labelledby="contact-links-title">
          <div className="panel-titlebar">
            <span>profiles.txt</span>
            <span className="window-dots" aria-hidden="true"><i /><i /><i /></span>
          </div>
          <div className="border border-[var(--border)] border-t-0 p-[clamp(20px,3vw,37px)]">
            <div className="mb-[29px]">
              <span className="font-[family-name:var(--mono)] text-xs leading-normal text-[var(--aqua)]">&gt; ls /profiles</span>
              <h2 id="contact-links-title" className="mt-3 font-[family-name:var(--font-pixel)] text-[clamp(23px,2.4vw,34px)] leading-[1.3] font-bold tracking-[-0.08em] max-[480px]:text-[22px]">SOCIAL LINKS<span className="text-[var(--aqua)]">_</span></h2>
            </div>
            <div className="grid gap-[15px]">
              {socialLinks.map((link, index) => (
                <a className={profileLinkClass} href={link.url} key={link.name} target="_blank" rel="noopener noreferrer">
                  <span className={profileLabelClass}>{String(index + 1).padStart(2, "0")} / {link.name}</span>
                  <span className={profileUrlClass}>{link.displayText}</span>
                  <span className={profileArrowClass} aria-hidden="true">↗</span>
                </a>
              ))}
            </div>
            <p className="mt-7 flex flex-wrap justify-between gap-x-4 gap-y-2 border-t border-[#597174] pt-[14px] font-[family-name:var(--mono)] text-[10px] leading-normal tracking-[0.08em] text-[#b9c7c9]">EXTERNAL LINKS <span>OPEN IN NEW TAB ↗</span></p>
          </div>
        </section>
      </div>
    </div>
  );
}
