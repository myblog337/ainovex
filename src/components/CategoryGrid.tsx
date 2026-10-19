import React from 'react';
import {
  PenTool,
  Image,
  Video,
  Zap,
  Palette,
  Code,
  TrendingUp,
  GraduationCap,
  LayoutGrid,
  ArrowRight,
} from 'lucide-react';
import { Category } from '../types';

interface CategoryGridProps {
  categories: Category[];
  onSelectCategory: (slug: string) => void;
  onViewAll: () => void;
}

const iconMap: Record<string, React.ReactNode> = {
  PenTool: <PenTool className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
  Image: <Image className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
  Video: <Video className="w-5 h-5 text-pink-600 dark:text-pink-400" />,
  Zap: <Zap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
  Palette: <Palette className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
  Code: <Code className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />,
  TrendingUp: <TrendingUp className="w-5 h-5 text-teal-600 dark:text-teal-400" />,
  GraduationCap: <GraduationCap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
  LayoutGrid: <LayoutGrid className="w-5 h-5 text-slate-600 dark:text-slate-400" />,
};

const bgMap: Record<string, string> = {
  PenTool: 'bg-blue-50 border-blue-200/80 dark:bg-blue-500/10 dark:border-blue-500/20',
  Image: 'bg-purple-50 border-purple-200/80 dark:bg-purple-500/10 dark:border-purple-500/20',
  Video: 'bg-pink-50 border-pink-200/80 dark:bg-pink-500/10 dark:border-pink-500/20',
  Zap: 'bg-emerald-50 border-emerald-200/80 dark:bg-emerald-500/10 dark:border-emerald-500/20',
  Palette: 'bg-amber-50 border-amber-200/80 dark:bg-amber-500/10 dark:border-amber-500/20',
  Code: 'bg-cyan-50 border-cyan-200/80 dark:bg-cyan-500/10 dark:border-cyan-500/20',
  TrendingUp: 'bg-teal-50 border-teal-200/80 dark:bg-teal-500/10 dark:border-teal-500/20',
  GraduationCap: 'bg-indigo-50 border-indigo-200/80 dark:bg-indigo-500/10 dark:border-indigo-500/20',
  LayoutGrid: 'bg-slate-100 border-slate-200/80 dark:bg-slate-500/10 dark:border-slate-500/20',
};

export const CategoryGrid: React.FC<CategoryGridProps> = ({
  categories,
  onSelectCategory,
  onViewAll,
}) => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Browse by Category
          </h2>
        </div>
        <a
          href="/categories/"
          onClick={(e) => {
            e.preventDefault();
            onViewAll();
          }}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors group cursor-pointer"
        >
          <span>View All Categories</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </a>
      </div>

      {/* Grid of Categories */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5 sm:gap-4">
        {categories.map((cat) => {
          const iconKey = cat.icon || 'LayoutGrid';
          const iconNode = iconMap[iconKey] || iconMap.LayoutGrid;
          const iconContainerClass = bgMap[iconKey] || bgMap.LayoutGrid;

          return (
            <a
              key={cat.id || cat.slug}
              href={`/category/${cat.slug}/`}
              onClick={(e) => {
                e.preventDefault();
                onSelectCategory(cat.slug);
              }}
              className="flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-blue-500/50 hover:bg-slate-50/80 shadow-sm hover:shadow-md dark:bg-slate-900/60 dark:border-slate-800/80 dark:hover:bg-slate-850/80 transition-all duration-200 hover:-translate-y-0.5 text-center group cursor-pointer"
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 border ${iconContainerClass} group-hover:scale-110 transition-transform`}
              >
                {iconNode}
              </div>
              <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                {cat.name}
              </span>
            </a>
          );
        })}
      </div>
    </section>
  );
};
