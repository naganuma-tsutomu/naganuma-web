import assert from "node:assert/strict";
import { test } from "node:test";
import { homelabQueries, networkQueries, normalizeMetric, parseInstantValue, parseRangeValues, rangeValueAt, systemQueries } from "../lib/prometheus-metrics.ts";

test("queries Proxmox node and guest metrics for the selected exporter", () => {
  const queries = homelabQueries("home:9100");
  const network = networkQueries("home:9100");
  const system = systemQueries("home:9100");
  assert.match(queries.CPU, /pve_cpu_usage_ratio\{job="proxmox",id=~"node\/\.\+",instance="home:9100"\}/);
  assert.match(queries.CPU, /pve_cpu_usage_limit/);
  assert.match(queries.MEM, /pve_memory_usage_bytes/);
  assert.match(queries.DISK, /pve_disk_usage_bytes/);
  assert.match(network.receive, /pve_network_receive_bytes\{job="proxmox",id=~"\(qemu\|lxc\)\/\.\+",instance="home:9100"\}\[2m\]/);
  assert.match(network.transmit, /pve_network_transmit_bytes/);
  assert.match(system.nodes, /count\(pve_up\{job="proxmox",id=~"node\/\.\+",instance="home:9100"\}\)/);
  assert.match(system.onlineNodes, /sum\(pve_up\{job="proxmox",id=~"node\/\.\+",instance="home:9100"\}\)/);
  assert.match(system.virtualMachines, /count\(pve_up\{job="proxmox",id=~"qemu\/\.\+",instance="home:9100"\}\)/);
  assert.match(system.containers, /count\(pve_up\{job="proxmox",id=~"lxc\/\.\+",instance="home:9100"\}\)/);
  assert.match(system.cpuCores, /sum\(pve_cpu_usage_limit\{job="proxmox",id=~"node\/\.\+",instance="home:9100"\}\)/);
  assert.match(system.uptime, /min\(pve_uptime_seconds/);
  assert.match(system.memoryUsed, /sum\(pve_memory_usage_bytes/);
  assert.match(system.memoryTotal, /sum\(pve_memory_size_bytes/);
});

test("reads one finite Prometheus instant-vector sample", () => {
  const response = (result) => ({ status: "success", data: { resultType: "vector", result } });
  assert.equal(parseInstantValue(response([{ value: [1_789_000_000, "37.45"] }])), 37.45);
  assert.equal(parseInstantValue(response([])), null);
  assert.equal(parseInstantValue(response([{ value: [1, "NaN"] }])), null);
  assert.equal(parseInstantValue(response([{ value: [1, "5"] }, { value: [1, "6"] }])), null);
  assert.equal(parseInstantValue({ status: "error" }), null);
});

test("reads finite samples from a Prometheus range matrix", () => {
  const response = (values) => ({ status: "success", data: { resultType: "matrix", result: [{ values }] } });
  assert.deepEqual(parseRangeValues(response([[1, "2.5"], [2, "NaN"], [3, "0"]])), [
    { timestamp: 1, value: 2.5 }, { timestamp: 3, value: 0 },
  ]);
  assert.equal(parseRangeValues(response([])), null);
  assert.equal(parseRangeValues({ status: "error" }), null);
});

test("requires a valid value at the current range step while preserving history", () => {
  const response = (values) => ({ status: "success", data: { resultType: "matrix", result: [{ values }] } });
  const history = parseRangeValues(response([[30, "2.5"], [60, "NaN"]]));
  assert.equal(rangeValueAt(history, 60), null);
  assert.equal(rangeValueAt(history, 90), null);
  assert.deepEqual(history, [{ timestamp: 30, value: 2.5 }]);
  assert.equal(rangeValueAt(parseRangeValues(response([[30, "2.5"], [60, "0"]])), 60), 0);
  assert.equal(rangeValueAt(parseRangeValues(response([[60, "4.5"]])), 60), 4.5);
  assert.equal(rangeValueAt(null, 60), null);
  assert.equal(rangeValueAt([], 60), null);
  assert.equal(rangeValueAt([{ timestamp: 90, value: 1 }], 60), null);
});

test("keeps percentages bounded", () => {
  assert.deepEqual(normalizeMetric("CPU", 105), { label: "CPU", value: 100, unit: "%", fillPercent: 100 });
  assert.deepEqual(normalizeMetric("MEM", null), { label: "MEM", value: null, unit: "%", fillPercent: null });
});
