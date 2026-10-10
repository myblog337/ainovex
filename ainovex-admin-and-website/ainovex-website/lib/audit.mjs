// Build-time audit of the generated site in dist/. Returns {errors, warnings, report}.
import fs from 'node:fs';import path from 'node:path';import zlib from 'node:zlib';
const PH=/\[\[(?:TODO|CONTACT EMAIL NOT SET)/,VOID=new Set('area base br col embed hr img input link meta source track wbr'.split(' '));
// Returns a description of the first tag-nesting error, or ''.
function balance(h){const s=[],re=/<(\/?)([a-z][a-z0-9]*)\b[^>]*?(\/?)>/gi,b=h.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<!--[\s\S]*?-->/gi,'');let m;
 while(m=re.exec(b)){const c=m[1],t=m[2].toLowerCase();if(VOID.has(t)||m[3])continue;if(!c)s.push(t);else{const top=s.pop();if(top!==t)return`</${t}> closes <${top||'nothing'}>`}}
 return s.length?`unclosed <${s.at(-1)}>`:''}
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);
const kb=n=>(n/1024).toFixed(1)+' KB';
export function audit({cfg,out,arts,cats,count,dist='dist'}){
 const A=p=>cfg.siteUrl.replace(/\/+$/,'')+p,errors=[],warnings=[],E=m=>errors.push(m),W=m=>warnings.push(m);
 const byUrl=new Map(out.map(p=>[p.url,p])),files=walk(dist),rel=f=>'/'+path.relative(dist,f).split(path.sep).join('/'),fileSet=new Set(files.map(rel));
 const exists=h=>byUrl.has(h)||fileSet.has(h);
 // ---- redirects ----
 const rules=(fs.existsSync(`${dist}/_redirects`)?fs.readFileSync(`${dist}/_redirects`,'utf8'):'').split('\n').map(l=>l.trim()).filter(l=>l&&!l.startsWith('#')).map(l=>{const[from,to,st]=l.split(/\s+/);return{from,to,st,l}});
 const rmap=new Map(rules.map(r=>[r.from,r.to]));
 for(const r of rules){
  if(!r.from?.startsWith('/')||!r.to||!/^(\/|https?:\/\/)/.test(r.to)){E(`_redirects: malformed rule "${r.l}"`);continue}
  if(r.from.includes('*')&&/^\/\*$/.test(r.from))E(`_redirects: catch-all "${r.l}" would hide real 404s`);
  if(!r.st)W(`_redirects: "${r.l}" has no status (Cloudflare defaults to 302); use 301 for permanent moves`);
  if(byUrl.has(r.from))E(`_redirects: source ${r.from} is a live page (the redirect would hide it)`);
  if(r.to===r.from)E(`_redirects: ${r.from} redirects to itself`);
  let cur=r.to,hops=1;while(rmap.has(cur)){cur=rmap.get(cur);hops++;if(cur===r.from||hops>10){E(`_redirects: loop starting at ${r.from}`);break}}
  if(hops>1&&cur!==r.from)E(`_redirects: chain ${r.from} -> ${r.to} -> ... -> ${cur}; point ${r.from} directly at ${cur}`);
  if(r.to.startsWith('/')&&!rmap.has(r.to)&&!exists(r.to.split(/[?#]/)[0]))E(`_redirects: target ${r.to} does not exist`);
 }
 // ---- per-page checks ----
 const titles=new Map(),descs=new Map(),inAll={},inMain={},inArt={};const link=(m,target,source)=>(m[target]??=new Set()).add(source);
 for(const p of out){const h=p.html,ni=p.noindex,where=p.url;
  (titles.get(p.title)??titles.set(p.title,[]).get(p.title)).push(p.url);(descs.get(p.desc)??descs.set(p.desc,[]).get(p.desc)).push(p.url);
  if(!h.startsWith('<!doctype html>'))E(`${where}: missing doctype`);
  {const b=balance(h);if(b)E(`${where}: invalid HTML nesting (${b})`)}
  if(/http-equiv="refresh"/i.test(h))E(`${where}: meta refresh redirect`);
  {const og=h.match(/property="og:image" content="([^"]+)"/)?.[1];if(og&&!exists(og.replace(cfg.siteUrl,'')))E(`${where}: og:image file missing ${og}`);
   for(const m of h.matchAll(/(\/(?:img|assets)\/[A-Za-z0-9._-]+)/g))if(!fileSet.has(m[1]))E(`${where}: referenced file missing ${m[1]}`)}
  if(!/<html lang="en">/.test(h))E(`${where}: missing lang="en"`);
  if(!/<meta name="viewport" content="width=device-width,initial-scale=1">/.test(h))E(`${where}: missing viewport meta`);
  if(!/<title>[^<]+<\/title>/.test(h))E(`${where}: missing title`);
  if(p.title.length>70)W(`${where}: title ${p.title.length} chars`);
  if(!ni&&(p.desc.length<50||p.desc.length>170))W(`${where}: description ${p.desc.length} chars`);
  // robots + canonical
  const rb=h.match(/<meta name="robots" content="([^"]*)"/)?.[1]||'';const cn=[...h.matchAll(/<link rel="canonical" href="([^"]*)"/g)].map(x=>x[1]);
  if(ni){if(!/noindex/.test(rb))E(`${where}: should be noindex`);if(cn.length)W(`${where}: noindex page has canonical`)}
  else{if(/noindex|nofollow|none/.test(rb))E(`${where}: indexable page has restrictive robots "${rb}"`);
   if(cn.length!==1)E(`${where}: needs exactly one canonical (found ${cn.length})`);else if(cn[0]!==A(p.url))E(`${where}: canonical ${cn[0]} != ${A(p.url)}`)}
  const ogu=h.match(/property="og:url" content="([^"]*)"/)?.[1];if(ogu!==A(p.url))E(`${where}: og:url ${ogu} != ${A(p.url)}`);
  for(const k of['og:title','og:description','twitter:card'])if(!h.includes(`"${k}"`))E(`${where}: missing ${k}`);
  // headings
  const hs=[...h.matchAll(/<h([1-6])[ >]/g)].map(x=>+x[1]);if(hs.filter(x=>x===1).length!==1)E(`${where}: needs exactly one h1 (found ${hs.filter(x=>x===1).length})`);
  hs.forEach((x,i)=>{if(i&&x>hs[i-1]+1){E(`${where}: heading level skips from h${hs[i-1]} to h${x}`)}});
  const ids=[...h.matchAll(/\sid="([^"]+)"/g)].map(x=>x[1]);const d=ids.filter((x,i)=>ids.indexOf(x)!==i);if(d.length)E(`${where}: duplicate ids ${[...new Set(d)].join(', ')}`);
  for(const t of['header','nav','main','footer'])if(!new RegExp(`<${t}[ >]`).test(h))E(`${where}: missing <${t}>`);
  if(p.kind==='article'&&!/<article[ >]/.test(h))E(`${where}: article page without <article>`);
  // json-ld
  const lds=[...h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(x=>x[1]);const types=new Set();
  for(const s of lds){let j;try{j=JSON.parse(s)}catch(e){E(`${where}: invalid JSON-LD (${e.message})`);continue}
   const walkJ=(o,k)=>{if(Array.isArray(o))return o.forEach(x=>walkJ(x,k));if(o&&typeof o==='object'){if(o['@type'])types.add(o['@type']);if(o['@type']==='ListItem'&&o.item&&!exists(o.item.replace(cfg.siteUrl,'')))E(`${where}: breadcrumb item ${o.item} does not exist`);
     if(o['@type']==='Article'){for(const f of['headline','datePublished','dateModified','author','publisher'])if(!o[f])E(`${where}: Article missing ${f}`);if(!h.includes(`datetime="${o.datePublished}"`)||!h.includes(`datetime="${o.dateModified}"`))E(`${where}: Article dates not visible on page`)}
     if(o['@type']==='FAQPage')for(const q of o.mainEntity)if(!h.includes(esc(q.name)))E(`${where}: FAQ question not visible on page: ${q.name}`);
     Object.entries(o).forEach(([kk,v])=>walkJ(v,kk));return}
    if(typeof o==='string'&&/^https?:\/\//.test(o)&&k!=='@context'&&!o.startsWith(cfg.siteUrl))E(`${where}: JSON-LD URL outside configured domain: ${o}`)};
   walkJ(j)}
  if(['article','category','page'].includes(p.kind)&&!types.has('BreadcrumbList'))E(`${where}: missing BreadcrumbList`);
  if(p.kind==='article'&&!types.has('Article'))E(`${where}: missing Article JSON-LD`);
  if(p.kind==='home'&&!(types.has('Organization')&&types.has('WebSite')))E(`${where}: home needs Organization + WebSite`);
  if(types.has('FAQPage')&&!/<h2[^>]*>(FAQs?|Frequently asked questions)<\/h2>/i.test(h))E(`${where}: FAQPage without visible FAQ section`);
  // images
  const imgs=[...h.matchAll(/<img\b[^>]*>/g)].map(x=>x[0]);let eager=0;
  for(const t of imgs){const at=n=>t.match(new RegExp(`\\s${n}="([^"]*)"`))?.[1];
   if(at('alt')===undefined)E(`${where}: <img> missing alt`);if(!at('width')||!at('height'))E(`${where}: <img> missing width/height`);
   if(/srcset=/.test(t)&&!/sizes=/.test(t))E(`${where}: srcset without sizes`);
   if(/fetchpriority="high"/.test(t)){eager++;if(/loading="lazy"/.test(t))E(`${where}: LCP image is lazy-loaded`)}else if(!/loading="lazy"/.test(t))W(`${where}: image without loading="lazy" that is not the LCP image`)}
  if(eager>1)E(`${where}: more than one fetchpriority=high image`);
  // links
  const mainH=h.match(/<main[\s\S]*?<\/main>/)?.[0]||'';
  const links=s=>[...s.matchAll(/<a\b([^>]*?)\shref="([^"]*)"([^>]*)>([\s\S]*?)<\/a>/g)];
  for(const m of links(h)){const href=m[2],text=m[4].replace(/<[^>]*>/g,'').trim();
   if(/^(click here|here|read more|more|link)$/i.test(text))W(`${where}: non-descriptive link text "${text}"`);
   if(href.startsWith('#')){if(href.length>1&&!ids.includes(href.slice(1)))E(`${where}: broken anchor ${href}`);continue}
   if(/^mailto:/.test(href))continue;
   if(/^https?:\/\//.test(href)){if(href.startsWith(cfg.siteUrl))W(`${where}: internal link written as absolute URL ${href}`);else if(!/rel="[^"]*noopener/.test(m[1]+m[3]))W(`${where}: external link without rel=noopener ${href}`);continue}
   if(!href.startsWith('/')){E(`${where}: unsupported/relative link "${href}"`);continue}
   const [pth,q]=href.split('#')[0].split('?');
   if(q!==undefined&&pth!=='/search/')E(`${where}: internal link with query string ${href}`);
   if(rmap.has(pth)){E(`${where}: links to redirected URL ${pth}; link to ${rmap.get(pth)} instead`);continue}
   if(!exists(pth)){E(!/\.[a-z0-9]+$/i.test(pth)&&!pth.endsWith('/')&&exists(pth+'/')?`${where}: internal link missing trailing slash ${href}`:`${where}: broken internal link ${href}`);continue}
   if(!/\.[a-z0-9]+$/i.test(pth)&&!pth.endsWith('/'))E(`${where}: internal link missing trailing slash ${href}`);
   if(pth!==p.url){link(inAll,pth,p.url);if(p.kind==='article')link(inArt,pth,p.url)}}
  for(const m of links(mainH)){const pth=m[2].split('#')[0].split('?')[0];if(pth!==p.url&&byUrl.has(pth))link(inMain,pth,p.url)}
  if(PH.test(h)){if(!ni)E(`${where}: contains [[placeholder]] text but is indexable`);(cfg.launched?E:W)(`${where}: unresolved [[placeholder]] text (page stays noindex until resolved)`)}
 }
 for(const[t,u]of titles)if(u.length>1)E(`duplicate title "${t}": ${u.join(', ')}`);
 for(const[t,u]of descs){const idx=u.filter(x=>!byUrl.get(x).noindex);if(idx.length>1)E(`duplicate meta description on indexable pages: ${idx.join(', ')}`)}
 // ---- orphans ----
 for(const p of out){if(p.noindex||p.kind==='home')continue;
  if(!inAll[p.url]?.size)E(`orphan page ${p.url}: no internal links point to it`);
  if(p.kind==='article'){const n=inMain[p.url]?.size||0;if(!n)E(`orphan article ${p.url}: not linked from any page's main content`);else if(n<2)W(`${p.url}: only one page links to this article in main content; add related/contextual links`);
   if(arts.length>1&&!inArt[p.url]?.size)W(`${p.url}: no other article links to this guide; add it to a related list or link it from a relevant article`)}}
 // ---- categories ----
 for(const c of cats){const p=byUrl.get(`/${c.slug}/`),list=arts.filter(a=>a.category===c.slug);if(!p){E(`category ${c.slug} not generated`);continue}
  const idx=list.filter(a=>!byUrl.get(`/${a.slug}/`)?.noindex);if(!idx.length&&!p.noindex)E(`${p.url}: category with no indexable articles must be noindex`);if(idx.length&&p.noindex)E(`${p.url}: category has indexable articles but is noindex`);
  for(const a of list){if(!p.html.includes(`href="/${a.slug}/"`))E(`${p.url}: does not link to its article ${a.slug}`);if(!byUrl.get(`/${a.slug}/`).html.includes(`href="/${c.slug}/"`))E(`/${a.slug}/: does not link back to category`)}}
 // ---- sitemap / robots / 404 ----
 const sm=fs.readFileSync(`${dist}/sitemap.xml`,'utf8'),locs=[...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map(x=>x[1]);
 if(!sm.includes('<sitemapindex')){const seen=new Set();for(const l of locs){if(!l.startsWith(cfg.siteUrl))E(`sitemap: URL outside domain ${l}`);if(/[?#]/.test(l))E(`sitemap: parameter/fragment URL ${l}`);if(seen.has(l))E(`sitemap: duplicate ${l}`);seen.add(l);
  const u=l.replace(cfg.siteUrl,'')||'/',p=byUrl.get(u);if(!p)E(`sitemap: ${l} is not a generated page`);else if(p.noindex||['search','404'].includes(p.kind))E(`sitemap: ${l} is noindex/utility`);else if(rmap.has(u))E(`sitemap: ${l} is redirected`)}
  for(const p of out)if(!p.noindex&&!seen.has(A(p.url)))E(`sitemap: missing indexable page ${p.url}`)}
 const rb=fs.readFileSync(`${dist}/robots.txt`,'utf8');if(!rb.includes(`Sitemap: ${A('/sitemap.xml')}`))E('robots.txt: missing/incorrect Sitemap line');if(!/User-agent: \*/.test(rb))E('robots.txt: missing User-agent: *');
 for(const m of rb.matchAll(/^Disallow:\s*(\S+)/gim)){const d=m[1];if(files.map(rel).concat(out.map(p=>p.url)).some(u=>u.startsWith(d)&&(!byUrl.get(u)||!byUrl.get(u).noindex)))E(`robots.txt: Disallow ${d} blocks crawlable content/assets`)}
 const nf=byUrl.get('/404.html');if(!nf||!fileSet.has('/404.html'))E('404.html missing');
 // ---- domain + placeholder scan over all text output ----
 let stale=0;for(const f of files.filter(f=>/\.(html|xml|txt|json|js|css|svg)$/.test(f)||/_(headers|redirects)$/.test(f))){const t=fs.readFileSync(f,'utf8');
  if(/ainovex\.com/i.test(t))E(`${rel(f)}: contains ainovex.com`);
  if(/\.(js|html)$/.test(f)&&/location\s*(\.(href|replace|assign)\s*(=[^=]|\()|=[^=])/.test(t.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g,'')))E(`${rel(f)}: JavaScript redirect (location assignment) found`);
  for(const m of t.matchAll(/https?:\/\/[a-z0-9.-]*ainovex[a-z0-9.-]*/gi))if(!m[0].startsWith(cfg.siteUrl)&&!stale++)E(`${rel(f)}: stale/foreign domain ${m[0]} (configured: ${cfg.siteUrl})`)}
 if(cfg.adsense.client&&!/^ca-pub-\d{10,}$/.test(cfg.adsense.client))E('site.config.mjs: adsense.client must look like ca-pub-0000000000000000');
 if(cfg.adsense.client&&!/^\d+$/.test(cfg.adsense.slot||''))E('site.config.mjs: adsense.slot must be a numeric ad-unit id');
 { // _headers safety: never noindex the production host or all paths
  const hd=fs.existsSync(`${dist}/_headers`)?fs.readFileSync(`${dist}/_headers`,'utf8'):'',host=new URL(cfg.siteUrl).hostname;
  for(const blk of hd.split(/\n(?=\S)/)){const[pat,...rest]=blk.trim().split('\n');if(!pat||pat.startsWith('#'))continue;
   if(/x-robots-tag:\s*[^\n]*noindex/i.test(rest.join('\n'))&&(['/*','/','/index.html'].includes(pat.trim())||(pat.includes(host)&&!pat.includes(':'))))E(`_headers: "${pat.trim()}" sends noindex for production content`)}}
 if(!cfg.email)(cfg.launched?E:W)('site.config.mjs: email is empty (Contact page shows a placeholder)');
 if(!fileSet.has(cfg.ogImage)&&!arts.some(a=>a.image))W(`no social image: add public${cfg.ogImage} (1200x630) or give articles an image`);
 // ---- report ----
 const sz=f=>fs.statSync(f).size,ext=e=>files.filter(f=>f.endsWith(e)),sum=a=>a.reduce((n,f)=>n+sz(f),0);
 const htmlB=out.map(p=>Buffer.byteLength(p.html)),inl=(out[0].html.match(/<style>([\s\S]*?)<\/style>/)||['',''])[1].length;
 const im=files.filter(f=>/\.(avif|webp|jpe?g|png|gif)$/i.test(f)),fmts={};im.forEach(f=>{const e=path.extname(f).slice(1).toLowerCase();fmts[e]=(fmts[e]||0)+1});
 const js=ext('.js'),top=[...files].sort((a,b)=>sz(b)-sz(a)).slice(0,5).map(f=>`${rel(f)} ${kb(sz(f))}`);
 const pj=JSON.parse(fs.readFileSync('package.json','utf8'));
 const report=['PERFORMANCE / OUTPUT REPORT',
  `  HTML: ${out.length} pages · total ${kb(htmlB.reduce((a,b)=>a+b,0))} · largest ${kb(Math.max(...htmlB))} · home ${kb(htmlB[0])} (${kb(zlib.gzipSync(out[0].html).length)} gzip)`,
  `  CSS: ${ext('.css').length} external files · inline critical CSS ${kb(inl)} (raw) per page`,
  `  JS: ${js.length} file(s) ${js.map(f=>`${rel(f)} ${kb(sz(f))}`).join(', ')||'-'} · loaded only on /search/ (defer)`,
  `  Images: ${im.length} files ${JSON.stringify(fmts)} · ${kb(sum(im))}`,
  `  Largest assets: ${top.join(' | ')}`,
  `  Runtime dependencies shipped to browser: 0 · build deps: ${Object.keys({...pj.dependencies,...pj.optionalDependencies}).join(', ')||'none'}`,
  `  Audit checks: ${out.length} pages, ${rules.length} redirect rule(s), ${locs.length} sitemap URL(s)`,''];
 return{errors,warnings,report};
}
