import assert from "node:assert/strict";
import { afterEach, beforeEach, mock, test } from "node:test";

const envKeys = ["HOMELAB_PROMETHEUS_URL", "HOMELAB_PROMETHEUS_INSTANCE", "HOMELAB_PROMETHEUS_BEARER_TOKEN"];
let saved;
let now;
let getHomelabStatus;
let moduleId = 0;
beforeEach(async () => {
  saved = Object.fromEntries(envKeys.map(key => [key, process.env[key]]));
  for (const key of envKeys) delete process.env[key];
  process.env.HOMELAB_PROMETHEUS_URL = "https://prometheus.example.test/prometheus/";
  now = 1_800_000_017_000;
  mock.method(Date, "now", () => now);
  mock.method(console, "error", () => {});
  // Each test gets an independent module cache without adding a production reset API.
  ({ getHomelabStatus } = await import(`../lib/homelab.ts?test=${++moduleId}`));
  mock.method(globalThis, "fetch", async () => { throw new Error("Unexpected fetch"); });
});
afterEach(() => {
  for (const key of envKeys) {
    if (saved[key] === undefined) delete process.env[key];
    else process.env[key] = saved[key];
  }
  mock.restoreAll();
});

const instant = value => ({ status: "success", data: { resultType: "vector", result: [{ value: [1, String(value)] }] } });
const range = values => ({ status: "success", data: { resultType: "matrix", result: [{ values }] } });
function nameOf(url) {
  const query = url.searchParams.get("query");
  if (query.includes("pve_network_receive_bytes")) return "receive";
  if (query.includes("pve_network_transmit_bytes")) return "transmit";
  if (query.includes("pve_cpu_usage_ratio")) return "CPU";
  if (query.includes('id=~"qemu/.+"')) return "virtualMachines";
  if (query.includes('id=~"lxc/.+"')) return "containers";
  if (query.startsWith("count(pve_up")) return "nodes";
  if (query.startsWith("sum(pve_up")) return "onlineNodes";
  if (query.startsWith("sum(pve_cpu_usage_limit")) return "cpuCores";
  if (query.includes("pve_uptime_seconds")) return "uptime";
  if (query.startsWith("sum(pve_memory_usage_bytes")) return "memoryUsed";
  if (query.startsWith("sum(pve_memory_size_bytes")) return "memoryTotal";
  if (query.includes("pve_memory_usage_bytes")) return "MEM";
  if (query.includes("pve_disk_usage_bytes")) return "DISK";
  throw new Error(`Unexpected query: ${query}`);
}
function payload(url) {
  const name = nameOf(url);
  if (name === "receive" || name === "transmit") {
    const end = Number(url.searchParams.get("end"));
    return range([[end - 30, "1"], [end, name === "receive" ? "2.5" : "0"]]);
  }
  return instant({
    CPU: 12.4, MEM: 38.6, DISK: 105, nodes: 3, onlineNodes: 3,
    virtualMachines: 8, containers: 5, cpuCores: 24, uptime: 2_098_800,
    memoryUsed: 12.1 * 1024 ** 3, memoryTotal: 64 * 1024 ** 3,
  }[name]);
}
function respond(handler = url => Response.json(payload(url))) {
  globalThis.fetch.mock.mockImplementation(handler);
  return globalThis.fetch;
}
function assertUnavailable(status) {
  assert.equal(status.state, "unavailable");
  assert.deepEqual(status.metrics.map(({ label, value, fillPercent }) => [label, value, fillPercent]), [
    ["CPU", null, null], ["MEM", null, null], ["DISK", null, null],
  ]);
  assert.deepEqual(status.network, { receiveMbps: null, transmitMbps: null, history: [] });
  assert.equal(status.system.state, "unavailable");
  assert.deepEqual(
    [status.system.nodeCount, status.system.onlineNodeCount, status.system.virtualMachineCount,
      status.system.containerCount, status.system.cpuCoreCount, status.system.uptimeSeconds,
      status.system.memoryUsedBytes, status.system.memoryTotalBytes],
    [null, null, null, null, null, null, null, null],
  );
}

test("missing configuration returns demo values without fetching", async () => {
  delete process.env.HOMELAB_PROMETHEUS_URL;
  const status = await getHomelabStatus();
  assert.equal(status.state, "demo");
  assert.deepEqual(status.metrics.map(({ value }) => value), [12, 38, 42]);
  assert.ok(status.network.history.length > 0);
  assert.equal(status.system.state, "demo");
  assert.equal(status.system.nodeCount, 3);
  assert.equal(status.system.onlineNodeCount, 3);
  assert.equal(status.system.virtualMachineCount, 8);
  assert.equal(status.system.containerCount, 5);
  assert.equal(status.system.cpuCoreCount, 24);
  assert.equal(globalThis.fetch.mock.callCount(), 0);
});

test("invalid URL configuration fails closed without fetching", async () => {
  process.env.HOMELAB_PROMETHEUS_URL = "file:///etc/passwd";
  assertUnavailable(await getHomelabStatus());
  assert.equal(globalThis.fetch.mock.callCount(), 0);
});

test("all successful queries produce live status, system facts and current network values", async () => {
  process.env.HOMELAB_PROMETHEUS_INSTANCE = " home:9100 ";
  process.env.HOMELAB_PROMETHEUS_BEARER_TOKEN = "test-secret";
  const fetch = respond();
  const status = await getHomelabStatus();
  assert.equal(status.state, "live");
  assert.deepEqual(status.metrics, [
    { label: "CPU", value: 12, unit: "%", fillPercent: 12 },
    { label: "MEM", value: 39, unit: "%", fillPercent: 39 },
    { label: "DISK", value: 100, unit: "%", fillPercent: 100 },
  ]);
  assert.equal(status.network.receiveMbps, 2.5);
  assert.equal(status.network.transmitMbps, 0);
  assert.deepEqual(status.system, {
    state: "live", os: "Proxmox VE", host: "Home Cluster",
    cpu: "AMD Ryzen 5 5600G", gpu: "NVIDIA GeForce RTX 3060",
    nodeCount: 3, onlineNodeCount: 3, virtualMachineCount: 8,
    containerCount: 5, cpuCoreCount: 24, uptimeSeconds: 2_098_800,
    memoryUsedBytes: 12.1 * 1024 ** 3, memoryTotalBytes: 64 * 1024 ** 3,
  });
  assert.equal(fetch.mock.callCount(), 13);
  const end = 1_800_000_000;
  for (const { arguments: [url, options] } of fetch.mock.calls) {
    assert.equal(url.origin, "https://prometheus.example.test");
    assert.equal(options.headers.Authorization, "Bearer test-secret");
    assert.equal(url.href.includes("test-secret"), false);
    assert.equal(options.cache, "no-store");
    assert.ok(options.signal instanceof AbortSignal);
    assert.match(url.searchParams.get("query"), /instance="home:9100"/);
    if (["receive", "transmit"].includes(nameOf(url))) {
      assert.equal(url.pathname, "/prometheus/api/v1/query_range");
      assert.equal(url.searchParams.get("end"), String(end));
      assert.equal(url.searchParams.get("start"), String(end - 600));
      assert.equal(url.searchParams.get("step"), "30s");
    } else {
      assert.equal(url.pathname, "/prometheus/api/v1/query");
      assert.equal(url.searchParams.has("start"), false);
    }
  }
});

test("one failed metric and one failed network query preserve other results as partial", async () => {
  respond(url => ["MEM", "transmit"].includes(nameOf(url))
    ? new Response(null, { status: 503 }) : Response.json(payload(url)));
  const status = await getHomelabStatus();
  assert.equal(status.state, "partial");
  assert.deepEqual(status.metrics.map(({ value }) => value), [12, null, 100]);
  assert.equal(status.network.receiveMbps, 2.5);
  assert.equal(status.network.transmitMbps, null);
  assert.ok(status.network.history.every(point => point.transmitMbps === null));
});

test("one failed system query only marks neofetch data as partial", async () => {
  respond(url => nameOf(url) === "onlineNodes"
    ? new Response(null, { status: 503 }) : Response.json(payload(url)));
  const status = await getHomelabStatus();
  assert.equal(status.state, "live");
  assert.equal(status.system.state, "partial");
  assert.equal(status.system.nodeCount, 3);
  assert.equal(status.system.onlineNodeCount, null);
  assert.equal(status.system.virtualMachineCount, 8);
  assert.equal(status.system.containerCount, 5);
  assert.equal(status.system.cpuCoreCount, 24);
});

test("all HTTP failures produce unavailable status", async () => {
  const fetch = respond(() => new Response(null, { status: 503 }));
  assertUnavailable(await getHomelabStatus());
  assert.equal(fetch.mock.callCount(), 13);
});

test("transport errors, invalid JSON and Prometheus error payloads do not reject the status", async () => {
  respond(url => {
    if (nameOf(url) === "CPU") throw new Error("Connection refused");
    if (nameOf(url) === "MEM") return new Response("not JSON");
    return Response.json({ status: "error", error: "query failed" });
  });
  assertUnavailable(await getHomelabStatus());
});

test("timeouts use a five-second abort signal and resolve as unavailable", async () => {
  const signal = AbortSignal.abort(new DOMException("Timed out", "TimeoutError"));
  const timeout = mock.method(AbortSignal, "timeout", milliseconds => {
    assert.equal(milliseconds, 5000);
    return signal;
  });
  respond((_url, options) => {
    assert.equal(options.signal, signal);
    options.signal.throwIfAborted();
  });
  assertUnavailable(await getHomelabStatus());
  assert.equal(timeout.mock.callCount(), 13);
});

test("network histories merge by timestamp and never substitute stale values for the current step", async () => {
  const end = 1_800_000_000;
  respond(url => {
    if (nameOf(url) === "receive") return Response.json(range([[end - 30, "2"], [end - 60, "1"], [end, "NaN"]]));
    if (nameOf(url) === "transmit") return Response.json(range([[end, "0"], [end - 60, "3"]]));
    return Response.json(payload(url));
  });
  const status = await getHomelabStatus();
  assert.equal(status.state, "partial");
  assert.equal(status.network.receiveMbps, null);
  assert.equal(status.network.transmitMbps, 0);
  assert.deepEqual(status.network.history, [
    { timestamp: end - 60, receiveMbps: 1, transmitMbps: 3 },
    { timestamp: end - 30, receiveMbps: 2, transmitMbps: null },
    { timestamp: end, receiveMbps: null, transmitMbps: 0 },
  ]);
});

test("history alone does not mark stale measurements as available", async () => {
  respond(url => ["receive", "transmit"].includes(nameOf(url))
    ? Response.json(range([[1_799_999_970, "1"]])) : Response.json(instant("NaN")));
  const status = await getHomelabStatus();
  assert.equal(status.state, "unavailable");
  assert.equal(status.network.history.length, 1);
  assert.equal(status.network.receiveMbps, null);
  assert.equal(status.network.transmitMbps, null);
});

test("simultaneous callers share the in-flight request and cached result until 25 seconds", async () => {
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  const fetch = respond(async (url, options) => {
    assert.equal(options.headers, undefined);
    assert.equal(url.searchParams.get("query").includes("instance="), false);
    await gate;
    return Response.json(payload(url));
  });
  const first = getHomelabStatus();
  const concurrent = Array.from({ length: 10 }, () => getHomelabStatus());
  assert.ok(concurrent.every(result => result === first));
  assert.equal(fetch.mock.callCount(), 13);
  release();
  const result = await first;
  await Promise.all(concurrent);
  now += 24_999;
  assert.equal(getHomelabStatus(), first);
  assert.equal(await getHomelabStatus(), result);
  assert.equal(fetch.mock.callCount(), 13);
  now += 1;
  const refreshed = getHomelabStatus();
  assert.notEqual(refreshed, first);
  assert.equal(getHomelabStatus(), refreshed);
  assert.equal((await refreshed).state, "live");
  assert.equal(fetch.mock.callCount(), 26);
});

test("an unavailable result is cached briefly and recovers after expiry", async () => {
  const fetch = respond(() => new Response(null, { status: 503 }));
  assertUnavailable(await getHomelabStatus());
  respond();
  now += 24_999;
  assertUnavailable(await getHomelabStatus());
  assert.equal(fetch.mock.callCount(), 13);
  now += 1;
  assert.equal((await getHomelabStatus()).state, "live");
  assert.equal(fetch.mock.callCount(), 26);
});
