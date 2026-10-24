import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Share2, Check, Tag } from 'lucide-react';
import { renderMarkdown } from '../utils/markdown';
import { Article } from '../types';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { JsonLd } from '../components/JsonLd';

interface ArticleDetailViewProps {
  slug: string;
  onNavigate: (path: string) => void;
  allArticles: Article[];
}

export const ArticleDetailView: React.FC<ArticleDetailViewProps> = ({
  slug,
  onNavigate,
  allArticles,
}) => {
  // Read any pre-rendered HTML already present in the DOM from static postbuild
  const getPreRenderedHtml = () => {
    if (typeof document !== 'undefined') {
      const el = document.getElementById('article-content-body');
      if (el && el.innerHTML.trim().length > 0) return el.innerHTML;
      const generic = document.querySelector('.article-content');
      if (generic && generic.innerHTML.trim().length > 0) return generic.innerHTML;
    }
    return '';
  };

  const initialArticle = allArticles.find((a) => a.slug === slug) || null;
  const initialHtml = getPreRenderedHtml();

  const [article, setArticle] = useState<Article | null>(initialArticle);
  const [contentHtml, setContentHtml] = useState<string>(initialHtml);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    // If pre-rendered HTML or known article already exists, NEVER display a blank loading spinner!
    if (initialHtml.length > 0) return false;
    return !initialArticle;
  });

  useEffect(() => {
    // If we already have article metadata AND rendered content, no client fetch is needed!
    if (article && contentHtml && contentHtml.length > 0) {
      return;
    }

    const found = allArticles.find((a) => a.slug === slug);
    if (found && !article) setArticle(found);

    let isMounted = true;
    fetch(`/api/articles/${encodeURIComponent(slug)}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then((data: Article & { content?: string }) => {
        if (!isMounted) return;
        setArticle(data);
        if (data.content) {
          setContentHtml(renderMarkdown(data.content));
        }
      })
      .catch((err) => {
        console.error('Failed to load article:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [slug, allArticles]);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <div className="w-8 h-8 mx-auto border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm text-slate-400">Loading guide...</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Article Not Found</h2>
        <p className="text-sm text-slate-400 mb-6">The requested article could not be located.</p>
        <a
          href="/blog/"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('/blog/');
          }}
          className="px-5 py-2.5 rounded-full bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500 inline-block"
        >
          Return to Blog Archive
        </a>
      </div>
    );
  }

  const related = allArticles
    .filter((a) => a.slug !== article.slug && (a.category === article.category || a.isPublished))
    .slice(0, 2);

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.metaDescription || article.excerpt,
    image: article.featuredImage,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt || article.publishedAt,
    author: {
      '@type': 'Person',
      name: article.author || 'Md Shamim',
    },
    publisher: {
      '@type': 'Organization',
      name: 'AINOVEX',
      logo: {
        '@type': 'ImageObject',
        url: 'https://ai-novex.netlify.app/favicon.svg',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://ai-novex.netlify.app/blog/${article.slug}/`,
    },
  };

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <JsonLd data={articleSchema} />

      <Breadcrumbs
        items={[
          { label: 'Blog', path: '/blog/' },
          { label: article.categoryName || article.category, path: `/category/${article.category}/` },
          { label: article.title },
        ]}
        onNavigate={onNavigate}
      />

      {/* Header */}
      <div className="py-6 border-b border-slate-200 dark:border-slate-800/80 mb-8">
        <a
          href={`/category/${article.category}/`}
          onClick={(e) => {
            e.preventDefault();
            onNavigate(`/category/${article.category}/`);
          }}
          className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-600/20 dark:text-blue-400 dark:border-blue-500/30 mb-4 hover:bg-blue-100 transition-colors"
        >
          {article.categoryName || article.category}
        </a>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight mb-4">
          {article.title}
        </h1>

        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
          {article.excerpt}
        </p>

        <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-600/20 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center font-bold text-blue-600 dark:text-blue-400 text-xs">
                MS
              </div>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {article.author || 'Md Shamim'}
              </span>
            </div>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {article.publishedAt}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {article.readingTime || '5 min read'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:hover:text-white transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied Link' : 'Share'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Featured Cover Image (LCP element - eager and dimensioned) */}
      {article.featuredImage && (
        <div className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-10 shadow-lg border border-slate-200 dark:border-slate-800/80">
          <img
            src={article.featuredImage}
            srcSet={`${article.featuredImage.replace('w=1200', 'w=600')} 600w, ${article.featuredImage.replace('w=1200', 'w=900')} 900w, ${article.featuredImage} 1200w`}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 896px"
            alt={article.imageAlt || article.title}
            width={1200}
            height={675}
            loading="eager"
            fetchPriority="high"
            decoding="async"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Article Content Render */}
      <div
        id="article-content-body"
        className="article-content mb-12"
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />

      {/* Tags */}
      {article.tags && article.tags.length > 0 && (
        <div className="py-6 border-t border-b border-slate-200 dark:border-slate-800/80 flex items-center gap-2 flex-wrap mb-10">
          <Tag className="w-4 h-4 text-slate-400 mr-1" />
          {article.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700/50"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Author Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-4 mb-12">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center font-bold text-white text-lg shrink-0 shadow-md">
          MS
        </div>
        <div>
          <div className="text-xs uppercase font-bold tracking-wider text-blue-600 dark:text-blue-400 mb-1">Author</div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
            {article.author || 'Md Shamim'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Lead researcher and editor at AINOVEX. Passionate about artificial intelligence, software benchmarks, prompt engineering, and democratizing modern productivity tools.
          </p>
        </div>
      </div>

      {/* Related Guides */}
      {related.length > 0 && (
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800/80">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
            Related Guides & Tutorials
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {related.map((r) => (
              <a
                key={r.slug}
                href={`/blog/${r.slug}/`}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(`/blog/${r.slug}/`);
                }}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-blue-500/40 shadow-sm hover:shadow-md cursor-pointer group transition-all block"
              >
                <div className="text-xs text-blue-600 dark:text-blue-400 font-semibold mb-2">
                  {r.categoryName || r.category}
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 mb-2">
                  {r.title}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{r.excerpt}</p>
              </a>
            ))}
          </div>
        </div>
      )}
    </article>
  );
};
