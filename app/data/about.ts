export interface Experience {
  year: string;
  title: string;
  company: string;
  description: string;
}

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
  name: "NAGANUMA",
  role: "SOFTWARE ENGINEER",
  focus: "WEB / SERVER / HOMELAB",
  comment: "# BUILD / TWEAK / LEARN / REPEAT",
};

export const bio: readonly string[] = [
  "こんにちは。私はWeb開発に情熱を注ぐソフトウェアエンジニアです。シンプルで使いやすく、かつ印象に残るデジタル体験を創造することを目指しています。",
  "技術の進化は早いですが、変わらない「良さ」を大切にしながら、最新のトレンド（Next.js, Reactなど）を取り入れた開発を行っています。このポートフォリオサイトも、レトロモダンなデザインと最新の技術スタックを融合させて作りました。",
  "コードを書くこと以外にも、デザイン、写真、そして新しいコーヒーショップを探すことが好きです。",
];

export const skills: readonly string[] = [
  "React",
  "Next.js",
  "TypeScript",
  "Tailwind CSS",
  "Node.js",
  "Kubernetes",
  "Docker",
  "AWS",
];

export const experiences: readonly Experience[] = [
  {
    year: "2024 - Present",
    title: "Senior Frontend Engineer",
    company: "Tech Innovation Inc.",
    description:
      "Leading the frontend team in building scalable web applications using Next.js and React.",
  },
  {
    year: "2021 - 2024",
    title: "Web Developer",
    company: "Creative Solutions Ltd.",
    description:
      "Developed responsive websites and e-commerce platforms for various clients.",
  },
  {
    year: "2019 - 2021",
    title: "Junior Developer",
    company: "StartUp Hub",
    description:
      "Collaborated with designers to implement user interfaces and improve UX.",
  },
];
