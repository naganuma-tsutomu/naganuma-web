"use client";

import { homelabIdentity } from "@/app/data/homelab";
import { useHomelabStatus } from "./HomelabProvider";
import HomelabStatus from "./HomelabStatus";

export default function HomelabOverview() {
  const status = useHomelabStatus();
  const system = status?.system;
  const facts = [
    ["OS", homelabIdentity.os],
    ["HOST", homelabIdentity.host],
    ["CPU", homelabIdentity.cpu],
    ["GPU", homelabIdentity.gpu],
    ["NODES", system?.onlineNodeCount == null || system.nodeCount == null ? "--" : `${system.onlineNodeCount} / ${system.nodeCount} online`],
    ["VIRTUAL MACHINES", system?.virtualMachineCount == null ? "--" : `${system.virtualMachineCount} VMs`],
    ["CONTAINERS", system?.containerCount == null ? "--" : `${system.containerCount} containers`],
    ["CPU CORES", system?.cpuCoreCount == null ? "--" : `${system.cpuCoreCount} cores`],
    ["MEMORY", system?.memoryTotalBytes == null ? "--" : `${Math.round(system.memoryTotalBytes / 1024 ** 3)} GiB`],
    ["UPTIME", system?.uptimeSeconds == null ? "--" : `${Math.floor(system.uptimeSeconds / 86400)} days / ${Math.floor(system.uptimeSeconds % 86400 / 3600)} hours`],
  ];
  return (
    <>
      <p className="mt-0 mb-6 max-w-[60ch] text-sm leading-[2] text-[var(--text-sub)]">自宅のサーバーを使って、仮想化基盤の構築や運用を試しています。機材の構成と、取得できた稼働データを公開しています。</p>
      <dl className="m-0 border-t border-[var(--ink)]">
        {facts.map(([label, value]) => (
          <div key={label} className="grid min-w-0 grid-cols-[minmax(100px,1fr)_2fr] items-baseline gap-4 border-b border-[#a8b5a9] py-4">
            <dt className="font-[family-name:var(--mono)] text-[10px] tracking-wider text-[var(--teal)]">{label}</dt>
            <dd className="m-0 break-words font-[family-name:var(--mono)] text-sm">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="my-5 text-xs leading-[1.8] text-[var(--text-sub)]">{!status ? "稼働データを取得しています。" : status.state === "demo" ? "現在の数値はデモデータです。実際の稼働値ではありません。" : status.state === "unavailable" ? "現在、稼働データを取得できません。構成情報のみ表示しています。" : status.state === "partial" ? "取得できた項目のみ表示しています。欠損値は -- で表示します。" : "取得した稼働データを表示しています。"}</p>
      <p className="my-5 text-xs leading-[1.8] text-[var(--text-sub)]">稼働データは取得先を設定した環境で30秒ごとに更新します。取得できない項目は -- と表示します。</p>
      <div className="lg:hidden"><HomelabStatus /></div>
    </>
  );
}
