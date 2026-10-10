import React, { useState, useEffect, useRef } from "react";
import { Search, X, ArrowRight, ExternalLink, Sparkles, Folder, FileText } from "lucide-react";
import toolsData from "@/src/data/tools.json";
import categoriesData from "@/src/data/categories.json";
import { ARTICLES } from "@/src/data/articles";
import { useTheme } from "@/src/context/ThemeContext";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCategory: (slug: string) => void;
  onSelectArticle?: (slug: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectCategory,
  onSelectArticle,
}) => {
  const { isDark } = useTheme();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setQuery("");
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const normalized = query.toLowerCase().trim();

  const matchingTools = normalized
    ? toolsData.filter(
        (t) =>
          t.name.toLowerCase().includes(normalized) ||
          t.description.toLowerCase().includes(normalized) ||
          t.tags.some((tag) => tag.toLowerCase().includes(normalized))
      )
    : toolsData.slice(0, 5);

  const matchingCategories = normalized
    ? categoriesData.filter(
        (c) =>
          c.name.toLowerCase().includes(normalized) ||
          c.description.toLowerCase().includes(normalized) ||
          c.slug.toLowerCase().includes(normalized)
      )
    : categoriesData.slice(0, 4);

  const matchingArticles = normalized
    ? ARTICLES.filter(
        (a) =>
          a.title.toLowerCase().includes(normalized) ||
          a.description.toLowerCase().includes(normalized) ||
          a.primaryKeyword.toLowerCase().includes(normalized) ||
          a.tags.some((tag) => tag.toLowerCase().includes(normalized))
      )
    : [];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="search-modal-title"
      className="fixed inset-0 z-50 flex items-start justify-center pt-4 sm:pt-20 px-3 sm:px-4 bg-slate-950/80 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-2xl rounded-2xl shadow-2xl border overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[82vh] animate-in fade-in zoom-in-95 duration-150 ${
          isDark
            ? "bg-[#0a1224] border-slate-800 text-white"
            : "bg-white border-slate-100 text-slate-800"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search header */}
        <div
          className={`flex items-center px-4 py-3.5 border-b gap-3 ${
            isDark ? "border-slate-800 bg-[#080f1e]" : "border-slate-100 bg-white"
          }`}
        >
          <Search className="w-5 h-5 text-blue-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            id="search-modal-title"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search AI tools, categories, software, tags..."
            className={`w-full bg-transparent text-base focus:outline-none ${
              isDark
                ? "text-white placeholder:text-slate-500"
                : "text-slate-800 placeholder:text-slate-400"
            }`}
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className={`p-1 rounded-lg ${
                isDark ? "text-slate-400 hover:text-white hover:bg-slate-800" : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              }`}
              aria-label="Clear query"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className={`text-xs font-semibold px-2.5 py-1 rounded-lg cursor-pointer ${
              isDark
                ? "text-slate-300 bg-slate-800 hover:bg-slate-700"
                : "text-slate-500 bg-slate-100 hover:bg-slate-200"
            }`}
          >
            ESC
          </button>
        </div>

        {/* Results Area */}
        <div className="overflow-y-auto p-4 space-y-6">
          {matchingArticles.length > 0 && (
            <div>
              <div
                className={`flex items-center justify-between text-xs font-semibold uppercase tracking-wider mb-2.5 px-2 ${
                  isDark ? "text-slate-400" : "text-slate-400"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-500" /> Articles
                </span>
                <span>{matchingArticles.length} results</span>
              </div>
              <div className="space-y-1.5">
                {matchingArticles.map((article) => (
                  <button
                    key={article.slug}
                    onClick={() => {
                      onSelectArticle?.(article.slug);
                      onClose();
                    }}
                    className={`w-full text-left flex items-center justify-between p-2.5 rounded-xl transition-colors group border cursor-pointer ${
                      isDark
                        ? "border-transparent hover:border-slate-800 hover:bg-slate-800/60"
                        : "border-transparent hover:border-slate-100 hover:bg-slate-50"
                    }`}
                  >
                    <div>
                      <div
                        className={`text-sm font-semibold group-hover:text-blue-500 line-clamp-1 ${
                          isDark ? "text-white" : "text-slate-900"
                        }`}
                      >
                        {article.title}
                      </div>
                      <p
                        className={`text-xs line-clamp-1 mt-0.5 ${
                          isDark ? "text-slate-400" : "text-slate-500"
                        }`}
                      >
                        {article.description}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 shrink-0 ml-3" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* AI Tools Section */}
          <div>
            <div
              className={`flex items-center justify-between text-xs font-semibold uppercase tracking-wider mb-2.5 px-2 ${
                isDark ? "text-slate-400" : "text-slate-400"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-500" /> AI Tools
              </span>
              <span>{matchingTools.length} results</span>
            </div>
            {matchingTools.length === 0 ? (
              <p
                className={`text-xs px-2 py-1 ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                No AI tools matching &quot;{query}&quot;
              </p>
            ) : (
              <div className="space-y-1.5">
                {matchingTools.map((tool) => (
                  <a
                    key={tool.id}
                    href={tool.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center justify-between p-2.5 rounded-xl transition-colors group border ${
                      isDark
                        ? "border-transparent hover:border-slate-800 hover:bg-slate-800/60"
                        : "border-transparent hover:border-slate-100 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${tool.iconColor}`}
                      >
                        {tool.name.slice(0, 2)}
                      </div>
                      <div>
                        <div
                          className={`text-sm font-semibold group-hover:text-blue-500 flex items-center gap-1.5 ${
                            isDark ? "text-white" : "text-slate-900"
                          }`}
                        >
                          {tool.name}
                          <span
                            className={`text-[11px] font-normal px-1.5 py-0.2 rounded ${
                              isDark
                                ? "bg-slate-800 text-slate-300"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {tool.pricing}
                          </span>
                        </div>
                        <p
                          className={`text-xs line-clamp-1 ${
                            isDark ? "text-slate-400" : "text-slate-500"
                          }`}
                        >
                          {tool.description}
                        </p>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-500 shrink-0 ml-2" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* AI Tool Categories Section */}
          <div>
            <div
              className={`flex items-center justify-between text-xs font-semibold uppercase tracking-wider mb-2.5 px-2 ${
                isDark ? "text-slate-400" : "text-slate-400"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Folder className="w-3.5 h-3.5 text-indigo-500" /> Tool Categories
              </span>
              <span>{matchingCategories.length} categories</span>
            </div>
            {matchingCategories.length === 0 ? (
              <p
                className={`text-xs px-2 py-1 ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                No categories found matching &quot;{query}&quot;
              </p>
            ) : (
              <div className="space-y-1.5">
                {matchingCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      onSelectCategory(cat.slug);
                      onClose();
                    }}
                    className={`w-full text-left flex items-center justify-between p-2.5 rounded-xl transition-colors group border cursor-pointer ${
                      isDark
                        ? "border-transparent hover:border-slate-800 hover:bg-slate-800/60"
                        : "border-transparent hover:border-slate-100 hover:bg-slate-50"
                    }`}
                  >
                    <div>
                      <h4
                        className={`text-sm font-semibold group-hover:text-blue-500 line-clamp-1 ${
                          isDark ? "text-white" : "text-slate-900"
                        }`}
                      >
                        {cat.name}
                      </h4>
                      <p
                        className={`text-xs line-clamp-1 mt-0.5 ${
                          isDark ? "text-slate-400" : "text-slate-500"
                        }`}
                      >
                        {cat.description}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-transform shrink-0 ml-3" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer shortcuts */}
        <div
          className={`px-4 py-2.5 border-t flex items-center justify-between text-xs ${
            isDark
              ? "bg-[#070e1b] border-slate-800 text-slate-400"
              : "bg-slate-50 border-slate-100 text-slate-500"
          }`}
        >
          <span>Explore 12+ verified AI tools across 9 categories</span>
          <button
            onClick={() => {
              onSelectCategory("all");
              onClose();
            }}
            className="text-blue-500 font-medium hover:underline cursor-pointer"
          >
            View all categories &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};
