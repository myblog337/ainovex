import React, { useState, useMemo } from 'react';
import { Search, Calendar, Clock, ArrowRight, BookOpen } from 'lucide-react';
import { Article, Category } from '../types';
import { Breadcrumbs } from '../components/Breadcrumbs';

interface BlogViewProps {
  articles: Article[];
  categories: Category[];
  onSelectArticle: (slug: string) => void;
  onNavigate: (path: string) => void;
}

export const BlogView: React.FC<BlogViewProps> = ({
  articles,
  categories,
  onSelectArticle,
  onNavigate,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const published = useMemo(() => articles.filter((a) => a.isPublished), [articles]);

  const filteredArticles = useMemo(() => {
    return published.filter((a) => {
      const matchesSearch =
        !search ||
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.excerpt.toLowerCase().includes(search.toLowerCase()) ||
        a.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));

      const matchesCat =
        selectedCategory === 'all' || a.category === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [published, search, selectedCategory]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs items={[{ label: 'Blog & Articles' }]} onNavigate={onNavigate} />

      {/* Banner */}
      <div className="py-6 text-center max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
          AI Articles, Tutorials & Reviews
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          In-depth guides, workflows, and tool comparisons to accelerate your learning and productivity.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm mb-8 space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search guides by title, topic, or keyword..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white font-semibold'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            All Topics ({published.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id || cat.slug}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat.slug
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Articles Grid */}
      {filteredArticles.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
          <BookOpen className="w-8 h-8 mx-auto text-slate-400 mb-2" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">No guides found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Try searching for other topics or reset the category filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article) => (
            <a
              key={article.id || article.slug}
              href={`/blog/${article.slug}`}
              onClick={(e) => {
                e.preventDefault();
                onSelectArticle(article.slug);
              }}
              className="group flex flex-col justify-between rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 overflow-hidden hover:border-blue-500/40 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl shadow-sm cursor-pointer block"
            >
              <div>
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

                  <h2 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 mb-2 leading-snug">
                    {article.title}
                  </h2>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {article.excerpt}
                  </p>
                </div>
              </div>

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
    </div>
  );
};
