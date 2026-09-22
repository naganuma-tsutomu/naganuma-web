export type HomelabMetric = {
  label: "CPU" | "MEM" | "DISK";
  value: number | null;
  unit: "%";
  fillPercent: number | null;
};

export type HomelabNetworkPoint = {
  timestamp: number;
  receiveMbps: number | null;
  transmitMbps: number | null;
};

export type HomelabNetwork = {
  receiveMbps: number | null;
  transmitMbps: number | null;
  history: HomelabNetworkPoint[];
};

export type HomelabState = "demo" | "live" | "partial" | "unavailable";

export type HomelabSystem = {
  state: HomelabState;
  os: string;
  host: string;
  cpu: string;
  gpu: string;
  nodeCount: number | null;
  onlineNodeCount: number | null;
  virtualMachineCount: number | null;
  containerCount: number | null;
  cpuCoreCount: number | null;
  uptimeSeconds: number | null;
  memoryUsedBytes: number | null;
  memoryTotalBytes: number | null;
};

export type HomelabStatus = {
  state: HomelabState;
  metrics: HomelabMetric[];
  network: HomelabNetwork;
  system: HomelabSystem;
};
