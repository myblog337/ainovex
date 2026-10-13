import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Sparkles, BookOpen, ExternalLink, ArrowRight } from 'lucide-react';
import { Tool, Article, Category } from '../types';
import { getToolLogo } from '../data/toolLogos';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  tools: Tool[];
  articles: Article[];
  categories: Category[];
  onSelectTool: (tool: Tool) => void;
  onSelectArticle: (slug: string) => void;
  onSelectCategory: (slug: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  tools,
  articles,
  categories,
  onSelectTool,
  onSelectArticle,
  onSelectCategory,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  const filteredTools = q
    ? tools.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q))
      )
    : tools.slice(0, 4);

  const filteredArticles = q
    ? articles.filter(
        (a) =>
          a.isPublished &&
          (a.title.toLowerCase().includes(q) ||
            a.excerpt.toLowerCase().includes(q) ||
            a.tags.some((tag) => tag.toLowerCase().includes(q)))
      )
    : articles.filter((a) => a.isPublished).slice(0, 3);

  const filteredCategories = q
    ? categories.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q)
      )
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl rounded-2xl bg-white border border-slate-300 shadow-2xl overflow-hidden flex flex-col max-h-[80vh] dark:bg-slate-900 dark:border-slate-700"
      >
        {/* Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search AI tools, articles, categories..."
            className="w-full bg-transparent text-slate-900 placeholder-slate-400 text-base focus:outline-none dark:text-white dark:placeholder-slate-500"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="ml-2 text-xs px-2 py-1 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:text-white cursor-pointer"
          >
            ESC
          </button>
        </div>

        {/* Search Results Area */}
        <div className="overflow-y-auto p-4 space-y-6">
          {/* Categories matches if any */}
          {filteredCategories.length > 0 && (
            <div>
              <div className="text-[11px] font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400 mb-2">
                Categories
              </div>
              <div className="flex flex-wrap gap-2">
                {filteredCategories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      onSelectCategory(c.slug);
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-blue-50 text-blue-600 border border-slate-200 flex items-center gap-1.5 dark:bg-slate-800 dark:hover:bg-blue-600/30 dark:text-blue-400 dark:border-slate-700 cursor-pointer"
                  >
                    <span>{c.name}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* AI Tools */}
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400 mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
              <span>AI Tools ({filteredTools.length})</span>
            </div>
            {filteredTools.length === 0 ? (
              <p className="text-xs text-slate-400 py-2">No tools match your query.</p>
            ) : (
              <div className="space-y-2">
                {filteredTools.map((tool) => (
                  <div
                    key={tool.id}
                    onClick={() => {
                      onSelectTool(tool);
                      onClose();
                    }}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 cursor-pointer transition-colors dark:bg-slate-800/40 dark:hover:bg-slate-800 dark:border-slate-700/60"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden flex items-center justify-center font-bold text-sky-600 dark:text-sky-400 text-xs p-1 border border-slate-200/60 dark:border-slate-700/60">
                        <img 
                          src={getToolLogo(tool.id, tool.icon)} 
                          alt={tool.name} 
                          className="w-full h-full object-contain rounded-md" 
                          onError={(e) => {
                            const fallback = getToolLogo(tool.id);
                            if (fallback && e.currentTarget.src !== fallback) {
                              e.currentTarget.src = fallback;
                            }
                          }}
                        />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900 dark:text-white">
                          {tool.name}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                          {tool.description}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {tool.categoryName || tool.category}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Articles */}
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400 mb-2.5">
              <BookOpen className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Articles & Guides ({filteredArticles.length})</span>
            </div>
            {filteredArticles.length === 0 ? (
              <p className="text-xs text-slate-400 py-2">No articles match your query.</p>
            ) : (
              <div className="space-y-2">
                {filteredArticles.map((article) => (
                  <div
                    key={article.id}
                    onClick={() => {
                      onSelectArticle(article.slug);
                      onClose();
                    }}
                    className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 cursor-pointer transition-colors dark:bg-slate-800/40 dark:hover:bg-slate-800 dark:border-slate-700/60"
                  >
                    <div className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-1">
                      {article.title}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-1">
                      {article.excerpt}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
