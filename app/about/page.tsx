import { createPageMetadata } from "@/lib/site-metadata";
import Link from "next/link";
import {
  terminalProfile,
  bio,
  skills,
} from "@/app/data/about";

export const metadata = createPageMetadata({
  title: "About",
  description: "プロフィール、スキル、取り組んでいる技術について。",
  path: "/about",
});

const terminalTextClass = "font-[family-name:var(--mono)] text-xs leading-[1.6] [overflow-wrap:anywhere]";
const aboutSectionClass = "border-t border-[var(--ink)] pt-[30px] pb-[46px] max-[768px]:pt-[25px] max-[768px]:pb-[37px]";

export default function About() {
  return (
    <div className="interior-page site-shell">
      <nav className="interior-breadcrumb" aria-label="パンくずリスト">
        <Link href="/">HOME</Link><span aria-hidden="true">/</span><span>ABOUT</span>
      </nav>

      <header className="interior-hero">
        <div className="interior-hero-main">
          <span className="interior-kicker">PROFILE / 001</span>
          <h1>ABOUT<span className="interior-title-period">.</span></h1>
          <p>つくること、試すこと、学び続けること。</p>
          <span className="interior-hero-underscore" aria-hidden="true">_</span>
        </div>
        <div className="interior-hero-side">
          <span>WEB / SERVER / HOMELAB</span>
          <p>BUILD<br />TWEAK<br />LEARN<br />REPEAT.</p>
          <span>PERSONAL WORKSPACE ↗</span>
        </div>
      </header>

      <section className="grid grid-cols-[minmax(0,.8fr)_minmax(0,1.2fr)] items-stretch gap-[clamp(32px,5vw,80px)] pt-[72px] pb-20 max-[1024px]:gap-8 max-[768px]:grid-cols-1 max-[768px]:gap-[34px] max-[768px]:pt-[42px] max-[768px]:pb-[47px]" aria-labelledby="about-intro-title">
        <div className="dark-panel flex min-h-[475px] min-w-0 flex-col max-[768px]:min-h-[300px]">
          <div className="panel-titlebar">
            <span>{terminalProfile.filename}</span>
            <span className="window-dots" aria-hidden="true"><i /><i /><i /></span>
          </div>
          <div className="flex min-h-0 flex-1 flex-col border border-[var(--border)] border-t-0">
            <div className="flex min-w-0 flex-1 flex-col px-6 pt-[22px] pb-[18px] [@media(max-width:479px)]:px-4 [@media(max-width:479px)]:pt-[18px] [@media(max-width:479px)]:pb-[14px]">
              <p className={`m-0 ${terminalTextClass}`}><span className="text-[var(--aqua)]">{terminalProfile.username}@{terminalProfile.hostname}:~</span>$ whoami</p>
              <p className={`mt-1 mr-0 mb-5 ml-0 text-[#eaf4ef] ${terminalTextClass}`}>{terminalProfile.username}</p>
              <p className={`m-0 ${terminalTextClass}`}><span className="text-[var(--aqua)]">{terminalProfile.username}@{terminalProfile.hostname}:~</span>$ cat {terminalProfile.filename}</p>
              <div className="mt-3 grid grid-cols-[110px_minmax(0,1fr)] items-center gap-5 border-l-2 border-[var(--aqua)] bg-[#173036] py-[19px] pr-[14px] pl-[18px] [@media(max-width:479px)]:grid-cols-[76px_minmax(0,1fr)] [@media(max-width:479px)]:gap-3 [@media(max-width:479px)]:px-[10px] [@media(max-width:479px)]:py-[14px]">
                <div className="flex items-center justify-center font-[family-name:var(--font-oswald),sans-serif] text-[112px] leading-[.9] font-bold tracking-[-.16em] whitespace-nowrap text-[var(--aqua)] [@media(max-width:479px)]:text-[78px]" aria-hidden="true">N<span className="text-[var(--orange)]">_</span></div>
                <dl className="m-0 grid min-w-0 gap-[11px]">
                  <div className="min-w-0"><dt className="font-[family-name:var(--mono)] text-[10px] leading-[1.4] tracking-[.1em] text-[var(--aqua)]">NAME</dt><dd className="mx-0 mt-[2px] mb-0 font-[family-name:var(--mono)] text-xs leading-[1.45] text-[#f1f0e9] [overflow-wrap:anywhere] [@media(max-width:479px)]:text-[10px]">{terminalProfile.name}</dd></div>
                  <div className="min-w-0"><dt className="font-[family-name:var(--mono)] text-[10px] leading-[1.4] tracking-[.1em] text-[var(--aqua)]">ROLE</dt><dd className="mx-0 mt-[2px] mb-0 font-[family-name:var(--mono)] text-xs leading-[1.45] text-[#f1f0e9] [overflow-wrap:anywhere] [@media(max-width:479px)]:text-[10px]">{terminalProfile.role}</dd></div>
                  <div className="min-w-0"><dt className="font-[family-name:var(--mono)] text-[10px] leading-[1.4] tracking-[.1em] text-[var(--aqua)]">FOCUS</dt><dd className="mx-0 mt-[2px] mb-0 font-[family-name:var(--mono)] text-xs leading-[1.45] text-[#f1f0e9] [overflow-wrap:anywhere] [@media(max-width:479px)]:text-[10px]">{terminalProfile.focus}</dd></div>
                </dl>
              </div>
              <p className="mt-[17px] mr-0 mb-0 ml-0 font-[family-name:var(--mono)] text-[11px] leading-[1.6] text-[#9fb4b3] [overflow-wrap:anywhere]">{terminalProfile.comment}</p>
              <p className={`mx-0 mt-auto mb-0 flex items-center gap-[.5ch] pt-5 ${terminalTextClass}`}><span className="text-[var(--aqua)]">{terminalProfile.username}@{terminalProfile.hostname}:~</span>$ <i className="inline-block h-[1.2em] w-[9px] bg-[var(--orange)] motion-safe:animate-blink" aria-hidden="true" /></p>
            </div>
            <div className="flex flex-wrap justify-between gap-x-3 gap-y-1 bg-[var(--terminal-accent)] px-[10px] py-[5px] font-[family-name:var(--mono)] text-[10px] leading-[1.5] tracking-[.02em] text-[#08171b] [@media(max-width:479px)]:text-[8px]">
              <span>1:{terminalProfile.filename}*</span>
              <span>READ ONLY / UTF-8</span>
            </div>
          </div>
        </div>
        <div className="py-[6px]">
          <div className="interior-section-heading">
            <span>01 / INTRODUCTION</span>
            <span className="section-rule" aria-hidden="true" />
          </div>
          <h2 id="about-intro-title" className="m-0 mb-[25px] font-[family-name:var(--font-oswald),sans-serif] text-[clamp(34px,3.6vw,52px)] leading-[1.2] font-bold tracking-[0.02em] max-[768px]:mb-[18px]">
            Who I Am<span className="text-[var(--red)]">.</span>
          </h2>
          <div className="max-w-[670px] text-[15px] leading-[2] text-[var(--text-sub)]">
            {bio.map((paragraph, index) => (
              <p key={index} className="m-0 mb-[18px]">{paragraph}</p>
            ))}
          </div>
          <Link href="/contact" className="mt-[14px] inline-flex items-center justify-between gap-[42px] border-2 border-[var(--ink)] bg-[var(--ink)] px-[18px] py-[14px] font-[family-name:var(--mono)] text-xs leading-[1.5] tracking-[0.07em] text-[var(--paper)] no-underline transition-colors duration-200 hover:bg-[var(--orange)] hover:text-[var(--ink)]">
            FIND ME ONLINE <span className="text-lg" aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>

      <section className={aboutSectionClass} aria-labelledby="skills-title">
        <div className="interior-section-heading">
          <span>02 / TOOLKIT</span>
          <span className="section-rule" aria-hidden="true" />
          <span>TECH STACK</span>
        </div>
        <h2 id="skills-title" className="interior-section-title">MY SKILLS<span>.</span></h2>
        <ul className="m-0 grid list-none grid-cols-4 gap-[10px] p-0 max-[1024px]:grid-cols-2 max-[480px]:gap-[9px]">
          {skills.map((skill, index) => (
            <li
              key={skill}
              className="group flex min-h-[84px] cursor-default items-center gap-[14px] border-2 border-[var(--ink)] bg-[var(--surface)] px-[19px] py-[17px] font-[family-name:var(--font-oswald),sans-serif] text-[clamp(15px,1.4vw,20px)] leading-[1.4] font-bold text-[var(--ink)] shadow-[4px_4px_0_var(--ink)] max-[480px]:min-h-[73px] max-[480px]:gap-[7px] max-[480px]:p-[11px] max-[480px]:text-sm"
            >
              <span className="self-start font-[family-name:var(--mono)] text-[10px] leading-[1.5] text-[var(--red)] transition-colors duration-200 group-hover:text-[var(--orange)]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span>{skill}</span>
              <span className="ml-auto font-[family-name:var(--mono)] text-xs leading-none max-[480px]:text-[10px] text-[var(--terminal-accent)] transition-colors duration-200 group-hover:text-[var(--orange)]" aria-hidden="true">
                ◆
              </span>
            </li>
          ))}
        </ul>
      </section>

    </div>
  );
}
