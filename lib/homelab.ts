import "server-only";

import { homelabPreview } from "@/app/data/homelab";
import type { HomelabMetric, HomelabNetwork, HomelabStatus } from "@/lib/homelab-types";
import { homelabQueries, networkQueries, normalizeMetric, parseInstantValue, parseRangeValues, rangeValueAt } from "@/lib/prometheus-metrics";

const LABELS = ["CPU", "MEM", "DISK"] as const;
const CACHE_MS = 25_000;
const REQUEST_TIMEOUT_MS = 5_000;
const EMPTY_NETWORK: HomelabNetwork = { receiveMbps: null, transmitMbps: null, history: [] };

let cached: { expiresAt: number; result: Promise<HomelabStatus> } | null = null;

function demoStatus(): HomelabStatus {
  return {
    state: "demo",
    metrics: homelabPreview.metrics.map(({ label, value }) => ({
      label: label as HomelabMetric["label"],
      value,
      unit: "%",
      fillPercent: value,
    })),
    network: homelabPreview.network,
  };
}

async function queryPrometheus(baseUrl: URL, query: string, rangeEnd: number | null, bearerToken?: string): Promise<unknown> {
  const url = new URL(baseUrl);
  url.pathname = `${url.pathname.replace(/\/$/, "")}/api/v1/${rangeEnd !== null ? "query_range" : "query"}`;
  url.searchParams.set("query", query);
  if (rangeEnd !== null) {
    url.searchParams.set("start", String(rangeEnd - 600));
    url.searchParams.set("end", String(rangeEnd));
    url.searchParams.set("step", "30s");
  }

  const response = await fetch(url, {
    headers: bearerToken ? { Authorization: `Bearer ${bearerToken}` } : undefined,
    cache: "no-store",
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`Prometheus returned HTTP ${response.status}.`);
  return response.json();
}

async function loadStatus(): Promise<HomelabStatus> {
  const configuredUrl = process.env.HOMELAB_PROMETHEUS_URL?.trim();
  if (!configuredUrl) return demoStatus();

  let baseUrl: URL;
  try {
    baseUrl = new URL(configuredUrl);
    if (!["http:", "https:"].includes(baseUrl.protocol)) throw new Error("Invalid protocol");
  } catch {
    console.error("HOMELAB_PROMETHEUS_URL is not a valid HTTP URL.");
    return { state: "unavailable", metrics: LABELS.map((label) => normalizeMetric(label, null)), network: EMPTY_NETWORK };
  }

  const instance = process.env.HOMELAB_PROMETHEUS_INSTANCE?.trim() || undefined;
  const queries = homelabQueries(instance);
  const netQueries = networkQueries(instance);
  const bearerToken = process.env.HOMELAB_PROMETHEUS_BEARER_TOKEN;
  const names = [...LABELS, "receive", "transmit"] as const;
  const rangeEnd = Math.floor(Date.now() / 30_000) * 30;
  const results = await Promise.allSettled(names.map((name) => queryPrometheus(
    baseUrl,
    name === "receive" || name === "transmit" ? netQueries[name] : queries[name],
    name === "receive" || name === "transmit" ? rangeEnd : null,
    bearerToken,
  )));
  const metrics = LABELS.map((label, index) => {
    const result = results[index];
    if (result.status === "rejected") {
      console.error(`HOMELAB ${label} query failed:`, result.reason instanceof Error ? result.reason.message : "Unknown error");
    }
    return normalizeMetric(label, result.status === "fulfilled" ? parseInstantValue(result.value) : null);
  });
  const readSeries = (index: number) => {
    const result = results[index];
    if (result.status === "rejected") {
      console.error(`HOMELAB ${names[index]} query failed:`, result.reason instanceof Error ? result.reason.message : "Unknown error");
    }
    return result.status === "fulfilled" ? parseRangeValues(result.value) : null;
  };
  const receive = readSeries(3);
  const transmit = readSeries(4);
  const byTimestamp = new Map<number, { receiveMbps: number | null; transmitMbps: number | null }>();
  for (const point of receive ?? []) byTimestamp.set(point.timestamp, { receiveMbps: point.value, transmitMbps: null });
  for (const point of transmit ?? []) {
    const entry = byTimestamp.get(point.timestamp) ?? { receiveMbps: null, transmitMbps: null };
    entry.transmitMbps = point.value;
    byTimestamp.set(point.timestamp, entry);
  }
  const history = [...byTimestamp].sort(([a], [b]) => a - b).map(([timestamp, values]) => ({ timestamp, ...values }));
  const network: HomelabNetwork = {
    // Keep history, but never substitute an older point for the current step.
    receiveMbps: rangeValueAt(receive, rangeEnd),
    transmitMbps: rangeValueAt(transmit, rangeEnd),
    history,
  };
  const available = metrics.filter(({ value }) => value !== null).length + Number(network.receiveMbps !== null) + Number(network.transmitMbps !== null);

  return {
    state: available === 0 ? "unavailable" : available === names.length ? "live" : "partial",
    metrics,
    network,
  };
}

export function getHomelabStatus(): Promise<HomelabStatus> {
  if (cached && Date.now() < cached.expiresAt) return cached.result;
  const result = loadStatus();
  cached = { expiresAt: Date.now() + CACHE_MS, result };
  return result;
}
