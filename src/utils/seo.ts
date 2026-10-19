// Client-side SEO helpers: keep <meta> + canonical in sync with the current route.
function setMeta(selector: string, attr: 'name' | 'property', key: string, value: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', value);
}

export function applySeo(opts: {
  title: string;
  description: string;
  path: string;
  baseUrl: string;
  image?: string;
  noindex?: boolean;
  type?: 'website' | 'article';
}) {
  const base = opts.baseUrl.replace(/\/+$/, '');
  const cleanPath = opts.path.split('?')[0];
  // Standardize canonical and og:url to trailing slash (matching direct 200 Netlify static routes)
  const formattedPath = cleanPath === '/' ? '/' : (cleanPath.endsWith('/') ? cleanPath : cleanPath + '/');
  const url = `${base}${formattedPath}`;

  // Enforce maximum 155 characters for meta descriptions
  const safeDesc = opts.description && opts.description.length > 155
    ? opts.description.slice(0, 152).trim() + '...'
    : opts.description;

  document.title = opts.title;
  setMeta('meta[name="description"]', 'name', 'description', safeDesc);
  setMeta('meta[property="og:title"]', 'property', 'og:title', opts.title);
  setMeta('meta[property="og:description"]', 'property', 'og:description', safeDesc);
  setMeta('meta[property="og:url"]', 'property', 'og:url', url);
  setMeta('meta[property="og:type"]', 'property', 'og:type', opts.type || 'website');
  setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', opts.title);
  setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', safeDesc);
  if (opts.image) {
    setMeta('meta[property="og:image"]', 'property', 'og:image', opts.image);
    setMeta('meta[name="twitter:image"]', 'name', 'twitter:image', opts.image);
  }
  setMeta('meta[name="robots"]', 'name', 'robots', opts.noindex ? 'noindex, nofollow' : 'index, follow');

  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'canonical';
    document.head.appendChild(link);
  }
  link.href = url;
}

/** Load Google Analytics only when a valid Measurement ID is configured. */
export function loadAnalytics(id: string | undefined) {
  if (!id || !/^G-[A-Z0-9]{4,20}$/.test(id)) return;
  if (document.getElementById('ga-script')) return;
  const s = document.createElement('script');
  s.id = 'ga-script';
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
  document.head.appendChild(s);
  (window as any).dataLayer = (window as any).dataLayer || [];
  const gtag = function (..._args: any[]) {
    (window as any).dataLayer.push(arguments);
  };
  (window as any).gtag = gtag;
  gtag('js', new Date());
  gtag('config', id);
}
