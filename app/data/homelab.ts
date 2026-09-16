// Design-preview values from the reference, not live server measurements.
// Replace this data source when the homelab integration is ready.
export const homelabPreview = {
  specs: [
    ["OS", "Ubuntu 24.04 LTS"],
    ["Host", "Proxmox Cluster"],
    ["Kernel", "6.8.0"],
    ["Uptime", "24 days, 7 hours"],
    ["Packages", "1243"],
    ["Shell", "zsh 5.9"],
    ["Terminal", "tmux"],
    ["CPU", "AMD Ryzen 5 5600G"],
    ["GPU", "NVIDIA GeForce RTX 3060"],
    ["Memory", "12.1 GiB / 64 GiB"],
  ],
  palette: ["#293f47", "#005863", "#008994", "#b7b6a2", "#ffbd76", "#ff965a", "#ed4136"],
  metrics: [
    { label: "CPU", value: 12 },
    { label: "MEM", value: 38 },
    { label: "DISK", value: 42 },
    { label: "NET", value: 3 },
  ],
};
