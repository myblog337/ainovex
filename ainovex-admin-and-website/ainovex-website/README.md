# AINOVEX

AINOVEX is a fast, SEO-focused AI tools and editorial website.

## Local development

Requirements: Node.js 20+.

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
```

The production build pre-renders all published/static routes, creates `404.html`, and generates `sitemap.xml`. Articles are intentionally empty until real editorial content is published.

## Cloudflare Pages

- Build command: `npm run build`
- Output directory: `dist`
- Production URL: https://ainovex.pages.dev
