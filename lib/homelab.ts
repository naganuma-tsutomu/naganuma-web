import "server-only";

import { homelabIdentity, homelabPreview } from "../app/data/homelab.ts";
import type { HomelabMetric, HomelabNetwork, HomelabStatus, HomelabSystem } from "@/lib/homelab-types";
import { homelabQueries, networkQueries, normalizeMetric, parseInstantValue, parseRangeValues, rangeValueAt, systemQueries } from "./prometheus-metrics.ts";

const LABELS = ["CPU", "MEM", "DISK"] as const;
const SYSTEM_LABELS = ["nodes", "onlineNodes", "virtualMachines", "containers", "cpuCores", "uptime", "memoryUsed", "memoryTotal"] as const;
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
    system: { state: "demo", ...homelabIdentity, ...homelabPreview.system },
  };
}

function unavailableSystem(): HomelabSystem {
  return {
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
    return { state: "unavailable", metrics: LABELS.map((label) => normalizeMetric(label, null)), network: EMPTY_NETWORK, system: unavailableSystem() };
  }

  const instance = process.env.HOMELAB_PROMETHEUS_INSTANCE?.trim() || undefined;
  const queries = { ...homelabQueries(instance), ...systemQueries(instance) };
  const netQueries = networkQueries(instance);
  const bearerToken = process.env.HOMELAB_PROMETHEUS_BEARER_TOKEN;
  const names = [...LABELS, "receive", "transmit", ...SYSTEM_LABELS] as const;
  const rangeEnd = Math.floor(Date.now() / 30_000) * 30;
  const results = await Promise.allSettled(names.map((name) => queryPrometheus(
    baseUrl,
    name === "receive" || name === "transmit"
      ? netQueries[name]
      : queries[name],
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

  const readSystemValue = (name: typeof SYSTEM_LABELS[number]) => {
    const index = names.indexOf(name);
    const result = results[index];
    if (result.status === "rejected") {
      console.error(`HOMELAB ${name} query failed:`, result.reason instanceof Error ? result.reason.message : "Unknown error");
    }
    const value = result.status === "fulfilled" ? parseInstantValue(result.value) : null;
    return value !== null && value >= 0 ? value : null;
  };
  const rawNodeCount = readSystemValue("nodes");
  const rawOnlineNodeCount = readSystemValue("onlineNodes");
  const rawVirtualMachineCount = readSystemValue("virtualMachines");
  const rawContainerCount = readSystemValue("containers");
  const rawCpuCoreCount = readSystemValue("cpuCores");
  const rawUptime = readSystemValue("uptime");
  const rawMemoryUsed = readSystemValue("memoryUsed");
  const rawMemoryTotal = readSystemValue("memoryTotal");
  const nodeCount = rawNodeCount === null ? null : Math.round(rawNodeCount);
  const onlineNodeCount = rawOnlineNodeCount === null ? null : Math.round(rawOnlineNodeCount);
  const virtualMachineCount = rawVirtualMachineCount === null ? null : Math.round(rawVirtualMachineCount);
  const containerCount = rawContainerCount === null ? null : Math.round(rawContainerCount);
  const cpuCoreCount = rawCpuCoreCount === null ? null : Math.round(rawCpuCoreCount);
  const uptimeSeconds = rawUptime === null ? null : Math.floor(rawUptime);
  const validMemory = rawMemoryUsed !== null && rawMemoryTotal !== null && rawMemoryTotal > 0;
  const systemAvailable = Number(nodeCount !== null && onlineNodeCount !== null)
    + Number(virtualMachineCount !== null && containerCount !== null)
    + Number(cpuCoreCount !== null)
    + Number(uptimeSeconds !== null)
    + Number(validMemory);
  const system: HomelabSystem = {
    state: systemAvailable === 0 ? "unavailable" : systemAvailable === 5 ? "live" : "partial",
    ...homelabIdentity,
    nodeCount,
    onlineNodeCount,
    virtualMachineCount,
    containerCount,
    cpuCoreCount,
    uptimeSeconds,
    memoryUsedBytes: validMemory ? rawMemoryUsed : null,
    memoryTotalBytes: validMemory ? rawMemoryTotal : null,
  };

  return {
    state: available === 0 ? "unavailable" : available === LABELS.length + 2 ? "live" : "partial",
    metrics,
    network,
    system,
  };
}

export function getHomelabStatus(): Promise<HomelabStatus> {
  if (cached && Date.now() < cached.expiresAt) return cached.result;
  const result = loadStatus();
  cached = { expiresAt: Date.now() + CACHE_MS, result };
  return result;
}
