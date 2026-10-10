import React, { useState, useEffect, useCallback } from "react";
import { ThemeProvider, useTheme } from "@/src/context/ThemeContext";
import { Header } from "@/src/components/Header";
import { Footer } from "@/src/components/Footer";
import { SearchModal } from "@/src/components/SearchModal";
import { HomeView } from "@/src/views/HomeView";
import { ToolsView } from "@/src/views/ToolsView";
import { CategoriesView } from "@/src/views/CategoriesView";
import { ArticlesView } from "@/src/views/ArticlesView";
import { ArticleView } from "@/src/views/ArticleView";
import { AboutView } from "@/src/views/AboutView";
import { ContactView } from "@/src/views/ContactView";
import { PrivacyPolicyView } from "@/src/views/PrivacyPolicyView";
import { TermsView } from "@/src/views/TermsView";
import { EditorialPolicyView } from "@/src/views/EditorialPolicyView";
import { NotFoundView } from "@/src/views/NotFoundView";
import categoriesData from "@/src/data/categories.json";
import { ARTICLES, getArticleBySlug } from "@/src/data/articles";
import { SITE_CONFIG, getCanonicalUrl } from "@/src/config/site";

interface AppProps {
  serverRoute?: string;
}

function MainLayout({ serverRoute }: AppProps) {
  const { isDark } = useTheme();
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    if (serverRoute) {
      return serverRoute.length > 1 &&
        !serverRoute.endsWith("/") &&
        !serverRoute.includes(".")
        ? `${serverRoute}/`
        : serverRoute;
    }
    if (typeof window !== "undefined") {
      const path = window.location.pathname;
      return path.length > 1 && !path.endsWith("/") && !path.includes(".")
        ? `${path}/`
        : path;
    }
    return "/";
  });
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Sync route changes with browser history
  const handleNavigate = useCallback((route: string) => {
    const target =
      route.length > 1 && !route.endsWith("/") && !route.includes(".")
        ? `${route}/`
        : route;
    if (typeof window !== "undefined") {
      window.history.pushState({}, "", target);
    }
    setCurrentRoute(target);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Listen to popstate (back/forward buttons)
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const target =
        path.length > 1 && !path.endsWith("/") && !path.includes(".")
          ? `${path}/`
          : path;
      setCurrentRoute(target);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Keyboard shortcut: Cmd+K / Ctrl+K for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Keep document metadata synchronized for client-side navigation.
  useEffect(() => {
    const cleanPath = currentRoute.replace(/^\/|\/$/g, "");
    const setMeta = (name: string, content: string) => {
      let node = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
      if (!node) {
        node = document.createElement("meta");
        node.name = name;
        document.head.appendChild(node);
      }
      node.content = content;
    };
    const setCanonical = (href: string) => {
      let node = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
      if (!node) {
        node = document.createElement("link");
        node.rel = "canonical";
        document.head.appendChild(node);
      }
      node.href = href;
    };

    let title = "Page Not Found (404) | AINOVEX";
    let description = "The requested AINOVEX page could not be found.";
    let noindex = true;
    const matchingArticle = getArticleBySlug(cleanPath);

    if (!cleanPath || currentRoute === "/") {
      title = "AINOVEX - Best AI Tools, Guides & Comparisons";
      description = SITE_CONFIG.description;
      noindex = false;
    } else if (cleanPath === "ai-tools") {
      title = "AI Tools Directory - Verified Artificial Intelligence Software | AINOVEX";
      description = "Explore AI tools by category, use case, pricing, and capabilities with AINOVEX.";
      noindex = false;
    } else if (cleanPath === "categories") {
      title = "Browse AI Categories & Taxonomy | AINOVEX";
      description = "Browse AINOVEX AI tool categories, including writing, image generation, productivity, coding, education, and more.";
      noindex = false;
    } else if (cleanPath === "articles" || cleanPath === "blog") {
      title = "AI Guides, Articles & Comparisons | AINOVEX";
      description = ARTICLES.length ? "Explore practical AI guides, comparisons, tutorials, and research-backed workflows from AINOVEX." : "AINOVEX articles and guides will be published here as they are researched, reviewed, and published.";
      noindex = ARTICLES.length === 0;
    } else if (matchingArticle) {
      title = `${matchingArticle.title} | AINOVEX`;
      description = matchingArticle.description;
      noindex = false;
    } else {
      const category = categoriesData.find(c => c.slug === cleanPath || `categories/${c.slug}` === cleanPath);
      if (category) {
        title = `${category.name} AI Tools & Software | AINOVEX`;
        description = category.description;
        noindex = false;
      } else if (cleanPath === "about") {
        title = "About AINOVEX - Mission, Standards & Research | AINOVEX";
        description = "Learn about AINOVEX, its editorial standards, AI tool research approach, and publishing mission.";
        noindex = false;
      } else if (cleanPath === "contact") {
        title = "Contact AINOVEX Editorial Desk";
        description = "Contact the AINOVEX editorial desk for corrections, feedback, partnerships, and general inquiries.";
        noindex = false;
      } else if (cleanPath === "privacy-policy") {
        title = "Privacy Policy | AINOVEX";
        description = "Read the AINOVEX privacy policy and learn how site data and analytics information are handled.";
        noindex = false;
      } else if (cleanPath === "terms") {
        title = "Terms of Service | AINOVEX";
        description = "Read the terms governing use of the AINOVEX website and its content.";
        noindex = false;
      } else if (cleanPath === "editorial-policy") {
        title = "Editorial Policy & Review Methodology | AINOVEX";
        description = "Learn how AINOVEX researches, reviews, updates, and publishes AI tools and editorial content.";
        noindex = false;
      }
    }

    document.title = title;
    setMeta("description", description);
    setMeta("robots", `${noindex ? "noindex,follow" : "index,follow"}`);
    setCanonical(getCanonicalUrl(currentRoute));
  }, [currentRoute]);

  // Route Resolver
  const renderCurrentView = () => {
    const cleanPath = currentRoute.replace(/^\/|\/$/g, "");

    // 1. Home
    if (!cleanPath || currentRoute === "/") {
      return (
        <HomeView
          onNavigate={handleNavigate}
          onOpenSearch={() => setIsSearchOpen(true)}
        />
      );
    }

    // 2. AI Tools Directory
    if (cleanPath === "ai-tools") {
      return <ToolsView onNavigate={handleNavigate} />;
    }

    // 3. Articles / Blog Listing Page
    if (cleanPath === "articles" || cleanPath === "blog") {
      if (cleanPath === "blog" && typeof window !== "undefined") {
        window.history.replaceState({}, "", "/articles/");
      }
      return <ArticlesView onNavigate={handleNavigate} />;
    }

    // 4. Categories Index
    if (cleanPath === "categories") {
      return <CategoriesView onNavigate={handleNavigate} />;
    }

    // 5. Individual Article Route
    const articleSlug = cleanPath.startsWith("articles/")
      ? cleanPath.split("/")[1]
      : cleanPath;
    const realArticle = getArticleBySlug(articleSlug);
    if (realArticle) {
      return (
        <ArticleView
          slug={realArticle.slug}
          onNavigate={handleNavigate}
        />
      );
    }

    // 6. Flat Category Landing Page (/ai-writing/, /image-generation/, etc.)
    const categorySlug = cleanPath.startsWith("categories/")
      ? cleanPath.split("/")[1]
      : cleanPath;
    const isCategory = categoriesData.some((c) => c.slug === categorySlug);
    if (isCategory) {
      if (cleanPath.startsWith("categories/") && typeof window !== "undefined") {
        window.history.replaceState({}, "", `/${categorySlug}/`);
      }
      return (
        <CategoriesView
          currentCategorySlug={categorySlug}
          onNavigate={handleNavigate}
        />
      );
    }

    // 7. About Page
    if (cleanPath === "about") {
      return <AboutView onNavigate={handleNavigate} />;
    }

    // 8. Contact Page
    if (cleanPath === "contact") {
      return <ContactView onNavigate={handleNavigate} />;
    }

    // 9. Privacy Policy
    if (cleanPath === "privacy-policy") {
      return <PrivacyPolicyView onNavigate={handleNavigate} />;
    }

    // 10. Terms
    if (cleanPath === "terms") {
      return <TermsView onNavigate={handleNavigate} />;
    }

    // 11. Editorial Policy
    if (cleanPath === "editorial-policy") {
      return <EditorialPolicyView onNavigate={handleNavigate} />;
    }

    // 12. 404 Fallback
    return (
      <NotFoundView
        onNavigate={handleNavigate}
        onOpenSearch={() => setIsSearchOpen(true)}
      />
    );
  };

  return (
    <div
      className={`min-h-screen flex flex-col font-sans selection:bg-blue-600 selection:text-white transition-colors duration-200 overflow-x-hidden ${
        isDark ? "bg-[#060d1b] text-slate-100" : "bg-[#f8fafc] text-slate-900"
      }`}
    >
      <Header
        currentRoute={currentRoute}
        onNavigate={handleNavigate}
        onOpenSearch={() => setIsSearchOpen(true)}
      />
      <main className="flex-1">{renderCurrentView()}</main>
      <Footer onNavigate={handleNavigate} />
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectCategory={(slug) =>
          handleNavigate(slug === "all" ? "/categories/" : `/${slug}/`)
        }
        onSelectArticle={(slug) => handleNavigate(`/articles/${slug}/`)}
      />
    </div>
  );
}

export default function App({ serverRoute }: AppProps = {}) {
  return (
    <ThemeProvider>
      <MainLayout serverRoute={serverRoute} />
    </ThemeProvider>
  );
}
