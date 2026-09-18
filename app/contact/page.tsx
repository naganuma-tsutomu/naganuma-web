import type { Metadata } from "next";
import Link from "next/link";
import { githubProfileUrl, xProfileUrl } from "@/app/data/links";
import styles from "./ContactLinks.module.css";

export const metadata: Metadata = {
  title: "Contact | NAGANUMA",
  description: "GitHubとXのプロフィールへのリンクをまとめています。",
};

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
          <p className="contact-lead">コードやプロジェクトはGitHubで、日々の投稿はXで公開しています。気になるものから覗いてみてください。</p>

          <div className="contact-methods">
            <div className="contact-method">
              <span>01 / GITHUB</span>
              <p>ソースコードとプロジェクト</p>
            </div>
            <div className="contact-method">
              <span>02 / X</span>
              <p>日々の投稿と近況</p>
            </div>
          </div>
        </section>

        <section className="dark-panel" aria-labelledby="contact-links-title">
          <div className="panel-titlebar">
            <span>profiles.txt</span>
            <span className="window-dots" aria-hidden="true"><i /><i /><i /></span>
          </div>
          <div className={styles.body}>
            <div className={styles.heading}>
              <span>&gt; ls /profiles</span>
              <h2 id="contact-links-title">SOCIAL LINKS<span>_</span></h2>
            </div>
            <div className={styles.list}>
              <a className={styles.link} href={githubProfileUrl} target="_blank" rel="noopener noreferrer">
                <span className={styles.label}>01 / GITHUB</span>
                <span className={styles.url}>github.com/naganuma-tsutomu</span>
                <span className={styles.arrow} aria-hidden="true">↗</span>
              </a>
              <a className={styles.link} href={xProfileUrl} target="_blank" rel="noopener noreferrer">
                <span className={styles.label}>02 / X</span>
                <span className={styles.url}>x.com/naganuma_web</span>
                <span className={styles.arrow} aria-hidden="true">↗</span>
              </a>
            </div>
            <p className={styles.footer}>EXTERNAL LINKS <span>OPEN IN NEW TAB ↗</span></p>
          </div>
        </section>
      </div>
    </div>
  );
}
