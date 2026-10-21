import React from 'react';
import { ArrowRight, Sparkles, BookOpen } from 'lucide-react';
import { Category, Tool, Article } from '../types';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { getToolLogo } from '../data/toolLogos';

interface CategoryDetailViewProps {
  slug: string;
  categories: Category[];
  tools: Tool[];
  articles: Article[];
  onNavigate: (path: string) => void;
  onSelectTool: (tool: Tool) => void;
  onSelectArticle: (slug: string) => void;
}

export const CategoryDetailView: React.FC<CategoryDetailViewProps> = ({
  slug,
  categories,
  tools,
  articles,
  onNavigate,
  onSelectTool,
  onSelectArticle,
}) => {
  const category = categories.find((c) => c.slug === slug);
  const catTools = tools.filter((t) => t.category === slug);
  const catArticles = articles.filter((a) => a.category === slug && a.isPublished);

  if (!category) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Category Not Found</h2>
        <a
          href="/categories/"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('/categories/');
          }}
          className="px-5 py-2.5 rounded-full bg-blue-600 text-white text-sm font-semibold inline-block hover:bg-blue-500"
        >
          View All Categories
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs
        items={[{ label: 'Categories', path: '/categories/' }, { label: category.name }]}
        onNavigate={onNavigate}
      />

      <div className="py-8 border-b border-slate-200 dark:border-slate-800/80 mb-10 text-center max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-3">
          {category.name}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          {category.description}
        </p>
      </div>

      {/* Tools Section */}
      <div className="mb-14">
        <div className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white mb-6">
          <Sparkles className="w-5 h-5 text-sky-500 dark:text-sky-400" />
          <span>Recommended AI Tools in {category.name}</span>
        </div>

        {catTools.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-sm">
            No specific tools registered under this category yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {catTools.map((tool) => (
              <div
                key={tool.id}
                onClick={() => onSelectTool(tool)}
                className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-blue-500/40 shadow-sm hover:shadow-md cursor-pointer group transition-all text-center"
              >
                <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center font-bold text-sky-500 dark:text-sky-400 text-lg mb-3 overflow-hidden shadow-sm p-1 border border-slate-200/60 dark:border-slate-700/60">
                  <img 
                    src={getToolLogo(tool.id, tool.icon)} 
                    alt={tool.name} 
                    className="w-full h-full object-contain rounded-xl" 
                    onError={(e) => {
                      const fallback = getToolLogo(tool.id);
                      if (fallback && e.currentTarget.src !== fallback) {
                        e.currentTarget.src = fallback;
                      }
                    }}
                  />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 mb-1">
                  {tool.name}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-4">{tool.description}</p>
                <a
                  href={tool.url}
                  target="_blank"
                  rel="nofollow noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-blue-600 dark:bg-slate-800 dark:hover:bg-blue-600 transition-colors shadow-sm"
                >
                  <span>Visit Tool</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Articles Section */}
      <div>
        <div className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white mb-6">
          <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <span>Guides & Tutorials for {category.name}</span>
        </div>

        {catArticles.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-sm">
            Our editorial desk is preparing guides for this category.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {catArticles.map((article) => (
              <a
                key={article.id}
                href={`/blog/${article.slug}/`}
                onClick={(e) => {
                  e.preventDefault();
                  onSelectArticle(article.slug);
                }}
                className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-blue-500/40 shadow-sm hover:shadow-md cursor-pointer group transition-all block"
              >
                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 mb-2">
                  {article.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-4">
                  {article.excerpt}
                </p>
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 inline-flex items-center gap-1">
                  Read Guide <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
