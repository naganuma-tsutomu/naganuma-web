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
  if (finite.length < 2) return <span className="block h-5 border-b border-dashed border-[#29424b]" aria-hidden="true" />;

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

  return (
    <svg className="block w-full h-5 overflow-visible border-b border-[#29424b]" viewBox="0 0 120 24" preserveAspectRatio="none" aria-hidden="true">
      <path className="fill-none stroke-current stroke-[1.5] [vector-effect:non-scaling-stroke]" d={path} />
    </svg>
  );
}

function NetworkLine({ direction, value, values }: { direction: "receive" | "transmit"; value: number | null; values: Array<number | null> }) {
  const receive = direction === "receive";
  return (
    <span className={`grid grid-cols-[43px_5ch_minmax(24px,1fr)] max-[768px]:grid-cols-[37px_5ch_minmax(24px,1fr)] gap-[7px] max-[768px]:gap-1 items-center min-w-0 text-[11px] max-[768px]:text-[10px] leading-none ${receive ? "text-[var(--terminal-accent)]" : "text-[#ffbd76]"}`}>
      <span className="whitespace-nowrap">{receive ? "↓ RX" : "↑ TX"}</span>
      <span className="text-right tabular-nums whitespace-nowrap">{value === null ? "--" : value.toFixed(1)}</span>
      <Sparkline values={values} />
    </span>
  );
}

export default function HomelabStatus() {
  const status = useHomelabStatus();

  const network = status?.network ?? emptyNetwork;
  const isLive = status?.state === "live";
  const isDemo = status?.state === "demo";

  const statusDemoClasses = `text-[10px] max-[768px]:text-[9px] tracking-[0.05em] whitespace-nowrap ${
    isLive
      ? "inline-flex items-center gap-[9px] text-[#b9c7c9] before:content-[''] before:w-[7px] before:h-[7px] before:shrink-0 before:rounded-full before:bg-[#57d7c3] before:shadow-[0_0_10px_#57d7c3]"
      : isDemo
      ? "text-[#ff7364]"
      : "text-[#b9c7c9]"
  }`;

  return (
    <div className="status-panel dark-panel relative flex flex-col before:absolute before:inset-[5px] before:border before:border-[var(--border)] before:pointer-events-none" data-hero-window>
      <div className="hidden max-[768px]:flex min-h-[43px] items-center gap-3 px-3 py-2 font-[family-name:var(--mono)] text-[10px] leading-[1.3]">
        <strong className="mr-auto text-[11px] tracking-[0.04em]">HOMELAB STATUS</strong>
        <span className={statusDemoClasses} data-state={status?.state}>{status ? labels[status.state] : "CONNECTING"}</span>
      </div>
      <div className="panel-titlebar status-titlebar min-h-[37px] py-[6px] border-0 max-[768px]:hidden" data-drag-handle role="group" tabIndex={0} aria-label="Homelab status window. Drag or use arrow keys to move.">
        <h2 className="m-0 font-inherit text-[14px]">HOMELAB STATUS</h2>
        <span className="window-dots" aria-hidden="true"><i /><i /><i /></span>
      </div>
      <div className="status-body grid flex-1 grid-cols-[1.65fr_1fr] max-[1199px]:grid-cols-[1.8fr_1fr] max-[1023px]:grid-cols-1 max-[768px]:block max-[768px]:flex-none max-[768px]:min-h-0 items-stretch border-0 border-t border-[var(--border)] p-[19px_24px] max-[1199px]:px-3 max-[1023px]:p-5 max-[768px]:p-[11px_12px_13px] gap-[30px] max-[1199px]:gap-[15px] max-[1023px]:gap-5 min-h-[156px] max-[1023px]:min-h-[232px]">
        <dl className="grid gap-[9px] max-[768px]:gap-2 content-center m-0">
          {(status?.metrics ?? unavailableMetrics).map(({ label, value, fillPercent }) => (
            <div className="grid grid-cols-[44px_minmax(0,1fr)] max-[1199px]:grid-cols-[35px_minmax(0,1fr)] max-[1023px]:grid-cols-[44px_minmax(0,1fr)] max-[768px]:grid-cols-[31px_minmax(0,1fr)] gap-3 max-[1199px]:gap-[6px] max-[1023px]:gap-[15px] max-[768px]:gap-[5px] items-center text-[14px] max-[1199px]:text-[12px] max-[1023px]:text-[14px] max-[768px]:text-[11px] leading-none" key={label}>
              <dt>{label}</dt>
              <dd className="m-0 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-[15px] max-[1199px]:gap-2 max-[1023px]:gap-[15px]">
                <span className="grid grid-cols-[repeat(16,minmax(0,1fr))] gap-[2px] max-[768px]:gap-[1px] h-[17px] max-[768px]:h-[15px]" aria-hidden="true">
                  {Array.from({ length: 16 }, (_, index) => {
                    const isFilled = fillPercent !== null && index < Math.round(fillPercent / 100 * 16);
                    return (
                      <i
                        key={index}
                        className={isFilled ? "bg-[var(--terminal-accent)] shadow-[inset_0_0_3px_#4faea1]" : "bg-[#29424b] shadow-[inset_0_0_3px_#12262c]"}
                      />
                    );
                  })}
                </span>
                <span className="tabular-nums whitespace-nowrap">{value === null ? "--" : `${value}%`}</span>
              </dd>
            </div>
          ))}
          <div className="grid grid-cols-[44px_minmax(0,1fr)] max-[1199px]:grid-cols-[35px_minmax(0,1fr)] max-[1023px]:grid-cols-[44px_minmax(0,1fr)] max-[768px]:grid-cols-[31px_minmax(0,1fr)] gap-3 max-[1199px]:gap-[6px] max-[1023px]:gap-[15px] max-[768px]:gap-[5px] items-center text-[14px] max-[1199px]:text-[12px] max-[1023px]:text-[14px] max-[768px]:text-[11px] leading-none max-[768px]:hidden">
            <dt>NET<span className="block mt-[3px] text-[#a5b6b9] text-[9px] max-[768px]:text-[8px] leading-none">Mb/s</span></dt>
            <dd className="m-0 grid grid-cols-[minmax(0,1fr)] gap-[3px] min-w-0" title="10-minute trend (RX and TX use separate scales)">
              <NetworkLine direction="receive" value={network.receiveMbps} values={network.history.map((point) => point.receiveMbps)} />
              <NetworkLine direction="transmit" value={network.transmitMbps} values={network.history.map((point) => point.transmitMbps)} />
            </dd>
          </div>
        </dl>
        <div className="status-motto-wrap relative grid min-w-0 max-[1023px]:pt-[14px] max-[768px]:hidden">
          <span className={`${statusDemoClasses} absolute top-0 right-0`} data-state={status?.state} aria-live="polite">{status ? labels[status.state] : "CONNECTING"}</span>
          <p className="m-0 border-l border-[var(--border)] pl-7 max-[1199px]:pl-[15px] max-[1023px]:border-l-0 max-[1023px]:border-t max-[1023px]:border-[var(--border)] max-[1023px]:pt-3 max-[1023px]:pl-0 content-center text-[15px] max-[1199px]:text-[12px] max-[1023px]:text-[11px] leading-[1.55] tracking-[0.06em]">
            MAKE <br className="max-[1023px]:hidden" />A BETTER <br className="max-[1023px]:hidden" />DIGITAL LIFE.
            <span className="block w-[23px] h-px bg-current mt-[14px] max-[1023px]:hidden" aria-hidden="true" />
          </p>
        </div>
      </div>
    </div>
  );
}
