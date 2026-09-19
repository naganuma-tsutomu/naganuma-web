"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { homelabPreview } from "@/app/data/homelab";
import { links } from "@/app/data/links";

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

type CommandResult = { kind: "text"; output: string } | { kind: "neofetch" };
type Entry = { command: string; result: CommandResult };
const pageNames = links.filter(({ href }) => href !== "/").map(({ name }) => name.toLowerCase());

function getOutput(command: string): CommandResult {
  const [name, ...args] = command.split(/\s+/);

  switch (name.toLowerCase()) {
    case "help":
      return { kind: "text", output: `Commands: help, ls, cd <page>, whoami, pwd, echo, neofetch, clear\nUse cd ${pageNames.join(", cd ")} to open a page.` };
    case "ls":
      return { kind: "text", output: pageNames.map((name) => `${name}/`).join("  ") };
    case "whoami":
      return { kind: "text", output: "naganuma" };
    case "pwd":
      return { kind: "text", output: "/home/naganuma" };
    case "echo":
      return { kind: "text", output: args.join(" ") };
    case "neofetch":
      return { kind: "neofetch" };
    default:
      return { kind: "text", output: `${name}: command not found. Type help to see available commands.` };
  }
}

function NeofetchOutput() {
  return (
    <div className="grid grid-cols-[.9fr_1.1fr] items-center gap-6 py-2 max-[1200px]:grid-cols-[.72fr_1fr] max-[1200px]:gap-[10px] max-[1024px]:grid-cols-[.9fr_1.1fr] max-[1024px]:gap-[30px] max-[1024px]:py-[15px] max-[768px]:grid-cols-[.72fr_1fr] max-[768px]:gap-3 max-[768px]:py-[13px] max-[641px]:grid-cols-1 max-[641px]:py-[10px]">
      <pre className="m-0 justify-self-center font-[family-name:var(--mono)] text-[clamp(10px,1.03vw,16px)] leading-[1.12] font-bold whitespace-pre text-[var(--aqua)] select-none max-[1200px]:text-[10px] max-[1024px]:text-[15px] max-[768px]:text-[clamp(7px,1.95vw,13px)] max-[641px]:hidden" aria-hidden="true">{monogram}</pre>
      <div className="min-w-0">
        <dl className="m-0">
          {homelabPreview.specs.map(([label, value]) => (
            <div className={`grid grid-cols-[87px_1fr] gap-2 text-[clamp(11px,1.05vw,16px)] leading-[1.55] max-[1200px]:grid-cols-[62px_1fr] max-[1200px]:text-[11px] max-[1024px]:grid-cols-[83px_1fr] max-[1024px]:text-sm max-[768px]:grid-cols-[61px_1fr] max-[768px]:gap-1 max-[768px]:text-[11px] max-[768px]:leading-[1.8] max-[641px]:grid-cols-[76px_1fr] max-[641px]:text-[13px] max-[641px]:leading-[1.9] max-[375px]:grid-cols-[70px_1fr] max-[375px]:text-xs ${["Kernel", "Packages", "Shell", "Terminal"].includes(label) ? "max-[641px]:hidden" : ""}`} key={label}>
              <dt className="text-[var(--aqua)]">{label}:</dt><dd className="m-0 [overflow-wrap:anywhere]">{value}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-[17px] flex h-[21px] w-[245px] max-w-full max-[768px]:h-4 [&_span]:flex-1" aria-hidden="true">
          {homelabPreview.palette.map((color) => <span key={color} style={{ backgroundColor: color }} />)}
        </div>
        <p className="mt-[9px] text-[9px] tracking-[0.13em] text-[#93a8ae] max-[768px]:text-[8px]">SAMPLE CONFIGURATION</p>
      </div>
    </div>
  );
}

export default function InteractiveTerminal({ draggable = true, inputId = "terminal-command-input" }: { draggable?: boolean; inputId?: string }) {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<Entry[]>([]);
  const [showWelcome, setShowWelcome] = useState(true);
  const screenRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (history.length > 0) {
      screenRef.current?.scrollTo({ top: screenRef.current.scrollHeight });
    }
  }, [history]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const command = input.trim();
    if (!command) return;
    const [name, ...args] = command.split(/\s+/);

    if (name.toLowerCase() === "cd") {
      const target = args[0]?.toLowerCase().replace(/^\.\//, "").replace(/\/+$/, "");
      const destination = !target || ["~", "..", "/"].includes(target)
        ? "/"
        : links.find(({ name: page, href }) => target === page.toLowerCase() || target === href)?.href;

      if (args.length > 1) {
        setHistory((current) => [...current, { command, result: { kind: "text", output: "cd: too many arguments" } }]);
      } else if (!destination) {
        setHistory((current) => [...current, { command, result: { kind: "text", output: `cd: ${args[0]}: no such page. Type ls to see available pages.` } }]);
      } else if (destination === "/") {
        setHistory((current) => [...current, { command, result: { kind: "text", output: "Already at home." } }]);
      } else {
        router.push(destination);
      }
    } else if (command.toLowerCase() === "clear") {
      setHistory([]);
      setShowWelcome(false);
      screenRef.current?.scrollTo({ top: 0 });
    } else {
      setHistory((current) => [...current, { command, result: getOutput(command) }]);
    }
    setInput("");
  }

  return (
    <div className="terminal-panel dark-panel row-span-2 flex flex-col max-[1024px]:col-span-full max-[1024px]:row-start-2 max-[1024px]:min-h-[490px] max-[768px]:min-h-[450px] max-[641px]:min-h-[390px]" data-hero-window={draggable ? "" : undefined}>
      <div className="panel-titlebar min-h-[37px] py-[6px] max-[768px]:px-3 max-[768px]:text-[13px]" data-drag-handle={draggable ? "" : undefined} role={draggable ? "group" : undefined} tabIndex={draggable ? 0 : undefined} aria-label={draggable ? "Terminal window. Drag or use arrow keys to move." : undefined}>
        <span>naganuma@home:~</span>
        <span className="inline-flex shrink-0 gap-[10px] [&_i]:block [&_i]:h-3 [&_i]:w-3 [&_i]:rounded-full [&_i]:border [&_i]:border-current" aria-hidden="true"><i /><i /><i /></span>
      </div>
      <div className="flex min-h-0 flex-1 flex-col border border-t-0 border-[#bcc8c9] px-5 pt-[18px] pb-6 max-[768px]:px-3 max-[768px]:pt-[13px] max-[768px]:pb-[17px]">
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto [scrollbar-color:#537175_transparent] [scrollbar-width:thin]" ref={screenRef} onClick={() => inputRef.current?.focus()}>
          {showWelcome && (
            <>
              <p className="mb-[9px] text-[13px] text-[#c4cccc] max-[768px]:text-[10px]">Personal workspace · web / server / homelab</p>
              <p className="m-0 max-[768px]:text-xs"><span className="text-[var(--aqua)]">naganuma@home:~</span>$ neofetch</p>
              <NeofetchOutput />
            </>
          )}
          <div className="grid gap-2" aria-live="polite">
            {history.map((entry, index) => (
              <div key={index}>
                <p className="m-0 max-[768px]:text-xs"><span className="text-[var(--aqua)]">naganuma@home:~</span>$ <span className="whitespace-pre-wrap [overflow-wrap:anywhere]">{entry.command}</span></p>
                {entry.result.kind === "neofetch" ? <NeofetchOutput /> : entry.result.output && <p className="m-0 whitespace-pre-wrap text-[#c4cccc] [overflow-wrap:anywhere]">{entry.result.output}</p>}
              </div>
            ))}
          </div>
          <form className={`terminal-input-row flex w-full min-w-0 shrink-0 items-center gap-2 ${showWelcome ? "mt-auto" : ""}`} onSubmit={handleSubmit}>
            <label className="shrink-0 whitespace-nowrap" htmlFor={inputId}><span className="text-[var(--aqua)]">naganuma@home:~</span>$</label>
            <span className="relative block min-w-[1ch] max-w-full flex-[0_1_auto]" style={{ width: `${input.length + 1}ch` }}>
              <input
                id={inputId}
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
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
              <span className="terminal-cursor pointer-events-none absolute top-1/2 h-[1.2em] w-[1ch] -translate-y-1/2 bg-[var(--red)]" style={{ left: `min(${input.length}ch, calc(100% - 1ch))` }} aria-hidden="true" />
              {!input && <span className="pointer-events-none absolute top-1/2 left-[calc(1ch+4px)] -translate-y-1/2 whitespace-nowrap text-[#91a7a9] max-[768px]:text-xs" aria-hidden="true">type help ↵</span>}
            </span>
          </form>
        </div>
        <div className="mx-[-20px] mt-0 mb-[-24px] flex shrink-0 items-center gap-3 bg-[#86cec2] px-2 py-0.5 text-xs leading-[1.4] text-[#08171b] max-[768px]:mx-[-12px] max-[768px]:mb-[-17px]" aria-label="tmux session home, window 0 bash">
          <span className="font-bold">[home]</span>
          <span className="whitespace-nowrap">0:bash*</span>
          <span className="ml-auto whitespace-nowrap text-[#24464b]">naganuma@home</span>
        </div>
      </div>
    </div>
  );
}
