import { githubProfileUrl, xProfileUrl } from "@/app/data/links";

const Footer = () => {
  return (
    <footer className="w-full mt-12">
      <div className="site-shell flex flex-wrap gap-4 items-center justify-between py-6 border-t border-[#b1b5ab] text-xs font-[family-name:var(--mono)]">
        <p className="text-[var(--ink)]">© {new Date().getFullYear()} NAGANUMA</p>
        <div className="flex space-x-4">
          <a
            href={githubProfileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--ink)] hover:text-[var(--red)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--red)] px-1"
          >
            GitHub
            <span className="sr-only">（新しいタブで開きます）</span>
          </a>
          <a
            href={xProfileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--ink)] hover:text-[var(--red)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--red)] px-1"
          >
            X
            <span className="sr-only">（新しいタブで開きます）</span>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
