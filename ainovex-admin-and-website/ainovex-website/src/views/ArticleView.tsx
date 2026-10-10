import React, { useState } from "react";
import {
  Calendar,
  Clock,
  Share2,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { ARTICLES, getArticleBySlug } from "@/src/data/articles";
import { Breadcrumbs } from "@/src/components/Breadcrumbs";
import { JsonLd } from "@/src/components/JsonLd";
import { ArticleCard } from "@/src/components/ArticleCard";
import { SITE_CONFIG, getCanonicalUrl } from "@/src/config/site";
import { useTheme } from "@/src/context/ThemeContext";

interface ArticleViewProps {
  slug: string;
  onNavigate: (route: string) => void;
}

export const ArticleView: React.FC<ArticleViewProps> = ({ slug, onNavigate }) => {
  const { isDark } = useTheme();
  const [copiedLink, setCopiedLink] = useState(false);

  const article = getArticleBySlug(slug);

  if (!article) {
    return (
      <div
        className={`min-h-[60vh] flex flex-col items-center justify-center py-20 px-4 text-center transition-colors duration-200 ${
          isDark ? "bg-[#060d1b] text-white" : "bg-[#f8fafc] text-slate-900"
        }`}
      >
        <h1 className="text-2xl font-bold">Article Not Found</h1>
        <p className={`mt-2 text-sm leading-relaxed ${isDark ? "text-slate-400" : "text-slate-500"}`}>
          The requested article does not exist or has not been published yet.
        </p>
        <button
          onClick={() => onNavigate("/articles/")}
          className="mt-6 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 cursor-pointer transition-colors"
        >
          Return to Blog Archive
        </button>
      </div>
    );
  }

  const relatedArticles = ARTICLES.filter(
    (a) =>
      a.slug !== article.slug &&
      (a.categorySlug === article.categorySlug || a.category === article.category)
  ).slice(0, 3);

  const canonicalUrl = getCanonicalUrl(`/articles/${article.slug}/`);

  const handleShare = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(canonicalUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <article
      className={`min-h-screen pb-24 transition-colors duration-200 ${
        isDark ? "bg-[#060d1b] text-slate-100" : "bg-[#f8fafc] text-slate-900"
      }`}
    >
      <JsonLd
        type="article"
        title={article.title}
        description={article.description}
        url={canonicalUrl}
        published={article.published}
        updated={article.updated}
        image={article.featuredImage}
        authorName={article.author}
      />
      <JsonLd
        type="breadcrumbs"
        items={[
          { name: "Home", url: `${SITE_CONFIG.url}/` },
          { name: "Articles", url: `${SITE_CONFIG.url}/articles/` },
          { name: article.title, url: canonicalUrl },
        ]}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-4">
        <Breadcrumbs
          items={[
            { name: "Articles", url: "/articles/" },
            { name: article.title, url: `/articles/${article.slug}/` },
          ]}
          onNavigate={onNavigate}
        />

        <header
          className={`rounded-3xl p-6 sm:p-10 border shadow-sm mt-3 mb-8 transition-colors duration-200 ${
            isDark ? "bg-[#0d162d] border-slate-800 text-white" : "bg-white border-slate-200/80 text-slate-900"
          }`}
        >
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span
              className={`text-xs font-semibold px-3 py-1 rounded-full ${
                isDark ? "bg-blue-950/70 text-blue-400 border border-blue-800/50" : "bg-blue-50 text-blue-700"
              }`}
            >
              {article.category}
            </span>
            <span className={`text-xs font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Primary Focus: <strong className={isDark ? "text-slate-200" : "text-slate-700"}>{article.primaryKeyword}</strong>
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-[40px] font-extrabold tracking-tight leading-tight">
            {article.title}
          </h1>

          <p className={`text-base sm:text-lg mt-4 leading-relaxed ${isDark ? "text-slate-300" : "text-slate-600"}`}>
            {article.description}
          </p>

          <div
            className={`mt-6 pt-6 border-t flex flex-wrap items-center justify-between gap-4 text-xs sm:text-sm ${
              isDark ? "border-slate-800 text-slate-400" : "border-slate-100 text-slate-500"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                MS
              </div>
              <div>
                <div className={`font-semibold flex items-center gap-1.5 ${isDark ? "text-white" : "text-slate-900"}`}>
                  <span>{article.author}</span>
                  <span title="Verified Editorial Author" className="inline-flex items-center">
                    <ShieldCheck className="w-4 h-4 text-blue-500" />
                  </span>
                </div>
                <div className={`text-xs ${isDark ? "text-slate-400" : "text-slate-400"}`}>Lead AI Researcher • AINOVEX</div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Updated: {formatDate(article.updated || article.published)}</span>
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{article.readingTime}</span>
              </span>
              <button
                onClick={handleShare}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  isDark ? "bg-slate-800 hover:bg-slate-700 text-slate-200" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
                title="Copy Canonical Link"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{copiedLink ? "Copied!" : "Share"}</span>
              </button>
            </div>
          </div>
        </header>

        {article.featuredImage && (
          <div className="w-full aspect-[16/9] rounded-3xl overflow-hidden shadow-md border border-slate-200/80 mb-10 bg-slate-950">
            <img
              src={article.featuredImage}
              alt={article.featuredImageAlt}
              width={900}
              height={506}
              decoding="async"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {article.quickAnswer && (
          <div
            className={`border-l-4 border-blue-600 rounded-r-2xl p-6 sm:p-8 mb-10 shadow-sm ${
              isDark
                ? "bg-[#0d162d] border-slate-800 text-slate-200"
                : "bg-gradient-to-r from-blue-50 to-indigo-50/60 text-slate-800"
            }`}
          >
            <div className="text-xs font-bold uppercase tracking-wider text-blue-500 mb-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              Quick Answer &amp; Key Takeaway
            </div>
            <p className="text-sm sm:text-base leading-relaxed font-medium">
              {article.quickAnswer}
            </p>
          </div>
        )}

        {article.bodyHtml && (
          <div
            className={`article-prose rounded-3xl p-6 sm:p-10 border shadow-sm ${
              isDark ? "bg-[#0d162d] border-slate-800 text-slate-200" : "bg-white border-slate-200/80 text-slate-800"
            }`}
            dangerouslySetInnerHTML={{ __html: article.bodyHtml }}
          />
        )}

        <div
          className={`mt-8 border rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs ${
            isDark ? "bg-[#080f1e] border-slate-800 text-slate-400" : "bg-slate-50 border-slate-200/80 text-slate-500"
          }`}
        >
          <div>
            Published by <strong>Md Shamim</strong> under <strong className={isDark ? "text-slate-200" : "text-slate-800"}>AINOVEX Editorial Guidelines</strong>.
            All assessments are independently conducted and fact-checked.
          </div>
          <button
            onClick={() => onNavigate("/editorial-policy/")}
            className="text-blue-500 hover:underline font-semibold shrink-0 cursor-pointer"
          >
            Read Review Methodology &rarr;
          </button>
        </div>

        {relatedArticles.length > 0 && (
          <div className="mt-14">
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                Related Articles &amp; Comparisons
              </h2>
              <button
                onClick={() => onNavigate("/articles/")}
                className="text-xs sm:text-sm font-semibold text-blue-500 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Browse All Articles</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {relatedArticles.map((rel) => (
                <ArticleCard
                  key={rel.slug}
                  article={rel}
                  onSelect={(newSlug) => {
                    onNavigate(`/articles/${newSlug}/`);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
};
