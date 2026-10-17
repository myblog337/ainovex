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

function AppContent() {
  // Navigation route state
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  // Search & Tool Modal
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedToolModal, setSelectedToolModal] = useState<Tool | null>(null);

  // Content Data
  const [categories, setCategories] = useState<Category[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  // True only when content was actually fetched. If the API fetch fails we must NOT mark pages as noindex.
  const [dataOk, setDataOk] = useState(false);
  const [siteSettings, setSiteSettings] = useState<Partial<SiteSettings>>({});

  const loadData = async () => {
    try {
      const [catRes, toolsRes, articlesRes, settingsRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/tools'),
        fetch('/api/articles'),
        fetch('/api/settings'),
      ]);

      // Only accept arrays — a non-array response used to crash the whole app on .map()
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
      console.error('Failed to load initial data:', err);
    } finally {
      setDataLoaded(true);
    }
  };

  useEffect(() => {
    loadData();
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

    if (currentPath === '/') {
      // defaults above
    } else if (currentPath === '/tools' || currentPath.startsWith('/tools?')) {
      title = 'AI Tools Directory & Software Reviews | AINOVEX';
      description = 'Browse and compare AI tools for writing, images, video, coding and productivity.';
    } else if (currentPath === '/blog') {
      title = 'AI Insights, Tutorials & Technology Guides | AINOVEX';
      description = 'Practical AI tutorials, tool comparisons and technology guides from the AINOVEX editorial team.';
    } else if (currentPath.startsWith('/blog/')) {
      const slug = currentPath.replace('/blog/', '');
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
    } else if (currentPath === '/categories') {
      title = 'Browse AI Categories & Topics | AINOVEX';
      description = 'Explore AI tools and guides by category.';
    } else if (currentPath.startsWith('/category/')) {
      const slug = currentPath.replace('/category/', '');
      const found = categories.find((c) => c.slug === slug);
      if (found) {
        title = `${found.name} AI Tools & Guides | AINOVEX`;
        description = found.description || defaultDesc;
      } else if (dataLoaded && dataOk) {
        title = 'Category Not Found | AINOVEX';
        noindex = true;
      }
    } else if (currentPath === '/about') {
      title = 'About Us & Editorial Standards | AINOVEX';
      description = 'Learn who is behind AINOVEX and how we research and review AI tools.';
    } else if (currentPath === '/contact') {
      title = 'Contact AINOVEX | Editorial Team';
      description = 'Send tool submissions, corrections or partnership enquiries to the AINOVEX editorial team.';
    } else if (currentPath === '/privacy') {
      title = 'Privacy Policy | AINOVEX';
    } else if (currentPath === '/terms') {
      title = 'Terms of Service | AINOVEX';
    } else if (currentPath === '/editorial-policy') {
      title = 'Editorial Policy | AINOVEX';
    } else if (currentPath === '/affiliate-disclosure') {
      title = 'Affiliate Disclosure | AINOVEX';
    } else {
      // Unknown route: the SPA still answers HTTP 200, so tell crawlers not to index it.
      title = 'Page Not Found | AINOVEX';
      noindex = true;
    }

    applySeo({ title, description, path: currentPath, baseUrl: base, image, noindex, type });
  }, [currentPath, articles, categories, siteSettings, dataLoaded, dataOk]);

  // Public View Router
  let viewContent: React.ReactNode = null;

  if (currentPath === '/') {
    viewContent = (
      <HomeView
        categories={categories}
        tools={tools}
        articles={articles}
        onNavigate={navigate}
        onSelectTool={(tool) => setSelectedToolModal(tool)}
      />
    );
  } else if (currentPath === '/tools' || currentPath.startsWith('/tools?')) {
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
  } else if (currentPath === '/blog') {
    viewContent = (
      <BlogView
        articles={articles}
        categories={categories}
        onSelectArticle={(slug) => navigate(`/blog/${slug}`)}
        onNavigate={navigate}
      />
    );
  } else if (currentPath.startsWith('/blog/')) {
    const slug = currentPath.replace('/blog/', '');
    viewContent = (
      <ArticleDetailView
        slug={slug}
        onNavigate={navigate}
        allArticles={articles}
      />
    );
  } else if (currentPath === '/categories') {
    viewContent = (
      <CategoriesView
        categories={categories}
        onSelectCategory={(slug) => navigate(`/category/${slug}`)}
        onNavigate={navigate}
      />
    );
  } else if (currentPath.startsWith('/category/')) {
    const slug = currentPath.replace('/category/', '');
    viewContent = (
      <CategoryDetailView
        slug={slug}
        categories={categories}
        tools={tools}
        articles={articles}
        onNavigate={navigate}
        onSelectTool={(tool) => setSelectedToolModal(tool)}
        onSelectArticle={(slug) => navigate(`/blog/${slug}`)}
      />
    );
  } else if (currentPath === '/about') {
    viewContent = <AboutView onNavigate={navigate} />;
  } else if (currentPath === '/contact') {
    viewContent = <ContactView onNavigate={navigate} />;
  } else if (currentPath === '/privacy') {
    viewContent = <LegalView page="privacy" onNavigate={navigate} />;
  } else if (currentPath === '/terms') {
    viewContent = <LegalView page="terms" onNavigate={navigate} />;
  } else if (currentPath === '/editorial-policy') {
    viewContent = <LegalView page="editorial" onNavigate={navigate} />;
  } else if (currentPath === '/affiliate-disclosure') {
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
          if (currentPath !== '/tools') {
            navigate('/tools');
          }
        }}
        onSelectArticle={(slug) => {
          setIsSearchOpen(false);
          navigate(`/blog/${slug}`);
        }}
        onSelectCategory={(slug) => {
          setIsSearchOpen(false);
          navigate(`/category/${slug}`);
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
