import InteriorPageHeader from "@/components/InteriorPageHeader";
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
const aboutSectionClass = "border-t border-[var(--ink)] pt-[30px] pb-[46px] @max-[800px]/reader:pt-[25px] @max-[800px]/reader:pb-[37px]";

export default function About() {
  return (
    <div className="interior-page site-shell">
      <nav className="interior-breadcrumb" aria-label="パンくずリスト">
        <Link href="/">HOME</Link><span aria-hidden="true">/</span><span>ABOUT</span>
      </nav>

      <InteriorPageHeader title="ABOUT" kicker="PROFILE / 001" description="つくること、試すこと、学び続けること。" meta="WEB / SERVER / HOMELAB" />

      <section className="grid grid-cols-[minmax(0,.8fr)_minmax(0,1.2fr)] items-stretch gap-[clamp(32px,5cqw,80px)] pt-0 pb-20 @max-[1000px]/reader:gap-8 @max-[800px]/reader:grid-cols-1 @max-[800px]/reader:gap-[34px] @max-[800px]/reader:pt-0 @max-[800px]/reader:pb-[47px]" aria-labelledby="about-intro-title">
        <div className="dark-panel flex min-h-[475px] min-w-0 flex-col @max-[800px]/reader:min-h-[300px]">
          <div className="panel-titlebar">
            <span>{terminalProfile.filename}</span>
            <span className="window-dots" aria-hidden="true"><i /><i /><i /></span>
          </div>
          <div className="flex min-h-0 flex-1 flex-col border border-[var(--border)] border-t-0">
            <div className="flex min-w-0 flex-1 flex-col px-6 pt-[22px] pb-[18px] @max-[480px]/reader:px-4 @max-[480px]/reader:pt-[18px] @max-[480px]/reader:pb-[14px]">
              <p className={`m-0 ${terminalTextClass}`}><span className="text-[var(--aqua)]">{terminalProfile.username}@{terminalProfile.hostname}:~</span>$ whoami</p>
              <p className={`mt-1 mr-0 mb-5 ml-0 text-[#eaf4ef] ${terminalTextClass}`}>{terminalProfile.username}</p>
              <p className={`m-0 ${terminalTextClass}`}><span className="text-[var(--aqua)]">{terminalProfile.username}@{terminalProfile.hostname}:~</span>$ cat {terminalProfile.filename}</p>
              <div className="mt-3 grid grid-cols-[110px_minmax(0,1fr)] items-center gap-5 border-l-2 border-[var(--aqua)] bg-[#173036] py-[19px] pr-[14px] pl-[18px] @max-[480px]/reader:grid-cols-[76px_minmax(0,1fr)] @max-[480px]/reader:gap-3 @max-[480px]/reader:px-[10px] @max-[480px]/reader:py-[14px]">
                <div className="flex items-center justify-center font-[family-name:var(--font-oswald),sans-serif] text-[112px] leading-[.9] font-bold tracking-[-.16em] whitespace-nowrap text-[var(--aqua)] @max-[480px]/reader:text-[78px]" aria-hidden="true">N<span className="text-[var(--orange)]">_</span></div>
                <dl className="m-0 grid min-w-0 gap-[11px]">
                  <div className="min-w-0"><dt className="font-[family-name:var(--mono)] text-[10px] leading-[1.4] tracking-[.1em] text-[var(--aqua)]">NAME</dt><dd className="mx-0 mt-[2px] mb-0 font-[family-name:var(--mono)] text-xs leading-[1.45] text-[#f1f0e9] [overflow-wrap:anywhere] @max-[480px]/reader:text-[10px]">{terminalProfile.name}</dd></div>
                  <div className="min-w-0"><dt className="font-[family-name:var(--mono)] text-[10px] leading-[1.4] tracking-[.1em] text-[var(--aqua)]">ROLE</dt><dd className="mx-0 mt-[2px] mb-0 font-[family-name:var(--mono)] text-xs leading-[1.45] text-[#f1f0e9] [overflow-wrap:anywhere] @max-[480px]/reader:text-[10px]">{terminalProfile.role}</dd></div>
                  <div className="min-w-0"><dt className="font-[family-name:var(--mono)] text-[10px] leading-[1.4] tracking-[.1em] text-[var(--aqua)]">FOCUS</dt><dd className="mx-0 mt-[2px] mb-0 font-[family-name:var(--mono)] text-xs leading-[1.45] text-[#f1f0e9] [overflow-wrap:anywhere] @max-[480px]/reader:text-[10px]">{terminalProfile.focus}</dd></div>
                </dl>
              </div>
              <p className="mt-[17px] mr-0 mb-0 ml-0 font-[family-name:var(--mono)] text-[11px] leading-[1.6] text-[#9fb4b3] [overflow-wrap:anywhere]">{terminalProfile.comment}</p>
              <p className={`mx-0 mt-auto mb-0 flex items-center gap-[.5ch] pt-5 ${terminalTextClass}`}><span className="text-[var(--aqua)]">{terminalProfile.username}@{terminalProfile.hostname}:~</span>$ <i className="inline-block h-[1.2em] w-[9px] bg-[var(--orange)] motion-safe:animate-blink" aria-hidden="true" /></p>
            </div>
            <div className="flex flex-wrap justify-between gap-x-3 gap-y-1 bg-[var(--terminal-accent)] px-[10px] py-[5px] font-[family-name:var(--mono)] text-[10px] leading-[1.5] tracking-[.02em] text-[#08171b] @max-[480px]/reader:text-[8px]">
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
          <h2 id="about-intro-title" className="m-0 mb-[25px] font-[family-name:var(--font-oswald),sans-serif] text-[clamp(34px,3.6cqw,52px)] leading-[1.2] font-bold tracking-[0.02em] @max-[800px]/reader:mb-[18px]">
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
        <ul className="m-0 grid list-none grid-cols-4 gap-[10px] p-0 @max-[1000px]/reader:grid-cols-2 @max-[480px]/reader:gap-[9px]">
          {skills.map((skill, index) => (
            <li
              key={skill}
              className="group flex min-h-[84px] cursor-default items-center gap-[14px] border-2 border-[var(--ink)] bg-[var(--surface)] px-[19px] py-[17px] font-[family-name:var(--font-oswald),sans-serif] text-[clamp(15px,1.4cqw,20px)] leading-[1.4] font-bold text-[var(--ink)] shadow-[4px_4px_0_var(--ink)] @max-[480px]/reader:min-h-[73px] @max-[480px]/reader:gap-[7px] @max-[480px]/reader:p-[11px] @max-[480px]/reader:text-sm"
            >
              <span className="self-start font-[family-name:var(--mono)] text-[10px] leading-[1.5] text-[var(--red)] transition-colors duration-200 group-hover:text-[var(--orange)]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span>{skill}</span>
              <span className="ml-auto font-[family-name:var(--mono)] text-xs leading-none @max-[480px]/reader:text-[10px] text-[var(--terminal-accent)] transition-colors duration-200 group-hover:text-[var(--orange)]" aria-hidden="true">
                ◆
              </span>
            </li>
          ))}
        </ul>
      </section>

    </div>
  );
}
