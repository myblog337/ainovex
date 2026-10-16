// Runs after `vite build`. Makes the static (Cloudflare Pages) deployment work:
//  - copies published content into dist/content so Pages Functions can serve /api/*
//  - regenerates sitemap.xml, rss.xml (and ads.txt when configured) from the real content
// Draft articles are never copied to dist.
import fs from 'node:fs';
import path from 'node:path';

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
  String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

const settings = readJson('settings.json', {});
const categories = readJson('categories.json', []);
const tools = readJson('tools.json', []);
const ads = readJson('ads.json', {});
const allArticles = readJson('articles.json', []);
const articles = allArticles.filter((a) => a.isPublished);
const baseUrl = (settings.productionUrl || 'https://ainovex.pages.dev').replace(/\/+$/, '');

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

// ---- static API snapshots (used by Netlify redirects: /api/* -> dist/api/*.json)
// Cloudflare Pages keeps serving /api/* from functions/; these files are simply unused there.
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
writeApi('health.json', { status: 'ok', platform: 'static' });
writeApi('articles/index.json', articles);
const SAFE_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
for (const a of articles) {
  if (!SAFE_SLUG.test(a.slug)) continue;
  const mdFile = path.join(contentDst, 'articles', `${a.slug}.md`);
  const content = fs.existsSync(mdFile) ? fs.readFileSync(mdFile, 'utf-8') : '';
  writeApi(`articles/${a.slug}/index.json`, { ...a, content });
}

// ---- sitemap.xml
const today = new Date().toISOString().slice(0, 10);
const staticRoutes = [
  ['/', '1.0', 'daily'], ['/tools', '0.9', 'daily'], ['/blog', '0.9', 'daily'], ['/categories', '0.8', 'weekly'],
  ['/about', '0.5', 'monthly'], ['/contact', '0.5', 'monthly'], ['/privacy', '0.3', 'monthly'],
  ['/terms', '0.3', 'monthly'], ['/editorial-policy', '0.4', 'monthly'], ['/affiliate-disclosure', '0.3', 'monthly'],
];
let sm = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
for (const [p, pr, cf] of staticRoutes) sm += `  <url>\n    <loc>${esc(baseUrl + p)}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${cf}</changefreq>\n    <priority>${pr}</priority>\n  </url>\n`;
for (const a of articles) sm += `  <url>\n    <loc>${esc(`${baseUrl}/blog/${a.slug}`)}</loc>\n    <lastmod>${esc(a.updatedAt || a.publishedAt || today)}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
for (const c of categories) sm += `  <url>\n    <loc>${esc(`${baseUrl}/category/${c.slug}`)}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
sm += `</urlset>\n`;
fs.writeFileSync(path.join(dist, 'sitemap.xml'), sm);

// ---- rss.xml
let rss = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0">\n<channel>\n  <title>${esc(settings.siteTitle || 'AINOVEX')}</title>\n  <link>${esc(baseUrl)}</link>\n  <description>${esc(settings.siteDescription || '')}</description>\n`;
for (const a of [...articles].sort((x, y) => String(y.publishedAt).localeCompare(String(x.publishedAt)))) {
  const url = `${baseUrl}/blog/${a.slug}`;
  rss += `  <item>\n    <title>${esc(a.title)}</title>\n    <link>${esc(url)}</link>\n    <guid>${esc(url)}</guid>\n    <description>${esc(a.excerpt || '')}</description>\n    <pubDate>${new Date(a.publishedAt).toUTCString()}</pubDate>\n  </item>\n`;
}
rss += `</channel>\n</rss>\n`;
fs.writeFileSync(path.join(dist, 'rss.xml'), rss);

// ---- robots.txt uses the configured domain
fs.writeFileSync(
  path.join(dist, 'robots.txt'),
  `User-agent: *\nAllow: /\n\nSitemap: ${baseUrl}/sitemap.xml\n`
);

// ---- ads.txt only when a real publisher id is configured
if (ads.enabled && ads.adsTxtContent && !/pub-X+/i.test(ads.adsTxtContent)) {
  fs.writeFileSync(path.join(dist, 'ads.txt'), ads.adsTxtContent);
}

console.log(`[postbuild] ${articles.length} articles, ${categories.length} categories, ${tools.length} tools exported.`);
