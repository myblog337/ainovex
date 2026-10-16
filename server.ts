import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.disable('x-powered-by');

// Basic security headers
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  if (isProduction) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
});

const escapeXml = (v: string) =>
  v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

// Paths to content files
const CONTENT_DIR = path.resolve(__dirname, 'content');
const ARTICLES_JSON = path.join(CONTENT_DIR, 'articles.json');
const ARTICLES_DIR = path.join(CONTENT_DIR, 'articles');
const CATEGORIES_JSON = path.join(CONTENT_DIR, 'categories.json');
const TOOLS_JSON = path.join(CONTENT_DIR, 'tools.json');
const SETTINGS_JSON = path.join(CONTENT_DIR, 'settings.json');
const ADS_JSON = path.join(CONTENT_DIR, 'ads.json');

// Helper for reading JSON files safely
function readJsonFile<T>(filePath: string, fallback: T): T {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
  }
  return fallback;
}

// ----------------------------------------------------
// PUBLIC CONTENT ENDPOINTS (read-only)
// ----------------------------------------------------
app.get('/api/settings', (_req: Request, res: Response) => {
  res.json(readJsonFile(SETTINGS_JSON, {}));
});

app.get('/api/ads', (_req: Request, res: Response) => {
  const ads = readJsonFile(ADS_JSON, {
    enabled: false,
    publisherId: '',
    autoAds: false,
    testMode: true,
    adsTxtContent: '# Google AdSense ads.txt for AINOVEX\n',
    slots: {}
  });
  res.json(ads);
});

app.get('/api/categories', (_req: Request, res: Response) => {
  res.json(readJsonFile(CATEGORIES_JSON, []));
});

app.get('/api/tools', (_req: Request, res: Response) => {
  res.json(readJsonFile(TOOLS_JSON, []));
});

app.get('/api/articles', (_req: Request, res: Response) => {
  const articles = readJsonFile<any[]>(ARTICLES_JSON, []);
  res.json(articles.filter(a => a.isPublished));
});

app.get('/api/articles/:slug', (req: Request, res: Response) => {
  const { slug } = req.params;
  const articles = readJsonFile<any[]>(ARTICLES_JSON, []);
  const article = articles.find(a => a.slug === slug || a.id === slug);

  if (!article || !article.isPublished) {
    res.status(404).json({ error: 'Article not found' });
    return;
  }

  // Load markdown content if available (only from inside content/articles)
  let content = article.content || '';
  if (article.contentPath) {
    const fullMdPath = path.resolve(__dirname, article.contentPath);
    if (fullMdPath.startsWith(ARTICLES_DIR + path.sep) && fs.existsSync(fullMdPath)) {
      content = fs.readFileSync(fullMdPath, 'utf-8');
    }
  }

  res.json({ ...article, content });
});

// Dynamic XML Sitemap
app.get('/sitemap.xml', (_req: Request, res: Response) => {
  const articles = readJsonFile<any[]>(ARTICLES_JSON, []).filter(a => a.isPublished);
  const categories = readJsonFile<any[]>(CATEGORIES_JSON, []);
  const settings = readJsonFile<any>(SETTINGS_JSON, { productionUrl: 'https://ai-novex.netlify.app' });
  const baseUrl = settings.productionUrl || 'https://ai-novex.netlify.app';

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // Static routes
  const staticRoutes = [
    { loc: `${baseUrl}/`, priority: '1.0', changefreq: 'daily' },
    { loc: `${baseUrl}/tools`, priority: '0.9', changefreq: 'daily' },
    { loc: `${baseUrl}/blog`, priority: '0.9', changefreq: 'daily' },
    { loc: `${baseUrl}/categories`, priority: '0.8', changefreq: 'weekly' },
    { loc: `${baseUrl}/about`, priority: '0.5', changefreq: 'monthly' },
    { loc: `${baseUrl}/contact`, priority: '0.5', changefreq: 'monthly' },
    { loc: `${baseUrl}/privacy`, priority: '0.3', changefreq: 'monthly' },
    { loc: `${baseUrl}/terms`, priority: '0.3', changefreq: 'monthly' },
    { loc: `${baseUrl}/editorial-policy`, priority: '0.4', changefreq: 'monthly' },
    { loc: `${baseUrl}/affiliate-disclosure`, priority: '0.3', changefreq: 'monthly' },
  ];

  staticRoutes.forEach(r => {
    xml += `  <url>\n    <loc>${r.loc}</loc>\n    <changefreq>${r.changefreq}</changefreq>\n    <priority>${r.priority}</priority>\n  </url>\n`;
  });

  // Articles
  articles.forEach(a => {
    xml += `  <url>\n    <loc>${escapeXml(`${baseUrl}/blog/${a.slug}`)}</loc>\n    <lastmod>${a.updatedAt || a.publishedAt || '2026-10-10'}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
  });

  // Categories
  categories.forEach(c => {
    xml += `  <url>\n    <loc>${escapeXml(`${baseUrl}/category/${c.slug}`)}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
  });

  xml += `</urlset>`;

  res.header('Content-Type', 'application/xml');
  res.send(xml);
});

// Dynamic robots.txt
app.get('/robots.txt', (_req: Request, res: Response) => {
  const settings = readJsonFile<any>(SETTINGS_JSON, {});
  const baseUrl = settings.productionUrl || 'https://ai-novex.netlify.app';
  const content = `User-agent: *\nAllow: /\n\nSitemap: ${baseUrl}/sitemap.xml\n`;
  res.header('Content-Type', 'text/plain');
  res.send(content);
});

// RSS feed (the footer links to /rss.xml)
app.get('/rss.xml', (_req: Request, res: Response) => {
  const settings = readJsonFile<any>(SETTINGS_JSON, {});
  const baseUrl = settings.productionUrl || 'https://ai-novex.netlify.app';
  const articles = readJsonFile<any[]>(ARTICLES_JSON, [])
    .filter(a => a.isPublished)
    .sort((a, b) => String(b.publishedAt).localeCompare(String(a.publishedAt)));

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0">\n<channel>\n`;
  xml += `  <title>${escapeXml(settings.siteTitle || 'AINOVEX')}</title>\n  <link>${escapeXml(baseUrl)}</link>\n`;
  xml += `  <description>${escapeXml(settings.siteDescription || '')}</description>\n`;
  articles.forEach(a => {
    xml += `  <item>\n    <title>${escapeXml(a.title)}</title>\n    <link>${escapeXml(`${baseUrl}/blog/${a.slug}`)}</link>\n`;
    xml += `    <guid>${escapeXml(`${baseUrl}/blog/${a.slug}`)}</guid>\n    <description>${escapeXml(a.excerpt || '')}</description>\n`;
    xml += `    <pubDate>${new Date(a.publishedAt).toUTCString()}</pubDate>\n  </item>\n`;
  });
  xml += `</channel>\n</rss>`;
  res.header('Content-Type', 'application/rss+xml');
  res.send(xml);
});

// ads.txt (required by AdSense) — served only once a real publisher id is configured
app.get('/ads.txt', (_req: Request, res: Response) => {
  const ads = readJsonFile<any>(ADS_JSON, {});
  const content: string = ads.adsTxtContent || '';
  if (!ads.enabled || !content || /pub-X+/i.test(content)) {
    res.status(404).type('text/plain').send('Not found');
    return;
  }
  res.type('text/plain').send(content);
});

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    app: 'AINOVEX',
    timestamp: new Date().toISOString(),
    nodeEnv: process.env.NODE_ENV || 'development'
  });
});

// ----------------------------------------------------
// VITE DEV MIDDLEWARE OR PRODUCTION STATIC SERVER
// ----------------------------------------------------
// Central error handler (must come after all routes, before listen)
function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  console.error('Unhandled error:', err);
  if (res.headersSent) return;
  res.status(err?.status || 500).json({ error: isProduction ? 'Internal server error' : String(err?.message || err) });
}

async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.use(errorHandler);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AINOVEX server running on http://0.0.0.0:${PORT} [${isProduction ? 'PROD' : 'DEV'}]`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
