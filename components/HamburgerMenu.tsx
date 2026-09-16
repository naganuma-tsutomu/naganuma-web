"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";

import { links } from "../app/data/links";

const HamburgerMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (!isOpen) return;
    const opener = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusFrame = requestAnimationFrame(() => {
      menuRef.current?.querySelector<HTMLButtonElement>("button")?.focus({ preventScroll: true });
    });
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
      if (event.key === "Tab") {
        const items = menuRef.current?.querySelectorAll<HTMLElement>("a[href], button");
        if (!items?.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (!menuRef.current?.contains(document.activeElement)) {
          event.preventDefault();
          first.focus();
        } else if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    const desktop = window.matchMedia("(min-width: 768px)");
    const closeOnDesktop = () => { if (desktop.matches) setIsOpen(false); };
    desktop.addEventListener("change", closeOnDesktop);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      cancelAnimationFrame(focusFrame);
      window.removeEventListener("keydown", handleKeyDown);
      desktop.removeEventListener("change", closeOnDesktop);
      document.body.style.overflow = previousOverflow;
      opener?.focus({ preventScroll: true });
    };
  }, [isOpen]);

  return (
    <div className="md:hidden">
      <button
        onClick={toggleMenu}
        className="outline-none p-2 border-2 border-black dark:border-white bg-white dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors focus-visible:ring-4 focus-visible:ring-black dark:focus-visible:ring-white"
        aria-label={isOpen ? "メニューを閉じる" : "メニューを開く"}
        aria-expanded={isOpen}
        aria-controls="mobile-menu"
      >
        <svg
          className="w-8 h-8 text-[#1C1C1C] dark:text-white"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          {isOpen ? (
            <path d="M6 18L18 6M6 6l12 12"></path>
          ) : (
            <path d="M4 6h16M4 12h12M4 18h8"></path>
          )}
        </svg>
      </button>

      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/60 z-30 transition-opacity duration-300 backdrop-blur-sm
          ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={toggleMenu}
        aria-hidden="true"
      ></div>

      {/* Slide-in Menu */}
      <div
        id="mobile-menu"
        ref={menuRef}
        inert={!isOpen}
        role="dialog"
        aria-modal="true"
        aria-label="サイト内ナビゲーション"
        className={`fixed top-0 right-0 h-dvh w-80 max-w-full bg-[#f4f1e5] z-40 transform transition-transform ease-in-out duration-300 border-l-2 border-[#0a171d] shadow-2xl overflow-y-auto
          ${isOpen ? "translate-x-0 visible" : "translate-x-full invisible"}`}
      >
        <div className="flex justify-end p-4 border-b-4 border-black dark:border-white bg-gray-50 dark:bg-zinc-800 transition-colors duration-300">
          <button
            onClick={toggleMenu}
            aria-label="メニューを閉じる"
            className="outline-none p-1 border-2 border-black dark:border-white hover:bg-[var(--red)] dark:hover:bg-[var(--red)] hover:text-white transition-colors group focus-visible:ring-4 focus-visible:ring-[var(--red)] dark:focus-visible:ring-[var(--red)]"
          >
            <svg
              className="w-8 h-8 text-[#1C1C1C] dark:text-white group-hover:text-white transition-colors"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <nav className="flex flex-col items-start space-y-6 font-mono text-2xl py-12 px-8 uppercase tracking-wide">
          {links.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={toggleMenu}
              className="text-[#1C1C1C] dark:text-gray-200 hover:text-[var(--red)] dark:hover:text-[var(--red)] hover:translate-x-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--red)] dark:focus-visible:ring-[var(--red)] px-2 rounded-sm"
            >
              {link.name}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default HamburgerMenu;
