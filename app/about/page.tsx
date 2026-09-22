import { createPageMetadata } from "@/lib/site-metadata";
import Link from "next/link";
import { sampleExperienceEnabled } from "@/lib/sample-content";
import {
  terminalProfile,
  bio,
  skills,
  experiences,
} from "@/app/data/about";

export const metadata = createPageMetadata({
  title: "About",
  description: "プロフィール、スキル、取り組んでいる技術について。",
  path: "/about",
});

export default function About() {
  const showSampleExperience = sampleExperienceEnabled();

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

      <section className="about-intro" aria-labelledby="about-intro-title">
        <div className="about-identity dark-panel">
          <div className="panel-titlebar">
            <span>{terminalProfile.filename}</span>
            <span className="window-dots" aria-hidden="true"><i /><i /><i /></span>
          </div>
          <div className="about-identity-body">
            <div className="about-terminal-content">
              <p className="about-terminal-command"><span>{terminalProfile.username}@{terminalProfile.hostname}:~</span>$ whoami</p>
              <p className="about-terminal-response">{terminalProfile.username}</p>
              <p className="about-terminal-command"><span>{terminalProfile.username}@{terminalProfile.hostname}:~</span>$ cat {terminalProfile.filename}</p>
              <div className="about-terminal-profile">
                <div className="about-monogram" aria-hidden="true">N<span>_</span></div>
                <dl>
                  <div><dt>NAME</dt><dd>{terminalProfile.name}</dd></div>
                  <div><dt>ROLE</dt><dd>{terminalProfile.role}</dd></div>
                  <div><dt>FOCUS</dt><dd>{terminalProfile.focus}</dd></div>
                </dl>
              </div>
              <p className="about-terminal-comment">{terminalProfile.comment}</p>
              <p className="about-terminal-command about-terminal-ready"><span>{terminalProfile.username}@{terminalProfile.hostname}:~</span>$ <i aria-hidden="true" /></p>
            </div>
            <div className="about-identity-footer">
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

      <section className="about-section" aria-labelledby="skills-title">
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
              className="group flex min-h-[84px] cursor-default items-center gap-[14px] border-2 border-[var(--ink)] bg-[var(--surface)] px-[19px] py-[17px] font-[family-name:var(--font-oswald),sans-serif] text-[clamp(15px,1.4vw,20px)] leading-[1.4] font-bold shadow-[4px_4px_0_var(--ink)] transition-all duration-300 hover:-translate-y-1 hover:bg-[var(--ink)] hover:text-white hover:shadow-[2px_2px_0_var(--ink)] max-[480px]:min-h-[73px] max-[480px]:gap-[7px] max-[480px]:p-[11px] max-[480px]:text-sm"
            >
              <span className="self-start font-[family-name:var(--mono)] text-[10px] leading-[1.5] text-[var(--red)] group-hover:text-[var(--orange)]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span>{skill}</span>
              <span className="ml-auto font-[family-name:var(--mono)] text-xs leading-none max-[480px]:text-[10px] text-[var(--terminal-accent)]" aria-hidden="true">
                ◆
              </span>
            </li>
          ))}
        </ul>
      </section>

      {showSampleExperience && (
        <section className="about-section" aria-labelledby="experience-title">
          <div className="interior-section-heading">
            <span>03 / JOURNEY</span>
            <span className="section-rule" aria-hidden="true" />
            <span>SAMPLE CONTENT</span>
          </div>
          <h2 id="experience-title" className="interior-section-title">EXPERIENCE<span>.</span></h2>
          <ol className="m-0 list-none border-t-2 border-[var(--ink)] p-0">
            {experiences.map((experience) => (
              <li
                key={experience.year}
                className="grid grid-cols-[minmax(150px,.35fr)_minmax(0,1fr)_auto] gap-8 border-b border-[#aeb7ad] px-2 py-[27px] max-[768px]:grid-cols-[1fr_auto] max-[768px]:gap-x-[14px] max-[768px]:gap-y-2"
              >
                <span className="font-[family-name:var(--mono)] text-xs leading-[1.5] text-[var(--teal)] max-[768px]:col-span-full">
                  {experience.year}
                </span>
                <div>
                  <h3 className="m-0 mb-1 font-[family-name:var(--font-oswald),sans-serif] text-[clamp(20px,2vw,27px)] leading-[1.3] font-bold">
                    {experience.title}
                  </h3>
                  <span className="font-[family-name:var(--mono)] text-xs leading-[1.5] text-[var(--red)]">
                    {experience.company}
                  </span>
                  <p className="mt-[13px] mb-0 max-w-[740px] text-sm leading-[1.8] text-[var(--text-sub)]">
                    {experience.description}
                  </p>
                </div>
                <span className="font-[family-name:var(--mono)] text-xs leading-none text-[var(--terminal-accent)]" aria-hidden="true">
                  ◆
                </span>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}
