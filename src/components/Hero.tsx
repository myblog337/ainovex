import React, { useState } from 'react';
import { Search, Flame } from 'lucide-react';
import { OrbitalGraphic } from './OrbitalGraphic';

interface HeroProps {
  onSearch: (query: string) => void;
  onTagClick: (tag: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onSearch, onTagClick }) => {
  const [searchInput, setSearchInput] = useState('');

  const trendingTags = [
    'ChatGPT',
    'AI Image Generator',
    'Video Editing',
    'Productivity',
    'SEO',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSearch(searchInput.trim());
    }
  };

  return (
    <section className="relative pt-8 pb-14 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
      {/* Journey Badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-50 border border-blue-200 text-blue-600 dark:bg-blue-950/60 dark:border-blue-500/30 dark:text-blue-400 mb-6 shadow-sm">
        <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping inline-block" />
        <span>Your AI Journey Starts Here</span>
      </div>

      {/* Main Title */}
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15] mb-5">
        Discover the Best <br className="hidden sm:inline" />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-sky-500 to-blue-500 dark:from-blue-400 dark:via-sky-400 dark:to-blue-600">
          AI Tools
        </span>{' '}
        & Resources
      </h1>

      {/* Description */}
      <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-8">
        AINOVEX brings you the latest AI tools, helpful guides, tech news and insights — all in one place. Boost your productivity, creativity and work smarter with the power of AI.
      </p>

      {/* Search Input Box */}
      <form
        onSubmit={handleSubmit}
        className="max-w-xl mx-auto relative flex items-center shadow-xl rounded-full p-1.5 bg-white border border-slate-300 dark:bg-slate-900/90 dark:border-slate-700/80 focus-within:border-blue-500 transition-all mb-5"
      >
        <div className="pl-4 pr-2 text-slate-400 dark:text-slate-400">
          <Search className="w-5 h-5" />
        </div>
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search AI tools, guides..."
          className="w-full bg-transparent text-sm sm:text-base text-slate-900 placeholder-slate-400 dark:text-white dark:placeholder-slate-500 focus:outline-none py-2"
        />
        <button
          type="submit"
          className="px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-md shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          Search
        </button>
      </form>

      {/* Trending Tags Row */}
      <div className="flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 mb-8">
        <span className="inline-flex items-center gap-1 font-semibold text-amber-500 dark:text-amber-400">
          <Flame className="w-4 h-4 fill-amber-500 text-amber-500 dark:fill-amber-400 dark:text-amber-400" />
          Trending:
        </span>
        {trendingTags.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => onTagClick(tag)}
            className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 hover:bg-blue-50 border border-slate-200 text-slate-700 hover:text-blue-600 dark:bg-slate-800/80 dark:border-slate-700/60 dark:text-slate-300 dark:hover:bg-blue-600/20 dark:hover:text-blue-400 transition-colors cursor-pointer"
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Glowing Orbital Sphere Graphic */}
      <OrbitalGraphic />
    </section>
  );
};
