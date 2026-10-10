import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import { renderToString } from 'react-dom/server';
import App from '../src/App';
import categoriesData from '../src/data/categories.json';
import { ARTICLES } from '../src/data/articles';
import { SITE_CONFIG, getCanonicalUrl } from '../src/config/site';

const distDir = path.join(process.cwd(), 'dist');
const shell = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8');
const routes = [...new Set([
  '/', '/ai-tools/', '/categories/', '/articles/', '/about/', '/contact/', '/privacy-policy/', '/terms/', '/editorial-policy/',
  ...categoriesData.map(c => `/${c.slug}/`),
  ...ARTICLES.map(a => `/articles/${a.slug}/`),
])];

const meta: Record<string, {title:string; description:string; noindex?:boolean}> = {
  '/': {title:'AINOVEX - Best AI Tools, Guides & Comparisons', description:SITE_CONFIG.description},
  '/ai-tools/': {title:'AI Tools Directory - Verified Artificial Intelligence Software | AINOVEX', description:'Explore AI tools by category, use case, pricing, and capabilities with AINOVEX.'},
  '/categories/': {title:'Browse AI Categories & Taxonomy | AINOVEX', description:'Browse AINOVEX AI tool categories, including writing, image generation, productivity, coding, education, and more.'},
  '/articles/': {title:'AI Guides, Articles & Comparisons | AINOVEX', description:ARTICLES.length ? 'Explore practical AI guides, comparisons, tutorials, and research-backed workflows from AINOVEX.' : 'AINOVEX articles and guides will be published here as they are researched, reviewed, and published.', noindex:ARTICLES.length===0},
  '/about/': {title:'About AINOVEX - Mission, Standards & Research | AINOVEX', description:'Learn about AINOVEX, its editorial standards, AI tool research approach, and publishing mission.'},
  '/contact/': {title:'Contact AINOVEX Editorial Desk', description:'Contact the AINOVEX editorial desk for corrections, feedback, partnerships, and general inquiries.'},
  '/privacy-policy/': {title:'Privacy Policy | AINOVEX', description:'Read the AINOVEX privacy policy and learn how site data and analytics information are handled.'},
  '/terms/': {title:'Terms of Service | AINOVEX', description:'Read the terms governing use of the AINOVEX website and its content.'},
  '/editorial-policy/': {title:'Editorial Policy & Review Methodology | AINOVEX', description:'Learn how AINOVEX researches, reviews, updates, and publishes AI tools and editorial content.'},
};
for (const c of categoriesData) meta[`/${c.slug}/`] = {title:`${c.name} AI Tools & Software | AINOVEX`, description:c.description};
for (const a of ARTICLES) meta[`/articles/${a.slug}/`] = {title:`${a.title} | AINOVEX`, description:a.description};

const esc = (v:string) => v.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
function page(route:string, markup:string) {
  const m = meta[route] ?? {title:'Page Not Found | AINOVEX',description:'The requested AINOVEX page could not be found.',noindex:true};
  const canonical = getCanonicalUrl(route);
  const image = `${SITE_CONFIG.url}/og-image.png`;
  const head = `<title>${esc(m.title)}</title><meta name="description" content="${esc(m.description)}" /><meta name="robots" content="${m.noindex?'noindex,follow':'index,follow'}" /><link rel="canonical" href="${canonical}" /><meta property="og:title" content="${esc(m.title)}" /><meta property="og:description" content="${esc(m.description)}" /><meta property="og:url" content="${canonical}" /><meta property="og:site_name" content="AINOVEX" /><meta property="og:type" content="${route.startsWith('/articles/')?'article':'website'}" /><meta property="og:image" content="${image}" /><meta name="twitter:card" content="summary_large_image" /><meta name="twitter:title" content="${esc(m.title)}" /><meta name="twitter:description" content="${esc(m.description)}" /><meta name="twitter:image" content="${image}" />`;
  return shell.replace(/<title>[\s\S]*?<\/title>/i,'').replace(/\s*<meta name="description"[^>]*>/i,'').replace(/\s*<link rel="canonical"[^>]*>/i,'').replace(/\s*<meta property="og:[^"]+"[^>]*>/gi,'').replace(/\s*<meta name="twitter:[^"]+"[^>]*>/gi,'').replace('</head>',`${head}</head>`).replace('<div id="root"></div>',`<div id="root">${markup}</div>`);
}
for (const route of routes) {
  const out = route==='/' ? path.join(distDir,'index.html') : path.join(distDir,route.slice(1),'index.html');
  fs.mkdirSync(path.dirname(out),{recursive:true});
  fs.writeFileSync(out,page(route,renderToString(<App serverRoute={route}/>)));
}
fs.writeFileSync(path.join(distDir,'404.html'),page('/404/',renderToString(<App serverRoute="/404/"/>)));
const sitemapRoutes = routes.filter(r => r!=='/articles/' || ARTICLES.length>0);
fs.writeFileSync(path.join(distDir,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapRoutes.map(r=>`  <url><loc>${getCanonicalUrl(r)}</loc></url>`).join('\n')}\n</urlset>\n`);
console.log(`Prerendered ${routes.length} routes · ${sitemapRoutes.length} sitemap URLs · ${ARTICLES.length} published articles`);
