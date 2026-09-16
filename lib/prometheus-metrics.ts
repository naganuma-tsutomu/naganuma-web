import type { HomelabMetric } from "@/lib/homelab-types";

function exactMatcher(label: string, value: string): string {
  const escaped = value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
  return `${label}="${escaped}"`;
}

function selector(instance: string | undefined, additional: string[] = []): string {
  const matchers = [...additional];
  if (instance) matchers.push(exactMatcher("instance", instance));
  return `{${matchers.join(",")}}`;
}

export function homelabQueries(instance?: string): Record<HomelabMetric["label"], string> {
  const nodes = selector(instance, ['job="proxmox"', 'id=~"node/.+"']);

  return {
    CPU: `100 * sum(pve_cpu_usage_ratio${nodes} * pve_cpu_usage_limit${nodes}) / sum(pve_cpu_usage_limit${nodes})`,
    MEM: `100 * sum(pve_memory_usage_bytes${nodes}) / sum(pve_memory_size_bytes${nodes})`,
    DISK: `100 * sum(pve_disk_usage_bytes${nodes}) / sum(pve_disk_size_bytes${nodes})`,
  };
}

export function networkQueries(instance?: string): { receive: string; transmit: string } {
  const guests = selector(instance, ['job="proxmox"', 'id=~"(qemu|lxc)/.+"']);
  return {
    receive: `8 / 1000000 * sum(clamp_min(deriv(pve_network_receive_bytes${guests}[2m]), 0))`,
    transmit: `8 / 1000000 * sum(clamp_min(deriv(pve_network_transmit_bytes${guests}[2m]), 0))`,
  };
}

export function parseInstantValue(payload: unknown): number | null {
  if (!payload || typeof payload !== "object") return null;
  const result = payload as {
    status?: unknown;
    data?: { resultType?: unknown; result?: unknown };
  };
  if (result.status !== "success" || result.data?.resultType !== "vector" || !Array.isArray(result.data.result) || result.data.result.length !== 1) {
    return null;
  }
  const sample = result.data.result[0] as { value?: unknown };
  if (!Array.isArray(sample?.value) || sample.value.length !== 2 || typeof sample.value[1] !== "string") return null;
  const value = Number(sample.value[1]);
  return Number.isFinite(value) ? value : null;
}

export function parseRangeValues(payload: unknown): Array<{ timestamp: number; value: number }> | null {
  if (!payload || typeof payload !== "object") return null;
  const result = payload as {
    status?: unknown;
    data?: { resultType?: unknown; result?: unknown };
  };
  if (result.status !== "success" || result.data?.resultType !== "matrix" || !Array.isArray(result.data.result) || result.data.result.length !== 1) {
    return null;
  }
  const series = result.data.result[0] as { values?: unknown };
  if (!Array.isArray(series?.values)) return null;
  const values = series.values.flatMap((sample): Array<{ timestamp: number; value: number }> => {
    if (!Array.isArray(sample) || sample.length !== 2 || typeof sample[0] !== "number" || typeof sample[1] !== "string" || !sample[1].trim()) return [];
    const value = Number(sample[1]);
    return Number.isFinite(sample[0]) && Number.isFinite(value) && value >= 0 ? [{ timestamp: sample[0], value }] : [];
  });
  return values.length ? values : null;
}

export function normalizeMetric(label: HomelabMetric["label"], value: number | null): HomelabMetric {
  if (value === null || value < 0) return { label, value: null, unit: "%", fillPercent: null };
  const percent = Math.max(0, Math.min(100, Math.round(value)));
  return { label, value: percent, unit: "%", fillPercent: percent };
}
