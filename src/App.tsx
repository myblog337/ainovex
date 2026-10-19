import React, { useState, useEffect, lazy, Suspense } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomeView } from './views/HomeView';
import { Tool, Category, Article, SiteSettings } from './types';
import { applySeo, loadAnalytics } from './utils/seo';

// Code-splitting: only the home page is in the first bundle; other pages load on demand.
const ToolsView = lazy(() => import('./views/ToolsView').then((m) => ({ default: m.ToolsView })));
const BlogView = lazy(() => import('./views/BlogView').then((m) => ({ default: m.BlogView })));
const ArticleDetailView = lazy(() => import('./views/ArticleDetailView').then((m) => ({ default: m.ArticleDetailView })));
const CategoriesView = lazy(() => import('./views/CategoriesView').then((m) => ({ default: m.CategoriesView })));
const CategoryDetailView = lazy(() => import('./views/CategoryDetailView').then((m) => ({ default: m.CategoryDetailView })));
const AboutView = lazy(() => import('./views/AboutView').then((m) => ({ default: m.AboutView })));
const ContactView = lazy(() => import('./views/ContactView').then((m) => ({ default: m.ContactView })));
const LegalView = lazy(() => import('./views/LegalView').then((m) => ({ default: m.LegalView })));
const SearchModal = lazy(() => import('./components/SearchModal').then((m) => ({ default: m.SearchModal })));

import defaultCategories from '../content/categories.json';
import defaultTools from '../content/tools.json';
import defaultArticles from '../content/articles.json';
import defaultSettings from '../content/settings.json';

function AppContent() {
  // Navigation route state
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  // Search & Tool Modal
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedToolModal, setSelectedToolModal] = useState<Tool | null>(null);

  // Content Data: Pre-populated with static content for instant initial paint
  const [categories, setCategories] = useState<Category[]>(defaultCategories as Category[]);
  const [tools, setTools] = useState<Tool[]>(defaultTools as Tool[]);
  const [articles, setArticles] = useState<Article[]>(
    (defaultArticles as Article[]).filter((a) => a.isPublished)
  );
  const [dataLoaded, setDataLoaded] = useState(true);
  const [dataOk, setDataOk] = useState(true);
  const [siteSettings, setSiteSettings] = useState<Partial<SiteSettings>>(defaultSettings);

  const loadData = async () => {
    try {
      const [catRes, toolsRes, articlesRes, settingsRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/tools'),
        fetch('/api/articles'),
        fetch('/api/settings'),
      ]);

      const asArray = async <T,>(res: Response): Promise<T[] | null> => {
        if (!res.ok) return null;
        const data = await res.json();
        return Array.isArray(data) ? (data as T[]) : null;
      };
      const cats = await asArray<Category>(catRes);
      const tls = await asArray<Tool>(toolsRes);
      const arts = await asArray<Article>(articlesRes);
      if (cats && arts) setDataOk(true);
      if (cats) setCategories(cats);
      if (tls) setTools(tls);
      if (arts) setArticles(arts);
      if (settingsRes.ok) {
        const st = await settingsRes.json();
        if (st && typeof st === 'object' && !Array.isArray(st)) {
          setSiteSettings(st);
          loadAnalytics(st.googleAnalyticsId);
        }
      }
    } catch (err) {
      console.error('Failed to load updated data:', err);
    }
  };

  useEffect(() => {
    // Run background revalidation during browser idle time so main thread is not blocked
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => {
        loadData();
      });
    } else {
      setTimeout(() => {
        loadData();
      }, 600);
    }
  }, []);

  useEffect(() => {
    // Listen to browser forward/backward buttons
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    if (path !== currentPath) {
      window.history.pushState({}, '', path);
      setCurrentPath(path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const normalizePath = (p: string) => {
    const clean = p.split('?')[0].replace(/\/+$/, '');
    return clean === '' ? '/' : clean;
  };

  const normPath = normalizePath(currentPath);

  // Keep <title>, description, canonical and Open Graph tags in sync with the route
  useEffect(() => {
    const base = siteSettings.productionUrl || 'https://ai-novex.netlify.app';
    const defaultDesc =
      siteSettings.siteDescription ||
      'AINOVEX brings you the latest AI tools, helpful guides, tech news and insights.';
    const defaultImage = siteSettings.defaultOgImage;
    let title = 'AINOVEX - Discover the Best AI Tools & Resources';
    let description = defaultDesc;
    let image = defaultImage;
    let noindex = false;
    let type: 'website' | 'article' = 'website';

    if (normPath === '/') {
      title = 'AINOVEX - AI Tools & Technology Platform';
      description = 'Discover the best AI tools, software reviews, and guides on AINOVEX. Boost productivity and work smarter with curated artificial intelligence.';
    } else if (normPath === '/tools') {
      title = 'Best AI Tools Directory & Software Reviews 2026 | AINOVEX';
      description = 'Browse and compare the top artificial intelligence tools for writing, image creation, video, coding, and productivity. Find the best software for your needs.';
    } else if (normPath === '/blog') {
      title = 'AI Insights, Tutorials & Technology Guides | AINOVEX';
      description = 'Explore actionable AI tutorials, practical workflows, tool comparisons, and tech guides from the AINOVEX editorial team. Master modern AI applications today.';
    } else if (normPath.startsWith('/blog/')) {
      const slug = normPath.replace('/blog/', '').replace(/\/$/, '');
      const found = articles.find((a) => a.slug === slug);
      if (found) {
        title = found.metaTitle || `${found.title} | AINOVEX`;
        description = found.metaDescription || found.excerpt || defaultDesc;
        image = found.featuredImage || defaultImage;
        type = 'article';
      } else if (dataLoaded && dataOk) {
        title = 'Article Not Found | AINOVEX';
        noindex = true;
      }
    } else if (normPath === '/categories') {
      title = 'Browse AI Categories & Topics | AINOVEX';
      description = 'Explore specialized AI software categories from writing and image generation to coding and productivity. Find the right tools for your specific workflow.';
    } else if (normPath.startsWith('/category/')) {
      const slug = normPath.replace('/category/', '').replace(/\/$/, '');
      const found = categories.find((c) => c.slug === slug);
      if (found) {
        title = `${found.name} AI Tools & Practical Guides 2026 | AINOVEX`;
        const baseCatDesc = found.description || 'Explore the best artificial intelligence tools and workflows.';
        description = `${baseCatDesc} Browse handpicked software reviews, features, and expert tutorials on AINOVEX.`;
      } else if (dataLoaded && dataOk) {
        title = 'Category Not Found | AINOVEX';
        noindex = true;
      }
    } else if (normPath === '/about') {
      title = 'About Us & Editorial Standards | AINOVEX';
      description = 'Learn about AINOVEX, our mission to simplify artificial intelligence, our testing standards, and our independent editorial review methodology.';
    } else if (normPath === '/contact') {
      title = 'Contact AINOVEX | Editorial & Support Team';
      description = 'Contact the AINOVEX editorial team for software recommendations, directory submissions, editorial corrections, or partnership inquiries.';
    } else if (normPath === '/privacy') {
      title = 'Privacy Policy | AINOVEX AI Platform';
      description = 'Read the official AINOVEX Privacy Policy. Learn how we safeguard your personal information, handle essential cookies, and maintain data privacy.';
    } else if (normPath === '/terms') {
      title = 'Terms of Service | AINOVEX Platform';
      description = 'Review the AINOVEX Terms of Service. Understand the rules, guidelines, disclaimers, and legal agreements governing the use of our website.';
    } else if (normPath === '/editorial-policy') {
      title = 'Editorial Policy & Review Standards | AINOVEX';
      description = 'Explore AINOVEX editorial policy, review guidelines, testing benchmarks, and independence standards for recommending artificial intelligence tools.';
    } else if (normPath === '/affiliate-disclosure') {
      title = 'Affiliate & Monetization Disclosure | AINOVEX';
      description = 'Read the AINOVEX affiliate and advertising disclosure. Learn how our site remains free for readers through transparent monetization and integrity.';
    } else {
      // Unknown route: tell crawlers not to index it
      title = 'Page Not Found | AINOVEX';
      description = 'The page you are looking for does not exist. Browse our AI tools directory, tutorials, and category archives on AINOVEX.';
      noindex = true;
    }

    const canonicalPath = normPath === '/' ? '/' : `${normPath}/`;
    applySeo({ title, description, path: canonicalPath, baseUrl: base, image, noindex, type });
  }, [normPath, articles, categories, siteSettings, dataLoaded, dataOk]);

  // Public View Router
  let viewContent: React.ReactNode = null;

  if (normPath === '/') {
    viewContent = (
      <HomeView
        categories={categories}
        tools={tools}
        articles={articles}
        onNavigate={navigate}
        onSelectTool={(tool) => setSelectedToolModal(tool)}
      />
    );
  } else if (normPath === '/tools') {
    const urlParams = new URLSearchParams(window.location.search);
    const q = urlParams.get('q') || '';
    viewContent = (
      <ToolsView
        tools={tools}
        categories={categories}
        initialQuery={q}
        onNavigate={navigate}
        selectedToolModal={selectedToolModal}
        onSelectToolModal={setSelectedToolModal}
      />
    );
  } else if (normPath === '/blog') {
    viewContent = (
      <BlogView
        articles={articles}
        categories={categories}
        onSelectArticle={(slug) => navigate(`/blog/${slug}/`)}
        onNavigate={navigate}
      />
    );
  } else if (normPath.startsWith('/blog/')) {
    const slug = normPath.replace('/blog/', '').replace(/\/$/, '');
    viewContent = (
      <ArticleDetailView
        slug={slug}
        onNavigate={navigate}
        allArticles={articles}
      />
    );
  } else if (normPath === '/categories') {
    viewContent = (
      <CategoriesView
        categories={categories}
        onSelectCategory={(slug) => navigate(`/category/${slug}/`)}
        onNavigate={navigate}
      />
    );
  } else if (normPath.startsWith('/category/')) {
    const slug = normPath.replace('/category/', '').replace(/\/$/, '');
    viewContent = (
      <CategoryDetailView
        slug={slug}
        categories={categories}
        tools={tools}
        articles={articles}
        onNavigate={navigate}
        onSelectTool={(tool) => setSelectedToolModal(tool)}
        onSelectArticle={(slug) => navigate(`/blog/${slug}/`)}
      />
    );
  } else if (normPath === '/about') {
    viewContent = <AboutView onNavigate={navigate} />;
  } else if (normPath === '/contact') {
    viewContent = <ContactView onNavigate={navigate} />;
  } else if (normPath === '/privacy') {
    viewContent = <LegalView page="privacy" onNavigate={navigate} />;
  } else if (normPath === '/terms') {
    viewContent = <LegalView page="terms" onNavigate={navigate} />;
  } else if (normPath === '/editorial-policy') {
    viewContent = <LegalView page="editorial" onNavigate={navigate} />;
  } else if (normPath === '/affiliate-disclosure') {
    viewContent = <LegalView page="affiliate" onNavigate={navigate} />;
  } else {
    // 404 Not Found fallback
    viewContent = (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <h1 className="text-4xl font-extrabold text-white mb-3">404 - Page Not Found</h1>
        <p className="text-sm text-slate-400 mb-6">
          The page you are looking for does not exist or has been moved.
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-600/30"
        >
          Return Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-900 dark:bg-[#0b101b] dark:text-slate-100 transition-colors duration-200">
      <Header
        onOpenSearch={() => setIsSearchOpen(true)}
        currentPath={currentPath}
        onNavigate={navigate}
      />

      <main className="flex-1">
        <Suspense fallback={<div className="min-h-[60vh]" aria-hidden="true" />}>{viewContent}</Suspense>
      </main>

      <Footer onNavigate={navigate} />

      {/* Global Quick Search Dialog */}
      {isSearchOpen && (
        <Suspense fallback={null}>
        <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        tools={tools}
        articles={articles}
        categories={categories}
        onSelectTool={(tool) => {
          setSelectedToolModal(tool);
          setIsSearchOpen(false);
          if (normPath !== '/tools') {
            navigate('/tools/');
          }
        }}
        onSelectArticle={(slug) => {
          setIsSearchOpen(false);
          navigate(`/blog/${slug}/`);
        }}
        onSelectCategory={(slug) => {
          setIsSearchOpen(false);
          navigate(`/category/${slug}/`);
        }}
      />
        </Suspense>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
