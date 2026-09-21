export interface SocialLink {
  name: string;
  description: string;
  displayText: string;
  url: string;
}

export const githubProfileUrl = "https://github.com/naganuma-tsutomu/";
export const xProfileUrl = "https://x.com/naganuma_web";

export const contactLead =
  "コードやプロジェクトはGitHubで、日々の投稿はXで公開しています。気になるものから覗いてみてください。";

export const socialLinks: readonly SocialLink[] = [
  {
    name: "GITHUB",
    description: "ソースコードとプロジェクト",
    displayText: "github.com/naganuma-tsutomu",
    url: githubProfileUrl,
  },
  {
    name: "X",
    description: "日々の投稿と近況",
    displayText: "x.com/naganuma_web",
    url: xProfileUrl,
  },
];
