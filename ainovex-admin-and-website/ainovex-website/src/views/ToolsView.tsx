import React, { useState } from "react";
import { Search, Sparkles, Filter } from "lucide-react";
import toolsData from "@/src/data/tools.json";
import categoriesData from "@/src/data/categories.json";
import { ToolCard, ToolItem } from "@/src/components/ToolCard";
import { Breadcrumbs } from "@/src/components/Breadcrumbs";
import { useTheme } from "@/src/context/ThemeContext";

interface ToolsViewProps {
  onNavigate: (route: string) => void;
}

export const ToolsView: React.FC<ToolsViewProps> = ({ onNavigate }) => {
  const { isDark } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedPricing, setSelectedPricing] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredTools = (toolsData as ToolItem[]).filter((tool) => {
    const matchesCategory =
      selectedCategory === "all" || tool.category === selectedCategory;
    const matchesPricing =
      selectedPricing === "all" ||
      (selectedPricing === "free" && tool.freeTier) ||
      (selectedPricing === "paid" && !tool.freeTier) ||
      tool.pricing.toLowerCase() === selectedPricing.toLowerCase();
    const normalized = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !normalized ||
      tool.name.toLowerCase().includes(normalized) ||
      tool.description.toLowerCase().includes(normalized) ||
      tool.tags.some((t) => t.toLowerCase().includes(normalized));

    return matchesCategory && matchesPricing && matchesSearch;
  });

  return (
    <div
      className={`min-h-screen pb-20 transition-colors duration-200 ${
        isDark ? "bg-[#060d1b] text-slate-100" : "bg-[#f8fafc] text-slate-900"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <Breadcrumbs
          items={[{ name: "AI Tools", url: "/ai-tools/" }]}
          onNavigate={onNavigate}
        />

        {/* Directory Header */}
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
              <Sparkles className="w-3.5 h-3.5" />
              <span>Curated Directory</span>
            </div>
            <h1
              className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              AI Tools Directory
            </h1>
            <p
              className={`text-sm sm:text-base mt-3 leading-relaxed ${
                isDark ? "text-slate-400" : "text-slate-600"
              }`}
            >
              Explore verified artificial intelligence software across writing, design, video editing,
              coding, and productivity. Every tool includes factual pricing details and direct links.
            </p>
          </div>

          {/* Search & Filter Bar */}
          <div
            className={`mt-8 pt-6 border-t flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between ${
              isDark ? "border-slate-800" : "border-slate-100"
            }`}
          >
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tools by name, tag, or function..."
                className={`w-full rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm border transition-colors focus:outline-none focus:border-blue-500 ${
                  isDark
                    ? "bg-[#080f1e] border-slate-700 text-white placeholder:text-slate-500"
                    : "bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:bg-white"
                }`}
              />
            </div>

            {/* Pricing Tabs */}
            <div
              className={`flex items-center gap-1.5 p-1 rounded-xl text-xs font-medium shrink-0 border ${
                isDark
                  ? "bg-[#080f1e] border-slate-700/80 text-slate-300"
                  : "bg-slate-100 border-transparent text-slate-700"
              }`}
            >
              <button
                onClick={() => setSelectedPricing("all")}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  selectedPricing === "all"
                    ? isDark
                      ? "bg-blue-600 text-white shadow-xs font-semibold"
                      : "bg-white text-slate-900 shadow-sm font-semibold"
                    : isDark
                      ? "text-slate-400 hover:text-white"
                      : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All Pricing
              </button>
              <button
                onClick={() => setSelectedPricing("free")}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  selectedPricing === "free"
                    ? isDark
                      ? "bg-emerald-600 text-white shadow-xs font-semibold"
                      : "bg-white text-emerald-700 shadow-sm font-semibold"
                    : isDark
                      ? "text-slate-400 hover:text-white"
                      : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Free Tier
              </button>
              <button
                onClick={() => setSelectedPricing("paid")}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  selectedPricing === "paid"
                    ? isDark
                      ? "bg-blue-600 text-white shadow-xs font-semibold"
                      : "bg-white text-slate-900 shadow-sm font-semibold"
                    : isDark
                      ? "text-slate-400 hover:text-white"
                      : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Paid Only
              </button>
            </div>
          </div>

          {/* Category Chips */}
          <div
            className={`flex flex-wrap items-center gap-2 mt-4 pt-4 border-t ${
              isDark ? "border-slate-800" : "border-slate-100"
            }`}
          >
            <span
              className={`text-xs font-semibold flex items-center gap-1 mr-1 ${
                isDark ? "text-slate-400" : "text-slate-400"
              }`}
            >
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
              All ({toolsData.length})
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

        {/* Results Count & Grid */}
        <div className="flex items-center justify-between mb-6 text-xs text-slate-500">
          <span>Showing {filteredTools.length} verified AI tools</span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-blue-500 hover:underline cursor-pointer"
            >
              Clear search
            </button>
          )}
        </div>

        {filteredTools.length === 0 ? (
          <div
            className={`rounded-3xl p-12 text-center border ${
              isDark ? "bg-[#0d162d] border-slate-800 text-white" : "bg-white border-slate-200/80 text-slate-900"
            }`}
          >
            <p className="text-sm text-slate-400">No AI tools matched your selected filters.</p>
            <button
              onClick={() => {
                setSelectedCategory("all");
                setSelectedPricing("all");
                setSearchQuery("");
              }}
              className="mt-4 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
