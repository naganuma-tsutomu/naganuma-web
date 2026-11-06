"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { homelabIdentity, homelabPreview } from "@/app/data/homelab";
import { links } from "@/app/data/links";
import { useHomelabStatus } from "@/components/HomelabProvider";
import TerminalListing from "./TerminalListing";
import type { WorkspaceListing } from "@/lib/workspace-listing";
import type { HomelabSystem } from "@/lib/homelab-types";

const monogram = [
  "    /#####\\           /#####\\",
  "   /#######\\          |#####|",
  "  /#########\\         |#####|",
  " /#####\\#####\\        |#####|",
  " |#####|\\#####\\       |#####|",
  " |#####| \\#####\\      |#####|",
  " |#####|  \\#####\\     |#####|",
  " |#####|   \\#####\\    |#####|",
  " |#####|    \\#####\\   |#####|",
  " |#####|     \\#####\\  |#####|",
  " |#####|      \\#####\\ |#####|",
  " |#####|       \\#####\\|#####|",
  " |#####|        \\###########|",
  " \\#####/         \\##########/",
].join("\n");

export type TerminalGuide = { id: string; command: string; output: ReactNode; neofetch?: boolean };
type CommandResult = { kind: "text"; output: string } | { kind: "neofetch"; system?: HomelabSystem } | { kind: "projects" | "notes"; output?: ReactNode };
type Entry = { id: number; command: string; prompt: string; result: CommandResult };
const pageNames = links.filter(({ href }) => href !== "/").map(({ name }) => name.toLowerCase());
const BOOT_COMMAND = "neofetch";
const stateLabels = {
  demo: "DEMO · NOT LIVE",
  live: "LIVE",
  partial: "PARTIAL DATA",
  unavailable: "OFFLINE",
} as const;

const emptySystem: HomelabSystem = {
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

function formatUptime(seconds: number | null) {
  if (seconds === null) return "--";
  const days = Math.floor(seconds / 86_400);
  const hours = Math.floor(seconds % 86_400 / 3_600);
  const minutes = Math.floor(seconds % 3_600 / 60);
  if (days > 0) return `${days} day${days === 1 ? "" : "s"}, ${hours} hour${hours === 1 ? "" : "s"}`;
  if (hours > 0) return `${hours} hour${hours === 1 ? "" : "s"}, ${minutes} minute${minutes === 1 ? "" : "s"}`;
  return `${minutes} minute${minutes === 1 ? "" : "s"}`;
}

function formatGibibytes(bytes: number) {
  return (bytes / 1024 ** 3).toFixed(1).replace(/\.0$/, "");
}

function systemSpecs(system: HomelabSystem): Array<[string, string]> {
  const nodes = system.onlineNodeCount === null && system.nodeCount === null
    ? "--"
    : `${system.onlineNodeCount ?? "--"} / ${system.nodeCount ?? "--"} online`;
  const guests = system.virtualMachineCount === null && system.containerCount === null
    ? "--"
    : `${system.virtualMachineCount ?? "--"} VMs · ${system.containerCount ?? "--"} LXCs`;
  const cpu = `${system.cpu} · ${system.cpuCoreCount ?? "--"} cores`;
  const memory = system.memoryUsedBytes === null || system.memoryTotalBytes === null
    ? "--"
    : `${formatGibibytes(system.memoryUsedBytes)} GiB / ${formatGibibytes(system.memoryTotalBytes)} GiB`;

  return [
    ["OS", system.os],
    ["Host", system.host],
    ["Nodes", nodes],
    ["Guests", guests],
    ["Uptime", formatUptime(system.uptimeSeconds)],
    ["CPU", cpu],
    ["GPU", system.gpu],
    ["Memory", memory],
  ];
}

function getOutput(command: string, pathname: string): CommandResult {
  const [name, ...args] = command.split(/\s+/);

  switch (name.toLowerCase()) {
    case "help":
      return { kind: "text", output: `Commands: help, ls, cd <page>, whoami, pwd, echo, neofetch, clear\nUse cd ${pageNames.join(", cd ")} to open a page.` };
    case "ls":
      if (args[0]?.replace(/\/+$/, "").toLowerCase() === "projects") return { kind: "projects" };
      if (args[0]?.replace(/\/+$/, "").toLowerCase() === "notes") return { kind: "notes" };
      return { kind: "text", output: pageNames.map((name) => `${name}/`).join("  ") };
    case "whoami":
      return { kind: "text", output: "naganuma" };
    case "pwd":
      return { kind: "text", output: pathname };
    case "echo":
      return { kind: "text", output: args.join(" ") };
    case "neofetch":
      return { kind: "neofetch" };
    default:
      return { kind: "text", output: `${name}: command not found. Type help to see available commands.` };
  }
}

function NeofetchOutput({ animate = false, onComplete, compact = false, snapshot }: { animate?: boolean; onComplete?: () => void; compact?: boolean; snapshot?: HomelabSystem }) {
  const status = useHomelabStatus();
  const system = snapshot ?? status?.system ?? emptySystem;
  const [printedRows, setPrintedRows] = useState<number | null>(0);
  const visibleRows = animate ? printedRows : null;
  const specs = systemSpecs(system);
  const rowCount = specs.length;

  useEffect(() => {
    if (!animate) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let timer = 0;
    let stopped = false;
    let step = 0;
    const finish = () => {
      stopped = true;
      window.clearTimeout(timer);
      setPrintedRows(null);
      onComplete?.();
    };
    const tick = () => {
      if (stopped) return;
      step += 1;
      if (step >= rowCount) finish();
      else {
        setPrintedRows(step);
        timer = window.setTimeout(tick, 25);
      }
    };
    const frame = window.requestAnimationFrame(() => {
      if (motion.matches) finish();
      else tick();
    });
    const onMotionChange = () => { if (motion.matches) finish(); };
    motion.addEventListener("change", onMotionChange);
    return () => {
      stopped = true;
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
      motion.removeEventListener("change", onMotionChange);
    };
  }, [animate, onComplete, rowCount]);

  return (
    <div data-neofetch-output={visibleRows === null ? "complete" : "printing"} aria-hidden={visibleRows !== null || undefined} className="grid grid-cols-[.9fr_1.1fr] items-center gap-6 py-2 max-[1200px]:grid-cols-[.72fr_1fr] max-[1200px]:gap-[10px] max-[1024px]:grid-cols-[.9fr_1.1fr] max-[1024px]:gap-[30px] max-[1024px]:py-[15px] max-[768px]:grid-cols-[.72fr_1fr] max-[768px]:gap-3 max-[768px]:py-[13px] max-[641px]:grid-cols-1 max-[641px]:py-[10px]">
      <pre className={compact ? "m-0 justify-self-center font-[family-name:var(--mono)] text-[9px] leading-[1.12] font-bold whitespace-pre text-[var(--aqua)] select-none xl:text-[10px] max-[641px]:hidden" : "m-0 justify-self-center font-[family-name:var(--mono)] text-[clamp(10px,1.03vw,16px)] leading-[1.12] font-bold whitespace-pre text-[var(--aqua)] select-none max-[1200px]:text-[10px] max-[1024px]:text-[15px] max-[768px]:text-[clamp(7px,1.95vw,13px)] max-[641px]:hidden"} aria-hidden="true">{monogram}</pre>
      <div className="min-w-0">
        <dl className="m-0">
          {specs.map(([label, value], index) => (
            <div data-neofetch-row className={`${compact ? "grid grid-cols-[52px_minmax(0,1fr)] gap-1 text-[11px] leading-[1.65]" : "grid grid-cols-[87px_1fr] gap-2 text-[clamp(11px,1.05vw,16px)] leading-[1.55] max-[1200px]:grid-cols-[62px_1fr] max-[1200px]:text-[11px] max-[1024px]:grid-cols-[83px_1fr] max-[1024px]:text-sm max-[768px]:grid-cols-[61px_1fr] max-[768px]:gap-1 max-[768px]:text-[11px] max-[768px]:leading-[1.8] max-[641px]:grid-cols-[76px_1fr] max-[641px]:text-[13px] max-[641px]:leading-[1.9] max-[375px]:grid-cols-[70px_1fr] max-[375px]:text-xs"} ${visibleRows === null || index < visibleRows ? "" : "invisible"}`} key={label}>
              <dt className="text-[var(--aqua)]">{label}:</dt><dd className="m-0 [overflow-wrap:anywhere]">{value}</dd>
            </div>
          ))}
        </dl>
        <div className={`mt-[17px] flex h-[21px] w-[245px] max-w-full max-[768px]:h-4 [&_span]:flex-1 ${visibleRows === null ? "" : "invisible"}`} aria-hidden="true">
          {homelabPreview.palette.map((color) => <span key={color} style={{ backgroundColor: color }} />)}
        </div>
        <p className={`status-demo mt-[9px] ${visibleRows === null ? "" : "invisible"}`} data-state={system.state} aria-live="polite">{snapshot || status ? stateLabels[system.state] : "CONNECTING"}</p>
      </div>
    </div>
  );
}

function GuideOutput({ children, animate, onComplete }: { children: ReactNode; animate: boolean; onComplete: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (!animate) return;
    const rows = Array.from(ref.current!.querySelectorAll<HTMLElement>("[data-command-row]"));
    let index = 0;
    let timer = 0;
    const reveal = (row: HTMLElement) => { row.style.visibility = ""; row.removeAttribute("aria-hidden"); };
    rows.forEach(row => { row.style.visibility = "hidden"; row.setAttribute("aria-hidden", "true"); });
    const tick = () => {
      if (index >= rows.length) { onComplete(); return; }
      reveal(rows[index++]);
      timer = window.setTimeout(tick, 25);
    };
    const frame = window.requestAnimationFrame(tick);
    return () => { window.cancelAnimationFrame(frame); window.clearTimeout(timer); rows.forEach(reveal); };
  }, [animate, onComplete]);
  return <div ref={ref} data-guide-output className="py-3 font-[family-name:var(--mono),var(--font-shippori-mincho)]">{children}</div>;
}

export default function InteractiveTerminal({ inputId = "terminal-command-input", guide, projectOutput, noteOutput, followScroll = false, compact = false, navigation, enabled = true }: { enabled?: boolean; inputId?: string; guide?: TerminalGuide; projectOutput?: ReactNode; noteOutput?: ReactNode; followScroll?: boolean; compact?: boolean; navigation?: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const status = useHomelabStatus();
  const prompt = `naganuma@home:${pathname === "/" ? "~" : pathname}`;
  const [manualPrompt, setManualPrompt] = useState(prompt);
  const entries = useRef(0);
  const pinned = useRef(true);
  const listCache = useRef<Partial<Record<"projects" | "notes", { output: ReactNode; expires: number }>>>({});
  const requests = useRef(new Map<string, Promise<ReactNode>>());
  useEffect(() => {
    if (projectOutput) listCache.current.projects = { output: projectOutput, expires: Date.now() + 300_000 };
    if (noteOutput) listCache.current.notes = { output: noteOutput, expires: Date.now() + 300_000 };
  }, [projectOutput, noteOutput]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<Entry[]>([]);
  const [showWelcome, setShowWelcome] = useState(true);
  const [manual, setManual] = useState(false);
  const [manualGuide, setManualGuide] = useState<TerminalGuide | null>(null);
  const currentGuide = manual ? manualGuide : followScroll ? guide ?? null : null;
  const automaticCommand = followScroll && guide ? guide.command : BOOT_COMMAND;
  const automaticNeofetch = followScroll && guide ? Boolean(guide.neofetch) : true;
  const displayedCommand = currentGuide?.command ?? BOOT_COMMAND;
  const [animateOutput, setAnimateOutput] = useState(false);
  const screenRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const stopBoot = useRef<(() => void) | null>(null);
  // Render the full content on the server, including when JavaScript is unavailable.
  const [bootCommand, setBootCommand] = useState<string | null>(null);
  const [autoRun, setAutoRun] = useState(0);
  const finishBoot = useCallback(() => stopBoot.current?.(), []);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel || manual || !enabled || typeof IntersectionObserver === "undefined") return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motion.matches) return;
    let started = false;
    let stopped = false;
    let frame = 0;
    let timer = 0;
    const finish = () => {
      stopped = true;
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
      visibility.disconnect();
      intro.disconnect();
      setBootCommand(null);
    };
    const start = () => {
      if (started || stopped || panel.closest("[inert]") || document.documentElement.dataset.pageTransition === "active" || document.visibilityState !== "visible") return;
      const login = document.querySelector<HTMLElement>("[data-login-intro]");
      if (login && getComputedStyle(login).display !== "none") return;
      const rect = panel.getBoundingClientRect();
      if (!rect.width || rect.top >= window.innerHeight || rect.bottom <= 0) return;
      started = true;
      visibility.disconnect();
      intro.disconnect();
      setBootCommand("");
      setAutoRun(run => run + 1);
      if (pinned.current) screenRef.current?.scrollTo({ top: 0 });
      let length = 0;
      const type = () => {
        if (stopped) return;
        length += 1;
        setBootCommand(automaticCommand.slice(0, length));
        if (length < automaticCommand.length) timer = window.setTimeout(type, 65);
      };
      timer = window.setTimeout(type, 100);
    };
    const visibility = new IntersectionObserver(start, { threshold: 0 });
    const intro = new MutationObserver(start);
    visibility.observe(panel);
    intro.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["inert", "data-page-transition"] });
    frame = window.requestAnimationFrame(start);
    stopBoot.current = finish;
    const onVisibility = () => { if (document.visibilityState !== "visible") finish(); };
    document.addEventListener("visibilitychange", onVisibility);
    const onMotionChange = () => { if (motion.matches) finish(); };
    motion.addEventListener("change", onMotionChange);
    return () => {
      stopped = true;
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
      visibility.disconnect();
      intro.disconnect();
      motion.removeEventListener("change", onMotionChange);
      document.removeEventListener("visibilitychange", onVisibility);
      stopBoot.current = null;
    };
  }, [automaticCommand, automaticNeofetch, followScroll, guide?.id, manual, enabled]);

  useEffect(() => {
    if (history.length > 0 && pinned.current) {
      screenRef.current?.scrollTo({ top: screenRef.current.scrollHeight });
    }
  }, [history]);

  function beginManual() {
    stopBoot.current?.();
    setAnimateOutput(false);
    if (!manual) { setManualGuide(followScroll ? guide ?? null : null); setManualPrompt(prompt); }
    setManual(true);
  }

  function resumeFollowing() {
    setManual(false);
    setShowWelcome(true);
    setInput("");
    setAnimateOutput(false);
    screenRef.current?.scrollTo({ top: 0 });
  }

  async function listingOutput(kind: "projects" | "notes"): Promise<ReactNode> {
    const cached = listCache.current[kind];
    if (cached && cached.expires > Date.now()) return cached.output;
    const pending = requests.current.get(kind);
    if (pending) return pending;
    const request = fetch(`/api/workspace-guide?section=${kind}`, { signal: AbortSignal.timeout(8000) }).then(async response => {
      if (!response.ok) throw new Error("Unable to load listing");
      const listing = await response.json() as WorkspaceListing;
      const output = <TerminalListing listing={listing} />;
      if (!listing.message) listCache.current[kind] = { output, expires: Date.now() + 300_000 };
      return output;
    }).catch(() => <p>一覧を取得できませんでした。<a href={`/${kind}`} className="text-[var(--aqua)] underline">一覧ページへ ↗</a></p>).finally(() => requests.current.delete(kind));
    requests.current.set(kind, request);
    return request;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const command = input.trim();
    if (!command) return;
    beginManual();
    setAnimateOutput(command.toLowerCase() === "neofetch");
    const [name, ...args] = command.split(/\s+/);
    const id = ++entries.current;
    const append = (result: CommandResult) => setHistory(current => [...current, { id, command, prompt, result }]);

    if (name.toLowerCase() === "cd") {
      const target = args[0]?.toLowerCase().replace(/^\.\//, "").replace(/\/+$/, "");
      const destination = !target || ["~", "..", "/"].includes(target)
        ? "/"
        : links.find(({ name: page, href }) => target === page.toLowerCase() || target === href)?.href;
      if (args.length > 1) append({ kind: "text", output: "cd: too many arguments" });
      else if (!destination) append({ kind: "text", output: `cd: ${args[0]}: no such page. Type ls to see available pages.` });
      else if (destination === pathname) append({ kind: "text", output: destination === "/" ? "Already at home." : `Already at ${destination}.` });
      else {
        append({ kind: "text", output: destination });
        document.dispatchEvent(new CustomEvent("naganuma:navigate", { detail: { pathname: destination, hash: "", source: "terminal" } }));
        router.push(destination, { scroll: false });
      }
    } else if (command.toLowerCase() === "clear") {
      setHistory([]);
      setShowWelcome(false);
      screenRef.current?.scrollTo({ top: 0 });
    } else {
      const result = getOutput(command, pathname);
      if (result.kind === "neofetch") append({ ...result, system: structuredClone(status?.system ?? emptySystem) });
      else if (result.kind === "projects" || result.kind === "notes") {
        const kind = result.kind;
        const cached = listCache.current[kind];
        const output = cached && cached.expires > Date.now() ? cached.output : undefined;
        append({ kind, output: output ?? "一覧を読み込み中…" });
        if (!output) void listingOutput(kind).then(value => setHistory(current => current.map(entry => entry.id === id ? { ...entry, result: { kind, output: value } } : entry)));
      } else append(result);
    }
    setInput("");
  }

  return (
    <div ref={panelRef} data-boot={bootCommand === null ? "complete" : "typing"} data-mode={manual ? "manual" : "follow"} data-guide={currentGuide?.id ?? "homelab"} className="terminal-panel dark-panel relative flex h-[460px] flex-col sm:h-[490px] lg:h-[480px] xl:h-[510px]">
      {navigation}
      <div className="panel-titlebar min-h-[37px] py-[6px] max-[768px]:px-3 max-[768px]:text-[13px]">
        <span className="min-w-0 truncate" title={prompt}>{prompt}</span>
        <span className="inline-flex shrink-0 gap-[10px] [&_i]:block [&_i]:h-3 [&_i]:w-3 [&_i]:rounded-full [&_i]:border [&_i]:border-current" aria-hidden="true"><i /><i /><i /></span>
      </div>
      <div className="flex min-h-0 flex-1 flex-col border border-t-0 border-[var(--border)] px-5 pt-[18px] pb-6 max-[768px]:px-3 max-[768px]:pt-[13px] max-[768px]:pb-[17px]">
        {followScroll && (
          <div className="mb-3 flex min-h-8 shrink-0 items-center justify-between gap-2 border-b border-[#29424b] pb-2 font-[family-name:Arial,var(--font-shippori-mincho)] text-[10px] text-[#b9c7c9]">
            <span>{manual ? "手動操作中" : pathname === "/" ? "スクロール連動" : "ページ連動"}</span>
            {manual && <button type="button" onClick={resumeFollowing} className="min-h-8 text-[var(--aqua)] underline underline-offset-4">{pathname === "/" ? "スクロール連動に戻る" : "自動案内に戻る"}</button>}
          </div>
        )}
        <div className="relative flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain [scrollbar-color:#537175_transparent] [scrollbar-width:thin]" ref={screenRef} onScroll={() => { const screen = screenRef.current; if (screen) pinned.current = screen.scrollHeight - screen.clientHeight - screen.scrollTop < 24; }}>
          {showWelcome && (
            <>
              <p className="mb-[9px] text-[13px] text-[#c4cccc] max-[768px]:text-[10px]">Personal workspace · web / server / homelab</p>
              <p className="m-0 max-[768px]:text-xs">
                <span className="text-[var(--aqua)]">{manual ? manualPrompt : prompt}</span>$ <span aria-hidden="true">{bootCommand ?? displayedCommand}</span><span className="sr-only">{displayedCommand}</span>
                {bootCommand !== null && bootCommand !== displayedCommand && <span className="inline-block h-[1em] w-[1ch] bg-[var(--red)] align-middle" aria-hidden="true" />}
              </p>
              <div className={bootCommand === null || bootCommand === displayedCommand ? "" : "invisible"} aria-hidden={bootCommand !== null && bootCommand !== displayedCommand || undefined}>
                {currentGuide && !currentGuide.neofetch ? <GuideOutput key={`${currentGuide.id}-${autoRun}`} animate={bootCommand === displayedCommand} onComplete={finishBoot}>{currentGuide.output}</GuideOutput> : <NeofetchOutput key={`${currentGuide?.id ?? "initial"}-${autoRun}`} animate={bootCommand === displayedCommand} onComplete={finishBoot} compact={compact} />}
              </div>
            </>
          )}
          <div className="grid gap-2" aria-live="polite" aria-atomic="false">
            {(manual ? history : []).map((entry, index) => (
              <div key={entry.id}>
                <p className="m-0 max-[768px]:text-xs"><span className="text-[var(--aqua)]">{entry.prompt}</span>$ <span className="whitespace-pre-wrap [overflow-wrap:anywhere]">{entry.command}</span></p>
                {entry.result.kind === "neofetch" ? <NeofetchOutput snapshot={entry.result.system} animate={animateOutput && index === history.length - 1} compact={compact} /> : entry.result.kind === "projects" || entry.result.kind === "notes" ? <div className="py-3 font-[family-name:var(--mono),var(--font-shippori-mincho)] text-xs leading-[1.8]">{entry.result.output}</div> : entry.result.output && <p className="m-0 whitespace-pre-wrap text-[#c4cccc] [overflow-wrap:anywhere]">{entry.result.output}</p>}
              </div>
            ))}
          </div>
        </div>
        <form className="terminal-input-row mt-3 flex w-full min-w-0 shrink-0 items-center gap-2" onSubmit={handleSubmit} onClick={() => inputRef.current?.focus()}>
          <label className="max-w-[52%] shrink-0 truncate whitespace-nowrap" title={prompt} htmlFor={inputId}><span className="text-[var(--aqua)]">{prompt}</span>$</label>
          <span className="relative block min-w-[1ch] flex-1">
            <input
              id={inputId}
              ref={inputRef}
              value={input}
              onFocus={beginManual}
              onChange={(event) => { setAnimateOutput(false); setInput(event.target.value); }}
              aria-label="Terminal command. Type help to see available commands."
              title="Type help to see available commands"
              maxLength={200}
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="go"
              className="block w-full min-w-0 border-0 bg-transparent p-0 font-[inherit] leading-[inherit] text-inherit outline-none caret-[var(--red)] [caret-shape:block] supports-not-[caret-shape:block]:caret-transparent"
            />
            <span className="terminal-cursor pointer-events-none absolute top-1/2 h-[1.2em] w-[1ch] -translate-y-1/2 bg-[var(--red)] motion-safe:animate-blink" style={{ left: `min(${input.length}ch, calc(100% - 1ch))` }} aria-hidden="true" />
            {!input && <span className="pointer-events-none absolute top-1/2 left-[calc(1ch+4px)] -translate-y-1/2 whitespace-nowrap text-[#91a7a9] max-[768px]:text-xs" aria-hidden="true">type help ↵</span>}
          </span>
        </form>
        <div className="mx-[-20px] mt-0 mb-[-24px] flex shrink-0 items-center gap-3 bg-[var(--terminal-accent)] px-2 py-0.5 text-xs leading-[1.4] text-[#08171b] max-[768px]:mx-[-12px] max-[768px]:mb-[-17px]" aria-label="tmux session home, window 0 bash">
          <span className="font-bold">[home]</span>
          <span className="whitespace-nowrap">0:bash*</span>
          <span className="ml-auto whitespace-nowrap text-[#24464b]">naganuma@home</span>
        </div>
      </div>
    </div>
  );
}
