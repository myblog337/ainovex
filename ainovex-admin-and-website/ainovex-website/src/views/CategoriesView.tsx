import React from "react";
import { ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import categoriesData from "@/src/data/categories.json";
import toolsData from "@/src/data/tools.json";
import { ToolCard, ToolItem } from "@/src/components/ToolCard";
import { Breadcrumbs } from "@/src/components/Breadcrumbs";
import { useTheme } from "@/src/context/ThemeContext";

interface CategoriesViewProps {
  currentCategorySlug?: string;
  onNavigate: (route: string) => void;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  currentCategorySlug,
  onNavigate,
}) => {
  const { isDark } = useTheme();

  const activeCategory = currentCategorySlug
    ? categoriesData.find((c) => c.slug === currentCategorySlug)
    : null;

  if (activeCategory) {
    const categoryTools = (toolsData as ToolItem[]).filter(
      (t) => t.category === activeCategory.slug
    );

    return (
      <div
        className={`min-h-screen pb-20 transition-colors duration-200 ${
          isDark ? "bg-[#060d1b] text-slate-100" : "bg-[#f8fafc] text-slate-900"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <Breadcrumbs
            items={[
              { name: "Categories", url: "/categories/" },
              { name: activeCategory.name, url: `/${activeCategory.slug}/` },
            ]}
            onNavigate={onNavigate}
          />

          {/* Category Detail Hero */}
          <div
            className={`rounded-3xl p-6 sm:p-10 border shadow-sm mt-4 mb-8 transition-colors duration-200 ${
              isDark ? "bg-[#0d162d] border-slate-800 text-white" : "bg-white border-slate-200/80 text-slate-900"
            }`}
          >
            <div className="max-w-3xl">
              <span
                className={`text-xs font-semibold px-3 py-1 rounded-full ${
                  isDark ? "bg-blue-950/70 text-blue-400 border border-blue-800/50" : "bg-blue-50 text-blue-700"
                }`}
              >
                AI Category Directory
              </span>
              <h1
                className={`text-3xl sm:text-4xl font-extrabold tracking-tight mt-3 ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                {activeCategory.name} AI Tools
              </h1>
              <p
                className={`text-sm sm:text-base mt-3 leading-relaxed ${
                  isDark ? "text-slate-400" : "text-slate-600"
                }`}
              >
                {activeCategory.description} Compare verified software, evaluate free tier limits, and launch official apps directly.
              </p>
            </div>
          </div>

          {/* Tools under this category */}
          {categoryTools.length > 0 ? (
            <div className="mb-14">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-500" />
                  <h2
                    className={`text-xl font-bold ${
                      isDark ? "text-white" : "text-slate-900"
                    }`}
                  >
                    Verified {activeCategory.name} Software ({categoryTools.length})
                  </h2>
                </div>
                <button
                  onClick={() => onNavigate("/ai-tools/")}
                  className={`text-xs sm:text-sm font-semibold flex items-center gap-1 cursor-pointer ${
                    isDark ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"
                  }`}
                >
                  <span>All Tools Directory</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {categoryTools.map((tool) => (
                  <ToolCard key={tool.id} tool={tool} />
                ))}
              </div>
            </div>
          ) : (
            <div
              className={`rounded-2xl p-12 text-center border my-8 ${
                isDark ? "bg-[#0d162d] border-slate-800 text-white" : "bg-white border-slate-200/80 text-slate-900"
              }`}
            >
              <p className="text-sm text-slate-400">
                Tools for {activeCategory.name} are currently undergoing hands-on verification by our editorial team.
              </p>
              <button
                onClick={() => onNavigate("/ai-tools/")}
                className="mt-4 px-5 py-2.5 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 cursor-pointer"
              >
                Browse All Tools
              </button>
            </div>
          )}

          {/* Category Trust & Methodology Info */}
          <div
            className={`rounded-3xl p-6 sm:p-10 mt-10 border transition-colors duration-200 ${
              isDark
                ? "bg-gradient-to-r from-slate-900 to-[#0b1731] border-slate-800 text-white"
                : "bg-gradient-to-r from-slate-900 to-[#0b1731] border-transparent text-white shadow-xl"
            }`}
          >
            <h3 className="text-lg sm:text-xl font-bold">How We Evaluate {activeCategory.name} Tools</h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
              Every tool featured under {activeCategory.name} is tested for pricing transparency, free-tier availability, output stability, and user experience. We cite official rates with zero sponsored bias.
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-slate-300">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Hands-on tested</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Verified official links</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Transparent free tier info</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // General Categories Index
  return (
    <div
      className={`min-h-screen pb-20 transition-colors duration-200 ${
        isDark ? "bg-[#060d1b] text-slate-100" : "bg-[#f8fafc] text-slate-900"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <Breadcrumbs
          items={[{ name: "Categories", url: "/categories/" }]}
          onNavigate={onNavigate}
        />

        <div
          className={`rounded-3xl p-6 sm:p-10 border shadow-sm mt-4 mb-8 transition-colors duration-200 ${
            isDark ? "bg-[#0d162d] border-slate-800 text-white" : "bg-white border-slate-200/80 text-slate-900"
          }`}
        >
          <div className="max-w-3xl">
            <span
              className={`text-xs font-semibold px-3 py-1 rounded-full ${
                isDark ? "bg-blue-950/70 text-blue-400 border border-blue-800/50" : "bg-blue-50 text-blue-700"
              }`}
            >
              Taxonomy &amp; Classification
            </span>
            <h1
              className={`text-3xl sm:text-4xl font-extrabold tracking-tight mt-3 ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              Browse AI Categories
            </h1>
            <p
              className={`text-sm sm:text-base mt-3 leading-relaxed ${
                isDark ? "text-slate-400" : "text-slate-600"
              }`}
            >
              Explore our organized taxonomy of artificial intelligence software and workflows.
              Each category hub features verified tools, comparison benchmarks, and factual pricing details.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoriesData.map((cat) => {
            const toolCount = (toolsData as ToolItem[]).filter(
              (t) => t.category === cat.slug
            ).length;

            return (
              <button
                key={cat.id}
                onClick={() => onNavigate(`/${cat.slug}/`)}
                className={`rounded-2xl p-6 border shadow-sm hover:shadow-md transition-all text-left flex flex-col justify-between group cursor-pointer ${
                  isDark
                    ? "bg-[#0d162d] border-slate-800 hover:border-blue-500/50 hover:bg-[#111c38]"
                    : "bg-white border-slate-200/80 hover:border-blue-300"
                }`}
              >
                <div>
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg mb-4 ${
                      isDark ? "bg-slate-800 text-blue-400" : cat.iconBg
                    }`}
                  >
                    ⚡
                  </div>
                  <h3
                    className={`text-lg font-bold transition-colors ${
                      isDark ? "text-white group-hover:text-blue-400" : "text-slate-900 group-hover:text-blue-600"
                    }`}
                  >
                    {cat.name}
                  </h3>
                  <p
                    className={`text-xs sm:text-sm mt-2 leading-relaxed ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    {cat.description}
                  </p>
                </div>

                <div
                  className={`mt-6 pt-4 border-t flex items-center justify-between text-xs ${
                    isDark ? "border-slate-800 text-slate-400" : "border-slate-100 text-slate-400"
                  }`}
                >
                  <span>
                    {toolCount > 0 ? `${toolCount} Verified Tools` : "Curated Category"}
                  </span>
                  <span className="text-blue-500 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Explore <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
