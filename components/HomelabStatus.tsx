"use client";

import { useHomelabStatus } from "@/components/HomelabProvider";
import type { HomelabNetwork } from "@/lib/homelab-types";

const emptyNetwork: HomelabNetwork = { receiveMbps: null, transmitMbps: null, history: [] };
const unavailableMetrics = (["CPU", "MEM", "DISK"] as const).map((label) => ({
  label, value: null, unit: "%", fillPercent: null,
}));

const labels = {
  demo: "DEMO · NOT LIVE",
  live: "LIVE",
  partial: "PARTIAL DATA",
  unavailable: "OFFLINE",
} as const;

function Sparkline({ values }: { values: Array<number | null> }) {
  const finite = values.filter((value): value is number => value !== null);
  if (finite.length < 2) return <span className="network-sparkline-empty" aria-hidden="true" />;

  const min = Math.min(...finite);
  const max = Math.max(...finite);
  let path = "";
  let previousVisible = false;
  values.forEach((value, index) => {
    if (value === null) {
      previousVisible = false;
      return;
    }
    const x = values.length === 1 ? 0 : index / (values.length - 1) * 120;
    const y = max === min ? 12 : 21 - (value - min) / (max - min) * 18;
    path += `${previousVisible ? " L" : " M"}${x.toFixed(1)} ${y.toFixed(1)}`;
    previousVisible = true;
  });

  return <svg className="network-sparkline" viewBox="0 0 120 24" preserveAspectRatio="none" aria-hidden="true"><path d={path} /></svg>;
}

function NetworkLine({ direction, value, values }: { direction: "receive" | "transmit"; value: number | null; values: Array<number | null> }) {
  const receive = direction === "receive";
  return (
    <span className={`network-line ${receive ? "network-receive" : "network-transmit"}`}>
      <span className="network-direction">{receive ? "↓ RX" : "↑ TX"}</span>
      <span className="network-value">{value === null ? "--" : value.toFixed(1)}</span>
      <Sparkline values={values} />
    </span>
  );
}

export default function HomelabStatus() {
  const status = useHomelabStatus();

  const network = status?.network ?? emptyNetwork;
  return (
    <div className="status-panel dark-panel" data-hero-window>
      <div className="mobile-status-summary">
        <strong>HOMELAB STATUS</strong>
        <span className="status-demo" data-state={status?.state}>{status ? labels[status.state] : "CONNECTING"}</span>
      </div>
      <div className="panel-titlebar status-titlebar" data-drag-handle role="group" tabIndex={0} aria-label="Homelab status window. Drag or use arrow keys to move.">
        <h2>HOMELAB STATUS</h2>
        <span className="window-dots" aria-hidden="true"><i /><i /><i /></span>
      </div>
      <div className="status-body">
        <dl className="status-meters">
          {(status?.metrics ?? unavailableMetrics).map(({ label, value, fillPercent }) => (
            <div className="status-row" key={label}>
              <dt>{label}</dt>
              <dd>
                <span className="meter-segments" aria-hidden="true">
                  {Array.from({ length: 16 }, (_, index) => <i key={index} className={fillPercent !== null && index < Math.round(fillPercent / 100 * 16) ? "is-filled" : undefined} />)}
                </span>
                <span className="meter-value">{value === null ? "--" : `${value}%`}</span>
              </dd>
            </div>
          ))}
          <div className="status-row status-network">
            <dt>NET<span className="network-unit">Mb/s</span></dt>
            <dd title="10-minute trend (RX and TX use separate scales)">
              <NetworkLine direction="receive" value={network.receiveMbps} values={network.history.map((point) => point.receiveMbps)} />
              <NetworkLine direction="transmit" value={network.transmitMbps} values={network.history.map((point) => point.transmitMbps)} />
            </dd>
          </div>
        </dl>
        <div className="status-motto-wrap">
          <span className="status-demo" data-state={status?.state} aria-live="polite">{status ? labels[status.state] : "CONNECTING"}</span>
          <p className="status-motto">MAKE <br />A BETTER <br />DIGITAL LIFE.<span className="short-rule" aria-hidden="true" /></p>
        </div>
      </div>
    </div>
  );
}
