import InteractiveTerminal from "@/components/InteractiveTerminal";
import HomelabStatus from "@/components/HomelabStatus";

export default function HeroSection() {
  return (
    <section className="hero-grid site-shell" aria-labelledby="hero-title">
      <InteractiveTerminal />
      <div className="manifesto-panel">
        <h1 id="hero-title">BUILD<br />TWEAK<br />LEARN<br />REPEAT.</h1>
        <div className="manifesto-caption">
          <p>WEB / SERVER / HOMELAB<br />CODE / DESIGN / LIFE</p>
          <span className="short-rule" aria-hidden="true" />
        </div>
        <span className="manifesto-underscore" aria-hidden="true">_</span>
      </div>
      <HomelabStatus configured={Boolean(process.env.HOMELAB_PROMETHEUS_URL)} />
    </section>
  );
}
