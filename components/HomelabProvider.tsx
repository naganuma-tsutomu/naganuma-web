"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { homelabIdentity, homelabPreview } from "@/app/data/homelab";
import type { HomelabMetric, HomelabNetwork, HomelabStatus } from "@/lib/homelab-types";

const REFRESH_MS = 30_000;
const emptyNetwork: HomelabNetwork = { receiveMbps: null, transmitMbps: null, history: [] };
const unavailableMetrics: HomelabMetric[] = (["CPU", "MEM", "DISK"] as const).map((label) => ({
  label, value: null, unit: "%", fillPercent: null,
}));

const preview: HomelabStatus = {
  state: "demo",
  metrics: homelabPreview.metrics.map(({ label, value }) => ({
    label: label as HomelabMetric["label"], value, unit: "%", fillPercent: value,
  })),
  network: homelabPreview.network,
  system: { state: "demo", ...homelabIdentity, ...homelabPreview.system },
};

const unavailable: HomelabStatus = {
  state: "unavailable",
  metrics: unavailableMetrics,
  network: emptyNetwork,
  system: {
    state: "unavailable",
    ...homelabIdentity,
    nodeCount: null,
    onlineNodeCount: null,
    virtualMachineCount: null,
    containerCount: null,
    cpuCoreCount: null,
    uptimeSeconds: null,
    memoryUsedBytes: null,
    memoryTotalBytes: null,
  },
};

const HomelabContext = createContext<HomelabStatus | null | undefined>(undefined);

export function HomelabProvider({ configured, children }: { configured: boolean; children: ReactNode }) {
  const [status, setStatus] = useState<HomelabStatus | null>(configured ? null : preview);

  useEffect(() => {
    if (!configured) return;

    let active = true;
    let request: AbortController | null = null;
    let interval: number | null = null;

    async function refresh() {
      request?.abort();
      const controller = new AbortController();
      request = controller;
      try {
        const response = await fetch("/api/homelab", { cache: "no-store", signal: controller.signal });
        if (!response.ok) throw new Error("Unable to load homelab status.");
        const nextStatus = await response.json() as HomelabStatus;
        if (active && !controller.signal.aborted) setStatus(nextStatus);
      } catch {
        if (active && !controller.signal.aborted) setStatus(unavailable);
      } finally {
        if (request === controller) request = null;
      }
    }

    function onVisibilityChange() {
      if (document.visibilityState === "visible") {
        if (interval !== null) window.clearInterval(interval);
        void refresh();
        interval = window.setInterval(() => void refresh(), REFRESH_MS);
      } else {
        if (interval !== null) window.clearInterval(interval);
        interval = null;
        request?.abort();
      }
    }

    onVisibilityChange();
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      active = false;
      document.removeEventListener("visibilitychange", onVisibilityChange);
      if (interval !== null) window.clearInterval(interval);
      request?.abort();
    };
  }, [configured]);

  return <HomelabContext.Provider value={status}>{children}</HomelabContext.Provider>;
}

export function useHomelabStatus() {
  const status = useContext(HomelabContext);
  if (status === undefined) throw new Error("useHomelabStatus must be used within HomelabProvider.");
  return status;
}
