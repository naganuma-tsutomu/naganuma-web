export const links = [
  { name: "HOME", href: "/" },
  { name: "PROJECTS", href: "/projects" },
  { name: "NOTES", href: "/notes" },
  { name: "ABOUT", href: "/about" },
  { name: "CONTACT", href: "/contact" },
];

export function pageNumber(pathname: string) {
  const index = links.findIndex(({ href }) =>
    pathname === href || (href !== "/" && pathname.startsWith(`${href}/`)),
  );
  return index === -1 ? "--" : String(index + 1).padStart(2, "0");
}

export { githubProfileUrl, xProfileUrl } from "./contact";
