export interface TerminalProfile {
  username: string;
  hostname: string;
  filename: string;
  name: string;
  role: string;
  focus: string;
  comment: string;
}

export const terminalProfile: TerminalProfile = {
  username: "naganuma",
  hostname: "home",
  filename: "profile.txt",
  name: "naganuma",
  role: "WEB ENGINEER",
  focus: "WEB / SERVER / HOMELAB",
  comment: "# BUILD / TWEAK / LEARN / REPEAT",
};

export const bio: readonly string[] = [
  "こんにちは。普段Web開発をしているエンジニアのnaganumaです。",
  "コードを書くこと以外にも、自作PCや自宅サーバーの構築、電子工作なども趣味で行っています。",
];

export const skills: readonly string[] = [
  "React",
  "Next.js",
  "TypeScript",
  "Tailwind CSS",
  "Node.js",
  "WordPress",
  "PHP",
  "MySQL",
  "Kubernetes",
  "Docker",
  "Git",
  "Linux",
];
