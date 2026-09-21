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
        <div className="about-copy">
          <div className="interior-section-heading">
            <span>01 / INTRODUCTION</span>
            <span className="section-rule" aria-hidden="true" />
          </div>
          <h2 id="about-intro-title">Who I Am<span>.</span></h2>
          <div className="about-prose">
            {bio.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
          <Link href="/contact" className="interior-action">FIND ME ONLINE <span aria-hidden="true">↗</span></Link>
        </div>
      </section>

      <section className="about-section" aria-labelledby="skills-title">
        <div className="interior-section-heading">
          <span>02 / TOOLKIT</span>
          <span className="section-rule" aria-hidden="true" />
          <span>TECH STACK</span>
        </div>
        <h2 id="skills-title" className="interior-section-title">MY SKILLS<span>.</span></h2>
        <ul className="about-skills">
          {skills.map((skill, index) => (
            <li key={skill}><span>{String(index + 1).padStart(2, "0")}</span>{skill}<span aria-hidden="true">↗</span></li>
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
          <ol className="about-experience">
            {experiences.map((experience) => (
              <li key={experience.year}>
                <span className="about-experience-year">{experience.year}</span>
                <div>
                  <h3>{experience.title}</h3>
                  <span className="about-experience-company">{experience.company}</span>
                  <p>{experience.description}</p>
                </div>
                <span className="about-experience-mark" aria-hidden="true">↗</span>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}
