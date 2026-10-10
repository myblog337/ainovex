import React from "react";
import { ChevronRight, Home } from "lucide-react";
import { useTheme } from "@/src/context/ThemeContext";

export interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  onNavigate?: (url: string) => void;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, onNavigate }) => {
  const { isDark } = useTheme();

  return (
    <nav aria-label="Breadcrumb" className="py-3 px-4 sm:px-0">
      <ol
        className={`flex flex-wrap items-center gap-1.5 text-xs sm:text-sm ${
          isDark ? "text-slate-400" : "text-slate-500"
        }`}
      >
        <li className="flex items-center">
          <a
            href="/"
            onClick={(e) => {
              if (onNavigate) {
                e.preventDefault();
                onNavigate("/");
              }
            }}
            className={`flex items-center gap-1 transition-colors ${
              isDark ? "hover:text-blue-400" : "hover:text-blue-600"
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </a>
        </li>
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <li key={item.url} className="flex items-center gap-1.5">
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 opacity-70" />
              {isLast ? (
                <span
                  className={`font-medium truncate max-w-[260px] sm:max-w-md ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                  aria-current="page"
                >
                  {item.name}
                </span>
              ) : (
                <a
                  href={item.url}
                  onClick={(e) => {
                    if (onNavigate) {
                      e.preventDefault();
                      onNavigate(item.url);
                    }
                  }}
                  className={`transition-colors whitespace-nowrap ${
                    isDark ? "hover:text-blue-400" : "hover:text-blue-600"
                  }`}
                >
                  {item.name}
                </a>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
