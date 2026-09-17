"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { homelabPreview } from "@/app/data/homelab";

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

function getOutput(command: string): CommandResult {
  const [name, ...args] = command.split(/\s+/);

  switch (name.toLowerCase()) {
    case "help":
      return { kind: "text", output: "Available commands: help, whoami, pwd, echo, neofetch, clear" };
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
    <div className="neofetch-output">
      <pre className="ascii-monogram" aria-hidden="true">{monogram}</pre>
      <div className="system-info">
        <dl>
          {homelabPreview.specs.map(([label, value]) => (
            <div className={`system-info-row ${["Kernel", "Packages", "Shell", "Terminal"].includes(label) ? "system-info-secondary" : ""}`} key={label}>
              <dt>{label}:</dt><dd>{value}</dd>
            </div>
          ))}
        </dl>
        <div className="terminal-palette" aria-hidden="true">
          {homelabPreview.palette.map((color) => <span key={color} style={{ backgroundColor: color }} />)}
        </div>
        <p className="sample-config">SAMPLE CONFIGURATION</p>
      </div>
    </div>
  );
}

export default function InteractiveTerminal() {
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

    if (command.toLowerCase() === "clear") {
      setHistory([]);
      setShowWelcome(false);
      screenRef.current?.scrollTo({ top: 0 });
    } else {
      setHistory((current) => [...current, { command, result: getOutput(command) }]);
    }
    setInput("");
  }

  return (
    <div className="terminal-panel dark-panel" data-hero-window>
      <div className="panel-titlebar" data-drag-handle role="group" tabIndex={0} aria-label="Terminal window. Drag or use arrow keys to move.">
        <span>naganuma@home:~</span>
        <span className="window-dots" aria-hidden="true"><i /><i /><i /></span>
      </div>
      <div className="terminal-body">
        <div className="terminal-screen" ref={screenRef} onClick={() => inputRef.current?.focus()}>
          {showWelcome && (
            <>
              <p className="terminal-intro">Personal workspace · web / server / homelab</p>
              <p className="terminal-command"><span className="terminal-prompt">naganuma@home:~</span>$ neofetch</p>
              <NeofetchOutput />
            </>
          )}
          <div className="terminal-history" aria-live="polite">
            {history.map((entry, index) => (
              <div className="terminal-entry" key={index}>
                <p className="terminal-command"><span className="terminal-prompt">naganuma@home:~</span>$ <span className="terminal-command-text">{entry.command}</span></p>
                {entry.result.kind === "neofetch" ? <NeofetchOutput /> : entry.result.output && <p className="terminal-response">{entry.result.output}</p>}
              </div>
            ))}
          </div>
          <form className={`terminal-input-row${showWelcome ? " terminal-input-welcome" : ""}`} onSubmit={handleSubmit}>
            <label htmlFor="terminal-command-input"><span className="terminal-prompt">naganuma@home:~</span>$</label>
            <span className="terminal-input-wrap" style={{ width: `${input.length + 1}ch` }}>
              <input
                id="terminal-command-input"
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
              />
              <span className="terminal-cursor" style={{ left: `min(${input.length}ch, calc(100% - 1ch))` }} aria-hidden="true" />
              {!input && <span className="terminal-input-hint" aria-hidden="true">type help ↵</span>}
            </span>
          </form>
        </div>
        <div className="tmux-status" aria-label="tmux session home, window 0 bash">
          <span className="tmux-session">[home]</span>
          <span className="tmux-window">0:bash*</span>
          <span className="tmux-host">naganuma@home</span>
        </div>
      </div>
    </div>
  );
}
