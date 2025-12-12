const MetaData = (title?: string) => {
  const metaData = {
    // Primary SEO tags
    title: title || " Cognitiveview AI Governance Platform",
    description:
      "Cognitiveview's  AI Governance Platform for Partners to manage their customer lifecycle, deal registrations, and get access to marketing and technical resources.",
    keywords: [
      "Cognitiveview",
      "AI governance",
      "partner portal",
      "AI",
      "governance",
      "partner program",
      "deal registration",
      "reseller",
      "channel partner",
      "SaaS"
    ],
    authors: [{ name: "Cognitiveview", url: "https://www.cognitiveview.com" }],

    // Canonical URL to prevent duplicate content issues
    alternates: {
      canonical: "https://app.cognitiveview.com"
    },
    robots: "index, follow",

    // Open Graph (for social media sharing)
    openGraph: {
      title: " Cognitiveview AI Governance Platform",
      description:
        "Cognitiveview's  for AI Governance Platform for Partners to manage their customer lifecycle, deal registrations, and get access to marketing and technical resources.",
      url: "https://app.cognitiveview.com",
      siteName: "Cognitiveview Partner Portal",
      type: "website",
      locale: "en_US",
      images: [
        {
          url: "https://app.cognitiveview.com/partner-portal-og-image.png",
          width: 1200,
          height: 630,
          alt: "Cognitiveview AI Governance Platform "
        }
      ]
    },

    // Twitter Card (for Twitter sharing)
    twitter: {
      card: "summary_large_image",
      title: "Cognitiveview AI Governance Platform",
      description:
        "Cognitiveview's  for AI Governance Platform for Partners to manage their customer lifecycle, deal registrations, and get access to marketing and technical resources.",
      creator: "@Cognitiveview",
      images: ["https://app.cognitiveview.com/partner-portal-og-image.png"]
    },

    // Optional: Add a manifest for PWA (Progressive Web App)
    manifest: "/manifest.json"
  };
  return metaData;
};
export default MetaData;
