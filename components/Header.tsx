"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import HamburgerMenu from "./HamburgerMenu";

import { links } from "../app/data/links";

const Header = () => {
  const pathname = usePathname();
  return (
    <header className="site-header">
      <div className="site-shell header-inner">
        <Link href="/" className="site-wordmark" aria-label="NAGANUMA ホーム">
          NAGANUMA
        </Link>

        {/* Desktop Nav */}
        <nav className="desktop-nav" aria-label="メインナビゲーション">
          {links.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              aria-current={pathname === link.href ? "page" : pathname.startsWith("/projects/") && link.href === "/projects" ? "location" : undefined}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <p className="header-caption">PERSONAL WORKSPACE<br />WEB / SERVER / HOMELAB</p>
        <HamburgerMenu />
      </div>
    </header>
  );
};

export default Header;
