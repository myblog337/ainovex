export const SITE_CONFIG = {
  url: "https://ainovex.pages.dev",
  name: "AINOVEX",
  tagline: "AI Tools • News • Guides • More",
  description:
    "AINOVEX brings you the latest AI tools, helpful guides, tech news and insights — all in one place. Boost your productivity, creativity and work smarter with the power of AI.",
  author: {
    name: "Md Shamim",
    email: "mdshamimhossaincom129@gmail.com",
    role: "Lead Editor & AI Research Specialist",
  },
  navLinks: [
    { name: "Home", href: "/" },
    { name: "AI Tools", href: "/ai-tools/", hasDropdown: true },
    { name: "Categories", href: "/categories/", hasDropdown: true },
    { name: "Articles", href: "/articles/" },
    { name: "About", href: "/about/" },
    { name: "Contact", href: "/contact/" },
  ],
  trendingSearches: [
    "ChatGPT",
    "AI Image Generator",
    "Video Editing",
    "Productivity",
    "SEO",
  ],
  footerLinks: {
    quickLinks: [
      { name: "Home", href: "/" },
      { name: "AI Tools", href: "/ai-tools/" },
      { name: "Categories", href: "/categories/" },
      { name: "Articles", href: "/articles/" },
      { name: "About", href: "/about/" },
      { name: "Contact", href: "/contact/" },
    ],
    legal: [
      { name: "Privacy Policy", href: "/privacy-policy/" },
      { name: "Terms of Service", href: "/terms/" },
      { name: "Editorial Policy", href: "/editorial-policy/" },
    ],
  },
} as const;

export function getCanonicalUrl(path: string = "/"): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const normalizedPath =
    cleanPath.endsWith("/") || cleanPath.includes(".") ? cleanPath : `${cleanPath}/`;
  return `${SITE_CONFIG.url}${normalizedPath === "//" ? "/" : normalizedPath}`;
}
