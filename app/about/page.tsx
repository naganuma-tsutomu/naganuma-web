import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About | NAGANUMA",
  description: "プロフィール、スキル、これまでの経験について。",
};

const skills = [
  "React",
  "Next.js",
  "TypeScript",
  "Tailwind CSS",
  "Node.js",
  "Kubernetes",
  "Docker",
  "AWS",
];

const experiences = [
  {
    year: "2024 - Present",
    title: "Senior Frontend Engineer",
    company: "Tech Innovation Inc.",
    description:
      "Leading the frontend team in building scalable web applications using Next.js and React.",
  },
  {
    year: "2021 - 2024",
    title: "Web Developer",
    company: "Creative Solutions Ltd.",
    description:
      "Developed responsive websites and e-commerce platforms for various clients.",
  },
  {
    year: "2019 - 2021",
    title: "Junior Developer",
    company: "StartUp Hub",
    description:
      "Collaborated with designers to implement user interfaces and improve UX.",
  },
];

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

      <section className="about-intro" aria-labelledby="about-intro-title">
        <div className="about-identity dark-panel">
          <div className="panel-titlebar">
            <span>profile.txt</span>
            <span className="window-dots" aria-hidden="true"><i /><i /><i /></span>
          </div>
          <div className="about-identity-body">
            <div className="about-terminal-content">
              <p className="about-terminal-command"><span>naganuma@home:~</span>$ whoami</p>
              <p className="about-terminal-response">naganuma</p>
              <p className="about-terminal-command"><span>naganuma@home:~</span>$ cat profile.txt</p>
              <div className="about-terminal-profile">
                <div className="about-monogram" aria-hidden="true">N<span>_</span></div>
                <dl>
                  <div><dt>NAME</dt><dd>NAGANUMA</dd></div>
                  <div><dt>ROLE</dt><dd>SOFTWARE ENGINEER</dd></div>
                  <div><dt>FOCUS</dt><dd>WEB / SERVER / HOMELAB</dd></div>
                </dl>
              </div>
              <p className="about-terminal-comment"># BUILD / TWEAK / LEARN / REPEAT</p>
              <p className="about-terminal-command about-terminal-ready"><span>naganuma@home:~</span>$ <i aria-hidden="true" /></p>
            </div>
            <div className="about-identity-footer">
              <span>1:profile.txt*</span>
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
            <p>こんにちは。私はWeb開発に情熱を注ぐソフトウェアエンジニアです。シンプルで使いやすく、かつ印象に残るデジタル体験を創造することを目指しています。</p>
            <p>技術の進化は早いですが、変わらない「良さ」を大切にしながら、最新のトレンド（Next.js, Reactなど）を取り入れた開発を行っています。このポートフォリオサイトも、レトロモダンなデザインと最新の技術スタックを融合させて作りました。</p>
            <p>コードを書くこと以外にも、デザイン、写真、そして新しいコーヒーショップを探すことが好きです。</p>
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
    </div>
  );
}
