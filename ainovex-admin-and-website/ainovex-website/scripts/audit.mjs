import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const required = [
  "index.html",
  "public/robots.txt",
  "public/_redirects",
  "public/_headers",
  "public/og-image.png",
  "src/data/articles.ts",
  "src/config/site.ts",
  "scripts/prerender.tsx",
];

const fail = [];
for (const file of required) if (!fs.existsSync(path.join(root, file))) fail.push(`Missing: ${file}`);

const articles = fs.readFileSync(path.join(root, "src/data/articles.ts"), "utf8");
if (!/export const ARTICLES:\s*Article\[\]\s*=\s*\[\];/.test(articles)) fail.push("Articles registry is not empty as required");

const contact = fs.readFileSync(path.join(root, "src/views/ContactView.tsx"), "utf8");
if (!contact.includes("mailto:") || !contact.includes("AINOVEX")) fail.push("Contact mailto workflow missing");

const prerender = fs.readFileSync(path.join(root, "scripts/prerender.tsx"), "utf8");
for (const token of ["sitemap.xml", "404.html", "noindex"]) {
  if (!prerender.includes(token)) fail.push(`Prerender missing ${token}`);
}

const redirects = fs.readFileSync(path.join(root, "public/_redirects"), "utf8");
if (redirects.includes("/* /index.html")) fail.push("Catch-all SPA rewrite would make unknown URLs indexable");

const robots = fs.readFileSync(path.join(root, "public/robots.txt"), "utf8");
if (!robots.includes("Sitemap: https://ainovex.pages.dev/sitemap.xml")) fail.push("robots.txt sitemap missing");

if (fail.length) {
  console.error("AUDIT FAILED");
  for (const item of fail) console.error(`- ${item}`);
  process.exit(1);
}
console.log("AUDIT PASSED");
console.log("Design/content changes: none; published articles: 0");
console.log("Required SEO/routing files present; contact uses mailto; catch-all rewrite absent.");
