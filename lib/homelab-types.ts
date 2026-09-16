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

export type HomelabStatus = {
  state: "demo" | "live" | "partial" | "unavailable";
  metrics: HomelabMetric[];
  network: HomelabNetwork;
};
