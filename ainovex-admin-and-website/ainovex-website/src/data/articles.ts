export interface Article {
  slug: string;
  title: string;
  description: string;
  category: string;
  categorySlug: string;
  categoryBadge: string;
  author: string;
  published: string;
  updated?: string;
  readingTime: string;
  primaryKeyword: string;
  secondaryKeywords?: string[];
  featuredImage: string;
  featuredImageAlt: string;
  featuredOnHome?: boolean;
  homeOrder?: number;
  tags: string[];
  relatedArticles?: string[];
  quickAnswer?: string;
  bodyMarkdown?: string;
  bodyHtml?: string;
}

/**
 * AINOVEX Article Registry
 * CURRENT STATE:
 * PUBLISHED ARTICLES = 0
 * Currently zero articles are published. No dummy, sample, or fabricated articles.
 *
 * FUTURE BEHAVIOR:
 * When real articles are authored and appended here, they automatically become
 * eligible to render in:
 * 1. Homepage "Latest Articles" section (up to 3-5 cards)
 * 2. Articles archive directory (/articles/)
 * 3. Individual canonical article pages (/articles/:slug/)
 * 4. Sitemap generation & Article JSON-LD structured data
 */
export const ARTICLES: Article[] = [];

export function getArticleBySlug(slug: string): Article | undefined {
  const clean = slug.replace(/^\/|\/$/g, "").replace(/^articles\//, "");
  return ARTICLES.find((a) => a.slug === clean);
}

export function getArticlesByCategory(categorySlug: string): Article[] {
  return ARTICLES.filter(
    (a) =>
      a.categorySlug.toLowerCase() === categorySlug.toLowerCase() ||
      a.category.toLowerCase() === categorySlug.toLowerCase()
  );
}

export function getFeaturedHomeArticles(limit: number = 5): Article[] {
  const featured = ARTICLES.filter((a) => a.featuredOnHome !== false);
  return featured.slice(0, limit);
}
