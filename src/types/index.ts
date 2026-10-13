export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content?: string;
  contentPath?: string;
  category: string;
  categoryName?: string;
  author: string;
  publishedAt: string;
  updatedAt: string;
  isPublished: boolean;
  featuredImage: string;
  imageAlt: string;
  readingTime: string;
  tags: string[];
  primaryKeyword?: string;
  secondaryKeywords?: string[];
  metaTitle: string;
  metaDescription: string;
  canonicalUrl?: string;
}

export interface Tool {
  id: string;
  name: string;
  slug: string;
  url: string;
  description: string;
  longDescription?: string;
  category: string;
  categoryName: string;
  tags: string[];
  pricing: 'Free' | 'Freemium' | 'Paid';
  isFeatured: boolean;
  icon: string;
  iconBg?: string;
  brandInitial?: string;
  rating?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color?: string;
  toolCount: number;
  articleCount: number;
}

export interface SiteSettings {
  siteTitle: string;
  siteTagline: string;
  siteDescription: string;
  authorName: string;
  contactEmail: string;
  productionUrl: string;
  socialLinks: {
    facebook?: string;
    twitter?: string;
    youtube?: string;
    linkedin?: string;
    pinterest?: string;
    rss?: string;
  };
  defaultOgImage: string;
  googleAnalyticsId: string;
  monetizationNotice: string;
  footerCopyright: string;
}
