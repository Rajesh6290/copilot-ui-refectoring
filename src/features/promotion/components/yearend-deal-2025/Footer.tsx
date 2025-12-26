const Footer = () => {
  const FOOTER_BG =
    "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop";
  return (
    <footer className="relative overflow-hidden bg-slate-950 py-8 text-slate-300 sm:py-10 lg:py-12">
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-fixed bg-center opacity-10"
        style={{ backgroundImage: `url(${FOOTER_BG})` }}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-slate-950" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:gap-6 md:flex-row md:items-center">
          <div className="flex flex-col items-center gap-3 sm:gap-4 md:items-start">
            <div className="flex items-center gap-2 sm:gap-3">
              <img
                src="https://cognitiveview.blob.core.windows.net/public-documents/logos/logo-favicon.png"
                alt="CognitiveView Logo"
                loading="lazy"
                decoding="async"
                className="h-12 w-12 object-contain sm:h-16 sm:w-16 lg:h-20 lg:w-20"
              />
              <div className="flex flex-col gap-1 sm:gap-2">
                <span className="bg-gradient-to-r from-white via-indigo-100 to-cyan-100 bg-clip-text text-xl font-bold tracking-tight text-transparent sm:text-2xl">
                  CognitiveView
                </span>
                <p className="text-center text-xs font-medium text-white sm:text-sm md:text-left">
                  AI Governance • Risk • Privacy • Assurance
                </p>
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-slate-300 sm:text-sm md:text-right">
            © {new Date().getFullYear()} CognitiveView. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
