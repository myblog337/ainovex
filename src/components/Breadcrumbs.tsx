import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  onNavigate: (path: string) => void;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, onNavigate }) => {
  return (
    <nav aria-label="Breadcrumb" className="py-3 text-xs text-slate-500 dark:text-slate-400">
      <ol itemScope itemType="https://schema.org/BreadcrumbList" className="flex items-center flex-wrap gap-1.5">
        <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
          <a
            href="/"
            itemProp="item"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('/');
            }}
            className="flex items-center gap-1 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span itemProp="name">Home</span>
          </a>
          <meta itemProp="position" content="1" />
        </li>

        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          const position = idx + 2;
          return (
            <React.Fragment key={idx}>
              <li className="text-slate-400 dark:text-slate-600" aria-hidden="true">
                <ChevronRight className="w-3.5 h-3.5" />
              </li>
              <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                {isLast || !item.path ? (
                  <span itemProp="name" className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[200px] sm:max-w-md inline-block">
                    {item.label}
                  </span>
                ) : (
                  <a
                    href={item.path.endsWith('/') ? item.path : `${item.path}/`}
                    itemProp="item"
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate(item.path!);
                    }}
                    className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
                  >
                    <span itemProp="name">{item.label}</span>
                  </a>
                )}
                <meta itemProp="position" content={String(position)} />
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
};
