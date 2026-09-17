// Design-preview values, not live server measurements.
const previewReceive = [3.2, 3.5, 4.1, 3.8, 5.6, 5.0, 4.4, 6.1, 5.8, 7.4, 8.2];
const previewTransmit = [1.0, 1.2, 1.1, 1.5, 1.4, 1.8, 1.7, 1.9, 2.3, 2.1, 2.4];

export const homelabPreview = {
  specs: [
    ["OS", "Ubuntu 24.04 LTS"],
    ["Host", "Proxmox Cluster"],
    ["Kernel", "6.8.0"],
    ["Uptime", "24 days, 7 hours"],
    ["Packages", "1243"],
    ["Shell", "bash"],
    ["Terminal", "tmux"],
    ["CPU", "AMD Ryzen 5 5600G"],
    ["GPU", "NVIDIA GeForce RTX 3060"],
    ["Memory", "12.1 GiB / 64 GiB"],
  ],
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
