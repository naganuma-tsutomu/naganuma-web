import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact | NAGANUMA",
  description: "ご相談やお問い合わせはこちらから。",
};

export default function Contact() {
  return (
    <div className="interior-page site-shell">
      <nav className="interior-breadcrumb" aria-label="パンくずリスト">
        <Link href="/#home">HOME</Link><span aria-hidden="true">/</span><span>CONTACT</span>
      </nav>

      <header className="interior-hero">
        <div className="interior-hero-main">
          <span className="interior-kicker">MESSAGE / 002</span>
          <h1>CONTACT<span className="interior-title-period">.</span></h1>
          <p>アイデアや相談があれば、気軽に声をかけてください。</p>
          <span className="interior-hero-underscore" aria-hidden="true">_</span>
        </div>
        <div className="interior-hero-side">
          <span>OPEN FOR CONVERSATION</span>
          <p>LET&apos;S<br />MAKE<br />SOMETHING<br />GOOD.</p>
          <span>HELLO FROM NAGANUMA ↗</span>
        </div>
      </header>

      <div className="contact-grid">
        <section className="contact-details" aria-labelledby="contact-intro-title">
          <div className="interior-section-heading">
            <span>01 / SAY HELLO</span>
            <span className="section-rule" aria-hidden="true" />
          </div>
          <h2 id="contact-intro-title" className="interior-section-title">GET IN TOUCH<span>.</span></h2>
          <p className="contact-lead">プロジェクトのご相談、技術的な質問、あるいは単なる挨拶でも、お気軽にご連絡ください。</p>

          <div className="contact-methods">
            <div className="contact-method">
              <span>01 / EMAIL</span>
              <p className="contact-placeholder">hello@example.com <span aria-hidden="true">↗</span></p>
            </div>
            <div className="contact-method">
              <span>02 / SOCIALS</span>
              <div className="contact-socials">
                <span>Twitter ↗</span>
                <span>GitHub ↗</span>
                <span>LinkedIn ↗</span>
              </div>
            </div>
          </div>
          <p className="contact-setup-note">連絡先・SNSリンクは現在準備中です。</p>
        </section>

        <section className="contact-form-panel dark-panel" aria-labelledby="contact-form-title">
          <div className="panel-titlebar">
            <span className="window-dots" aria-hidden="true"><i /><i /><i /></span>
            <span>new_message.txt</span>
          </div>
          <div className="contact-form-body">
            <div className="contact-form-heading">
              <span>&gt; compose_message</span>
              <h2 id="contact-form-title">SEND A MESSAGE<span>_</span></h2>
            </div>
            <form>
              <div className="contact-field">
                <label htmlFor="name">01 / NAME</label>
                <input type="text" id="name" name="name" autoComplete="name" placeholder="Your Name" disabled />
              </div>
              <div className="contact-field">
                <label htmlFor="email">02 / EMAIL</label>
                <input type="email" id="email" name="email" autoComplete="email" placeholder="your@email.com" disabled />
              </div>
              <div className="contact-field">
                <label htmlFor="message">03 / MESSAGE</label>
                <textarea id="message" name="message" rows={5} placeholder="How can I help you?" disabled />
              </div>
              <button type="button" className="contact-submit" disabled>SEND MESSAGE <span aria-hidden="true">↗</span></button>
              <p className="contact-form-note">フォームの送信機能は準備中です。</p>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
