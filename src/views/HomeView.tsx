import React from 'react';
import { Hero } from '../components/Hero';
import { CategoryGrid } from '../components/CategoryGrid';
import { FeaturedTools } from '../components/FeaturedTools';
import { BlogSection } from '../components/BlogSection';
import { JsonLd } from '../components/JsonLd';
import { Tool, Category, Article } from '../types';

interface HomeViewProps {
  categories: Category[];
  tools: Tool[];
  articles: Article[];
  onNavigate: (path: string) => void;
  onSelectTool: (tool: Tool) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  categories,
  tools,
  articles,
  onNavigate,
  onSelectTool,
}) => {
  const featuredTools = tools.filter((t) => t.isFeatured).slice(0, 5);

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'AINOVEX',
    url: 'https://ainovex.pages.dev/',
    description: 'AINOVEX brings you the latest AI tools, helpful guides, tech news and insights.',
    author: {
      '@type': 'Person',
      name: 'Md Shamim',
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://ainovex.pages.dev/tools?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <div>
      <JsonLd data={websiteSchema} />

      {/* Hero with glowing orbital sphere */}
      <Hero
        onSearch={(query) => onNavigate(`/tools?q=${encodeURIComponent(query)}`)}
        onTagClick={(tag) => onNavigate(`/tools?q=${encodeURIComponent(tag)}`)}
      />

      {/* Browse by Category */}
      <CategoryGrid
        categories={categories}
        onSelectCategory={(slug) => onNavigate(`/category/${slug}`)}
        onViewAll={() => onNavigate('/categories')}
      />

      {/* Featured AI Tools */}
      <FeaturedTools
        tools={featuredTools.length > 0 ? featuredTools : tools.slice(0, 5)}
        onViewAll={() => onNavigate('/tools')}
        onSelectTool={onSelectTool}
      />

      {/* Latest Blog & News */}
      <BlogSection
        articles={articles}
        onSelectArticle={(slug) => onNavigate(`/blog/${slug}`)}
        onViewAll={() => onNavigate('/blog')}
        onExploreTools={() => onNavigate('/tools')}
      />
    </div>
  );
};
