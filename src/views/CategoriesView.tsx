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
import { Breadcrumbs } from '../components/Breadcrumbs';

interface CategoriesViewProps {
  categories: Category[];
  onSelectCategory: (slug: string) => void;
  onNavigate: (path: string) => void;
}

const iconMap: Record<string, React.ReactNode> = {
  PenTool: <PenTool className="w-6 h-6 text-blue-400" />,
  Image: <Image className="w-6 h-6 text-purple-400" />,
  Video: <Video className="w-6 h-6 text-pink-400" />,
  Zap: <Zap className="w-6 h-6 text-emerald-400" />,
  Palette: <Palette className="w-6 h-6 text-amber-400" />,
  Code: <Code className="w-6 h-6 text-cyan-400" />,
  TrendingUp: <TrendingUp className="w-6 h-6 text-teal-400" />,
  GraduationCap: <GraduationCap className="w-6 h-6 text-indigo-400" />,
  LayoutGrid: <LayoutGrid className="w-6 h-6 text-slate-400" />,
};

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  categories,
  onSelectCategory,
  onNavigate,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs items={[{ label: 'Categories' }]} onNavigate={onNavigate} />

      <div className="py-6 text-center max-w-3xl mx-auto mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
          Explore AI Topics & Categories
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Browse specialized AI software and tutorials curated across {categories.length} industry domains.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => {
          const icon = iconMap[cat.icon] || iconMap.LayoutGrid;

          return (
            <a
              key={cat.id || cat.slug}
              href={`/category/${cat.slug}/`}
              onClick={(e) => {
                e.preventDefault();
                onSelectCategory(cat.slug);
              }}
              className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-blue-500/40 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 hover:shadow-xl cursor-pointer group flex flex-col justify-between block"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  {icon}
                </div>

                <h2 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2">
                  {cat.name}
                </h2>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                  {cat.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/50 flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-blue-400">
                <span>Browse {cat.name}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
};
