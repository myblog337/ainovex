import React from "react";
import {
  PenTool,
  Image as ImageIcon,
  Play,
  Zap,
  Palette,
  Code,
  BarChart2,
  GraduationCap,
  Grid,
  ArrowRight,
} from "lucide-react";
import categoriesData from "@/src/data/categories.json";
import { useTheme } from "@/src/context/ThemeContext";

interface CategoryGridProps {
  onSelectCategory: (slug: string) => void;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({ onSelectCategory }) => {
  const { isDark } = useTheme();

  const getCategoryDetails = (id: string) => {
    switch (id) {
      case "ai-writing":
        return {
          bg: isDark ? "bg-blue-950/70 text-blue-400" : "bg-blue-100 text-blue-600",
          icon: <PenTool className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />,
        };
      case "image-generation":
        return {
          bg: isDark ? "bg-purple-950/70 text-purple-400" : "bg-purple-100 text-purple-600",
          icon: <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />,
        };
      case "video-audio":
        return {
          bg: isDark ? "bg-pink-950/70 text-pink-400" : "bg-pink-100 text-pink-600",
          icon: <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-pink-500 text-pink-500 ml-0.5" />,
        };
      case "productivity":
        return {
          bg: isDark ? "bg-emerald-950/70 text-emerald-400" : "bg-emerald-100 text-emerald-600",
          icon: <Zap className="w-4 h-4 sm:w-5 sm:h-5 fill-emerald-500 text-emerald-500" />,
        };
      case "design-art":
        return {
          bg: isDark ? "bg-orange-950/70 text-orange-400" : "bg-orange-100 text-orange-600",
          icon: <Palette className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />,
        };
      case "code-dev":
        return {
          bg: isDark ? "bg-blue-950/70 text-blue-400" : "bg-blue-100 text-blue-600",
          icon: <Code className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />,
        };
      case "business":
        return {
          bg: isDark ? "bg-teal-950/70 text-teal-400" : "bg-teal-100 text-teal-600",
          icon: <BarChart2 className="w-4 h-4 sm:w-5 sm:h-5 text-teal-500" />,
        };
      case "education":
        return {
          bg: isDark ? "bg-purple-950/70 text-purple-400" : "bg-purple-100 text-purple-600",
          icon: <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />,
        };
      default:
        return {
          bg: isDark ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-600",
          icon: <Grid className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500" />,
        };
    }
  };

  return (
    <section
      className={`py-8 sm:py-12 border-b transition-colors duration-200 ${
        isDark ? "bg-[#080f20] border-slate-800/80" : "bg-white border-slate-100"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <h2
            className={`text-lg sm:text-xl md:text-2xl font-bold tracking-tight ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            Browse by Category
          </h2>
          <button
            onClick={() => onSelectCategory("all")}
            className={`text-xs sm:text-sm font-semibold flex items-center gap-1 sm:gap-1.5 group cursor-pointer transition-colors ${
              isDark ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"
            }`}
          >
            <span>View All Categories</span>
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2 sm:gap-3 lg:gap-4">
          {categoriesData.map((category) => {
            const { bg, icon } = getCategoryDetails(category.id);
            return (
              <button
                key={category.id}
                onClick={() => onSelectCategory(category.slug)}
                className={`flex flex-col items-center justify-center p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border transition-all duration-200 group cursor-pointer text-center ${
                  isDark
                    ? "bg-[#0d162d] border-slate-800/90 shadow-xs hover:border-blue-500/50 hover:bg-[#111c38] text-slate-200 hover:text-blue-400"
                    : "bg-white border-slate-100/90 shadow-xs hover:shadow-md hover:border-blue-200 hover:-translate-y-1 text-slate-800 hover:text-blue-600"
                }`}
              >
                <div
                  className={`w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center mb-1 sm:mb-2.5 transition-transform duration-200 group-hover:scale-110 ${bg}`}
                >
                  {icon}
                </div>
                <span className="text-[10px] xs:text-xs lg:text-sm font-semibold transition-colors leading-tight line-clamp-1 w-full px-0.5">
                  {category.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
