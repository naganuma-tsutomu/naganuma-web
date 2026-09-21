export interface ProjectPageHeader {
  kicker: string;
  title: string;
  description: string;
  sideTagline: string;
  sideMotto: readonly string[];
  sideLabel: string;
}

export interface ProjectPageMessages {
  unavailableWithSamples: string;
  unavailable: string;
  empty: string;
  emptyWithSamples: string;
}

export const projectsPageHeader: ProjectPageHeader = {
  kicker: "WORK / ARCHIVE",
  title: "PROJECTS",
  description: "制作したものなどをまとめています。",
  sideTagline: "SELECTED WORK / FIELD NOTES",
  sideMotto: ["BUILD", "TEST", "TWEAK", "REPEAT."],
  sideLabel: "PROJECT JOURNAL ↗",
};

export const projectsPageMessages: ProjectPageMessages = {
  unavailableWithSamples: "プロジェクトを読み込めませんでした。以下は表示サンプルです。",
  unavailable: "プロジェクトを読み込めませんでした。時間をおいて再度アクセスしてください。",
  empty: "プロジェクトは準備中です。",
  emptyWithSamples: "プロジェクトは準備中です。以下は表示サンプルです。",
};

export const projects = [
  {
    title: "Project Alpha",
    description: "A short description of Project Alpha.",
    slug: "project-alpha",
    imageUrl: "/images/project-alpha.jpg",
  },
  {
    title: "Project Beta",
    description: "A short description of Project Beta.",
    slug: "project-beta",
    imageUrl: "/images/project-beta.jpg",
  },
  {
    title: "Project Gamma",
    description: "A short description of Project Gamma.",
    slug: "project-gamma",
    imageUrl: "/images/project-gamma.jpg",
  },
  {
    title: "Project Delta",
    description: "A short description of Project Delta.",
    slug: "project-delta",
    imageUrl: "/images/project-delta.jpg",
  },
  {
    title: "Project Epsilon",
    description: "A short description of Project Epsilon.",
    slug: "project-epsilon",
    imageUrl: "/images/project-epsilon.jpg",
  },
  {
    title: "Project Zeta",
    description: "A short description of Project Zeta.",
    slug: "project-zeta",
    imageUrl: "/images/project-zeta.jpg",
  },
];