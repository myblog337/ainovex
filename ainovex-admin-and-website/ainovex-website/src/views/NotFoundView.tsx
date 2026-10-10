import React from "react";
import { Search, Home, ShieldCheck, Sparkles, Grid, BookOpen } from "lucide-react";
import { useTheme } from "@/src/context/ThemeContext";

interface NotFoundViewProps {
  onNavigate: (route: string) => void;
  onOpenSearch: () => void;
}

export const NotFoundView: React.FC<NotFoundViewProps> = ({ onNavigate, onOpenSearch }) => {
  const { isDark } = useTheme();

  return (
    <div
      className={`min-h-[75vh] flex items-center justify-center py-16 px-4 transition-colors duration-200 ${
        isDark ? "bg-[#060d1b] text-slate-100" : "bg-[#f8fafc] text-slate-900"
      }`}
    >
      <div
        className={`max-w-xl w-full rounded-3xl p-8 sm:p-12 border shadow-sm text-center transition-colors duration-200 ${
          isDark ? "bg-[#0d162d] border-slate-800 text-white" : "bg-white border-slate-200/90 text-slate-900"
        }`}
      >
        <div
          className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl mx-auto mb-4 ${
            isDark ? "bg-blue-950/70 text-blue-400 border border-blue-800/50" : "bg-blue-50 text-blue-600"
          }`}
        >
          404
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Page Not Found
        </h1>
        <p className={`text-xs sm:text-sm mt-3 leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
          The page you are looking for has been moved, renamed, or does not exist.
          Browse our verified directories or return to the homepage.
        </p>

        {/* Search Callout */}
        <div className="mt-6">
          <button
            onClick={onOpenSearch}
            className={`w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl border text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
              isDark
                ? "bg-[#080f1e] border-slate-700 text-slate-300 hover:text-blue-400 hover:border-blue-500/50"
                : "bg-slate-50 border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-300"
            }`}
          >
            <Search className="w-4 h-4 text-blue-500" />
            <span>Search AINOVEX for tools, categories, or topics...</span>
          </button>
        </div>

        {/* Navigation Quick Links */}
        <div
          className={`grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t text-xs font-semibold ${
            isDark ? "border-slate-800" : "border-slate-100"
          }`}
        >
          <button
            onClick={() => onNavigate("/")}
            className={`flex items-center justify-center gap-2 p-3 rounded-xl transition-colors cursor-pointer ${
              isDark ? "bg-[#080f1e] hover:bg-slate-800 text-slate-200" : "bg-slate-100 hover:bg-slate-200 text-slate-800"
            }`}
          >
            <Home className="w-4 h-4 text-blue-500" />
            <span>Homepage</span>
          </button>
          <button
            onClick={() => onNavigate("/ai-tools/")}
            className={`flex items-center justify-center gap-2 p-3 rounded-xl transition-colors cursor-pointer ${
              isDark ? "bg-[#080f1e] hover:bg-slate-800 text-slate-200" : "bg-slate-100 hover:bg-slate-200 text-slate-800"
            }`}
          >
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span>AI Tools</span>
          </button>
          <button
            onClick={() => onNavigate("/articles/")}
            className={`flex items-center justify-center gap-2 p-3 rounded-xl transition-colors cursor-pointer ${
              isDark ? "bg-[#080f1e] hover:bg-slate-800 text-slate-200" : "bg-slate-100 hover:bg-slate-200 text-slate-800"
            }`}
          >
            <BookOpen className="w-4 h-4 text-indigo-500" />
            <span>Blog</span>
          </button>
          <button
            onClick={() => onNavigate("/categories/")}
            className={`flex items-center justify-center gap-2 p-3 rounded-xl transition-colors cursor-pointer ${
              isDark ? "bg-[#080f1e] hover:bg-slate-800 text-slate-200" : "bg-slate-100 hover:bg-slate-200 text-slate-800"
            }`}
          >
            <Grid className="w-4 h-4 text-amber-500" />
            <span>Categories</span>
          </button>
          <button
            onClick={() => onNavigate("/about/")}
            className={`flex items-center justify-center gap-2 p-3 rounded-xl transition-colors cursor-pointer sm:col-span-2 ${
              isDark ? "bg-[#080f1e] hover:bg-slate-800 text-slate-200" : "bg-slate-100 hover:bg-slate-200 text-slate-800"
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-purple-500" />
            <span>About Publication</span>
          </button>
        </div>
      </div>
    </div>
  );
};
