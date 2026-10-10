import React, { useState } from "react";
import { BookOpen, Search, Filter, Sparkles, Folder } from "lucide-react";
import { ARTICLES } from "@/src/data/articles";
import categoriesData from "@/src/data/categories.json";
import { ArticleCard } from "@/src/components/ArticleCard";
import { Breadcrumbs } from "@/src/components/Breadcrumbs";
import { useTheme } from "@/src/context/ThemeContext";

interface ArticlesViewProps {
  onNavigate: (route: string) => void;
  initialCategory?: string;
}

export const ArticlesView: React.FC<ArticlesViewProps> = ({
  onNavigate,
  initialCategory = "all",
}) => {
  const { isDark } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredArticles = ARTICLES.filter((article) => {
    const matchesCategory =
      selectedCategory === "all" ||
      article.categorySlug === selectedCategory ||
      article.category.toLowerCase().includes(selectedCategory.toLowerCase());
    const normalized = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !normalized ||
      article.title.toLowerCase().includes(normalized) ||
      article.description.toLowerCase().includes(normalized) ||
      article.tags.some((t) => t.toLowerCase().includes(normalized)) ||
      article.primaryKeyword.toLowerCase().includes(normalized);

    return matchesCategory && matchesSearch;
  });

  return (
    <div
      className={`min-h-screen pb-20 transition-colors duration-200 ${
        isDark ? "bg-[#060d1b] text-slate-100" : "bg-[#f8fafc] text-slate-900"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <Breadcrumbs
          items={[{ name: "Articles", url: "/articles/" }]}
          onNavigate={onNavigate}
        />

        {/* Articles Header */}
        <div
          className={`rounded-3xl p-6 sm:p-10 border shadow-sm mt-4 mb-8 transition-colors duration-200 ${
            isDark ? "bg-[#0d162d] border-slate-800 text-white" : "bg-white border-slate-200/80 text-slate-900"
          }`}
        >
          <div className="max-w-3xl">
            <div
              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full mb-3 ${
                isDark ? "bg-blue-950/70 text-blue-400 border border-blue-800/50" : "bg-blue-50 text-blue-700"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>AINOVEX Publication</span>
            </div>
            <h1
              className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              AI Guides, Articles &amp; Comparisons
            </h1>
            <p
              className={`text-sm sm:text-base mt-3 leading-relaxed ${
                isDark ? "text-slate-400" : "text-slate-600"
              }`}
            >
              Explore in-depth, human-reviewed articles covering free AI tools, student learning workflows,
              creative prompt engineering, coding assistants, and productivity software.
            </p>
          </div>

          {/* Search bar & filter bar */}
          <div
            className={`mt-8 pt-6 border-t flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between ${
              isDark ? "border-slate-800" : "border-slate-100"
            }`}
          >
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles by title, keyword, or tool..."
                className={`w-full rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm border transition-colors focus:outline-none focus:border-blue-500 ${
                  isDark
                    ? "bg-[#080f1e] border-slate-700 text-white placeholder:text-slate-500"
                    : "bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:bg-white"
                }`}
              />
            </div>

            <div className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Showing <strong className={isDark ? "text-white" : "text-slate-800"}>{filteredArticles.length}</strong> published guides
            </div>
          </div>

          {/* Category Filter Chips */}
          <div
            className={`flex flex-wrap items-center gap-2 mt-4 pt-4 border-t ${
              isDark ? "border-slate-800" : "border-slate-100"
            }`}
          >
            <span className={`text-xs font-semibold flex items-center gap-1 mr-1 ${isDark ? "text-slate-400" : "text-slate-400"}`}>
              <Filter className="w-3.5 h-3.5" /> Category:
            </span>
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                selectedCategory === "all"
                  ? "bg-blue-600 text-white"
                  : isDark
                    ? "bg-[#080f1e] text-slate-300 hover:bg-slate-800"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All Topics ({ARTICLES.length})
            </button>
            {categoriesData.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                  selectedCategory === cat.slug
                    ? "bg-blue-600 text-white"
                    : isDark
                      ? "bg-[#080f1e] text-slate-300 hover:bg-slate-800"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Articles Content */}
        {ARTICLES.length === 0 ? (
          <div
            className={`rounded-3xl p-10 sm:p-16 text-center border shadow-sm max-w-2xl mx-auto my-8 transition-colors duration-200 ${
              isDark ? "bg-[#0d162d] border-slate-800 text-white" : "bg-white border-slate-200/80 text-slate-900"
            }`}
          >
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm ${
                isDark ? "bg-blue-950/70 text-blue-400" : "bg-blue-50 text-blue-600"
              }`}
            >
              <BookOpen className="w-7 h-7" />
            </div>
            <h2
              className={`text-xl sm:text-2xl font-bold tracking-tight ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              No articles published yet.
            </h2>
            <p
              className={`text-xs sm:text-sm mt-3 leading-relaxed max-w-md mx-auto ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              We are currently researching, testing, and verifying AI tools to bring you high-quality,
              factual guides and tutorials. Please check back soon or explore our tool directory in the meantime.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => onNavigate("/ai-tools/")}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer shadow-sm flex items-center gap-1.5 active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                <span>Explore AI Tools</span>
              </button>
              <button
                onClick={() => onNavigate("/categories/")}
                className={`px-5 py-2.5 text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 ${
                  isDark
                    ? "bg-[#142040] text-slate-200 hover:bg-[#1c2c58] border border-slate-700/80"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-800"
                }`}
              >
                <Folder className="w-4 h-4" />
                <span>Browse Categories</span>
              </button>
            </div>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div
            className={`rounded-3xl p-12 text-center border ${
              isDark ? "bg-[#0d162d] border-slate-800 text-white" : "bg-white border-slate-200/80 text-slate-900"
            }`}
          >
            <p className="text-sm text-slate-400">No articles matched your criteria.</p>
            <button
              onClick={() => {
                setSelectedCategory("all");
                setSearchQuery("");
              }}
              className="mt-4 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredArticles.map((article) => (
              <ArticleCard
                key={article.slug}
                article={article}
                onSelect={(slug) => onNavigate(`/articles/${slug}/`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
