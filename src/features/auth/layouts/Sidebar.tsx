import { motion } from "framer-motion";
const Sidebar = () => {
  return (
    <div className="relative hidden w-1/2 overflow-hidden bg-gradient-to-br from-tertiary-600 via-indigo-600 to-purple-700 lg:flex">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.2),rgba(255,255,255,0))]" />
        <div className="absolute inset-0 opacity-20">
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="topography"
                x="0"
                y="0"
                width="400"
                height="400"
                patternUnits="userSpaceOnUse"
              >
                <g fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1">
                  <path d="M0 200c50-50 100-50 200 0s150 50 200 0v200H0z" />
                  <path d="M0 300c50-25 100-25 200 0s150 25 200 0v100H0z" />
                </g>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#topography)" />
          </svg>
        </div>
      </div>

      {/* Floating Elements */}
      <motion.div
        className="absolute left-20 top-20 h-64 w-64 rounded-full bg-gradient-to-r from-tertiary-300/30 to-purple-400/30 blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute bottom-20 right-20 h-48 w-48 rounded-full bg-gradient-to-r from-indigo-300/30 to-cyan-400/30 blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.4, 0.7, 0.4]
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
      />

      {/* Brand Section */}
      <div className="relative z-10 flex flex-col justify-between p-12">
        {/* Logo */}
        <motion.div
          className="flex items-center space-x-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div>
            <h1 className="text-xl font-bold text-white">Cognitiveview</h1>
            <p className="text-sm text-white/80">AI Governance Platform</p>
          </div>
        </motion.div>

        {/* Hero Content */}
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h2 className="text-5xl font-bold leading-tight text-white">
              Welcome to the Future of
              <span className="block bg-gradient-to-r from-cyan-300 via-tertiary-300 to-indigo-300 bg-clip-text text-transparent">
                Responsible AI
              </span>
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/90">
              Your trusted AI Governance Platform. We help businesses:
            </p>
            <ul className="mt-4 space-y-2 text-white/90">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>
                  <strong>Streamline compliance</strong> with AI regulations and
                  standards
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>
                  <strong>Build trust</strong> with customers, partners, and
                  regulators
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>
                  <strong>Turn evaluations into evidence</strong> with
                  audit-ready outputs
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>
                  <strong>Scale responsibly</strong> without slowing innovation
                </span>
              </li>
            </ul>
            <p className="mt-6 text-lg text-white/90">
              With CognitiveView, you can confidently leverage AI while ensuring
              it remains <strong>ethical, secure, and compliant.</strong>
            </p>
          </motion.div>

          {/* Feature Pills */}
          <motion.div
            className="flex flex-wrap gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {[
              "Responsible AI",
              "Secure & Compliant",
              "Audit-Ready Evidence"
            ].map((feature) => (
              <div
                key={feature}
                className="rounded-full bg-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm"
              >
                {feature}
              </div>
            ))}
          </motion.div>
        </div>

        {/* Footer */}
        <motion.div
          className="flex items-center justify-between text-sm text-white/80"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <p>
            © {new Date().getFullYear()} Cognitiveview. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <a
              href="/terms-and-condition-and-privacy-policy"
              className="transition-colors hover:text-white/90"
            >
              Privacy
            </a>
            <a
              href="/terms-and-condition-and-privacy-policy"
              className="transition-colors hover:text-white/90"
            >
              Terms
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
export default Sidebar;
