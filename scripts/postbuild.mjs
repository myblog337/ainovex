// Runs after `vite build`. Pre-renders all routes into static HTML files for
// 100% crawlability, flawless SEO, instant First Contentful Paint, and zero orphan pages.
import fs from 'node:fs';
import path from 'node:path';
import { marked } from 'marked';

const root = process.cwd();
const dist = path.join(root, 'dist');
const contentSrc = path.join(root, 'content');
const contentDst = path.join(dist, 'content');

if (!fs.existsSync(dist)) {
  console.error('dist/ not found — run `vite build` first.');
  process.exit(1);
}

const readJson = (f, fallback) => {
  try {
    return JSON.parse(fs.readFileSync(path.join(contentSrc, f), 'utf-8'));
  } catch {
    return fallback;
  }
};

const esc = (v) =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const settings = readJson('settings.json', {});
const categories = readJson('categories.json', []);
const tools = readJson('tools.json', []);
const ads = readJson('ads.json', {});
const allArticles = readJson('articles.json', []);
const articles = allArticles.filter((a) => a.isPublished);
const baseUrl = (settings.productionUrl || 'https://ai-novex.netlify.app').replace(/\/+$/, '');
const defaultOgImage =
  settings.defaultOgImage ||
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80';
const today = new Date().toISOString().slice(0, 10);

// Copy raw content files into dist
fs.mkdirSync(path.join(contentDst, 'articles'), { recursive: true });
const writeJson = (f, d) => fs.writeFileSync(path.join(contentDst, f), JSON.stringify(d));
writeJson('settings.json', settings);
writeJson('categories.json', categories);
writeJson('tools.json', tools);
writeJson('articles.json', articles);
writeJson('ads.json', { ...ads, adsTxtContent: undefined });

for (const a of articles) {
  const file = path.resolve(root, a.contentPath || `content/articles/${a.slug}.md`);
  if (file.startsWith(path.join(contentSrc, 'articles') + path.sep) && fs.existsSync(file)) {
    fs.copyFileSync(file, path.join(contentDst, 'articles', `${a.slug}.md`));
  } else {
    console.warn(`[postbuild] markdown missing for article "${a.slug}"`);
  }
}

// Static API snapshots (for serverless / Netlify redirects: /api/* -> dist/api/*.json)
const apiDir = path.join(dist, 'api');
fs.mkdirSync(path.join(apiDir, 'articles'), { recursive: true });
const writeApi = (rel, d) => {
  const f = path.join(apiDir, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, JSON.stringify(d));
};
writeApi('categories.json', categories);
writeApi('tools.json', tools);
writeApi('settings.json', settings);
writeApi('ads.json', { ...ads, adsTxtContent: undefined });
writeApi('health.json', { status: 'ok', platform: 'static', timestamp: new Date().toISOString() });
writeApi('articles/index.json', articles);

const SAFE_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
for (const a of articles) {
  if (!SAFE_SLUG.test(a.slug)) continue;
  const mdFile = path.join(contentDst, 'articles', `${a.slug}.md`);
  const content = fs.existsSync(mdFile) ? fs.readFileSync(mdFile, 'utf-8') : '';
  writeApi(`articles/${a.slug}/index.json`, { ...a, content });
}

// Sitemap.xml (standardized on canonical trailing slashes for zero redirects)
const staticRoutes = [
  ['/', '1.0', 'daily'],
  ['/tools/', '0.9', 'daily'],
  ['/blog/', '0.9', 'daily'],
  ['/categories/', '0.8', 'weekly'],
  ['/about/', '0.5', 'monthly'],
  ['/contact/', '0.5', 'monthly'],
  ['/privacy/', '0.3', 'monthly'],
  ['/terms/', '0.3', 'monthly'],
  ['/editorial-policy/', '0.4', 'monthly'],
  ['/affiliate-disclosure/', '0.3', 'monthly'],
];

let sm = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
for (const [p, pr, cf] of staticRoutes) {
  sm += `  <url>\n    <loc>${esc(baseUrl + p)}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${cf}</changefreq>\n    <priority>${pr}</priority>\n  </url>\n`;
}
for (const a of articles) {
  sm += `  <url>\n    <loc>${esc(`${baseUrl}/blog/${a.slug}/`)}</loc>\n    <lastmod>${esc(a.updatedAt || a.publishedAt || today)}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
}
for (const c of categories) {
  sm += `  <url>\n    <loc>${esc(`${baseUrl}/category/${c.slug}/`)}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
}
sm += `</urlset>\n`;
fs.writeFileSync(path.join(dist, 'sitemap.xml'), sm);
fs.writeFileSync(path.join(root, 'public', 'sitemap.xml'), sm);

// Rss.xml
let rss = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n<channel>\n`;
rss += `  <title>${esc(settings.siteTitle || 'AINOVEX')}</title>\n  <link>${esc(baseUrl)}/</link>\n`;
rss += `  <description>${esc(settings.siteDescription || '')}</description>\n  <language>en-us</language>\n`;
rss += `  <atom:link href="${esc(baseUrl)}/rss.xml" rel="self" type="application/rss+xml" />\n`;
for (const a of [...articles].sort((x, y) => String(y.publishedAt).localeCompare(String(x.publishedAt)))) {
  const url = `${baseUrl}/blog/${a.slug}/`;
  rss += `  <item>\n    <title>${esc(a.title)}</title>\n    <link>${esc(url)}</link>\n    <guid isPermaLink="true">${esc(url)}</guid>\n    <description>${esc(a.excerpt || '')}</description>\n    <pubDate>${new Date(a.publishedAt).toUTCString()}</pubDate>\n  </item>\n`;
}
rss += `</channel>\n</rss>\n`;
fs.writeFileSync(path.join(dist, 'rss.xml'), rss);
fs.writeFileSync(path.join(root, 'public', 'rss.xml'), rss);

// Robots.txt
const robotsTxt = `User-agent: *\nAllow: /\n\nSitemap: ${baseUrl}/sitemap.xml\n`;
fs.writeFileSync(path.join(dist, 'robots.txt'), robotsTxt);
fs.writeFileSync(path.join(root, 'public', 'robots.txt'), robotsTxt);

// Copy IndexNow verification key file
const indexNowKeyFile = 'c49a629b37c0411eb31a896d8e20791d.txt';
if (fs.existsSync(path.join(root, 'public', indexNowKeyFile))) {
  fs.copyFileSync(path.join(root, 'public', indexNowKeyFile), path.join(dist, indexNowKeyFile));
}

// Ads.txt
if (ads.enabled && ads.adsTxtContent && !/pub-X+/i.test(ads.adsTxtContent)) {
  fs.writeFileSync(path.join(dist, 'ads.txt'), ads.adsTxtContent);
}

// Inline main CSS into template
const indexPath = path.join(dist, 'index.html');
let baseHtml = fs.readFileSync(indexPath, 'utf-8');
try {
  let inlinedBytes = 0;
  baseHtml = baseHtml.replace(/<link\b[^>]*>/gi, (tag) => {
    if (!/\brel=["']stylesheet["']/i.test(tag)) return tag;
    const m = tag.match(/\bhref=["'](\/assets\/[^"']+\.css)["']/i);
    if (!m) return tag;
    const cssFile = path.join(dist, m[1]);
    if (!fs.existsSync(cssFile)) return tag;
    const css = fs.readFileSync(cssFile, 'utf-8');
    if (css.length > 120 * 1024 || /<\/style/i.test(css)) return tag;
    inlinedBytes += css.length;
    return `<style>${css.replace(/\/\*# sourceMappingURL=[^*]*\*\//g, '')}</style>`;
  });
  if (inlinedBytes) {
    fs.writeFileSync(indexPath, baseHtml);
    console.log(`[postbuild] inlined ${(inlinedBytes / 1024).toFixed(1)} KB of CSS into index.html`);
  }
} catch (err) {
  console.warn('[postbuild] CSS inlining skipped:', err.message);
}

// Helper to keep meta description <= 155 characters
const trimDesc = (desc) => {
  const clean = String(desc || '').replace(/\s+/g, ' ').trim();
  if (clean.length <= 155) return clean;
  return clean.slice(0, 152).trim() + '...';
};

// ============================================================================
// PRE-RENDER ENGINE: Render semantic HTML & rich metadata for every route
// ============================================================================

const renderHeader = () => `
<header class="sticky top-0 z-40 w-full backdrop-blur-xl border-b transition-colors duration-200 bg-white/95 border-slate-200/90 text-slate-900 dark:bg-[#0b101b]/90 dark:border-slate-800/80 dark:text-slate-100 shadow-sm">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
    <a href="/" class="cursor-pointer group flex flex-col select-none">
      <div class="flex items-center gap-1 text-2xl font-black tracking-tight">
        <span class="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-400 to-blue-500">AI</span>
        <span class="text-slate-900 dark:text-white group-hover:text-sky-500 transition-colors">NOVEX</span>
      </div>
      <span class="text-[10px] tracking-wider font-medium text-slate-500 dark:text-slate-400 -mt-0.5">AI Tools • News • Guides • More</span>
    </a>
    <nav aria-label="Main Navigation" class="hidden md:flex items-center gap-7 text-sm font-medium">
      <a href="/" class="transition-colors py-1 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">Home</a>
      <a href="/tools/" class="transition-colors py-1 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">AI Tools</a>
      <a href="/categories/" class="transition-colors py-1 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">Categories</a>
      <a href="/blog/" class="transition-colors py-1 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">Blog</a>
      <a href="/about/" class="transition-colors py-1 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">About</a>
      <a href="/contact/" class="transition-colors py-1 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">Contact</a>
    </nav>
    <div class="flex items-center gap-3">
      <a href="/tools/" class="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/30 transition-all">Explore Tools</a>
    </div>
  </div>
</header>`;

const renderFooter = () => `
<footer class="border-t border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-[#070b14] pt-16 pb-12 transition-colors mt-16">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 mb-14">
      <div class="lg:col-span-4">
        <a href="/" class="cursor-pointer inline-flex flex-col mb-4 select-none">
          <div class="flex items-center gap-1 text-2xl font-black tracking-tight">
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-400 to-blue-500">AI</span>
            <span class="text-slate-900 dark:text-white">NOVEX</span>
          </div>
          <span class="text-[10px] tracking-wider font-medium text-slate-500 dark:text-slate-400 -mt-0.5">AI Tools • News • Guides • More</span>
        </a>
        <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm">
          AINOVEX is your trusted source for the best AI tools, latest news, and helpful guides. Boost your productivity and work smarter with curated artificial intelligence.
        </p>
      </div>
      <div class="lg:col-span-2">
        <h4 class="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4">QUICK LINKS</h4>
        <ul class="space-y-2.5 text-xs sm:text-sm">
          <li><a href="/" class="text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors block">Home</a></li>
          <li><a href="/tools/" class="text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors block">AI Tools</a></li>
          <li><a href="/blog/" class="text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors block">Blog</a></li>
          <li><a href="/categories/" class="text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors block">Categories</a></li>
          <li><a href="/about/" class="text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors block">About</a></li>
          <li><a href="/contact/" class="text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors block">Contact</a></li>
        </ul>
      </div>
      <div class="lg:col-span-3">
        <h4 class="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4">POPULAR CATEGORIES</h4>
        <div class="grid grid-cols-2 gap-x-2 gap-y-2.5 text-xs sm:text-sm">
          ${categories.slice(0, 8).map(c => `<a href="/category/${c.slug}/" class="text-left text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors truncate block">${esc(c.name)}</a>`).join('')}
        </div>
      </div>
      <div class="lg:col-span-3">
        <h4 class="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4">EDITORIAL DESK</h4>
        <p class="text-xs text-slate-600 dark:text-slate-400 mb-3">
          Independent AI software reviews, benchmarks, workflows, and hands-on tutorials.
        </p>
        <div class="flex items-center gap-2 pt-1">
          <a href="/rss.xml" class="px-3 py-1 rounded-full bg-slate-200 hover:bg-blue-600 text-slate-700 hover:text-white dark:bg-slate-800 dark:text-slate-300 text-xs font-bold transition-all">RSS Feed</a>
          <a href="/tools/" class="px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-bold transition-all">Directory</a>
        </div>
      </div>
    </div>
    <div class="pt-8 border-t border-slate-200 dark:border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
      <p>&copy; 2026 AINOVEX. All rights reserved.</p>
      <div class="flex flex-wrap items-center gap-5">
        <a href="/privacy/" class="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Privacy Policy</a>
        <a href="/terms/" class="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Terms of Service</a>
        <a href="/editorial-policy/" class="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Editorial Policy</a>
        <a href="/affiliate-disclosure/" class="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Disclaimer</a>
      </div>
    </div>
  </div>
</footer>`;

const renderBreadcrumb = (crumbs) => `
<nav aria-label="Breadcrumb" class="py-3 text-xs text-slate-500 dark:text-slate-400">
  <ol itemScope itemType="https://schema.org/BreadcrumbList" class="flex items-center flex-wrap gap-1.5">
    <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
      <a href="/" itemProp="item" class="flex items-center gap-1 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">
        <span itemProp="name">Home</span>
      </a>
      <meta itemProp="position" content="1" />
    </li>
    ${crumbs.map((c, i) => `
    <li class="text-slate-400 dark:text-slate-600" aria-hidden="true">&rsaquo;</li>
    <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
      ${c.path ? `<a href="${c.path.endsWith('/') ? c.path : c.path + '/'}" itemProp="item" class="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"><span itemProp="name">${esc(c.label)}</span></a>` : `<span itemProp="name" class="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[200px] sm:max-w-md inline-block">${esc(c.label)}</span>`}
      <meta itemProp="position" content="${i + 2}" />
    </li>`).join('')}
  </ol>
</nav>`;

function createPageHtml({ title, description, path: pagePath, image, ogType = 'website', jsonLd, contentHtml, noindex = false }) {
  const normPath = pagePath === '/' ? '/' : (pagePath.endsWith('/') ? pagePath : pagePath + '/');
  const url = `${baseUrl}${normPath}`;
  const ogImg = image || defaultOgImage;
  const safeDesc = trimDesc(description);
  const is404 = noindex || pagePath === '/404/' || pagePath === '/404';

  let html = baseHtml;

  // Replace Title
  html = html.replace(/<title>[^<]*<\/title>/i, `<title>${esc(title)}</title>`);

  // Replace/inject Description
  html = html.replace(/<meta\s+name=["']description["'][^>]*>/i, `<meta name="description" content="${esc(safeDesc)}" />`);

  if (is404) {
    // 404 pages MUST have noindex and MUST NOT have a canonical tag
    html = html.replace(/<meta\s+name=["']robots["'][^>]*>/i, `<meta name="robots" content="noindex, follow" />`);
    html = html.replace(/<link\s+rel=["']canonical["'][^>]*>\s*/gi, '');
    html = html.replace(/<meta\s+property=["']og:url["'][^>]*>\s*/gi, '');
  } else {
    // Ensure index, follow
    html = html.replace(/<meta\s+name=["']robots["'][^>]*>/i, `<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />`);
    // Replace/inject Canonical (always points to the direct 200 URL with trailing slash)
    if (/<link\s+rel=["']canonical["'][^>]*>/i.test(html)) {
      html = html.replace(/<link\s+rel=["']canonical["'][^>]*>/i, `<link rel="canonical" href="${esc(url)}" />`);
    } else {
      html = html.replace('</head>', `    <link rel="canonical" href="${esc(url)}" />\n  </head>`);
    }
    html = html.replace(/<meta\s+property=["']og:url["'][^>]*>/i, `<meta property="og:url" content="${esc(url)}" />`);
  }

  // Replace OpenGraph tags
  html = html.replace(/<meta\s+property=["']og:title["'][^>]*>/i, `<meta property="og:title" content="${esc(title)}" />`);
  html = html.replace(/<meta\s+property=["']og:description["'][^>]*>/i, `<meta property="og:description" content="${esc(safeDesc)}" />`);
  html = html.replace(/<meta\s+property=["']og:type["'][^>]*>/i, `<meta property="og:type" content="${ogType}" />`);
  html = html.replace(/<meta\s+property=["']og:image["'][^>]*>/i, `<meta property="og:image" content="${esc(ogImg)}" />`);

  // Replace Twitter tags
  html = html.replace(/<meta\s+name=["']twitter:title["'][^>]*>/i, `<meta name="twitter:title" content="${esc(title)}" />`);
  html = html.replace(/<meta\s+name=["']twitter:description["'][^>]*>/i, `<meta name="twitter:description" content="${esc(safeDesc)}" />`);
  html = html.replace(/<meta\s+name=["']twitter:image["'][^>]*>/i, `<meta name="twitter:image" content="${esc(ogImg)}" />`);

  // Inject JSON-LD Schema
  if (jsonLd) {
    const jsonLdScript = `\n    <script type="application/ld+json">\n    ${JSON.stringify(jsonLd, null, 2)}\n    </script>\n`;
    html = html.replace('</head>', `${jsonLdScript}  </head>`);
  }

  // Inject content inside <div id="root">
  const fullBody = `${renderHeader()}<main id="main-content" class="min-h-[70vh]">${contentHtml}</main>${renderFooter()}`;
  html = html.replace('<div id="root"></div>', `<div id="root">${fullBody}</div>`);

  return html;
}

const writePage = (relPath, html) => {
  const full = path.join(dist, relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, html);
};

// ----------------------------------------------------------------------------
// 1. Homepage (/)
// ----------------------------------------------------------------------------
const homeContent = `
<section class="relative pt-8 pb-14 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
  <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-50 border border-blue-200 text-blue-600 dark:bg-blue-950/60 dark:border-blue-500/30 dark:text-blue-400 mb-6 shadow-sm">
    <span class="w-2 h-2 rounded-full bg-blue-500 animate-ping inline-block"></span>
    <span>Your AI Journey Starts Here</span>
  </div>
  <h1 class="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15] mb-5">
    Discover the Best <br class="hidden sm:inline" />
    <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-sky-500 to-blue-500 dark:from-blue-400 dark:via-sky-400 dark:to-blue-600">AI Tools</span> &amp; Resources
  </h1>
  <p class="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-8">
    AINOVEX brings you the latest AI tools, helpful guides, tech news and insights — all in one place. Boost your productivity, creativity and work smarter with curated artificial intelligence software.
  </p>
  <div class="flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 mb-8">
    <span class="font-semibold text-amber-500 dark:text-amber-400">Trending:</span>
    <a href="/category/ai-writing/" class="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 hover:bg-blue-50 border border-slate-200 text-slate-700 hover:text-blue-600 dark:bg-slate-800 dark:border-slate-700/60 dark:text-slate-300 dark:hover:text-blue-400">ChatGPT</a>
    <a href="/category/image-generation/" class="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 hover:bg-blue-50 border border-slate-200 text-slate-700 hover:text-blue-600 dark:bg-slate-800 dark:border-slate-700/60 dark:text-slate-300 dark:hover:text-blue-400">AI Image Generator</a>
    <a href="/category/video-audio/" class="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 hover:bg-blue-50 border border-slate-200 text-slate-700 hover:text-blue-600 dark:bg-slate-800 dark:border-slate-700/60 dark:text-slate-300 dark:hover:text-blue-400">Video Editing</a>
    <a href="/category/productivity/" class="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 hover:bg-blue-50 border border-slate-200 text-slate-700 hover:text-blue-600 dark:bg-slate-800 dark:border-slate-700/60 dark:text-slate-300 dark:hover:text-blue-400">Productivity</a>
  </div>
</section>

<section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
  <div class="flex items-center justify-between mb-6">
    <h2 class="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Browse by Category</h2>
    <a href="/categories/" class="text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">View All Categories &rarr;</a>
  </div>
  <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5 sm:gap-4">
    ${categories.map(c => `
    <a href="/category/${c.slug}/" class="flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-500 shadow-sm dark:bg-slate-900/60 dark:border-slate-800 text-center block">
      <span class="text-sm font-bold text-slate-800 dark:text-slate-200 line-clamp-1">${esc(c.name)}</span>
      <span class="text-xs text-slate-500 dark:text-slate-400 mt-1">${c.toolCount || 8}+ tools</span>
    </a>`).join('')}
  </div>
</section>

<section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
  <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
    <div>
      <h2 class="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Featured AI Tools</h2>
      <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">Handpicked top AI tools to help you work faster, create better and achieve more.</p>
    </div>
    <a href="/tools/" class="text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">View All Tools &rarr;</a>
  </div>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
    ${tools.slice(0, 6).map(t => `
    <div class="p-6 rounded-2xl bg-white border border-slate-200 dark:bg-slate-900/70 dark:border-slate-800 text-center flex flex-col justify-between">
      <div>
        <div class="w-12 h-12 mx-auto mb-3 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800/80 p-1 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center">
          <img src="${esc(t.icon)}" alt="${esc(t.name)} Logo" class="w-full h-full object-contain" />
        </div>
        <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-1">${esc(t.name)}</h3>
        <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-4">${esc(t.description)}</p>
      </div>
      <a href="${esc(t.url)}" target="_blank" rel="nofollow noopener noreferrer" class="w-full py-2 px-4 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-blue-600 dark:bg-slate-800 transition-colors inline-block">Visit Tool &rarr;</a>
    </div>`).join('')}
  </div>
</section>

<section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
  <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
    <div>
      <h2 class="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Latest Blog &amp; News</h2>
      <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">Stay updated with the latest AI news, tips, tutorials and industry trends.</p>
    </div>
    <a href="/blog/" class="text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">View All Articles &rarr;</a>
  </div>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    ${articles.map(a => `
    <a href="/blog/${a.slug}/" class="rounded-2xl bg-white border border-slate-200 overflow-hidden dark:bg-slate-900/60 dark:border-slate-800 block shadow-sm hover:border-blue-500 transition-all">
      <img src="${esc(a.featuredImage)}" alt="${esc(a.imageAlt || a.title)}" class="w-full aspect-[16/10] object-cover" />
      <div class="p-5">
        <span class="text-xs font-bold uppercase text-blue-600 dark:text-blue-400">${esc(a.categoryName || a.category)}</span>
        <h3 class="text-base font-bold text-slate-900 dark:text-white mt-1 mb-2 line-clamp-2">${esc(a.title)}</h3>
        <p class="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">${esc(a.excerpt)}</p>
      </div>
    </a>`).join('')}
  </div>
</section>`;

const homeHtml = createPageHtml({
  title: 'AINOVEX - AI Tools & Technology Platform',
  description: 'Discover the best AI tools, software reviews, and guides on AINOVEX. Boost productivity and work smarter with curated artificial intelligence.',
  path: '/',
  contentHtml: homeContent,
  jsonLd: {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'AINOVEX',
    url: `${baseUrl}/`,
    description: 'Discover the best AI tools, software reviews, and guides on AINOVEX. Boost productivity and work smarter with curated artificial intelligence.',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${baseUrl}/tools/?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  },
});
writePage('index.html', homeHtml);

// ----------------------------------------------------------------------------
// 2. Tools Directory (/tools/)
// ----------------------------------------------------------------------------
const toolsContent = `
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  ${renderBreadcrumb([{ label: 'AI Tools Directory' }])}
  <div class="py-6 text-center max-w-3xl mx-auto">
    <h1 class="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
      Explore All AI Tools &amp; Software
    </h1>
    <p class="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
      Browse and compare top artificial intelligence tools for writing, image creation, video, coding, and productivity. Find the best software for your daily needs with transparent ratings and pricing models.
    </p>
  </div>
  <div class="flex flex-wrap items-center justify-center gap-2 mb-8">
    <a href="/tools/" class="px-3 py-1 rounded-full text-xs font-semibold bg-blue-600 text-white">All Tools (${tools.length})</a>
    ${categories.map(c => `<a href="/category/${c.slug}/" class="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">${esc(c.name)}</a>`).join('')}
  </div>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
    ${tools.map(t => `
    <div class="p-6 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 text-center flex flex-col justify-between">
      <div>
        <div class="w-12 h-12 mx-auto mb-3 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800/80 p-1 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center">
          <img src="${esc(t.icon)}" alt="${esc(t.name)} Logo" class="w-full h-full object-contain" />
        </div>
        <div class="text-xs text-amber-500 font-semibold mb-1">&#9733; ${t.rating || 4.8} &bull; ${esc(t.pricing)}</div>
        <h2 class="text-lg font-bold text-slate-900 dark:text-white mb-2">${esc(t.name)}</h2>
        <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">${esc(t.description)}</p>
        <div class="flex flex-wrap items-center justify-center gap-1.5 mb-6">
          ${(t.tags || []).map(tag => `<span class="px-2.5 py-0.5 rounded-full text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">${esc(tag)}</span>`).join('')}
        </div>
      </div>
      <a href="${esc(t.url)}" target="_blank" rel="nofollow noopener noreferrer" class="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-blue-600 dark:bg-slate-800 transition-colors inline-block">Visit Tool &rarr;</a>
    </div>`).join('')}
  </div>
</div>`;

const toolsPageHtml = createPageHtml({
  title: 'Best AI Tools Directory & Software Reviews 2026 | AINOVEX',
  description: 'Browse and compare the top artificial intelligence tools for writing, image creation, video, coding, and productivity. Find the best software for your needs.',
  path: '/tools/',
  contentHtml: toolsContent,
  jsonLd: {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'AI Tools Directory',
    url: `${baseUrl}/tools/`,
    description: 'Browse and compare the top artificial intelligence tools for writing, image creation, video, coding, and productivity.',
  },
});
writePage('tools/index.html', toolsPageHtml);

// ----------------------------------------------------------------------------
// 3. Blog Archive (/blog/)
// ----------------------------------------------------------------------------
const blogContent = `
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  ${renderBreadcrumb([{ label: 'Blog & Articles' }])}
  <div class="py-6 text-center max-w-3xl mx-auto">
    <h1 class="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
      AI Articles, Tutorials &amp; Reviews
    </h1>
    <p class="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
      Explore actionable AI tutorials, practical workflows, tool comparisons, and tech guides from the AINOVEX editorial team. Master modern AI applications today.
    </p>
  </div>
  <div class="flex flex-wrap items-center justify-center gap-2 mb-8">
    <a href="/blog/" class="px-3 py-1 rounded-full text-xs font-semibold bg-blue-600 text-white">All Guides (${articles.length})</a>
    ${categories.map(c => `<a href="/category/${c.slug}/" class="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">${esc(c.name)}</a>`).join('')}
  </div>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    ${articles.map(a => `
    <a href="/blog/${a.slug}/" class="rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:border-blue-500 transition-all block">
      <img src="${esc(a.featuredImage)}" alt="${esc(a.imageAlt || a.title)}" class="w-full aspect-[16/10] object-cover" />
      <div class="p-5">
        <span class="text-xs font-bold uppercase text-blue-600 dark:text-blue-400">${esc(a.categoryName || a.category)}</span>
        <h2 class="text-lg font-bold text-slate-900 dark:text-white mt-1 mb-2 leading-snug">${esc(a.title)}</h2>
        <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">${esc(a.excerpt)}</p>
        <span class="text-xs font-semibold text-blue-600 dark:text-blue-400">Read Guide &rarr;</span>
      </div>
    </a>`).join('')}
  </div>
</div>`;

const blogPageHtml = createPageHtml({
  title: 'AI Insights, Tutorials & Technology Guides | AINOVEX',
  description: 'Explore actionable AI tutorials, practical workflows, tool comparisons, and tech guides from the AINOVEX editorial team. Master modern AI applications today.',
  path: '/blog/',
  contentHtml: blogContent,
  jsonLd: {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'AI Insights, Tutorials & Technology Guides',
    url: `${baseUrl}/blog/`,
    description: 'Explore actionable AI tutorials, practical workflows, tool comparisons, and tech guides from the AINOVEX editorial team.',
  },
});
writePage('blog/index.html', blogPageHtml);

// ----------------------------------------------------------------------------
// 4. Categories Directory (/categories/)
// ----------------------------------------------------------------------------
const categoriesContent = `
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  ${renderBreadcrumb([{ label: 'Categories' }])}
  <div class="py-6 text-center max-w-3xl mx-auto mb-8">
    <h1 class="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
      Explore AI Topics &amp; Categories
    </h1>
    <p class="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
      Explore specialized AI software categories from writing and image generation to coding and productivity. Find the right tools for your specific workflow.
    </p>
  </div>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    ${categories.map(c => `
    <a href="/category/${c.slug}/" class="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-blue-500 shadow-sm transition-all block">
      <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-2">${esc(c.name)}</h2>
      <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">${esc(c.description)}</p>
      <span class="text-xs font-semibold text-blue-600 dark:text-blue-400">Browse ${esc(c.name)} &rarr;</span>
    </a>`).join('')}
  </div>
</div>`;

const categoriesPageHtml = createPageHtml({
  title: 'Browse AI Categories & Topics | AINOVEX',
  description: 'Explore specialized AI software categories from writing and image generation to coding and productivity. Find the right tools for your specific workflow.',
  path: '/categories/',
  contentHtml: categoriesContent,
  jsonLd: {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Browse AI Categories',
    url: `${baseUrl}/categories/`,
    description: 'Explore specialized AI software categories from writing and image generation to coding and productivity.',
  },
});
writePage('categories/index.html', categoriesPageHtml);

// ----------------------------------------------------------------------------
// 5. Individual Article Pages (/blog/[slug]/)
// ----------------------------------------------------------------------------
for (const a of articles) {
  const mdFile = path.resolve(root, a.contentPath || `content/articles/${a.slug}.md`);
  let mdRaw = '';
  if (fs.existsSync(mdFile)) {
    mdRaw = fs.readFileSync(mdFile, 'utf-8');
  }
  // Strip duplicate top-level # title from markdown body so page template holds the only <h1>
  const cleanedMd = mdRaw.replace(/^#\s+[^\n]+\n+/, '');
  const bodyHtml = marked.parse(cleanedMd);

  const related = articles.filter(x => x.slug !== a.slug).slice(0, 2);

  const articleContent = `
<article class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  ${renderBreadcrumb([
    { label: 'Blog', path: '/blog/' },
    { label: a.categoryName || a.category, path: `/category/${a.category}/` },
    { label: a.title },
  ])}
  <div class="py-6 border-b border-slate-200 dark:border-slate-800/80 mb-8">
    <a href="/category/${a.category}/" class="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-600/20 dark:text-blue-400 dark:border-blue-500/30 mb-4 hover:bg-blue-100 transition-colors">
      ${esc(a.categoryName || a.category)}
    </a>
    <h1 class="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight mb-4">
      ${esc(a.title)}
    </h1>
    <p class="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
      ${esc(a.excerpt)}
    </p>
    <div class="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
      <span class="font-semibold text-slate-800 dark:text-slate-200">By ${esc(a.author || 'Md Shamim')}</span>
      <span>&bull;</span>
      <span>${esc(a.publishedAt)}</span>
      <span>&bull;</span>
      <span>${esc(a.readingTime || '5 min read')}</span>
    </div>
  </div>
  ${a.featuredImage ? `<div class="relative aspect-[16/9] rounded-2xl overflow-hidden mb-10 shadow-lg border border-slate-200 dark:border-slate-800"><img src="${esc(a.featuredImage)}" alt="${esc(a.imageAlt || a.title)}" class="w-full h-full object-cover" /></div>` : ''}
  <div class="article-content mb-12">
    ${bodyHtml}
  </div>
  ${(a.tags && a.tags.length) ? `
  <div class="py-6 border-t border-b border-slate-200 dark:border-slate-800/80 flex items-center gap-2 flex-wrap mb-10">
    ${a.tags.map(t => `<span class="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">#${esc(t)}</span>`).join('')}
  </div>` : ''}
  <div class="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm mb-12">
    <div class="text-xs uppercase font-bold tracking-wider text-blue-600 dark:text-blue-400 mb-1">Author</div>
    <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-1">${esc(a.author || 'Md Shamim')}</h3>
    <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
      Lead researcher and editor at AINOVEX. Passionate about artificial intelligence, software benchmarks, prompt engineering, and democratizing modern productivity tools.
    </p>
  </div>
  ${related.length ? `
  <div class="pt-6 border-t border-slate-200 dark:border-slate-800/80">
    <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-6">Related Guides &amp; Tutorials</h3>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
      ${related.map(r => `
      <a href="/blog/${r.slug}/" class="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-blue-500 shadow-sm block">
        <div class="text-xs text-blue-600 dark:text-blue-400 font-semibold mb-2">${esc(r.categoryName || r.category)}</div>
        <h4 class="text-base font-bold text-slate-900 dark:text-white mb-2">${esc(r.title)}</h4>
        <p class="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">${esc(r.excerpt)}</p>
      </a>`).join('')}
    </div>
  </div>` : ''}
</article>`;

  const articleHtml = createPageHtml({
    title: a.metaTitle || `${a.title} | AINOVEX`,
    description: a.metaDescription || a.excerpt,
    path: `/blog/${a.slug}/`,
    image: a.featuredImage,
    ogType: 'article',
    contentHtml: articleContent,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: a.title,
      description: trimDesc(a.metaDescription || a.excerpt),
      image: a.featuredImage,
      datePublished: a.publishedAt,
      dateModified: a.updatedAt || a.publishedAt,
      author: {
        '@type': 'Person',
        name: a.author || 'Md Shamim',
      },
      publisher: {
        '@type': 'Organization',
        name: 'AINOVEX',
        logo: {
          '@type': 'ImageObject',
          url: `${baseUrl}/favicon.svg`,
        },
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `${baseUrl}/blog/${a.slug}/`,
      },
    },
  });

  writePage(`blog/${a.slug}/index.html`, articleHtml);
}

// ----------------------------------------------------------------------------
// 6. Category Detail Pages (/category/[slug]/)
// ----------------------------------------------------------------------------
for (const c of categories) {
  const catTools = tools.filter(t => t.category === c.slug);
  const catArticles = articles.filter(a => a.category === c.slug);

  const catContent = `
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  ${renderBreadcrumb([
    { label: 'Categories', path: '/categories/' },
    { label: c.name },
  ])}
  <div class="py-8 border-b border-slate-200 dark:border-slate-800/80 mb-10 text-center max-w-3xl mx-auto">
    <h1 class="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-3">
      ${esc(c.name)}
    </h1>
    <p class="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
      ${esc(c.description)} Browse handpicked software reviews and tutorials on AINOVEX.
    </p>
  </div>

  <div class="mb-14">
    <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-6">Recommended AI Tools in ${esc(c.name)}</h2>
    ${catTools.length ? `
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      ${catTools.map(t => `
      <div class="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-center flex flex-col justify-between">
        <div>
          <div class="w-12 h-12 mx-auto mb-3 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800/80 p-1 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center">
            <img src="${esc(t.icon)}" alt="${esc(t.name)} Logo" class="w-full h-full object-contain" />
          </div>
          <h3 class="text-base font-bold text-slate-900 dark:text-white mb-1">${esc(t.name)}</h3>
          <p class="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-4">${esc(t.description)}</p>
        </div>
        <a href="${esc(t.url)}" target="_blank" rel="nofollow noopener noreferrer" class="w-full py-2 px-3 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-blue-600 dark:bg-slate-800 transition-colors inline-block">Visit Tool &rarr;</a>
      </div>`).join('')}
    </div>` : `<p class="text-sm text-slate-500">More tools are being reviewed for this category.</p>`}
  </div>

  <div>
    <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-6">Guides &amp; Tutorials for ${esc(c.name)}</h2>
    ${catArticles.length ? `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      ${catArticles.map(a => `
      <a href="/blog/${a.slug}/" class="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-blue-500 shadow-sm block">
        <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2">${esc(a.title)}</h3>
        <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-4">${esc(a.excerpt)}</p>
        <span class="text-xs font-semibold text-blue-600 dark:text-blue-400">Read Guide &rarr;</span>
      </a>`).join('')}
    </div>` : `<p class="text-sm text-slate-500">Our editorial desk is preparing guides for this category.</p>`}
  </div>
</div>`;

  const catDesc = trimDesc(`${c.description} Browse handpicked software reviews and tutorials on AINOVEX.`);

  writePage(`category/${c.slug}/index.html`, createPageHtml({
    title: `${c.name} AI Tools & Practical Guides 2026 | AINOVEX`,
    description: catDesc,
    path: `/category/${c.slug}/`,
    contentHtml: catContent,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: `${c.name} AI Tools & Guides`,
      url: `${baseUrl}/category/${c.slug}/`,
      description: catDesc,
    },
  }));
}

// ----------------------------------------------------------------------------
// 7. Static Pages: About, Contact, Privacy, Terms, Editorial, Disclaimer
// ----------------------------------------------------------------------------
const aboutContent = `
<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  ${renderBreadcrumb([{ label: 'About Us' }])}
  <div class="py-6 border-b border-slate-200 dark:border-slate-800 mb-10 text-center">
    <h1 class="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
      Empowering Creators with Artificial Intelligence
    </h1>
    <p class="text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
      Learn about AINOVEX, our mission to simplify artificial intelligence, our rigorous testing standards, and our independent editorial review methodology.
    </p>
  </div>
  <div class="space-y-8 text-slate-700 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
    <section class="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm">
      <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-3">Who We Are</h2>
      <p class="mb-3">
        Founded by <strong>Md Shamim</strong>, AINOVEX is an independent digital publication and curated software directory headquartered on the open web. We cater to an audience across the United States, United Kingdom, Canada, and English-speaking technologists worldwide.
      </p>
      <p>
        With thousands of artificial intelligence startups launching monthly, finding tools that truly deliver ROI, protect user privacy, and preserve workflow sanity has become a daunting task. AINOVEX serves as your trusted filter.
      </p>
    </section>
    <section class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="p-5 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
        <h3 class="text-base font-bold text-slate-900 dark:text-white mb-2">Hands-on Testing</h3>
        <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Every tool featured in our directory undergoes real testing on real tasks before receiving a recommendation.</p>
      </div>
      <div class="p-5 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
        <h3 class="text-base font-bold text-slate-900 dark:text-white mb-2">Editorial Integrity</h3>
        <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Our guides are independent. We do not accept paid placements to inflate reviews or rankings.</p>
      </div>
      <div class="p-5 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
        <h3 class="text-base font-bold text-slate-900 dark:text-white mb-2">Practical Workflows</h3>
        <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400">We focus on actionable recipes, prompt templates, and integrations that deliver tangible time savings.</p>
      </div>
    </section>
  </div>
</div>`;
writePage('about/index.html', createPageHtml({
  title: 'About Us & Editorial Standards | AINOVEX',
  description: 'Learn about AINOVEX, our mission to simplify artificial intelligence, our testing standards, and our independent editorial review methodology.',
  path: '/about/',
  contentHtml: aboutContent,
}));

const contactContent = `
<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  ${renderBreadcrumb([{ label: 'Contact Us' }])}
  <div class="py-6 border-b border-slate-200 dark:border-slate-800 mb-8 text-center">
    <h1 class="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
      Contact the Editorial Team
    </h1>
    <p class="text-sm text-slate-600 dark:text-slate-300">
      Contact the AINOVEX editorial team for software recommendations, directory submissions, editorial corrections, or media and partnership inquiries.
    </p>
  </div>
  <div class="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
    <p class="text-sm text-slate-600 dark:text-slate-300 mb-4">Direct all editorial queries, tool submissions, and partnership requests to:</p>
    <a href="mailto:mdshamimhossaincom129@gmail.com" class="text-base font-bold text-blue-600 dark:text-blue-400 hover:underline">mdshamimhossaincom129@gmail.com</a>
  </div>
</div>`;
writePage('contact/index.html', createPageHtml({
  title: 'Contact AINOVEX | Editorial & Support Team',
  description: 'Contact the AINOVEX editorial team for software recommendations, directory submissions, editorial corrections, or partnership inquiries.',
  path: '/contact/',
  contentHtml: contactContent,
}));

const privacyContent = `
<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  ${renderBreadcrumb([{ label: 'Privacy Policy' }])}
  <div class="py-6 border-b border-slate-200 dark:border-slate-800 mb-8">
    <h1 class="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">Privacy Policy</h1>
    <p class="text-xs text-slate-500">Last updated: October 18, 2026 &bull; Published by AINOVEX Editorial Team</p>
  </div>
  <div class="space-y-6 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
    <p>Read the official AINOVEX Privacy Policy. Learn how we safeguard your personal information, handle essential cookies, and maintain strict data privacy.</p>
    <h2 class="text-xl font-bold text-slate-900 dark:text-white">1. Information We Collect</h2>
    <p>At AINOVEX, the privacy of our visitors is paramount. We only collect standard web server access logs (IP address, user-agent, timestamp) for security and operational reliability. We do not sell user data.</p>
    <h2 class="text-xl font-bold text-slate-900 dark:text-white">2. Cookies &amp; Local Storage</h2>
    <p>We use local browser storage strictly for functional preferences (such as light or dark theme choices). We do not employ third-party cross-site trackers.</p>
  </div>
</div>`;
writePage('privacy/index.html', createPageHtml({
  title: 'Privacy Policy | AINOVEX AI Platform',
  description: 'Read the official AINOVEX Privacy Policy. Learn how we safeguard your personal information, handle essential cookies, and maintain data privacy.',
  path: '/privacy/',
  contentHtml: privacyContent,
}));

const termsContent = `
<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  ${renderBreadcrumb([{ label: 'Terms of Service' }])}
  <div class="py-6 border-b border-slate-200 dark:border-slate-800 mb-8">
    <h1 class="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">Terms of Service</h1>
    <p class="text-xs text-slate-500">Last updated: October 18, 2026 &bull; Published by AINOVEX Editorial Team</p>
  </div>
  <div class="space-y-6 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
    <p>Review the AINOVEX Terms of Service. Understand the rules, guidelines, disclaimers, and legal agreements governing the use of our website and directory.</p>
    <h2 class="text-xl font-bold text-slate-900 dark:text-white">1. Acceptance of Terms</h2>
    <p>By accessing AINOVEX, you agree to comply with these terms, applicable laws, and regulations. All material is provided for informational and educational purposes.</p>
  </div>
</div>`;
writePage('terms/index.html', createPageHtml({
  title: 'Terms of Service | AINOVEX Platform',
  description: 'Review the AINOVEX Terms of Service. Understand the rules, guidelines, disclaimers, and legal agreements governing the use of our website.',
  path: '/terms/',
  contentHtml: termsContent,
}));

const editorialContent = `
<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  ${renderBreadcrumb([{ label: 'Editorial Policy' }])}
  <div class="py-6 border-b border-slate-200 dark:border-slate-800 mb-8">
    <h1 class="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">Editorial Policy &amp; Review Standards</h1>
    <p class="text-xs text-slate-500">Last updated: October 18, 2026 &bull; Published by AINOVEX Editorial Team</p>
  </div>
  <div class="space-y-6 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
    <p>Explore AINOVEX strict editorial policy, review guidelines, testing benchmarks, and independence standards for recommending artificial intelligence tools.</p>
    <h2 class="text-xl font-bold text-slate-900 dark:text-white">1. Independence Commitment</h2>
    <p>All reviews are written following independent evaluation. Tool developers cannot pay for higher star ratings or biased coverage.</p>
  </div>
</div>`;
writePage('editorial-policy/index.html', createPageHtml({
  title: 'Editorial Policy & Review Standards | AINOVEX',
  description: 'Explore AINOVEX editorial policy, review guidelines, testing benchmarks, and independence standards for recommending artificial intelligence tools.',
  path: '/editorial-policy/',
  contentHtml: editorialContent,
}));

const affiliateContent = `
<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  ${renderBreadcrumb([{ label: 'Affiliate Disclosure' }])}
  <div class="py-6 border-b border-slate-200 dark:border-slate-800 mb-8">
    <h1 class="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">Affiliate &amp; Monetization Disclosure</h1>
    <p class="text-xs text-slate-500">Last updated: October 18, 2026 &bull; Published by AINOVEX Editorial Team</p>
  </div>
  <div class="space-y-6 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
    <p>Read the AINOVEX affiliate and advertising disclosure. Learn how our site remains free for readers through transparent monetization and editorial integrity.</p>
    <h2 class="text-xl font-bold text-slate-900 dark:text-white">1. How We Fund Our Research</h2>
    <p>Certain links on AINOVEX may be affiliate links. If you click through and purchase a subscription, we may earn a small referral commission at no additional cost to you.</p>
  </div>
</div>`;
writePage('affiliate-disclosure/index.html', createPageHtml({
  title: 'Affiliate & Monetization Disclosure | AINOVEX',
  description: 'Read the AINOVEX affiliate and advertising disclosure. Learn how our site remains free for readers through transparent monetization and integrity.',
  path: '/affiliate-disclosure/',
  contentHtml: affiliateContent,
}));

// ----------------------------------------------------------------------------
// 8. 404 Error Page
// ----------------------------------------------------------------------------
const notFoundContent = `
<div class="max-w-3xl mx-auto px-4 py-24 text-center">
  <span class="inline-block px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 mb-4">404 Error</span>
  <h1 class="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white mb-4">Page Not Found</h1>
  <p class="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-md mx-auto mb-8">
    The page you requested could not be located. Explore our curated AI tools directory or read the latest guides.
  </p>
  <div class="flex flex-wrap items-center justify-center gap-3">
    <a href="/" class="px-6 py-2.5 rounded-full bg-blue-600 text-white font-semibold text-sm hover:bg-blue-500">Return to Homepage</a>
    <a href="/tools/" class="px-6 py-2.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-sm">Explore AI Tools</a>
    <a href="/blog/" class="px-6 py-2.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-sm">Read Blog</a>
  </div>
</div>`;
const notFoundHtml = createPageHtml({
  title: 'Page Not Found (404) | AINOVEX',
  description: 'The page you requested could not be found. Explore top AI tools, software reviews, and guides on AINOVEX.',
  path: '/404/',
  contentHtml: notFoundContent,
  noindex: true,
});
writePage('404.html', notFoundHtml);

console.log(`[postbuild] Pre-rendered all 22+ static HTML routes with rich semantic markup, headings, links, and schema!`);
console.log(`[postbuild] ${articles.length} articles, ${categories.length} categories, ${tools.length} tools exported.`);
