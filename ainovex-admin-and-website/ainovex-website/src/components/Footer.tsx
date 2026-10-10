import React, { useState } from "react";
import {
  Send,
  CheckCircle2,
  PenTool,
  Image as ImageIcon,
  Video,
  Zap,
  Palette,
  Code,
  TrendingUp,
  GraduationCap,
} from "lucide-react";

interface FooterProps {
  onNavigate: (route: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
    }
  };

  const popularCats = [
    { name: "AI Writing", slug: "ai-writing", icon: PenTool, color: "text-blue-400 bg-blue-500/10" },
    { name: "Image Generation", slug: "image-generation", icon: ImageIcon, color: "text-purple-400 bg-purple-500/10" },
    { name: "Video & Audio", slug: "video-audio", icon: Video, color: "text-pink-400 bg-pink-500/10" },
    { name: "Productivity", slug: "productivity", icon: Zap, color: "text-emerald-400 bg-emerald-500/10" },
    { name: "Design & Art", slug: "design-art", icon: Palette, color: "text-amber-400 bg-amber-500/10" },
    { name: "Code & Dev", slug: "code-dev", icon: Code, color: "text-cyan-400 bg-cyan-500/10" },
    { name: "Business", slug: "business", icon: TrendingUp, color: "text-teal-400 bg-teal-500/10" },
    { name: "Education", slug: "education", icon: GraduationCap, color: "text-violet-400 bg-violet-500/10" },
  ];

  return (
    <footer className="bg-[#050b16] text-slate-300 border-t border-slate-800/80 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-12 border-b border-slate-800/70">
          {/* Column 1: Brand & Description (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                onNavigate("/");
              }}
              className="inline-flex flex-col group cursor-pointer"
            >
              <div className="flex items-center text-2xl font-black tracking-tight leading-none">
                <span className="text-blue-500">AI</span>
                <span className="text-white">NOVEX</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium tracking-wider mt-1 group-hover:text-slate-300 transition-colors">
                AI Tools • News • Guides • More
              </span>
            </a>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
              AINOVEX is your trusted source for the best AI tools, latest news, and
              helpful guides. Boost your productivity, creativity and work smarter with
              the power of AI.
            </p>
          </div>

          {/* Column 2: Quick Links (2 cols) */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <button
                  onClick={() => onNavigate("/")}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("/ai-tools/")}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  AI Tools
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("/articles/")}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Blog
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("/categories/")}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Categories
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("/about/")}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  About
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("/contact/")}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Contact
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Popular Categories with icons (3 cols) */}
          <div className="lg:col-span-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Popular Categories
            </h4>
            <div className="grid grid-cols-2 gap-x-2 gap-y-2.5 text-xs sm:text-sm">
              {popularCats.map((cat) => {
                const IconComponent = cat.icon;
                return (
                  <button
                    key={cat.slug}
                    onClick={() => onNavigate(`/${cat.slug}/`)}
                    className="text-slate-400 hover:text-white text-left transition-colors truncate flex items-center gap-2 cursor-pointer group"
                  >
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${cat.color}`}>
                      <IconComponent className="w-3 h-3" />
                    </div>
                    <span className="truncate group-hover:text-blue-400">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Column 4: Stay Connected (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Stay Connected
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Newsletter sign-up will open when AINOVEX launches its email list.
            </p>
            <form onSubmit={handleSubscribe} className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full bg-[#0c1527] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 pr-11"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 bottom-1.5 px-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Subscribe to newsletter"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
            {subscribed && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Newsletter sign-up is not active yet. No email was subscribed.</span>
              </div>
            )}
            {/* Social Icons row */}
            <div className="flex items-center space-x-2 pt-2 text-slate-400">
              <span aria-hidden="true" className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-blue-600 hover:text-white flex items-center justify-center text-xs font-bold transition-colors cursor-pointer" title="Facebook">
                f
              </span>
              <span aria-hidden="true" className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 hover:text-white flex items-center justify-center text-xs font-bold transition-colors cursor-pointer" title="X / Twitter">
                𝕏
              </span>
              <span aria-hidden="true" className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-red-600 hover:text-white flex items-center justify-center text-xs font-bold transition-colors cursor-pointer" title="YouTube">
                ▶
              </span>
              <span aria-hidden="true" className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-blue-700 hover:text-white flex items-center justify-center text-xs font-bold transition-colors cursor-pointer" title="LinkedIn">
                in
              </span>
              <span aria-hidden="true" className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-red-500 hover:text-white flex items-center justify-center text-xs font-bold transition-colors cursor-pointer" title="Pinterest">
                P
              </span>
              <span aria-hidden="true" className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-amber-600 hover:text-white flex items-center justify-center text-xs font-bold transition-colors cursor-pointer" title="RSS Feed">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M4 11a9 9 0 0 1 9 9" />
                  <path d="M4 4a16 16 0 0 1 16 16" />
                  <circle cx="5" cy="19" r="1" fill="currentColor" />
                </svg>
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 AINOVEX. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-6">
            <button
              onClick={() => onNavigate("/privacy-policy/")}
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => onNavigate("/terms/")}
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              Terms of Service
            </button>
            <button
              onClick={() => onNavigate("/editorial-policy/")}
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              Disclaimer
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
