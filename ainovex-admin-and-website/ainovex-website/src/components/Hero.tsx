import React, { useState } from "react";
import { Search, Flame } from "lucide-react";
import { useTheme } from "@/src/context/ThemeContext";
import { HeroRobotGraphic } from "@/src/components/HeroRobotGraphic";

interface HeroProps {
  onSearch: (query: string) => void;
  onSelectTag: (tag: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onSearch, onSelectTag }) => {
  const { isDark } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSearch(searchTerm.trim());
    }
  };

  const trendingTags = [
    { label: "ChatGPT", query: "ChatGPT" },
    { label: "AI Image Generator", query: "Image" },
    { label: "Video Editing", query: "Video" },
    { label: "Productivity", query: "Productivity" },
    { label: "SEO", query: "Writing" },
  ];

  return (
    <section
      className={`relative overflow-hidden transition-colors duration-200 pt-8 pb-14 sm:pt-12 sm:pb-20 lg:pt-16 lg:pb-24 border-b ${
        isDark
          ? "bg-[#060d1b] text-white border-slate-800/60"
          : "bg-gradient-to-b from-blue-50/70 via-slate-50 to-white text-slate-900 border-slate-200"
      }`}
    >
      {/* Ambient background glows */}
      <div
        className={`absolute top-1/4 right-1/4 w-72 sm:w-96 h-72 sm:h-96 rounded-full blur-3xl pointer-events-none ${
          isDark ? "bg-blue-600/25" : "bg-blue-400/15"
        }`}
      />
      <div
        className={`absolute bottom-6 left-6 w-60 sm:w-72 h-60 sm:h-72 rounded-full blur-3xl pointer-events-none ${
          isDark ? "bg-indigo-600/15" : "bg-sky-400/15"
        }`}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
          {/* Left Column: Headlines & Search */}
          <div className="lg:col-span-7 flex flex-col items-start z-10">
            {/* Eyebrow badge matching reference */}
            <div
              className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6 shadow-xs backdrop-blur-sm ${
                isDark
                  ? "bg-slate-800/80 border border-slate-700/80 text-blue-400"
                  : "bg-blue-100/80 border border-blue-200/90 text-blue-700 font-semibold"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span>Your AI Journey Starts Here</span>
            </div>

            {/* Main H1 Headline matching reference */}
            <h1
              className={`text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-extrabold tracking-tight leading-[1.16] sm:leading-[1.12] ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              Discover the Best <br />
              <span
                className={
                  isDark
                    ? "text-blue-500 drop-shadow-[0_0_24px_rgba(59,130,246,0.35)]"
                    : "text-blue-600"
                }
              >
                AI Tools
              </span>{" "}
              &amp; Resources
            </h1>

            {/* Supporting description */}
            <p
              className={`mt-3.5 sm:mt-5 text-xs sm:text-base lg:text-lg max-w-xl leading-relaxed ${
                isDark ? "text-slate-300" : "text-slate-600"
              }`}
            >
              AINOVEX brings you the latest AI tools, helpful guides, tech news and
              insights — all in one place. Boost your productivity, creativity and
              work smarter with the power of AI.
            </p>

            {/* Prominent Search Field */}
            <form onSubmit={handleSubmit} className="w-full max-w-xl mt-5 sm:mt-8">
              <div
                className={`rounded-full p-1 sm:p-1.5 pl-3.5 sm:pl-6 flex items-center shadow-xl border transition-colors ${
                  isDark
                    ? "bg-white border-slate-100 hover:border-blue-400/50"
                    : "bg-white border-slate-200 shadow-md hover:border-blue-400"
                }`}
              >
                <Search className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 mr-2 sm:mr-3 shrink-0" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search AI tools, guides..."
                  className="w-full min-w-0 bg-transparent text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm md:text-base focus:outline-none py-1"
                />
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 sm:px-8 py-2 sm:py-3 rounded-full text-xs sm:text-sm transition-all shrink-0 cursor-pointer shadow-md hover:shadow-blue-500/25 active:scale-95"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Trending tags pills */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-4 sm:mt-6 text-xs sm:text-sm">
              <div
                className={`flex items-center gap-1 sm:gap-1.5 font-medium mr-1 text-xs sm:text-sm shrink-0 ${
                  isDark ? "text-slate-300" : "text-slate-700 font-semibold"
                }`}
              >
                <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 shrink-0" />
                <span>Trending:</span>
              </div>
              {trendingTags.map((tag) => (
                <button
                  key={tag.label}
                  onClick={() => onSelectTag(tag.query)}
                  className={`px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs transition-colors cursor-pointer border ${
                    isDark
                      ? "bg-slate-800/90 hover:bg-blue-600/30 hover:text-blue-300 hover:border-blue-500/50 text-slate-300 border-slate-700"
                      : "bg-white hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 text-slate-700 border-slate-200 shadow-2xs"
                  }`}
                >
                  {tag.label}
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Hero Graphic */}
          <div className="lg:col-span-5 flex items-center justify-center mt-6 lg:mt-0">
            <HeroRobotGraphic />
          </div>
        </div>
      </div>
    </section>
  );
};
