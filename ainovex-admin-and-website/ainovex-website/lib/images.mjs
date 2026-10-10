// Responsive image pipeline: content/images/<file> -> dist/img/<name>-<hash>-<w>.{avif,webp}
// Never upscales. File names contain a content hash, so /img/* can be cached immutably.
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import {createRequire} from 'node:module';
import cfg from '../site.config.mjs';
let sharp=null;
try{sharp=(await import('sharp')).default}catch{try{sharp=createRequire(import.meta.url)('sharp')}catch{}}
const SRC='content/images',OUT='dist/img',cache=new Map();
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
export async function loadImage(name){
  if(cache.has(name))return cache.get(name);
  const f=path.join(SRC,name);
  if(!fs.existsSync(f))throw Error(`Image not found: ${f}`);
  if(!sharp)throw Error('Images need the "sharp" package. Run "npm install" (Cloudflare Pages does this automatically).');
  const buf=await sharp(f).rotate().toBuffer();            // applies EXIF orientation
  const {width:W,height:H}=await sharp(buf).metadata();
  const hash=crypto.createHash('sha1').update(buf).digest('hex').slice(0,8);
  const base=name.replace(/\.[^.]+$/,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  let ws=cfg.images.widths.filter(w=>w<=W);if(!ws.length)ws=[W];else if(ws.at(-1)<W&&W<Math.max(...cfg.images.widths))ws.push(W); // keep native width for in-between sources
  fs.mkdirSync(OUT,{recursive:true});
  const v={avif:[],webp:[]};
  for(const w of ws){
    const r=sharp(buf).resize({width:w,withoutEnlargement:true});
    for(const [fmt,o] of [['avif',{quality:cfg.images.avifQuality,effort:4}],['webp',{quality:cfg.images.webpQuality}]]){
      const file=`${base}-${hash}-${w}.${fmt}`;await r.clone()[fmt](o).toFile(path.join(OUT,file));v[fmt].push({w,url:`/img/${file}`});
    }
  }
  const w=ws[ws.length-1],h=Math.round(H*w/W);
  let og=null;                                               // JPEG for social cards (widest platform support)
  if(W>=1200&&H>=630){const file=`${base}-${hash}-og.jpg`;await sharp(buf).resize(1200,630,{fit:'cover'}).jpeg({quality:80,mozjpeg:true}).toFile(path.join(OUT,file));og=`/img/${file}`}
  const m={w,h,v,og};cache.set(name,m);return m;
}
export const ogOf=name=>cache.get(name)?.og||null;
// Synchronous: call loadImage(name) first. lcp=true -> eager + fetchpriority=high; otherwise lazy.
export function pic(name,alt,{sizes,lcp=false}){
  const m=cache.get(name);if(!m)throw Error('image not loaded: '+name);
  const ss=a=>a.map(x=>`${x.url} ${x.w}w`).join(', '),fb=m.v.webp.find(x=>x.w>=768)||m.v.webp.at(-1);
  return `<picture><source type="image/avif" srcset="${ss(m.v.avif)}" sizes="${sizes}"><source type="image/webp" srcset="${ss(m.v.webp)}" sizes="${sizes}"><img src="${fb.url}" srcset="${ss(m.v.webp)}" sizes="${sizes}" alt="${esc(alt)}" width="${m.w}" height="${m.h}" style="aspect-ratio:${m.w}/${m.h}" ${lcp?'fetchpriority="high"':'loading="lazy" decoding="async"'}></picture>`;
}
