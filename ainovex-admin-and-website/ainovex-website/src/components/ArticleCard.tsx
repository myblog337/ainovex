import React from "react";
import { Clock, Calendar } from "lucide-react";
import { Article } from "@/src/data/articles";
import { useTheme } from "@/src/context/ThemeContext";

interface ArticleCardProps {
  article: Article;
  onSelect: (slug: string) => void;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ article, onSelect }) => {
  const { isDark } = useTheme();

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <article
      onClick={() => onSelect(article.slug)}
      className={`rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between group cursor-pointer ${
        isDark
          ? "bg-[#0d162d] border-slate-800/90 text-white shadow-sm hover:border-blue-500/50 hover:bg-[#111c38] hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)]"
          : "bg-white border-slate-200/90 text-slate-900 shadow-sm hover:shadow-lg hover:-translate-y-1"
      }`}
    >
      <div>
        {/* Featured Image Container */}
        <div className="relative aspect-[16/10] overflow-hidden bg-slate-950">
          <img
            src={article.featuredImage}
            alt={article.featuredImageAlt}
            width={400}
            height={250}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Category Badge */}
          <div className="absolute top-3 left-3">
            <span
              className={`text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-xs backdrop-blur-sm ${
                isDark
                  ? "bg-slate-900/90 text-blue-400 border border-slate-700/80"
                  : "bg-white/95 text-blue-700 shadow-xs"
              }`}
            >
              {article.categoryBadge || article.category}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5">
          <h3
            className={`text-sm sm:text-base font-bold transition-colors line-clamp-2 leading-snug ${
              isDark ? "text-white group-hover:text-blue-400" : "text-slate-900 group-hover:text-blue-600"
            }`}
          >
            {article.title}
          </h3>
          <p
            className={`text-xs line-clamp-2 mt-2 leading-relaxed ${
              isDark ? "text-slate-400" : "text-slate-500"
            }`}
          >
            {article.description}
          </p>
        </div>
      </div>

      {/* Card Footer: Date & Reading Time */}
      <div
        className={`px-4 sm:px-5 pb-4 pt-2 flex items-center justify-between text-xs border-t ${
          isDark ? "border-slate-800/80 text-slate-400" : "border-slate-100 text-slate-400"
        }`}
      >
        <span className="flex items-center gap-1 font-medium">
          <Calendar className="w-3.5 h-3.5" />
          <span>{formatDate(article.published)}</span>
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          <span>{article.readingTime}</span>
        </span>
      </div>
    </article>
  );
};
