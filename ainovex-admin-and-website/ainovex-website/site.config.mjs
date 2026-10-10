// SINGLE SOURCE OF TRUTH for the production domain.
// When you buy a custom domain, change siteUrl here and run `npm run build`.
// Canonicals, sitemap, robots.txt, Open Graph, Twitter and JSON-LD all derive from it.
export default {
  siteUrl: 'https://ainovex.pages.dev',
  name: 'AINOVEX',
  tagline: 'Practical guides to AI tools, compared in plain language.',
  email: 'mdshamimhossaincom129@gmail.com',                 // REQUIRED before launch. Shown on Contact/Privacy pages.
  launched: false,           // Set true on launch day: unresolved [[placeholders]] then FAIL the build.
  hideEmptyCategories: true, // Empty categories stay noindex AND are hidden from nav/home until they have content.
  ogImage: '/og-default.png',// Optional fallback social image: add file to /public (1200x630).
  authors: {
    // Replace with real people when available (type: 'Person', add `bio`). Never invent names.
    editorial: { name: 'Md Shamim', type: 'Person', url: '/about/' },
  },
  analytics: { provider: 'google-analytics', measurementId: '' },
  // AdSense: leave client empty until approved. Slots render only when set.
  adsense: { client: '', slot: '' },
  // Image pipeline (needs `sharp`, installed via npm). Variants are never upscaled.
  images: { widths: [480, 768, 1200], avifQuality: 50, webpQuality: 76 },
};
