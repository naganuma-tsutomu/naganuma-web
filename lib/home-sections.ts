export const homeSections = [
  { id: "top", target: "home", label: "TOP", command: "ls" },
  { id: "about", target: "about-base", label: "ABOUT", command: "whoami" },
  { id: "projects", target: "projects", label: "PROJECT", command: "ls projects/" },
  { id: "notes", target: "notes", label: "NOTES", command: "ls notes/" },
] as const;

export type HomeSection = typeof homeSections[number]["id"];
