import { useEffect, useState } from "react";

const Navbar = ({
  scrollToSection
}: {
  scrollToSection: (section: string) => void;
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMobileMenuOpen &&
        !(event.target as Element).closest(".mobile-menu")
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleScrollToSection = (section: string) => {
    scrollToSection(section);
    setIsMobileMenuOpen(false); // Close mobile menu after navigation
  };

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-50 border-b transition-all duration-300 ${
        isScrolled
          ? "border-indigo-500/20 bg-slate-950/95 py-2 shadow-lg shadow-slate-950/50 backdrop-blur-xl sm:py-3"
          : "border-transparent bg-transparent py-3 sm:py-5"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo and Brand */}
        <div className="flex flex-shrink-0 items-center gap-2 sm:gap-3">
          <img
            src="https://cognitiveview.blob.core.windows.net/public-documents/logos/logo-favicon.png"
            alt="CognitiveView Logo"
            className={`object-contain transition-all duration-300 ${
              isScrolled ? "size-10 sm:size-12" : "size-12 sm:size-14"
            }`}
          />
          <span className="hidden bg-gradient-to-r from-white via-indigo-100 to-cyan-100 bg-clip-text text-xl font-bold tracking-tight text-transparent lg:block">
            CognitiveView AI Governance Packages (2025)
          </span>
          <span className="bg-gradient-to-r from-white via-indigo-100 to-cyan-100 bg-clip-text text-xs font-bold tracking-tight text-transparent sm:text-sm lg:hidden">
            CognitiveView
          </span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-4 md:flex lg:gap-6">
          <button
            onClick={() => handleScrollToSection("cta")}
            className="group relative overflow-hidden rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-500/30 transition-all hover:scale-105 hover:shadow-xl hover:shadow-indigo-500/40 active:scale-95 sm:text-sm lg:px-6 lg:py-2.5"
          >
            <span className="relative z-10">Get Connected</span>
            <div className="absolute inset-0 -z-0 bg-gradient-to-r from-indigo-600 to-cyan-600 opacity-0 transition-opacity group-hover:opacity-100"></div>
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={toggleMobileMenu}
          className="relative z-50 rounded-lg border border-slate-700/50 bg-slate-800/80 p-2 backdrop-blur-sm transition-all duration-200 hover:bg-slate-700/80 active:scale-95 md:hidden"
          aria-label="Toggle mobile menu"
        >
          <div className="flex h-5 w-5 flex-col items-center justify-center">
            <span
              className={`block h-0.5 w-4 bg-white transition-all duration-300 ${
                isMobileMenuOpen ? "translate-y-0.5 rotate-45" : "mb-1"
              }`}
            ></span>
            <span
              className={`block h-0.5 w-4 bg-white transition-all duration-300 ${
                isMobileMenuOpen ? "opacity-0" : "mb-1"
              }`}
            ></span>
            <span
              className={`block h-0.5 w-4 bg-white transition-all duration-300 ${
                isMobileMenuOpen ? "-translate-y-0.5 -rotate-45" : ""
              }`}
            ></span>
          </div>
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-0 z-40 bg-slate-950 backdrop-blur-xl md:hidden">
          <div className="mobile-menu flex min-h-screen flex-col items-center justify-center bg-black-2 px-6 py-20">
            <div className="flex w-full max-w-sm flex-col items-center space-y-8">
              {/* Mobile Logo */}
              <div className="mb-8 flex flex-col items-center gap-3">
                <img
                  src="https://cognitiveview.blob.core.windows.net/public-documents/logos/logo-favicon.png"
                  alt="CognitiveView Logo"
                  className="size-16 object-contain"
                />
                <span className="bg-gradient-to-r from-white via-indigo-100 to-cyan-100 bg-clip-text text-center text-lg font-bold leading-tight tracking-tight text-transparent">
                  CognitiveView Year-End AI Governance Packages (2025)
                </span>
              </div>

              {/* Mobile Navigation Button */}
              <button
                onClick={() => handleScrollToSection("cta")}
                className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 px-8 py-4 text-base font-bold text-white shadow-lg shadow-indigo-500/30 transition-all hover:scale-105 hover:shadow-xl hover:shadow-indigo-500/40 active:scale-95"
              >
                <span className="relative z-10">Get Connected</span>
                <div className="absolute inset-0 -z-0 bg-gradient-to-r from-indigo-600 to-cyan-600 opacity-0 transition-opacity group-hover:opacity-100"></div>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
