// Cloudflare Pages Functions entry point for /api/*
//
// Read-only public endpoints. They serve the content that `scripts/postbuild.mjs`
// copies into dist/content during the build.

interface Env {
  ASSETS: { fetch: (input: Request | string | URL, init?: RequestInit) => Promise<Response> };
}

type PagesFunction<T = unknown> = (context: {
  request: Request;
  env: T;
  params: Record<string, string | string[]>;
  waitUntil: (promise: Promise<any>) => void;
  next: (input?: Request | string, init?: RequestInit) => Promise<Response>;
  data: Record<string, unknown>;
}) => Response | Promise<Response>;

const SAFE_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const isSafeSlug = (v: unknown): v is string => typeof v === 'string' && v.length <= 120 && SAFE_SLUG.test(v);

// ---------------------------------------------------------------- response helpers
const json = (data: unknown, status = 200, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'private, no-cache',
      'X-Content-Type-Options': 'nosniff',
      ...extra,
    },
  });

// ---------------------------------------------------------------- static content
async function loadAsset(env: Env, origin: string, assetPath: string): Promise<Response | null> {
  try {
    const res = await env.ASSETS.fetch(new URL(assetPath, origin).toString());
    return res.ok ? res : null;
  } catch {
    return null;
  }
}

async function loadJson<T>(env: Env, origin: string, name: string, fallback: T): Promise<T> {
  const res = await loadAsset(env, origin, `/content/${name}.json`);
  if (!res) return fallback;
  try {
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}

// ---------------------------------------------------------------- router
async function route(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const pathname = url.pathname.replace(/\/+$/, '');
  const method = request.method;
  const origin = url.origin;

  if (method === 'OPTIONS') return new Response(null, { status: 204 });

  if (pathname === '/api/health') {
    return json(
      { status: 'ok', platform: 'Cloudflare Pages Functions', timestamp: new Date().toISOString() },
      200,
      { 'Cache-Control': 'no-store' }
    );
  }

  if (method !== 'GET' && method !== 'HEAD') return json({ error: 'Not found' }, 404);

  if (pathname === '/api/categories') return json(await loadJson(env, origin, 'categories', []));
  if (pathname === '/api/tools') return json(await loadJson(env, origin, 'tools', []));
  if (pathname === '/api/settings') return json(await loadJson(env, origin, 'settings', {}));
  if (pathname === '/api/ads') return json(await loadJson(env, origin, 'ads', { enabled: false, slots: {} }));

  if (pathname === '/api/articles') {
    const articles = await loadJson<any[]>(env, origin, 'articles', []);
    return json(articles.filter((a) => a.isPublished));
  }

  if (pathname.startsWith('/api/articles/')) {
    let slug = '';
    try {
      slug = decodeURIComponent(pathname.slice('/api/articles/'.length));
    } catch {
      return json({ error: 'Article not found' }, 404);
    }
    if (!isSafeSlug(slug)) return json({ error: 'Article not found' }, 404);
    const articles = await loadJson<any[]>(env, origin, 'articles', []);
    const article = articles.find((a) => a.slug === slug);
    if (!article || !article.isPublished) return json({ error: 'Article not found' }, 404);

    let content = '';
    const md = await loadAsset(env, origin, `/content/articles/${slug}.md`);
    if (md) content = await md.text();
    return json({ ...article, content });
  }

  return json({ error: 'Not found' }, 404);
}

export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  try {
    return await route(request, env);
  } catch (e: any) {
    console.error('API error:', e);
    return json({ error: 'Internal server error' }, 500, { 'Cache-Control': 'no-store' });
  }
};
