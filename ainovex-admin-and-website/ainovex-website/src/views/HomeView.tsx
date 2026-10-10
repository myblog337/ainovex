import React from "react";
import {
  Sparkles,
  ArrowRight,
  FileText,
  BookOpen,
} from "lucide-react";
import { Hero } from "@/src/components/Hero";
import { CategoryGrid } from "@/src/components/CategoryGrid";
import { ToolCard, ToolItem } from "@/src/components/ToolCard";
import { ArticleCard } from "@/src/components/ArticleCard";
import toolsData from "@/src/data/tools.json";
import { getFeaturedHomeArticles } from "@/src/data/articles";
import { JsonLd } from "@/src/components/JsonLd";
import { useTheme } from "@/src/context/ThemeContext";

interface HomeViewProps {
  onNavigate: (route: string) => void;
  onOpenSearch: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate, onOpenSearch }) => {
  const { isDark } = useTheme();
  const featuredTools: ToolItem[] = (toolsData as ToolItem[]).slice(0, 5);
  const homeArticles = getFeaturedHomeArticles(5);

  const handleSearchSubmit = (_query: string) => {
    onOpenSearch();
  };

  const handleTagClick = (_tag: string) => {
    onOpenSearch();
  };

  return (
    <div className="transition-colors duration-200">
      <JsonLd type="website" />

      {/* 1. Hero Section matching reference image 100% */}
      <Hero onSearch={handleSearchSubmit} onSelectTag={handleTagClick} />

      {/* 2. Browse by Category Section */}
      <CategoryGrid
        onSelectCategory={(slug) =>
          onNavigate(slug === "all" ? "/categories/" : `/${slug}/`)
        }
      />

      {/* 3. Featured AI Tools Section */}
      <section
        className={`py-14 border-b transition-colors duration-200 ${
          isDark ? "bg-[#060d1b] border-slate-800/80" : "bg-white border-slate-100"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <div className="flex items-center gap-2 text-blue-600 mb-1">
                <Sparkles className="w-5 h-5 text-blue-500 fill-blue-500/20" />
                <h2
                  className={`text-xl sm:text-2xl font-bold tracking-tight ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  Featured AI Tools
                </h2>
              </div>
              <p
                className={`text-xs sm:text-sm max-w-xl ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                Handpicked top AI tools to help you work faster, create better and achieve more.
              </p>
            </div>
            <button
              onClick={() => onNavigate("/ai-tools/")}
              className={`text-xs sm:text-sm font-semibold flex items-center gap-1 group shrink-0 cursor-pointer transition-colors ${
                isDark ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"
              }`}
            >
              <span>View All Tools</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
            {featuredTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} onTagClick={handleTagClick} />
            ))}
          </div>
        </div>
      </section>

      {/* 4. Latest Blog & News Section */}
      <section
        className={`py-14 border-b transition-colors duration-200 ${
          isDark ? "bg-[#080f20] border-slate-800/80" : "bg-[#f8fafc] border-slate-200/60"
        }`}
        id="latest-blog-news"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <div className="flex items-center gap-2 text-blue-600 mb-1">
                <FileText className="w-5 h-5 text-blue-500" />
                <h2
                  className={`text-xl sm:text-2xl font-bold tracking-tight ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  Latest Blog &amp; News
                </h2>
              </div>
              <p
                className={`text-xs sm:text-sm max-w-xl ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                Stay updated with the latest AI news, tips, tutorials and industry trends.
              </p>
            </div>
            <button
              onClick={() => onNavigate("/articles/")}
              className={`text-xs sm:text-sm font-semibold flex items-center gap-1 group shrink-0 cursor-pointer transition-colors ${
                isDark ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"
              }`}
            >
              <span>View All Articles</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {homeArticles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
              {homeArticles.map((article) => (
                <ArticleCard
                  key={article.slug}
                  article={article}
                  onSelect={(slug) => onNavigate(`/articles/${slug}/`)}
                />
              ))}
            </div>
          ) : (
            <div
              className={`rounded-3xl p-8 sm:p-12 border shadow-sm text-center max-w-3xl mx-auto transition-colors duration-200 ${
                isDark
                  ? "bg-[#0d162d] border-slate-800 text-white"
                  : "bg-white border-slate-200/80 text-slate-900"
              }`}
            >
              <div
                className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 shadow-sm ${
                  isDark ? "bg-blue-950/70 text-blue-400" : "bg-blue-50 text-blue-600"
                }`}
              >
                <BookOpen className="w-6 h-6" />
              </div>
              <div
                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-3 ${
                  isDark
                    ? "bg-slate-800 text-slate-300 border border-slate-700"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                Editorial Desk
              </div>
              <h3
                className={`text-lg sm:text-xl font-bold tracking-tight ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                No articles published yet.
              </h3>
              <p
                className={`text-xs sm:text-sm max-w-lg mx-auto mt-2 leading-relaxed ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                Stay updated with upcoming AI news, tips, tutorials, and industry trends. Our editorial
                team is currently researching and vetting the first set of guides, comparisons, and workflows.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => onNavigate("/ai-tools/")}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-colors cursor-pointer shadow-sm active:scale-95"
                >
                  Explore AI Tools Directory
                </button>
                <button
                  onClick={() => onNavigate("/articles/")}
                  className={`text-xs font-semibold px-5 py-2.5 rounded-xl transition-colors cursor-pointer ${
                    isDark
                      ? "bg-[#142040] text-slate-200 hover:bg-[#1a2b58] border border-slate-700/80"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-800"
                  }`}
                >
                  View Blog Archive
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
