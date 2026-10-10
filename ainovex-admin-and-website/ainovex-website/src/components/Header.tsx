import React, { useState } from "react";
import { Search, Sun, Moon, ChevronDown, Menu, X, ArrowRight } from "lucide-react";
import categoriesData from "@/src/data/categories.json";
import { useTheme } from "@/src/context/ThemeContext";

interface HeaderProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  onOpenSearch: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRoute,
  onNavigate,
  onOpenSearch,
}) => {
  const { isDark, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const navItems = [
    { name: "Home", route: "/" },
    {
      name: "AI Tools",
      route: "/ai-tools/",
      hasDropdown: true,
      dropdownItems: [
        { label: "All Curated Tools", route: "/ai-tools/" },
        { label: "AI Writing Assistants", route: "/ai-writing/" },
        { label: "Image Generation", route: "/image-generation/" },
        { label: "Video & Audio Editors", route: "/video-audio/" },
        { label: "Productivity & Research", route: "/productivity/" },
        { label: "Code & Development", route: "/code-dev/" },
      ],
    },
    {
      name: "Blog",
      route: "/articles/",
      hasDropdown: true,
      dropdownItems: [
        { label: "All Guides & Articles", route: "/articles/" },
        { label: "AI Tutorials", route: "/articles/" },
        { label: "Tool Comparisons", route: "/articles/" },
      ],
    },
    {
      name: "Categories",
      route: "/categories/",
      hasDropdown: true,
      dropdownItems: categoriesData.map((cat) => ({
        label: cat.name,
        route: `/${cat.slug}/`,
      })),
    },
    { name: "About", route: "/about/" },
    { name: "Contact", route: "/contact/" },
  ];

  const handleLinkClick = (route: string) => {
    onNavigate(route);
    setMobileMenuOpen(false);
    setActiveDropdown(null);
  };

  return (
    <header
      className={`sticky top-0 z-40 border-b backdrop-blur-md transition-colors duration-200 ${
        isDark
          ? "bg-[#060d1b] border-slate-800/80 text-white"
          : "bg-white/95 border-slate-200/90 text-slate-800 shadow-xs"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Tagline */}
          <div className="flex items-center">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                handleLinkClick("/");
              }}
              className="flex flex-col group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg p-1"
              aria-label="AINOVEX Home"
            >
              <div className="flex items-center text-2xl font-black tracking-tight leading-none">
                <span className="text-blue-500">AI</span>
                <span className={isDark ? "text-white" : "text-slate-900"}>NOVEX</span>
              </div>
              <span
                className={`text-[10px] font-medium tracking-wider mt-1 transition-colors ${
                  isDark ? "text-slate-400 group-hover:text-slate-300" : "text-slate-500 group-hover:text-slate-700"
                }`}
              >
                AI Tools • News • Guides • More
              </span>
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1" aria-label="Main Navigation">
            {navItems.map((item) => {
              const isActive =
                item.route === "/"
                  ? currentRoute === "/"
                  : item.route === "/articles/"
                    ? currentRoute.startsWith("/articles") || currentRoute.startsWith("/blog")
                    : currentRoute.startsWith(item.route);

              return (
                <div
                  key={item.name}
                  className="relative group"
                  onMouseEnter={() => item.hasDropdown && setActiveDropdown(item.name)}
                  onMouseLeave={() => item.hasDropdown && setActiveDropdown(null)}
                >
                  <button
                    onClick={() => handleLinkClick(item.route)}
                    className={`px-3.5 py-2 text-sm font-medium transition-colors flex items-center gap-1 rounded-md cursor-pointer ${
                      isActive
                        ? isDark
                          ? "text-blue-400 font-semibold"
                          : "text-blue-600 font-semibold"
                        : isDark
                          ? "text-slate-200 hover:text-white"
                          : "text-slate-600 hover:text-slate-900"
                    }`}
                    aria-expanded={activeDropdown === item.name}
                  >
                    <span>{item.name}</span>
                    {item.hasDropdown && (
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 opacity-70 group-hover:opacity-100 ${
                          activeDropdown === item.name ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </button>

                  {/* Active bottom indicator bar */}
                  {isActive && (
                    <div className="absolute bottom-[-16px] left-3.5 right-3.5 h-[3px] bg-blue-500 rounded-full shadow-[0_0_12px_rgba(59,130,246,0.8)]" />
                  )}

                  {/* Dropdown Menu */}
                  {item.hasDropdown && activeDropdown === item.name && (
                    <div
                      className={`absolute top-full left-0 mt-2 w-60 rounded-xl shadow-2xl py-2 z-50 border animate-in fade-in slide-in-from-top-2 duration-150 ${
                        isDark
                          ? "bg-[#0a1224] border-slate-800 text-slate-300"
                          : "bg-white border-slate-200 text-slate-700 shadow-xl"
                      }`}
                    >
                      {item.dropdownItems?.map((drop) => (
                        <a
                          key={drop.label}
                          href={drop.route}
                          onClick={(e) => {
                            e.preventDefault();
                            handleLinkClick(drop.route);
                          }}
                          className={`block px-4 py-2 text-xs font-medium transition-colors ${
                            isDark
                              ? "text-slate-300 hover:text-white hover:bg-slate-800/60"
                              : "text-slate-600 hover:text-blue-600 hover:bg-slate-50"
                          }`}
                        >
                          {drop.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Desktop Right Action Controls */}
          <div className="hidden lg:flex items-center space-x-2.5">
            <button
              onClick={onOpenSearch}
              className={`p-2.5 rounded-full transition-colors cursor-pointer ${
                isDark
                  ? "text-slate-300 hover:text-white hover:bg-slate-800/60"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
              aria-label="Open Search (Cmd+K)"
              title="Search (Cmd+K)"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={toggleTheme}
              className={`p-2.5 rounded-full transition-colors cursor-pointer ${
                isDark
                  ? "text-slate-300 hover:text-white hover:bg-slate-800/60"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
              aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-slate-600" />
              )}
            </button>
            <button
              onClick={() => handleLinkClick("/ai-tools/")}
              className="bg-blue-600 hover:bg-blue-500 text-white rounded-full font-semibold px-5 py-2.5 text-sm shadow-md transition-all flex items-center gap-1.5 cursor-pointer hover:shadow-blue-500/25 active:scale-95"
            >
              <span>Explore AI Tools</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Tablet & Mobile Right Action Controls */}
          <div className="flex lg:hidden items-center space-x-1 sm:space-x-2">
            <button
              onClick={onOpenSearch}
              className={`p-2 sm:p-2.5 rounded-full cursor-pointer transition-colors ${
                isDark ? "text-slate-300 hover:text-white hover:bg-slate-800/60" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
              aria-label="Search"
              title="Search"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={toggleTheme}
              className={`p-2 sm:p-2.5 rounded-full cursor-pointer transition-colors ${
                isDark ? "text-slate-300 hover:text-white hover:bg-slate-800/60" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
              aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-slate-600" />
              )}
            </button>
            <button
              onClick={() => handleLinkClick("/ai-tools/")}
              className="hidden sm:inline-flex bg-blue-600 hover:bg-blue-500 text-white rounded-full font-semibold px-3.5 py-1.5 text-xs shadow-xs items-center gap-1 cursor-pointer"
            >
              <span>Explore Tools</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-colors ${
                isDark
                  ? "text-slate-300 hover:text-white hover:bg-slate-800/80"
                  : "text-slate-700 hover:text-slate-900 hover:bg-slate-100"
              }`}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          className={`lg:hidden border-b px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-4 duration-200 ${
            isDark ? "bg-[#09101f] border-slate-800" : "bg-white border-slate-200 shadow-xl"
          }`}
        >
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive =
                item.route === "/"
                  ? currentRoute === "/"
                  : item.route === "/articles/"
                    ? currentRoute.startsWith("/articles") || currentRoute.startsWith("/blog")
                    : currentRoute.startsWith(item.route);

              return (
                <div key={item.name} className="py-1">
                  <button
                    onClick={() => handleLinkClick(item.route)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-base font-medium flex items-center justify-between cursor-pointer ${
                      isActive
                        ? isDark
                          ? "bg-blue-600/20 text-blue-400 font-semibold"
                          : "bg-blue-50 text-blue-600 font-semibold"
                        : isDark
                          ? "text-slate-200 hover:bg-slate-800"
                          : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <span>{item.name}</span>
                  </button>
                </div>
              );
            })}
          </div>

          <div
            className={`pt-3 border-t flex items-center justify-between ${
              isDark ? "border-slate-800" : "border-slate-200"
            }`}
          >
            <button
              onClick={toggleTheme}
              className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg cursor-pointer ${
                isDark ? "text-slate-300 hover:bg-slate-800" : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
              <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
            </button>
            <button
              onClick={() => handleLinkClick("/ai-tools/")}
              className="bg-blue-600 hover:bg-blue-500 text-white rounded-full font-semibold px-4 py-2 text-xs flex items-center gap-1 cursor-pointer"
            >
              <span>Explore AI Tools</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
