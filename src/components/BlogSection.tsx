import React from 'react';
import { BookOpen, ArrowRight, Calendar, Clock, Newspaper } from 'lucide-react';
import { Article } from '../types';

interface BlogSectionProps {
  articles: Article[];
  onSelectArticle: (slug: string) => void;
  onViewAll: () => void;
  onExploreTools: () => void;
}

export const BlogSection: React.FC<BlogSectionProps> = ({
  articles,
  onSelectArticle,
  onViewAll,
  onExploreTools,
}) => {
  const publishedArticles = articles.filter((a) => a.isPublished);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            <Newspaper className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>Latest Blog & News</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Stay updated with the latest AI news, tips, tutorials and industry trends.
          </p>
        </div>
        <a
          href="/blog"
          onClick={(e) => {
            e.preventDefault();
            onViewAll();
          }}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors group self-start sm:self-auto cursor-pointer"
        >
          <span>View All Articles</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </a>
      </div>

      {publishedArticles.length === 0 ? (
        /* Empty / Editorial Desk State matching screenshot exactly */
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-50 border border-slate-200 text-center max-w-3xl mx-auto shadow-sm dark:bg-slate-900/50 dark:border-slate-800/80">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 mb-4 border border-blue-200 dark:bg-blue-600/10 dark:text-blue-400 dark:border-blue-500/20">
            <BookOpen className="w-7 h-7" />
          </div>

          <div className="inline-block px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-slate-200 text-slate-700 mb-3 dark:bg-slate-800 dark:text-slate-300">
            EDITORIAL DESK
          </div>

          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-3">
            No articles published yet.
          </h3>

          <p className="max-w-lg mx-auto text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
            Stay updated with upcoming AI news, tips, tutorials, and industry trends. Our editorial team is currently researching and vetting the first set of guides, comparisons, and workflows.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="/tools"
              onClick={(e) => {
                e.preventDefault();
                onExploreTools();
              }}
              className="px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/30 transition-all hover:scale-[1.02] cursor-pointer"
            >
              Explore AI Tools Directory
            </a>
            <a
              href="/blog"
              onClick={(e) => {
                e.preventDefault();
                onViewAll();
              }}
              className="px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold text-slate-700 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-700 transition-all cursor-pointer"
            >
              View Blog Archive
            </a>
          </div>
        </div>
      ) : (
        /* Grid of Published Articles */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {publishedArticles.slice(0, 3).map((article) => (
            <a
              key={article.id || article.slug}
              href={`/blog/${article.slug}`}
              onClick={(e) => {
                e.preventDefault();
                onSelectArticle(article.slug);
              }}
              className="group flex flex-col justify-between rounded-2xl bg-white border border-slate-200/90 overflow-hidden hover:border-blue-500/40 hover:shadow-xl shadow-sm dark:bg-slate-900/60 dark:border-slate-800/80 transition-all duration-200 hover:-translate-y-1 cursor-pointer block"
            >
              <div>
                {/* Article Cover Image */}
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src={article.featuredImage}
                    alt={article.imageAlt || article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-600/90 text-white backdrop-blur-md shadow-sm">
                      {article.categoryName || article.category}
                    </span>
                  </div>
                </div>

                {/* Article Body */}
                <div className="p-5">
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mb-2">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {article.publishedAt}
                    </span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {article.readingTime || '5 min read'}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 mb-2 leading-snug">
                    {article.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {article.excerpt}
                  </p>
                </div>
              </div>

              {/* Author and Read More */}
              <div className="px-5 pb-5 pt-2 border-t border-slate-100 dark:border-slate-800/50 flex items-center justify-between text-xs">
                <span className="font-medium text-slate-600 dark:text-slate-300">
                  By {article.author || 'Md Shamim'}
                </span>
                <span className="inline-flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
                  Read Guide
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </a>
          ))}
        </div>
      )}
    </section>
  );
};
