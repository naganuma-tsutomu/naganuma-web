"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { homelabPreview } from "@/app/data/homelab";

const monogram = [
  " #####             #####",
  " ######            #####",
  " #######           #####",
  " ########          #####",
  " ##### ###         #####",
  " #####  ###        #####",
  " #####   ###       #####",
  " #####    ###      #####",
  " #####     ###     #####",
  " #####      ###    #####",
  " #####       ###   #####",
  " #####        ###  #####",
  " #####         ### #####",
  " #####          ########",
  " #####           #######",
  " #####            ######",
  " #####             #####",
].join("\n");

type Entry = { command: string; output: string };

function getOutput(command: string): string {
  const [name, ...args] = command.split(/\s+/);

  switch (name.toLowerCase()) {
    case "help":
      return "Available commands: help, whoami, pwd, echo, clear";
    case "whoami":
      return "naganuma · web / server / homelab";
    case "pwd":
      return "/home/naganuma";
    case "echo":
      return args.join(" ");
    default:
      return `${name}: command not found. Type help to see available commands.`;
  }
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
      setHistory((current) => [...current, { command, output: getOutput(command) }]);
    }
    setInput("");
  }

  return (
    <div className="terminal-panel dark-panel">
      <div className="panel-titlebar">
        <span>naganuma@home:~</span>
        <span className="window-dots" aria-hidden="true"><i /><i /><i /></span>
      </div>
      <div className="terminal-body">
        <div className="terminal-screen" ref={screenRef} onClick={() => inputRef.current?.focus()}>
          {showWelcome && (
            <>
              <p className="terminal-intro">Personal workspace · web / server / homelab</p>
              <p className="terminal-command"><span className="terminal-prompt">naganuma@home:~</span>$ neofetch</p>
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
            </>
          )}
          <div className="terminal-history" aria-live="polite">
            {history.map((entry, index) => (
              <div className="terminal-entry" key={index}>
                <p className="terminal-command"><span className="terminal-prompt">naganuma@home:~</span>$ <span className="terminal-command-text">{entry.command}</span></p>
                {entry.output && <p className="terminal-response">{entry.output}</p>}
              </div>
            ))}
          </div>
        </div>
        <form className="terminal-input-row" onSubmit={handleSubmit}>
          <label htmlFor="terminal-command-input"><span className="terminal-prompt">naganuma@home:~</span>$</label>
          <input
            id="terminal-command-input"
            ref={inputRef}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="type help ↵"
            maxLength={200}
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="go"
          />
        </form>
      </div>
    </div>
  );
}
