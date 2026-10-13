import { Marked } from 'marked';

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

/** Only allow web, mailto and in-site links/images. Blocks javascript:, data:, vbscript: etc. */
export function isSafeUrl(href: string | null | undefined): boolean {
  if (!href) return false;
  const v = href.trim().replace(/[\u0000-\u001F\u007F\s]+/g, '');
  if (v.startsWith('#') || v.startsWith('/') || v.startsWith('./') || v.startsWith('../')) return true;
  return /^(https?:|mailto:)/i.test(v);
}

const md = new Marked({
  gfm: true,
  breaks: false,
  renderer: {
    // Raw HTML typed into markdown is shown as text, never executed.
    html(token: { text?: string; raw?: string }) {
      return escapeHtml(token.text ?? token.raw ?? '');
    },
  },
  walkTokens(token: any) {
    if (token.type === 'link' || token.type === 'image') {
      if (!isSafeUrl(token.href)) token.href = '#';
    }
  },
});

/** Render markdown to HTML that is safe to put in dangerouslySetInnerHTML. */
export function renderMarkdown(source: string): string {
  return md.parse(source || '', { async: false }) as string;
}
