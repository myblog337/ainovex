# AINOVEX — AI Tools & Technology Platform

AINOVEX is a high-performance, SEO-optimized AI tools directory, tutorials, and technology blog built for readers worldwide.

- **Production Domain:** [https://ai-novex.netlify.app](https://ai-novex.netlify.app)
- **GitHub Repository:** [https://github.com/myblog337/ainovex](https://github.com/myblog337/ainovex)
- **Target Branch:** `main`
- **Lead Editor & Author:** Md Shamim (`mdshamimhossaincom129@gmail.com`)

---

## 1. System Architecture

```
  content/*.json + content/articles/*.md   (edited by hand, committed to GitHub)
                     │
              git push origin main
                     │
                     ▼
         Netlify CI/CD  (npm run build → dist)
                     │
                     ▼
         https://ai-novex.netlify.app
```

The site is fully read-only: `functions/api/[[path]].ts` only serves the built content
(`/api/articles`, `/api/tools`, `/api/categories`, `/api/settings`, `/api/ads`, `/api/health`).

---

## 2. Public Features (Design Preserved from Screenshots)

1. **Header & Navigation:**
   - Dual-mode theme toggle (Dark / Light mode) with persistent preference.
   - Logo typography: **AI** in electric blue gradient + **NOVEX** in pure white/dark slate with tagline *AI Tools • News • Guides • More*.
   - Instant Search Modal dialog (`ESC` key to close).
   - "Explore Tools ->" pill action.
   - Responsive slide-out mobile drawer menu.

2. **Hero Section:**
   - Journey badge: *• Your AI Journey Starts Here*.
   - Dynamic search input + trending tags (*ChatGPT*, *AI Image Generator*, *Video Editing*, *Productivity*, *SEO*).
   - Signature animated **Glowing Orbital Sphere Graphic** with rotating elliptical dashed rings, floating badges (*Agent Workflows Autonomous Sync* & *⚡ Smarter with AI*).

3. **Browse by Category:**
   - 9 categorized domains: *AI Writing*, *Image Generation*, *Video & Audio*, *Productivity*, *Design & Art*, *Code & Dev*, *Business*, *Education*, *Others*.

4. **Featured AI Tools:**
   - Vetted directory cards with official logos, categories, pricing model (*Free*, *Freemium*, *Paid*), tags, and direct access links.
   - Detailed tool inspection modals.

5. **Latest Blog & News:**
   - Dynamic published articles with reading time, date, cover photo, and author card (*Md Shamim*).
   - Fallback *Editorial Desk* state if articles are undergoing vetting.

6. **Full-Spectrum Public Pages:**
   - `/tools`: AI Tools directory with search, pricing filters, and sorting.
   - `/blog`: Blog archive with category filtering.
   - `/blog/:slug`: Deep-dive guides rendered in Markdown with schema markup and social sharing.
   - `/categories`: Category taxonomy directory.
   - `/category/:slug`: Category-specific tools and articles.
   - `/about`: Editorial mission and author profile.
   - `/contact`: Direct editorial inquiry form and email contact.
   - `/privacy`, `/terms`, `/editorial-policy`, `/affiliate-disclosure`: Complete legal and transparency disclosures.

---

## 3. Updating Content

Edit the files in `content/` (`articles.json`, `articles/*.md`, `tools.json`, `categories.json`,
`settings.json`, `ads.json`), put images in `public/images/`, then commit and push to `main`.
Cloudflare Pages rebuilds the site automatically.

---

## 4. Cloudflare Pages Deployment Configuration

- **Framework preset:** `Vite`
- **Build command:** `npm run build`
- **Build output directory:** `dist`
- **Root directory:** `/` (repo root)

No environment variables or secrets are required.

---

## 5. Rollback & Disaster Recovery

If an erroneous commit is pushed:
1. Navigate to the GitHub repository: `https://github.com/myblog337/ainovex`.
2. Check commit history on the `main` branch.
3. Revert the commit via GitHub Web UI (`Revert` button on the pull request/commit) or run:
   ```bash
   git revert <commit-sha>
   git push origin main
   ```
4. Netlify will detect the revert commit and automatically redeploy the previous stable build to `https://ai-novex.netlify.app`.

---

## 6. Deployment notes

- `npm run build` also runs `scripts/postbuild.mjs`, which copies published content into `dist/content` and regenerates `sitemap.xml`, `rss.xml`, `robots.txt` (and `ads.txt` when AdSense is configured). Draft articles are never exported.
- `npm run dev` / `npm start` run a small local Node server for development only.
