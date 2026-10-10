// AINOVEX static site generator. Usage: npm run build  ->  dist/
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
import cfg from './site.config.mjs';
import {loadImage,pic,ogOf} from './lib/images.mjs';
import {audit} from './lib/audit.mjs';

const OUT='dist',rd=f=>fs.readFileSync(f,'utf8');
const E=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const A=p=>cfg.siteUrl.replace(/\/+$/,'')+p;                        // every absolute URL goes through here
const slug=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const tok=s=>s.replaceAll('{{name}}',cfg.name).replaceAll('{{email}}',cfg.email||'[[CONTACT EMAIL NOT SET]]').replaceAll('{{siteUrl}}',cfg.siteUrl);
const D=d=>new Date(d+'T00:00:00Z').toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric',timeZone:'UTC'});
const SLUG=/^[a-z0-9]+(?:-[a-z0-9]+)*$/,DATE=/^\d{4}-\d{2}-\d{2}$/,RESERVED=new Set(['search','404','assets','img','sitemap','robots','favicon','admin','api']);
const okDate=s=>{try{return DATE.test(s)&&new Date(s+'T00:00:00Z').toISOString().startsWith(s)}catch{return false}};
const today=new Date().toISOString().slice(0,10),errs=[],warns=[];
const PH=/\[\[(?:TODO|CONTACT EMAIL NOT SET)/; // unresolved placeholder markers: such pages are forced to noindex
const BODY_SIZES='(min-width:48rem) 736px, calc(100vw - 2rem)';
const IMG=/^!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)\s*$/;

// ---------- front matter + markdown ----------
function fm(raw){const m=raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);if(!m)throw Error('missing front matter');const d={};
for(const l of m[1].split(/\r?\n/)){const k=l.match(/^(\w+):\s*(.*)$/);if(!k)continue;let v=k[2].trim();
if(v.startsWith('['))v=v.slice(1,-1).split(',').map(x=>x.trim().replace(/^["']|["']$/g,'')).filter(Boolean);
else if(v==='true'||v==='false')v=v==='true';else v=v.replace(/^["']|["']$/g,'');d[k[1]]=v}return{d,body:tok(m[2])}}
const safe=u=>/^(https?:\/\/|\/|#|mailto:)/.test(u)?u:'#';
const inl=s=>E(s).replace(/`([^`]+)`/g,'<code>$1</code>').replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>').replace(/\*([^*]+)\*/g,'<em>$1</em>')
.replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+&quot;(sponsored)&quot;)?\)/g,(m,t,u,sp)=>`<a href="${safe(u)}"${sp?' rel="sponsored nofollow noopener"':/^https?:/.test(u)?' rel="noopener"':''}>${t}</a>`);
const plain=s=>s.replace(/!?\[([^\]]*)\]\([^)]*\)/g,'$1').replace(/[*`_>]/g,'').replace(/\s+/g,' ').trim();
function md(src,where){const L=src.split(/\r?\n/),toc=[],ids=new Set();let h='',i=0,m;
const block=l=>/^(#{2,3} |\||([-*]|\d+\.) |> |```|!\[)/.test(l);
const uid=t=>{let b=slug(t)||'section',n=b,k=2;while(ids.has(n))n=b+'-'+k++;ids.add(n);return n};
while(i<L.length){const l=L[i];if(!l.trim()){i++;continue}
if(m=l.match(/^(#{2,3}) (.+)/)){const id=uid(m[2]),n=m[1].length;if(n==2)toc.push({id,t:m[2]});h+=`<h${n} id="${id}">${inl(m[2])}</h${n}>`;i++}
else if(l.startsWith('```')){const c=[];i++;while(i<L.length&&!L[i].startsWith('```'))c.push(L[i++]);i++;h+=`<pre tabindex="0"><code>${E(c.join('\n'))}</code></pre>`}
else if(m=l.match(IMG)){if(!m[1].trim())errs.push(`${where}: image "${m[2]}" needs alt text`);h+=`<figure>${pic(m[2],m[1],{sizes:BODY_SIZES})}${m[3]?`<figcaption>${inl(m[3])}</figcaption>`:''}</figure>`;i++}
else if(l.startsWith('|')){const r=[];while(i<L.length&&L[i].startsWith('|'))r.push(L[i++]);const c=x=>x.replace(/^\||\|\s*$/g,'').split('|').map(y=>y.trim());
h+=`<div class="tw" role="region" aria-label="Scrollable table" tabindex="0"><table><thead><tr>${c(r[0]).map(x=>`<th scope="col">${inl(x)}</th>`).join('')}</tr></thead><tbody>${r.slice(2).map(x=>`<tr>${c(x).map(y=>`<td>${inl(y)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`}
else if(/^([-*]|\d+\.) /.test(l)){const t=/^\d/.test(l)?'ol':'ul',it=[];while(i<L.length&&/^([-*]|\d+\.) /.test(L[i]))it.push(L[i++].replace(/^([-*]|\d+\.) /,''));h+=`<${t}>${it.map(x=>`<li>${inl(x)}</li>`).join('')}</${t}>`}
else if(l.startsWith('> ')){const q=[];while(i<L.length&&L[i].startsWith('> '))q.push(L[i++].slice(2));h+=`<blockquote><p>${inl(q.join(' '))}</p></blockquote>`}
else{const p=[];while(i<L.length&&L[i].trim()&&!block(L[i]))p.push(L[i++]);h+=`<p>${inl(p.join(' '))}</p>`}}
return{html:h,toc}}
function faqs(src){const s=src.split(/^## (?:FAQs?|Frequently asked questions)\s*$/mi)[1];if(!s)return[];
return s.split(/^## /m)[0].split(/^### /m).slice(1).map(b=>{const[q,...a]=b.split('\n');return{q:plain(q),a:plain(a.join(' '))}}).filter(x=>x.q&&x.a)}
const ld=o=>`<script type="application/ld+json">${JSON.stringify(o).replace(/</g,'\\u003c')}</script>`;

// ---------- load + validate content ----------
const cats=JSON.parse(rd('content/categories.json'));
const load=dir=>fs.existsSync(dir)?fs.readdirSync(dir).filter(f=>f.endsWith('.md')).map(f=>{const _f=`${dir}/${f}`;try{const{d,body}=fm(rd(_f));return{...d,body,_f}}catch(e){errs.push(`${_f}: ${e.message}`);return null}}).filter(Boolean):[];
const bad=(x,m)=>errs.push(`${x._f}: ${m}`);
function validate(x,art){
 for(const k of['title','slug','description'])if(!x[k]||typeof x[k]!=='string')bad(x,`missing "${k}"`);
 if(x.slug&&!SLUG.test(x.slug))bad(x,`slug "${x.slug}" must be lowercase letters, numbers and hyphens`);
 if(x.slug&&RESERVED.has(x.slug))bad(x,`slug "${x.slug}" is reserved`);
 if(x.title&&x.title.length>60)warns.push(`${x._f}: title is ${x.title.length} chars (may truncate in results)`);
 if(x.description&&(x.description.length<50||x.description.length>170))warns.push(`${x._f}: description is ${x.description.length} chars (aim 50-170)`);
 if(x.updated&&!okDate(x.updated))bad(x,`invalid updated date "${x.updated}" (use YYYY-MM-DD)`);
 if(!art)return;
 if(!cats.some(c=>c.slug===x.category))bad(x,`missing or unknown category "${x.category||''}"`);
 if(!okDate(x.date))bad(x,`missing or invalid date "${x.date||''}" (use YYYY-MM-DD)`);
 else{if(x.updated&&okDate(x.updated)&&x.updated<x.date)bad(x,'updated is earlier than date');if(x.date>today)warns.push(`${x._f}: date is in the future`)}
 if(x.author&&!cfg.authors[x.author])bad(x,`unknown author "${x.author}" (see site.config.mjs)`);
 if(x.image){if(!fs.existsSync(`content/images/${x.image}`))bad(x,`image "${x.image}" not found in content/images/`);if(!x.imageAlt)bad(x,'image requires imageAlt')}
 else if(x.imageAlt)warns.push(`${x._f}: imageAlt without image`);
 if(x.related&&!Array.isArray(x.related))bad(x,'related must be a list: [slug-a, slug-b]');
}
const all=load('content/articles'),pages=load('content/pages');
all.forEach(a=>validate(a,1));pages.forEach(p=>validate(p,0));
pages.forEach(p=>p.hold=PH.test(p.body+p.title+p.description));
const arts=all.filter(a=>!a.draft).map(a=>({...a,updated:a.updated||a.date,hold:PH.test(a.body+a.title+a.description+(a.answer||''))})).sort((a,b)=>b.updated.localeCompare(a.updated)||a.slug.localeCompare(b.slug));
const seenSlug=new Map();for(const x of[...cats.map(c=>({...c,_f:'categories.json'})),...arts,...pages]){if(x.slug&&seenSlug.has(x.slug))errs.push(`${x._f}: duplicate slug "${x.slug}" (also ${seenSlug.get(x.slug)})`);seenSlug.set(x.slug,x._f)}
const bySlug=Object.fromEntries(arts.map(a=>[a.slug,a]));
arts.forEach(a=>(a.related||[]).forEach(s=>{if(!bySlug[s])bad(a,`related slug "${s}" does not exist`)}));
for(const f of['about','contact','editorial-policy','affiliate-disclosure','privacy','terms'])if(!pages.some(p=>p.slug===f))errs.push(`content/pages: required page "${f}" is missing`);
if(errs.length){console.log('CONTENT ERRORS:');errs.forEach(e=>console.log('  ERROR',e));process.exit(1)}

// ---------- output dir, fingerprinted JS, CSS ----------
fs.rmSync(OUT,{recursive:true,force:true});fs.cpSync('public',OUT,{recursive:true});
const host=new URL(cfg.siteUrl).hostname;
if(host.endsWith('.pages.dev'))fs.appendFileSync(`${OUT}/_headers`,`\n# Keep preview deployments (branch/hash URLs) out of search results. The rule needs an extra\n# subdomain label, so it can never match the production host itself.\nhttps://:version.${host}/*\n  X-Robots-Tag: noindex\n`);
const js=rd('src/app.js'),jsFile=`app.${crypto.createHash('sha1').update(js).digest('hex').slice(0,8)}.js`;
fs.mkdirSync(`${OUT}/assets`,{recursive:true});fs.writeFileSync(`${OUT}/assets/${jsFile}`,js);
const css=rd('src/style.css').replace(/\/\*[\s\S]*?\*\//g,'').replace(/\s*([{};:,>])\s*/g,'$1').replace(/;}/g,'}').trim();
const hasOg=fs.existsSync('public'+cfg.ogImage),ads=!!cfg.adsense.client,ga=cfg.analytics?.measurementId||'';
const tryImg=async(x,name)=>{try{await loadImage(name)}catch(e){errs.push(`${x._f}: ${e.message}`)}};
for(const x of[...arts,...pages]){for(const l of x.body.split(/\r?\n/))if(l.startsWith('![')){const m=l.match(IMG);if(m)await tryImg(x,m[2]);else errs.push(`${x._f}: malformed image line "${l.slice(0,60)}" (use ![alt](file.jpg "optional caption"); file names cannot contain spaces)`)}
 if(x.image){if(/[^A-Za-z0-9._-]/.test(x.image))errs.push(`${x._f}: image file name "${x.image}" may only contain letters, numbers, dot, dash, underscore`);else await tryImg(x,x.image)}}
if(errs.length){console.log('CONTENT ERRORS:');errs.forEach(e=>console.log('  ERROR',e));process.exit(1)}

const count=c=>arts.filter(a=>a.category===c.slug).length,catOf=s=>cats.find(c=>c.slug===s);
const vis=cfg.hideEmptyCategories?cats.filter(c=>count(c)>0):cats;
const out=[];
const ad=()=>ads?`<aside class="ad" aria-label="Advertisement"><ins class="adsbygoogle" style="display:block" data-ad-client="${E(cfg.adsense.client)}" data-ad-slot="${E(cfg.adsense.slot)}" data-ad-format="auto" data-full-width-responsive="true"></ins></aside>`:'';
const adJs=ads?`<script>addEventListener('load',()=>setTimeout(()=>{const s=document.createElement('script');s.async=1;s.crossOrigin='anonymous';s.src='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${E(cfg.adsense.client)}';s.onload=()=>document.querySelectorAll('.adsbygoogle').forEach(()=>(window.adsbygoogle=window.adsbygoogle||[]).push({}));document.head.appendChild(s)},1500))</script>`:'';
const gaJs=ga?`<script async src="https://www.googletagmanager.com/gtag/js?id=${E(ga)}"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${E(ga)}')</script>`:'';
const crumbs=it=>`<nav class="crumbs" aria-label="Breadcrumb"><ol>${it.map((x,i)=>i<it.length-1?`<li><a href="${x[1]}">${E(x[0])}</a></li>`:`<li aria-current="page">${E(x[0])}</li>`).join('')}</ol></nav>`;
const crumbLd=it=>({'@type':'BreadcrumbList',itemListElement:it.map((x,i)=>({'@type':'ListItem',position:i+1,name:x[0],item:A(x[1])}))});
const sec=(id,t,inner)=>`<section aria-labelledby="${id}"><h2 id="${id}">${E(t)}</h2>${inner}</section>`;
const card=a=>`<li><article class="card"><h3><a href="/${a.slug}/">${E(a.title)}</a></h3><p>${E(a.description)}</p><p class="meta">${E(catOf(a.category).name)} · Updated <time datetime="${a.updated}">${D(a.updated)}</time></p></article></li>`;
const cCard=c=>`<li><div class="card"><h3><a href="/${c.slug}/">${E(c.name)}</a></h3><p>${E(c.intro)}</p></div></li>`;
const searchForm=(id)=>`<form class="sf" id="${id}" role="search" action="/search/" method="get"><label class="vh" for="${id}-q">Search guides</label><input id="${id}-q" name="q" type="search" placeholder="Search guides" autocomplete="off"><button type="submit">Search</button></form>`;
const TRUST=[['about','About'],['editorial-policy','Editorial policy'],['affiliate-disclosure','Affiliate disclosure'],['contact','Contact'],['privacy','Privacy policy'],['terms','Terms']];

function page(url,m,main){
 const file=url.endsWith('.html')?url:url+'index.html',u=A(url),full=m.home?m.title:`${m.title} | ${cfg.name}`,ni=!!m.noindex,img=m.og?A(m.og):hasOg?A(cfg.ogImage):'';
 const html=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${E(full)}</title><meta name="description" content="${E(m.desc)}">`
 +(ni?'<meta name="robots" content="noindex,follow">':`<meta name="robots" content="index,follow,max-image-preview:large"><link rel="canonical" href="${u}">`)
 +`<meta property="og:site_name" content="${E(cfg.name)}"><meta property="og:type" content="${m.article?'article':'website'}"><meta property="og:title" content="${E(full)}"><meta property="og:description" content="${E(m.desc)}"><meta property="og:url" content="${u}"><meta property="og:locale" content="en_US">`
 +(m.article?`<meta property="article:published_time" content="${m.date}"><meta property="article:modified_time" content="${m.lastmod}">`:'')
 +(img?`<meta property="og:image" content="${img}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">`:'')
 +`<meta name="twitter:card" content="${img?'summary_large_image':'summary'}"><meta name="twitter:title" content="${E(full)}"><meta name="twitter:description" content="${E(m.desc)}">${img?`<meta name="twitter:image" content="${img}">`:''}`
 +`<link rel="icon" href="/favicon.svg" type="image/svg+xml"><meta name="theme-color" content="#0f4c5c"><style>${css}</style>${(m.ld||[]).map(ld).join('')}</head><body><a class="skip" href="#main">Skip to content</a>`
 +`<header class="site-header"><div class="site-header-inner"><a class="site-logo" href="/" aria-label="AINOVEX home"><span><b>AI</b>NOVEX</span><small>AI Tools · News · Guides · More</small></a><nav class="desktop-nav" aria-label="Main navigation"><a href="/"${m.home?' aria-current="page"':''}>Home</a><a href="/ai-tools-by-use-case/">AI Tools⌄</a><a href="/#latest">Blog⌄</a><a href="/ai-tools-by-use-case/">Categories⌄</a><a href="/about/">About</a><a href="/contact/">Contact</a></nav><div class="header-actions"><a class="header-search" href="/search/" aria-label="Search">⌕</a><a class="theme-toggle" href="/" aria-label="Light mode">☼</a><a class="header-cta" href="/ai-tools-by-use-case/">Explore AI Tools <span aria-hidden="true">→</span></a><button class="mobile-menu" type="button" aria-label="Open menu" aria-controls="mobile-nav" aria-expanded="false">☰</button></div></div><div id="mobile-nav" class="mobile-nav"><a href="/">Home</a><a href="/ai-tools-by-use-case/">AI Tools</a><a href="/#latest">Blog</a><a href="/ai-tools-by-use-case/">Categories</a><a href="/about/">About</a><a href="/contact/">Contact</a></div></header>`
 +`<main id="main" tabindex="-1">${m.home?main:`<div class="wrap">${main}</div>`}</main>`
 +`<footer class="site-footer"><div class="footer-main"><div class="footer-brand"><a href="/" class="site-logo footer-logo"><span><b>AI</b>NOVEX</span><small>AI Tools | News | Guides | More</small></a><p>AINOVEX is your trusted source for the best AI tools, latest news, and helpful guides. Build a smarter future with AI — together.</p></div><div><h2>Quick Links</h2><a href="/">Home</a><a href="/ai-tools-by-use-case/">AI Tools</a><a href="/#latest">Blog</a><a href="/ai-tools-by-use-case/">Categories</a><a href="/about/">About</a><a href="/contact/">Contact</a></div><div><h2>Popular Categories</h2>${toolCats.slice(0,8).map(c=>`<a href="${c[3]}"><span class="footer-dot" style="background:${c[2]}"></span>${E(c[0])}</a>`).join('')}</div><div><h2>Stay Connected</h2><p>Get the latest updates and news directly in your inbox.</p><form class="newsletter" action="/contact/" method="get"><input type="email" name="email" placeholder="Enter your email address" aria-label="Email address"><button type="submit" aria-label="Subscribe">➤</button></form><div class="socials"><a href="/contact/" aria-label="Facebook">f</a><a href="/contact/" aria-label="X">𝕏</a><a href="/contact/" aria-label="YouTube">▶</a><a href="/contact/" aria-label="LinkedIn">in</a><a href="/contact/" aria-label="Pinterest">p</a><a href="/contact/" aria-label="RSS">◔</a></div></div></div><div class="footer-bottom"><span>© ${new Date().getFullYear()} AINOVEX. All rights reserved.</span><span><a href="/privacy/">Privacy Policy</a><a href="/terms/">Terms of Service</a><a href="/affiliate-disclosure/">Disclaimer</a></span></div></footer>`
 +(m.js?`<script src="/assets/${jsFile}" defer></script>`:'')+adJs+gaJs+`</body></html>`;
 const f=path.join(OUT,file);fs.mkdirSync(path.dirname(f),{recursive:true});fs.writeFileSync(f,html);
 out.push({url,file,title:full,desc:m.desc,html,noindex:ni,kind:m.kind||'page',lastmod:m.lastmod})}

// ---------- home ----------
const org={'@type':'Organization','@id':A('/#organization'),name:cfg.name,url:A('/'),description:cfg.tagline};
const site={'@type':'WebSite','@id':A('/#website'),url:A('/'),name:cfg.name,publisher:{'@id':A('/#organization')},inLanguage:'en'};
const feat=arts.filter(a=>a.featured||a.cornerstone).slice(0,3),latest=arts.slice(0,5);
const toolCats=[
  ['AI Writing','pencil','#3B82F6','/ai-writing-productivity/'],
  ['Image Generation','image','#8B5CF6','/ai-image-video-tools/'],
  ['Video & Audio','circle-play','#F43F5E','/ai-image-video-tools/'],
  ['Productivity','zap','#22C55E','/ai-writing-productivity/'],
  ['Design & Art','palette','#F97316','/ai-image-video-tools/'],
  ['Code & Dev','code-xml','#2563EB','/ai-coding-tools/'],
  ['Business','chart-column','#14B8A6','/ai-tools-for-small-businesses/'],
  ['Education','graduation-cap','#7C3AED','/ai-tools-for-students/'],
  ['Others','layout-grid','#64748B','/ai-tools-by-use-case/']
];
const featuredTools=[
  ['ChatGPT','Get instant answers, write content, code and more with ChatGPT.',['Writing','Productivity'],'#10A37F','bot','https://chatgpt.com/'],
  ['Midjourney','Create stunning AI images from simple text prompts.',['Image Generation','Design'],'#172554','sailboat','https://www.midjourney.com/'],
  ['Canva','Design anything with AI-powered tools and templates.',['Design','Productivity'],'linear-gradient(135deg,#00C4CC,#7D2AE8)','palette','https://www.canva.com/'],
  ['Runway','Create and edit videos with powerful AI tools.',['Video','Creating'],'#050505','clapperboard','https://runwayml.com/'],
  ['Leonardo AI','Generate high-quality images, art and assets with AI.',['Image Generation','Design'],'linear-gradient(135deg,#3B2A6B,#C9A24B)','wand-sparkles','https://leonardo.ai/']
];
const toolCard=t=>`<article class="tool-card"><div class="tool-icon" style="background:${t[3]}"><span aria-hidden="true">${t[0]==='ChatGPT'?'✳':t[0]==='Midjourney'?'◒':t[0]==='Canva'?'C':t[0]==='Runway'?'R':'✦'}</span></div><h3>${E(t[0])}</h3><p>${E(t[1])}</p><div class="tag-row">${t[2].map(x=>`<span>${E(x)}</span>`).join('')}</div><a class="tool-visit" href="${t[5]}" target="_blank" rel="noopener noreferrer">Visit Tool <span aria-hidden="true">→</span></a></article>`;
const catCard=c=>`<a class="tool-cat" href="${c[3]}"><span class="cat-icon" style="--cat:${c[2]};background:${c[2]}18;color:${c[2]}">${c[0]==='AI Writing'?'✎':c[0]==='Image Generation'?'▧':c[0]==='Video & Audio'?'▶':c[0]==='Productivity'?'ϟ':c[0]==='Design & Art'?'◉':c[0]==='Code & Dev'?'&lt;/&gt;':c[0]==='Business'?'▥':c[0]==='Education'?'◆':'▦'}</span><span>${E(c[0])}</span></a>`;
const blogCard=a=>`<article class="blog-card"><a href="/${a.slug}/" class="blog-thumb" aria-label="Read ${E(a.title)}"><span>${E(catOf(a.category).name)}</span></a><div class="blog-body"><span class="blog-label">${E(catOf(a.category).name)}</span><h3><a href="/${a.slug}/">${E(a.title)}</a></h3><div class="blog-meta"><span>${D(a.date)}</span><span>◷ ${Math.max(4,Math.min(9,Math.ceil((a.body||'').split(/\s+/).length/180)))} min read</span></div></div></article>`;
const safeHero=fs.existsSync('public/hero-ai.webp')?`<img src="/hero-ai.webp" width="614" height="345" alt="Friendly AI robot working on a laptop" fetchpriority="high" decoding="async">`:`<div class="hero-placeholder" aria-hidden="true"></div>`;
const homeMain=`<section class="home-hero" aria-labelledby="hero-title"><div class="home-hero-inner"><div class="hero-copy"><span class="hero-kicker">Your AI Journey Starts Here</span><h1 id="hero-title">Discover the Best<br><strong>AI Tools</strong> &amp; Resources</h1><p>AINOVEX brings you the latest AI tools, helpful guides, tech news and insights — all in one place. Boost your productivity, creativity and work smarter with the power of AI.</p><form class="hero-search" role="search" action="/search/" method="get"><span aria-hidden="true">⌕</span><input name="q" type="search" placeholder="Search for AI tools, articles, or topics..." aria-label="Search for AI tools, articles, or topics"><button type="submit">Search</button></form><div class="trending"><strong>🔥 Trending:</strong><a href="/search/?q=ChatGPT">ChatGPT</a><a href="/search/?q=AI+Image+Generator">AI Image Generator</a><a href="/search/?q=Video+Editing">Video Editing</a><a href="/search/?q=Productivity">Productivity</a><a href="/search/?q=SEO">SEO</a></div></div><div class="hero-art">${safeHero}<span class="float-icon fi1">✳</span><span class="float-icon fi2">◒</span><span class="float-icon fi3">✦</span><span class="float-icon fi4">▶</span><span class="float-icon fi5">✧</span><span class="float-icon fi6">▶</span><div class="hero-note">Smarter<br>with AI<div>⌁</div></div></div></div></section><section class="home-section categories-section" aria-labelledby="category-title"><div class="section-head"><h2 id="category-title">Browse by Category</h2><a href="/ai-tools-by-use-case/">View All Categories <span aria-hidden="true">→</span></a></div><div class="category-strip">${toolCats.map(catCard).join('')}</div></section><section class="home-section" aria-labelledby="featured-title"><div class="section-head"><div><h2 id="featured-title"><span class="section-spark">✦</span> Featured AI Tools</h2><p>Handpicked top AI tools to help you work faster, create better and achieve more.</p></div><a href="/ai-tools-by-use-case/">View All Tools <span aria-hidden="true">→</span></a></div><div class="tool-grid">${featuredTools.map(toolCard).join('')}</div></section>${latest.length?`<section id="latest" class="home-section latest-section" aria-labelledby="latest-title"><div class="section-head"><div><h2 id="latest-title"><span class="section-doc">▤</span> Latest Blog &amp; News</h2><p>Stay updated with the latest AI news, tips, tutorials and industry trends.</p></div><a href="/ai-tools-by-use-case/">View All Articles <span aria-hidden="true">→</span></a></div><div class="blog-grid">${latest.map(blogCard).join('')}</div></section>`:''}<section class="home-about" aria-labelledby="about-home"><div><span>AINOVEX</span><h2 id="about-home">Practical AI tools, guides and news — in one place.</h2><p>Explore useful AI resources for productivity, creativity, learning, coding and everyday work.</p></div><a class="home-about-btn" href="/about/">Learn more about AINOVEX →</a></section>`;
page('/',{kind:'home',home:1,title:`${cfg.name}: Discover the Best AI Tools & Resources`,desc:'Discover the best AI tools, practical guides, AI news and useful resources for productivity, creativity, learning and work.',lastmod:arts[0]?.updated,ld:[{'@context':'https://schema.org','@graph':[org,site,{'@type':'WebPage','@id':A('/#webpage'),url:A('/'),name:cfg.name,isPartOf:{'@id':A('/#website')},inLanguage:'en'}]}]},homeMain);

// ---------- categories ----------
for(const c of cats){const list=arts.filter(a=>a.category===c.slug),cr=[['Home','/'],[c.name,`/${c.slug}/`]],others=vis.filter(x=>x!==c).slice(0,4);
page(`/${c.slug}/`,{kind:'category',cat:c.slug,title:c.name,desc:c.intro,noindex:!list.some(a=>!a.hold),lastmod:list[0]?.updated,
ld:[{'@context':'https://schema.org','@graph':[{'@type':'CollectionPage','@id':A(`/${c.slug}/#webpage`),url:A(`/${c.slug}/`),name:c.name,description:c.intro,isPartOf:{'@id':A('/#website')},inLanguage:'en'},crumbLd(cr),...(list.length?[{'@type':'ItemList',itemListElement:list.map((a,i)=>({'@type':'ListItem',position:i+1,url:A(`/${a.slug}/`),name:a.title}))}]:[])]}]},
`${crumbs(cr)}<h1>${E(c.name)}</h1><div class="prose"><p>${E(c.intro)}</p></div>`
+(list.length?sec('guides',`${c.name} guides`,`<ul class="grid">${list.map(card).join('')}</ul>`):'<p class="note">Guides for this topic are being written.</p>')
+(others.length?sec('other','Other topics',`<ul class="grid">${others.map(cCard).join('')}</ul>`):''))}

// ---------- articles ----------
for(const a of arts){const{html,toc}=md(a.body,a._f),c=catOf(a.category),au=cfg.authors[a.author||'editorial'],url=`/${a.slug}/`,cr=[['Home','/'],[c.name,`/${c.slug}/`],[a.title,url]];
const pool=[...arts.filter(x=>x!==a&&x.category===a.category),...arts.filter(x=>x!==a&&x.category!==a.category&&x.cornerstone)];
let rel=(a.related||[]).map(s=>bySlug[s]);if(rel.length<3)rel=[...rel,...pool.sort((x,y)=>(y.cornerstone?1:0)-(x.cornerstone?1:0))];
rel=[...new Set(rel)].slice(0,3);
const fq=a.faq?faqs(a.body):[],og=a.image?ogOf(a.image):null;
const g=[{'@type':'Article','@id':A(url+'#article'),headline:a.title,description:a.description,datePublished:a.date,dateModified:a.updated,inLanguage:'en',mainEntityOfPage:A(url),isPartOf:{'@id':A('/#website')},author:{'@type':au.type,name:au.name,url:A(au.url)},publisher:{'@id':A('/#organization')},...(og?{image:[A(og)]}:{})},crumbLd(cr),...(fq.length?[{'@type':'FAQPage',mainEntity:fq.map(x=>({'@type':'Question',name:x.q,acceptedAnswer:{'@type':'Answer',text:x.a}}))}]:[])];
const hero=a.image?`<div class="hero-img">${pic(a.image,a.imageAlt,{sizes:BODY_SIZES,lcp:true})}</div>`:'';
page(url,{kind:'article',cat:c.slug,article:1,date:a.date,title:a.title,desc:a.description,lastmod:a.updated,og,noindex:a.hold,ld:[{'@context':'https://schema.org','@graph':g}]},
`${crumbs(cr)}<article><header><h1>${E(a.title)}</h1><p class="meta">By <a href="${au.url}">${E(au.name)}</a> · Published <time datetime="${a.date}">${D(a.date)}</time> · Updated <time datetime="${a.updated}">${D(a.updated)}</time></p>${/rel="sponsored/.test(html)?'<p class="note">This guide contains affiliate links. We may earn a commission if you buy through them, at no extra cost to you. See our <a href="/affiliate-disclosure/">affiliate disclosure</a>.</p>':''}${hero}</header>`
+(a.answer?`<section class="answer" aria-labelledby="qa"><h2 id="qa">Quick answer</h2><p>${inl(a.answer)}</p></section>`:'')
+(toc.length>=3?`<details class="toc" open><summary>On this page</summary><ol>${toc.map(t=>`<li><a href="#${t.id}">${E(t.t)}</a></li>`).join('')}</ol></details>`:'')
+`<div class="prose">${html}</div>${ad()}<footer class="author"><p><strong>Published by ${E(au.name)}.</strong> ${au.bio?E(au.bio)+' ':''}Read <a href="/editorial-policy/">how we research and update guides</a>, or browse more in <a href="/${c.slug}/">${E(c.name)}</a>.</p></footer></article>`
+(rel.length?sec('rel','Related guides',`<ul class="grid">${rel.map(card).join('')}</ul>`):''))}

// ---------- static pages, search, 404 ----------
for(const p of pages){const{html}=md(p.body,p._f),cr=[['Home','/'],[p.title,`/${p.slug}/`]];
page(`/${p.slug}/`,{kind:'page',title:p.title,desc:p.description,lastmod:p.updated,noindex:p.hold,ld:[{'@context':'https://schema.org','@graph':[{'@type':p.slug==='about'?'AboutPage':p.slug==='contact'?'ContactPage':'WebPage',url:A(`/${p.slug}/`),name:p.title,isPartOf:{'@id':A('/#website')},inLanguage:'en'},crumbLd(cr)]}]},
`${crumbs(cr)}<h1>${E(p.title)}</h1><div class="prose">${html}${p.updated?`<p class="meta">Last updated <time datetime="${p.updated}">${D(p.updated)}</time></p>`:''}</div>`)}
const browse=vis.length?sec('browse','Browse topics',`<ul class="grid">${vis.map(cCard).join('')}</ul>`):'';
page('/search/',{kind:'search',title:'Search',desc:'Search AINOVEX guides.',noindex:1,js:1},`<h1>Search</h1><noscript><p class="note">Search needs JavaScript. Browse the topics below instead.</p></noscript><div id="results" role="status" aria-live="polite" class="prose"><p>Type a search above to find guides.</p></div>${browse}`);
page('/404.html',{kind:'404',title:'Page not found',desc:'This page could not be found. Search AINOVEX or browse our topics.',noindex:1},`<h1>Page not found</h1><div class="prose"><p>That address doesn't exist or has moved. Search below, or use a link to continue browsing.</p></div>${searchForm('sf404')}${browse}<p><a href="/">Go to the homepage</a></p>`);

// ---------- machine files ----------
fs.writeFileSync(`${OUT}/search-index.json`,JSON.stringify(arts.map(a=>({t:a.title,u:`/${a.slug}/`,d:a.description,c:catOf(a.category).name}))));
const urls=out.filter(p=>!p.noindex),SM=40000,chunks=[];for(let i=0;i<urls.length;i+=SM)chunks.push(urls.slice(i,i+SM));
const set=l=>`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${l.map(p=>`<url><loc>${A(p.url)}</loc>${p.lastmod?`<lastmod>${p.lastmod}</lastmod>`:''}</url>`).join('\n')}\n</urlset>\n`;
if(chunks.length<=1)fs.writeFileSync(`${OUT}/sitemap.xml`,set(urls));else{chunks.forEach((c,i)=>fs.writeFileSync(`${OUT}/sitemap-${i+1}.xml`,set(c)));
fs.writeFileSync(`${OUT}/sitemap.xml`,`<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${chunks.map((c,i)=>`<sitemap><loc>${A(`/sitemap-${i+1}.xml`)}</loc></sitemap>`).join('\n')}\n</sitemapindex>\n`)}
fs.writeFileSync(`${OUT}/robots.txt`,`User-agent: *\nAllow: /\n\nSitemap: ${A('/sitemap.xml')}\n`);

// ---------- audit ----------
const res=audit({cfg,out,arts,cats,count,dist:OUT});
console.log(`Built ${out.length} pages (${urls.length} in sitemap) · domain ${cfg.siteUrl}\n`);
console.log(res.report.join('\n'));
const allErr=[...errs,...res.errors];
[...warns,...res.warnings].forEach(w=>console.log('WARN ',w));allErr.forEach(e=>console.log('ERROR',e));
if(allErr.length){console.log(`\nAudit FAILED: ${allErr.length} error(s).`);process.exit(1)}console.log('\nAudit passed.');
