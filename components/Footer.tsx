const Footer = () => {
  return (
    <footer className="w-full mt-12">
      <div className="site-shell flex flex-wrap gap-4 items-center justify-between py-6 border-t border-[#b1b5ab] text-xs font-mono">
        <p className="text-[#1C1C1C] dark:text-white">© {new Date().getFullYear()} NAGANUMA</p>
        <div className="flex space-x-4">
          {/* TODO: Update these dummy links with actual URLs once ready */}
          <a href="#" target="_blank" rel="noopener noreferrer" className="text-[#1C1C1C] dark:text-gray-300 hover:text-[#E53935] dark:hover:text-[#ff6b6b] transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#E53935] dark:focus-visible:ring-[#ff6b6b] rounded-sm px-1">GitHub</a>
          <a href="#" target="_blank" rel="noopener noreferrer" className="text-[#1C1C1C] dark:text-gray-300 hover:text-[#E53935] dark:hover:text-[#ff6b6b] transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#E53935] dark:focus-visible:ring-[#ff6b6b] rounded-sm px-1">X</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
