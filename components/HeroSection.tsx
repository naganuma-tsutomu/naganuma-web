import { homelabPreview } from "@/app/data/homelab";

const monogram = [
  " #####             #####",
  " ######            #####",
  " #######           #####",
  " ########          #####",
  " ##### ###         #####",
  " #####  ###        #####",
  " #####   ###       #####",
  " #####    ###      #####",
  " #####     ###     #####",
  " #####      ###    #####",
  " #####       ###   #####",
  " #####        ###  #####",
  " #####         ### #####",
  " #####          ########",
  " #####           #######",
  " #####            ######",
  " #####             #####",
].join("\n");

export default function HeroSection() {
  return (
    <section className="hero-grid site-shell" aria-labelledby="hero-title">
      <div className="terminal-panel dark-panel">
        <div className="panel-titlebar">
          <span>naganuma@home:~</span>
          <span className="window-dots" aria-hidden="true"><i /><i /><i /></span>
        </div>
        <div className="terminal-body">
          <p className="terminal-intro">Personal workspace · web / server / homelab</p>
          <p className="terminal-command"><span className="terminal-prompt">naganuma@home:~</span>$ neofetch</p>
          <div className="neofetch-output">
            <pre className="ascii-monogram" aria-hidden="true">{monogram}</pre>
            <div className="system-info">
              <dl>
                {homelabPreview.specs.map(([label, value]) => (
                  <div className={`system-info-row ${["Kernel", "Packages", "Shell", "Terminal"].includes(label) ? "system-info-secondary" : ""}`} key={label}>
                    <dt>{label}:</dt><dd>{value}</dd>
                  </div>
                ))}
              </dl>
              <div className="terminal-palette" aria-hidden="true">
                {homelabPreview.palette.map((color) => <span key={color} style={{ backgroundColor: color }} />)}
              </div>
              <p className="sample-config">SAMPLE CONFIGURATION</p>
            </div>
          </div>
          <p className="terminal-command terminal-idle" aria-hidden="true">
            <span className="terminal-prompt">naganuma@home:~</span>$<span className="terminal-caret" />
          </p>
        </div>
      </div>
      <div className="manifesto-panel">
        <h1 id="hero-title">BUILD<br />TWEAK<br />LEARN<br />REPEAT.</h1>
        <div className="manifesto-caption">
          <p>WEB / SERVER / HOMELAB<br />CODE / DESIGN / LIFE</p>
          <span className="short-rule" aria-hidden="true" />
        </div>
        <span className="manifesto-underscore" aria-hidden="true">_</span>
      </div>
      <div className="status-panel dark-panel">
        <div className="panel-titlebar status-titlebar">
          <h2>HOMELAB STATUS</h2><span className="status-demo">DEMO · NOT LIVE</span>
        </div>
        <div className="status-body">
          <dl className="status-meters">
            {homelabPreview.metrics.map(({ label, value }) => (
              <div className="status-row" key={label}>
                <dt>{label}</dt>
                <dd>
                  <span className="meter-segments" aria-hidden="true">
                    {Array.from({ length: 16 }, (_, index) => <i key={index} className={index < Math.max(1, Math.round(value / 100 * 16)) ? "is-filled" : undefined} />)}
                  </span>
                  <span className="meter-value">{value}%</span>
                </dd>
              </div>
            ))}
          </dl>
          <p className="status-motto">MAKE <br />A BETTER <br />DIGITAL LIFE.<span className="short-rule" aria-hidden="true" /></p>
        </div>
      </div>
    </section>
  );
}
