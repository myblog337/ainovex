import React, { useState } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const quickLinks = [
    { label: 'Home', path: '/' },
    { label: 'AI Tools', path: '/tools' },
    { label: 'Blog', path: '/blog' },
    { label: 'Categories', path: '/categories' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ];

  const popularCategories = [
    { label: 'AI Writing', slug: 'ai-writing' },
    { label: 'Image Generation', slug: 'image-generation' },
    { label: 'Video & Audio', slug: 'video-audio' },
    { label: 'Productivity', slug: 'productivity' },
    { label: 'Design & Art', slug: 'design-art' },
    { label: 'Code & Dev', slug: 'code-dev' },
    { label: 'Business', slug: 'business' },
    { label: 'Education', slug: 'education' },
  ];

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 5000);
      setEmail('');
    }
  };

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-[#070b14] pt-16 pb-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 mb-14">
          {/* Brand Info */}
          <div className="lg:col-span-4">
            <a 
              href="/"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/');
              }}
              className="cursor-pointer inline-flex flex-col mb-4 select-none"
            >
              <div className="flex items-center gap-1 text-2xl font-black tracking-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-400 to-blue-500">
                  AI
                </span>
                <span className="text-slate-900 dark:text-white">
                  NOVEX
                </span>
              </div>
              <span className="text-[10px] tracking-wider font-medium text-slate-500 dark:text-slate-400 -mt-0.5">
                AI Tools • News • Guides • More
              </span>
            </a>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm">
              AINOVEX is your trusted source for the best AI tools, latest news, and helpful guides. Boost your productivity, creativity and work smarter with the power of AI.
            </p>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4">
              QUICK LINKS
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              {quickLinks.map((item) => (
                <li key={item.path}>
                  <a
                    href={item.path}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate(item.path);
                    }}
                    className="text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors cursor-pointer block"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular Categories */}
          <div className="lg:col-span-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4">
              POPULAR CATEGORIES
            </h4>
            <div className="grid grid-cols-2 gap-x-2 gap-y-2.5 text-xs sm:text-sm">
              {popularCategories.map((cat) => (
                <a
                  key={cat.slug}
                  href={`/category/${cat.slug}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate(`/category/${cat.slug}`);
                  }}
                  className="text-left text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors truncate cursor-pointer block"
                >
                  {cat.label}
                </a>
              ))}
            </div>
          </div>

          {/* Stay Connected */}
          <div className="lg:col-span-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4">
              STAY CONNECTED
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
              Newsletter sign-up will open when AINOVEX launches its email list.
            </p>

            <form onSubmit={handleSubscribe} className="relative mb-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full px-3.5 py-2.5 pr-11 rounded-xl text-xs bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 dark:bg-slate-900/90 dark:border-slate-700/80 dark:text-white dark:placeholder-slate-500"
              />
              <button
                type="submit"
                aria-label="Submit newsletter email"
                className="absolute right-1.5 top-1.5 bottom-1.5 px-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

            {subscribed && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 mb-3">
                <CheckCircle2 className="w-4 h-4" />
                <span>Thank you! We will notify you when subscriptions open.</span>
              </div>
            )}

            {/* Social Icons */}
            <div className="flex items-center gap-2 pt-1">
              {[
                { name: 'Facebook', label: 'f', href: 'https://facebook.com' },
                { name: 'X', label: '𝕏', href: 'https://x.com' },
                { name: 'YouTube', label: '▶', href: 'https://youtube.com' },
                { name: 'LinkedIn', label: 'in', href: 'https://linkedin.com' },
                { name: 'Pinterest', label: 'P', href: 'https://pinterest.com' },
                { name: 'RSS', label: 'ツ', href: '/rss.xml' },
              ].map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  className="w-7 h-7 rounded-full bg-slate-200 hover:bg-blue-600 text-slate-700 hover:text-white dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-blue-600 dark:hover:text-white flex items-center justify-center text-xs font-bold transition-all shadow-sm"
                >
                  {social.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-200 dark:border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <p>© 2026 AINOVEX. All rights reserved.</p>

          <div className="flex flex-wrap items-center gap-5">
            <a
              href="/privacy"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/privacy');
              }}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
            >
              Privacy Policy
            </a>
            <a
              href="/terms"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/terms');
              }}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
            >
              Terms of Service
            </a>
            <a
              href="/editorial-policy"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/editorial-policy');
              }}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
            >
              Editorial Policy
            </a>
            <a
              href="/affiliate-disclosure"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/affiliate-disclosure');
              }}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
            >
              Disclaimer
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
