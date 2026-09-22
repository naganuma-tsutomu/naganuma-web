// Design-preview values, not live server measurements.
const previewReceive = [3.2, 3.5, 4.1, 3.8, 5.6, 5.0, 4.4, 6.1, 5.8, 7.4, 8.2];
const previewTransmit = [1.0, 1.2, 1.1, 1.5, 1.4, 1.8, 1.7, 1.9, 2.3, 2.1, 2.4];
const gibibyte = 1024 ** 3;

// Public, slow-changing labels. Live measurements are added by the server.
export const homelabIdentity = {
  os: "Proxmox VE",
  host: "Home Cluster",
  cpu: "AMD Ryzen 5 5600G",
  gpu: "NVIDIA GeForce RTX 3060",
};

export const homelabPreview = {
  system: {
    nodeCount: 3,
    onlineNodeCount: 3,
    virtualMachineCount: 8,
    containerCount: 5,
    cpuCoreCount: 24,
    uptimeSeconds: 24 * 24 * 60 * 60 + 7 * 60 * 60,
    memoryUsedBytes: 12.1 * gibibyte,
    memoryTotalBytes: 64 * gibibyte,
  },
  palette: ["#293f47", "#005863", "#008994", "#b7b6a2", "#ffbd76", "#ff965a", "var(--red)"],
  metrics: [
    { label: "CPU", value: 12 },
    { label: "MEM", value: 38 },
    { label: "DISK", value: 42 },
  ],
  network: {
    receiveMbps: previewReceive.at(-1) ?? null,
    transmitMbps: previewTransmit.at(-1) ?? null,
    history: previewReceive.map((receiveMbps, index) => ({
      timestamp: index * 60,
      receiveMbps,
      transmitMbps: previewTransmit[index],
    })),
  },
};
