export interface BasePillar {
  index: string;
  tag: string;
  title: string;
  jpTitle: string;
  description: string;
  href: string;
  actionText: string;
  badge?: string;
  isUp?: boolean;
}

export interface BaseIdentity {
  tag: string;
  station: string;
  headline: {
    line1: string;
    line2: string;
  };
  lead: string;
}

export interface BaseProfileSummary {
  name: string;
  role: string;
  focus: string;
  linkText: string;
  linkHref: string;
}

export interface BaseWorkspacePhoto {
  src: string;
  alt: string;
  label: string;
  tag: string;
  caption: string;
}

export const baseIdentity: BaseIdentity = {
  tag: "STATION IDENTITY",
  station: "naganuma.WEB",
  headline: {
    line1: "つくって、試して、記録する。",
    line2: "個人の技術発信基地。",
  },
  lead: "ソフトウェアエンジニア naganuma の個人発信基地です。Web開発からサーバー構築、自宅ラックサーバーの運用まで、日々の実験や制作物、学んだ知識をオープンにストックしています。",
};

export const baseProfileSummary: BaseProfileSummary = {
  name: "naganuma",
  role: "SOFTWARE ENGINEER",
  focus: "WEB / SERVER / HOMELAB",
  linkText: "FULL PROFILE",
  linkHref: "/about",
};

export const baseWorkspacePhoto: BaseWorkspacePhoto = {
  src: "/images/workspace-preview.jpg",
  alt: "naganumaの作業デスクと自宅サーバー環境",
  label: "WORKSPACE_01",
  tag: "LIVE ENVIRONMENT",
  caption: "TOKYO // HOMELAB & WORKSTATION",
};

export const basePillars: readonly BasePillar[] = [
  {
    index: "01",
    tag: "PRODUCTS & APPS",
    title: "PROJECTS",
    jpTitle: "制作物・プロダクト",
    description:
      "Webアプリケーション、ツール、デザインなど、個人開発の制作アーカイブ。",
    href: "#projects",
    actionText: "VIEW PROJECTS",
  },
  {
    index: "02",
    tag: "LOGS & TECH",
    title: "NOTES",
    jpTitle: "技術メモ・試行錯誤",
    description:
      "日々の開発で得た知見やトラブルシューティング、思考ログの記録。",
    href: "#notes",
    actionText: "READ NOTES",
  },
  {
    index: "03",
    tag: "INFRASTRUCTURE",
    title: "HOMELAB",
    jpTitle: "自宅サーバー・検証環境",
    description:
      "常時稼働の仮想化基盤。上部のターミナルやステータスパネルでリアルタイム監視中。",
    href: "#home",
    actionText: "CHECK SYSTEM",
    badge: "LIVE",
    isUp: true,
  },
];
