import React, { useState, useRef, useEffect } from 'react';
import { Search, Sun, Moon, ArrowRight, Menu, X, Sparkles, Monitor, Check } from 'lucide-react';
import { useTheme, ThemeMode } from '../context/ThemeContext';

interface HeaderProps {
  onOpenSearch: () => void;
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSearch, currentPath, onNavigate }) => {
  const { theme, themeMode, toggleTheme, setThemeMode } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const themeMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(event.target as Node)) {
        setShowThemeMenu(false);
      }
    };
    if (showThemeMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showThemeMenu]);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'AI Tools', path: '/tools' },
    { label: 'Categories', path: '/categories' },
    { label: 'Blog', path: '/blog' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ];

  const handleLinkClick = (path: string) => {
    onNavigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl border-b transition-colors duration-200 bg-white/95 border-slate-200/90 text-slate-900 dark:bg-[#0b101b]/90 dark:border-slate-800/80 dark:text-slate-100 shadow-sm dark:shadow-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <div 
          onClick={() => handleLinkClick('/')}
          className="cursor-pointer group flex flex-col select-none"
        >
          <div className="flex items-center gap-1 text-2xl font-black tracking-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-400 to-blue-500">
              AI
            </span>
            <span className="text-slate-900 dark:text-white group-hover:text-sky-500 transition-colors">
              NOVEX
            </span>
          </div>
          <span className="text-[10px] tracking-wider font-medium text-slate-500 dark:text-slate-400 -mt-0.5">
            AI Tools • News • Guides • More
          </span>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
          {navLinks.map((link) => {
            const isActive = currentPath === link.path;
            return (
              <button
                key={link.path}
                onClick={() => handleLinkClick(link.path)}
                className={`transition-colors py-1 ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400 font-semibold border-b-2 border-blue-500'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          {/* Search Button */}
          <button
            onClick={onOpenSearch}
            aria-label="Search AI Tools"
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Theme Toggle Button (Fully Featured - CSS selector: div:nth-of-type(2) > button:nth-of-type(2)) */}
          <button
            onClick={toggleTheme}
            onContextMenu={(e) => {
              e.preventDefault();
              setShowThemeMenu(!showThemeMenu);
            }}
            aria-label={`Current: ${theme === 'light' ? 'Light' : 'Dark'} Mode. Click to toggle, right click for options.`}
            title={`Current: ${theme === 'light' ? 'Light Mode (Click to switch to Dark Mode)' : 'Dark Mode (Click to switch to Light Mode)'}`}
            className={`relative p-2.5 rounded-xl transition-all duration-300 flex items-center justify-center group cursor-pointer active:scale-95 shadow-sm ${
              theme === 'light'
                ? 'text-amber-600 bg-amber-50 hover:bg-amber-100/90 border border-amber-200/90 hover:border-amber-400 hover:shadow-[0_0_16px_rgba(245,158,11,0.25)]'
                : 'text-amber-300 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/70 hover:border-amber-400/40 hover:shadow-[0_0_16px_rgba(251,191,36,0.25)]'
            }`}
          >
            {/* Background subtle radial glow */}
            <span
              className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none ${
                theme === 'light'
                  ? 'bg-gradient-to-tr from-amber-400/15 to-yellow-300/20'
                  : 'bg-gradient-to-tr from-amber-500/10 to-yellow-300/15'
              }`}
            />

            {/* Rotating / Morphing Icons */}
            <span className="relative z-10 flex items-center justify-center transition-transform duration-500 ease-out group-hover:scale-110">
              {theme === 'light' ? (
                <Sun className="w-5 h-5 text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)] transition-transform duration-700 group-hover:rotate-90 animate-in fade-in zoom-in-75" />
              ) : (
                <Moon className="w-5 h-5 text-sky-300 drop-shadow-[0_0_8px_rgba(56,189,248,0.5)] transition-transform duration-700 group-hover:-rotate-45 animate-in fade-in zoom-in-75" />
              )}
            </span>

            {/* Mode indicator dot */}
            <span
              className={`absolute top-1 right-1 w-2 h-2 rounded-full transition-colors ${
                theme === 'light'
                  ? 'bg-amber-500 shadow-[0_0_6px_#f59e0b]'
                  : 'bg-sky-400 shadow-[0_0_6px_#38bdf8]'
              }`}
            />

            {/* Floating mode tooltip on hover */}
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-lg z-50">
              {theme === 'light' ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </span>
          </button>

          {/* Explore Tools CTA Button */}
          <button
            onClick={() => handleLinkClick('/tools')}
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Explore Tools</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Open Navigation Menu"
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/60 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b101b] px-4 pt-3 pb-6 space-y-2 shadow-2xl animate-in slide-in-from-top-4 duration-200">
          {navLinks.map((link) => (
            <button
              key={link.path}
              onClick={() => handleLinkClick(link.path)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-base font-medium transition-colors ${
                currentPath === link.path
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-600/20 dark:text-blue-400 font-semibold'
                  : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/50'
              }`}
            >
              {link.label}
            </button>
          ))}

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
            {/* Mobile Theme Selector */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs">
              <span className="text-slate-600 dark:text-slate-400 font-medium pl-1">Theme Mode</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setThemeMode('dark')}
                  className={`px-2.5 py-1 rounded-lg flex items-center gap-1 font-semibold transition-colors ${
                    themeMode === 'dark'
                      ? 'bg-amber-400/20 text-amber-500 dark:text-amber-300 border border-amber-400/30'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" />
                  <span>Dark</span>
                </button>
                <button
                  onClick={() => setThemeMode('light')}
                  className={`px-2.5 py-1 rounded-lg flex items-center gap-1 font-semibold transition-colors ${
                    themeMode === 'light'
                      ? 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" />
                  <span>Light</span>
                </button>
                <button
                  onClick={() => setThemeMode('system')}
                  className={`px-2.5 py-1 rounded-lg flex items-center gap-1 font-semibold transition-colors ${
                    themeMode === 'system'
                      ? 'bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/30'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>Auto</span>
                </button>
              </div>
            </div>

            <button
              onClick={() => handleLinkClick('/tools')}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/30"
            >
              <Sparkles className="w-4 h-4" />
              <span>Explore All AI Tools</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
