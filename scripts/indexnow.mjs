// Submit every URL in public/sitemap.xml to IndexNow (Bing, Yandex, etc.).
// Run AFTER the Netlify deploy has finished:  npm run indexnow
import fs from 'node:fs';

const KEY = 'c49a629b37c0411eb31a896d8e20791d';
const HOST = 'ai-novex.netlify.app';

const sitemap = fs.readFileSync('public/sitemap.xml', 'utf-8');
const urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

if (!urlList.length) {
  console.error('No URLs found in public/sitemap.xml');
  process.exit(1);
}

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({
    host: HOST,
    key: KEY,
    keyLocation: `https://${HOST}/${KEY}.txt`,
    urlList,
  }),
});

console.log(`IndexNow responded ${res.status} for ${urlList.length} URLs`);
if (res.status !== 200 && res.status !== 202) {
  console.log(await res.text());
  process.exit(1);
}
