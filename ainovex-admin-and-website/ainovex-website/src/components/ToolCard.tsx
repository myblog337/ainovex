import React from "react";
import { ArrowRight } from "lucide-react";
import { useTheme } from "@/src/context/ThemeContext";

export interface ToolItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  longDescription?: string;
  category: string;
  tags: string[];
  pricing: string;
  freeTier: boolean;
  featured?: boolean;
  rating: number;
  url: string;
  iconColor: string;
  logoType?: string;
}

interface ToolCardProps {
  tool: ToolItem;
  onTagClick?: (tag: string) => void;
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool, onTagClick }) => {
  const { isDark } = useTheme();

  // Render 100% authentic real logos matching official branding
  const renderLogo = () => {
    switch (tool.logoType) {
      case "chatgpt":
        return (
          <div className="w-16 h-16 rounded-2xl bg-[#10A37F] flex items-center justify-center text-white shadow-md transition-transform duration-200 group-hover:scale-105">
            <svg
              className="w-10 h-10 text-white"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.6666zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" />
            </svg>
          </div>
        );
      case "midjourney":
        return (
          <div className="w-16 h-16 rounded-2xl bg-[#090f1f] border border-blue-900/60 flex items-center justify-center text-white shadow-md transition-transform duration-200 group-hover:scale-105">
            <svg
              className="w-10 h-10 text-white"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M14.615 15.657c-2.458-.887-5.122-1.774-8.08-2.66 1.478 3.548 3.548 5.618 6.208 6.21 1.182-1.183 1.872-2.366 1.872-3.55zm-1.872-4.435c-1.478-.592-3.253-1.183-5.322-1.774.887 2.07 2.07 3.253 3.55 3.55 1.182-.592 1.772-1.184 1.772-1.776zm9.257 5.618C17.868 15.362 13.136 14.18 7.813 13c3.548 4.73 7.69 7.098 12.42 7.098 1.182-.592 1.774-1.774 1.766-3.254v-.002zM12.153 3c-1.774 3.548-2.956 7.394-3.55 11.533 2.958.887 5.62 1.773 8.08 2.66 0-1.773-1.48-5.322-4.53-14.193zm-3.55 13.308c-2.366-.592-4.14-1.774-5.323-3.548.887 2.66 2.66 4.73 5.323 6.21v-2.662z" />
            </svg>
          </div>
        );
      case "canva":
        return (
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#00c4cc] via-[#4d55ea] to-[#7d2ae8] flex items-center justify-center text-white shadow-md transition-transform duration-200 group-hover:scale-105 p-2">
            <svg className="w-12 h-7" viewBox="0 0 110 38" fill="currentColor">
              <path d="M18.8 19.3c-1.1 4.5-4.5 7.7-9.4 7.7-5.9 0-9.4-4.8-9.4-11 0-7 4.7-12 11.2-12 4.1 0 7.3 2.1 8.3 5.7l-4.5 1.5c-.7-2.3-2.2-3.4-4.2-3.4-3.7 0-6.1 3.4-6.1 8.2 0 4.1 2.1 7.2 5.5 7.2 2.8 0 4.8-1.7 5.5-4.4l3.1.5zm9.5 7.4h-4.3l4.8-15.6h4.3l-1.3 4.2c1.4-2.7 3.9-4.5 6.7-4.5 3.3 0 5 1.8 5 4.8 0 .9-.2 2-.5 3l-2.4 8.1h-4.3l2.3-7.6c.2-.8.4-1.6.4-2.2 0-1.6-.9-2.5-2.5-2.5-1.9 0-3.6 1.4-4.4 3.7l-2.1 8.6zm23.2-1.8c-1.3 1.3-3.2 2.1-5.4 2.1-4 0-6.4-2.4-6.4-5.6 0-4.1 3.7-6.2 9.5-6.2h2l.4-1.4c.2-.9.4-1.7.4-2.2 0-1.6-1.1-2.4-3-2.4-2.2 0-3.6 1-4.2 2.7l-3.8-1.5c1.2-3 3.9-4.8 8.4-4.8 4.6 0 6.9 2.2 6.9 5.8 0 .8-.2 1.8-.4 2.7l-2.4 8.2c-.3 1-.5 2-.5 2.6 0 .8.5 1.2 1.3 1.2.5 0 1-.1 1.5-.4l1.2 3.3c-1.1.7-2.6 1.1-4 1.1-2.3 0-3.6-1.2-3.9-3.3zm-1.8-6.4h-1.6c-3.1 0-5 1.1-5 3.3 0 1.6 1.1 2.6 2.8 2.6 1.6 0 3-1 3.5-2.5l.3-3.4zm16.5-7.4l-5 15.6h-4.4l7.1-21.2h4.5l-2.2 5.6zm13.1 0l-5.6 15.6h-4.2l-3.8-15.6h4.5l2.2 10.7 4.1-10.7h2.8zm11.7 15.6h-4.3l4.8-15.6h4.3l-1.3 4.2c1.4-2.7 3.9-4.5 6.7-4.5 3.3 0 5 1.8 5 4.8 0 .9-.2 2-.5 3l-2.4 8.1h-4.3l2.3-7.6c.2-.8.4-1.6.4-2.2 0-1.6-.9-2.5-2.5-2.5-1.9 0-3.6 1.4-4.4 3.7l-2.1 8.6z" />
            </svg>
          </div>
        );
      case "runway":
        return (
          <div className="w-16 h-16 rounded-2xl bg-black border border-slate-800 flex items-center justify-center shadow-md transition-transform duration-200 group-hover:scale-105">
            <svg className="w-10 h-10" viewBox="0 0 100 100" fill="none">
              <path
                d="M26 16h26c14.359 0 26 11.641 26 26 0 10.87-6.685 20.177-16.195 24.087L78 84H58l-12-18H38v18H26V16zm12 36h14c6.627 0 12-5.373 12-12s-5.373-12-12-12H38v24z"
                fill="#2EE59D"
              />
            </svg>
          </div>
        );
      case "leonardo":
        return (
          <div className="w-16 h-16 rounded-2xl bg-[#0c0517] border border-purple-800/80 flex items-center justify-center shadow-md transition-transform duration-200 group-hover:scale-105 overflow-hidden p-2">
            <svg className="w-11 h-11" viewBox="0 0 100 100" fill="none">
              <defs>
                <linearGradient id="leoTopGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FF2E93" />
                  <stop offset="100%" stopColor="#FFAA00" />
                </linearGradient>
                <linearGradient id="leoLeftGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#A855F7" />
                  <stop offset="100%" stopColor="#4C1D95" />
                </linearGradient>
                <linearGradient id="leoRightGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00F0FF" />
                  <stop offset="100%" stopColor="#3B82F6" />
                </linearGradient>
                <radialGradient id="leoCoreGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="45%" stopColor="#FF007A" />
                  <stop offset="100%" stopColor="#9333EA" />
                </radialGradient>
              </defs>
              {/* 3D Isometric Faceted Cube / Crystal */}
              <path d="M50 12 L84 31 L50 50 L16 31 Z" fill="url(#leoTopGrad)" stroke="#1a0b2e" strokeWidth="0.8" />
              <path d="M16 31 L50 50 L50 88 L16 69 Z" fill="url(#leoLeftGrad)" stroke="#1a0b2e" strokeWidth="0.8" />
              <path d="M50 50 L84 31 L84 69 L50 88 Z" fill="url(#leoRightGrad)" stroke="#1a0b2e" strokeWidth="0.8" />
              {/* Facet Highlights */}
              <path d="M50 14 L82 31 L50 48 L18 31 Z" fill="none" stroke="#ffffff" strokeWidth="1" opacity="0.35" />
              {/* Inner Glowing Crystal Core */}
              <circle cx="50" cy="50" r="11" fill="url(#leoCoreGlow)" />
              <path d="M50 36 L53 47 L64 50 L53 53 L50 64 L47 53 L36 50 L47 47 Z" fill="#ffffff" />
            </svg>
          </div>
        );
      case "claude":
        return (
          <div className="w-16 h-16 rounded-2xl bg-[#D97757] flex items-center justify-center text-white shadow-md transition-transform duration-200 group-hover:scale-105">
            <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13.882 1.839a.75.75 0 0 0-1.164-.239l-2.03 1.764a.75.75 0 0 1-.722.146l-2.614-.847a.75.75 0 0 0-.938.718l.063 2.747a.75.75 0 0 1-.393.666L3.65 8.163a.75.75 0 0 0-.348 1.135l1.637 2.21a.75.75 0 0 1 .082.733l-1.127 2.508a.75.75 0 0 0 .584 1.03l2.709.475a.75.75 0 0 1 .58.468l1.197 2.476a.75.75 0 0 0 1.077.348l2.368-1.4a.75.75 0 0 1 .746-.027l2.428 1.295a.75.75 0 0 0 1.066-.381l1.118-2.513a.75.75 0 0 1 .59-.455l2.704-.504a.75.75 0 0 0 .563-1.042l-1.168-2.489a.75.75 0 0 1 .092-.732l1.602-2.235a.75.75 0 0 0-.369-1.128l-2.456-1.147a.75.75 0 0 1-.383-.672l.095-2.746a.75.75 0 0 0-.954-.697l-2.604.877a.75.75 0 0 1-.723-.153l-2.003-1.795z" />
            </svg>
          </div>
        );
      case "perplexity":
        return (
          <div className="w-16 h-16 rounded-2xl bg-[#13343B] flex items-center justify-center shadow-md transition-transform duration-200 group-hover:scale-105">
            <svg
              className="w-10 h-10 text-[#22B8CD]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2v20" />
              <path d="M4.93 4.93l14.14 14.14" />
              <path d="M19.07 4.93L4.93 19.07" />
              <path d="M7 2l5 5 5-5" />
              <path d="M7 22l5-5 5 5" />
              <path d="M2 7l5 5-5 5" />
              <path d="M22 7l-5 5 5 5" />
            </svg>
          </div>
        );
      case "gamma":
        return (
          <div className="w-16 h-16 rounded-2xl bg-[#161329] border border-purple-900/50 flex items-center justify-center text-white shadow-md transition-transform duration-200 group-hover:scale-105 p-2">
            <svg className="w-10 h-10" viewBox="0 0 64 64" fill="none">
              <defs>
                <linearGradient id="gammaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F43F5E" />
                  <stop offset="50%" stopColor="#C026D3" />
                  <stop offset="100%" stopColor="#4F46E5" />
                </linearGradient>
              </defs>
              <path
                d="M14 16 C14 28 32 32 32 44 C32 49 28 52 23 52 C18 52 14 48 14 44 L6 44 C6 53 14 60 23 60 C33 60 40 53 40 44 C40 32 22 28 22 16 C22 11 26 8 31 8 C36 8 40 12 40 16 L48 16 C48 7 40 0 31 0 C21 0 14 7 14 16 Z"
                fill="url(#gammaGrad)"
              />
              <path
                d="M48 30 L56 30 L56 60 L48 60 Z"
                fill="#C026D3"
                opacity="0.85"
              />
            </svg>
          </div>
        );
      case "otter":
        return (
          <div className="w-16 h-16 rounded-2xl bg-[#2563EB] flex items-center justify-center text-white shadow-md transition-transform duration-200 group-hover:scale-105">
            <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor">
              <rect x="3.5" y="8" width="3" height="8" rx="1.5" />
              <rect x="8.5" y="4" width="3" height="16" rx="1.5" />
              <rect x="13.5" y="4" width="3" height="16" rx="1.5" />
              <rect x="18.5" y="8" width="3" height="8" rx="1.5" />
            </svg>
          </div>
        );
      case "chatpdf":
        return (
          <div className="w-16 h-16 rounded-2xl bg-[#E11D48] flex items-center justify-center text-white shadow-md transition-transform duration-200 group-hover:scale-105">
            <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="white" fillOpacity="0.2" stroke="white" />
              <polyline points="14 2 14 8 20 8" stroke="white" />
              <path d="M8 13h8M8 17h5" stroke="white" strokeWidth="2" />
            </svg>
          </div>
        );
      case "copilot":
        return (
          <div className="w-16 h-16 rounded-2xl bg-[#0d1117] border border-slate-700/80 flex items-center justify-center shadow-md transition-transform duration-200 group-hover:scale-105">
            <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none">
              <defs>
                <linearGradient id="copilotVisor" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="50%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
              <path
                d="M12 2C6.477 2 2 6.477 2 12c0 1.92.54 3.714 1.478 5.237L2.5 21.5l4.478-.936A9.957 9.957 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"
                fill="#161B22"
                stroke="#30363D"
                strokeWidth="1"
              />
              <rect x="6.5" y="9.5" width="11" height="5" rx="2.5" fill="url(#copilotVisor)" />
              <circle cx="9.5" cy="12" r="1.2" fill="#ffffff" />
              <circle cx="14.5" cy="12" r="1.2" fill="#ffffff" />
            </svg>
          </div>
        );
      case "elevenlabs":
        return (
          <div className="w-16 h-16 rounded-2xl bg-black border border-slate-800 flex items-center justify-center text-white shadow-md transition-transform duration-200 group-hover:scale-105">
            <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4.5 3h3v18h-3V3zm12 0h3v18h-3V3z" />
            </svg>
          </div>
        );
      default:
        return (
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-base shadow-sm ${tool.iconColor} transition-transform duration-200 group-hover:scale-105`}
          >
            {tool.name.slice(0, 2).toUpperCase()}
          </div>
        );
    }
  };

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 p-4 sm:p-5 flex flex-col justify-between group ${
        isDark
          ? "bg-[#0d162d] border-slate-800/90 text-white shadow-sm hover:border-blue-500/50 hover:bg-[#111c38] hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)]"
          : "bg-white border-slate-200/90 text-slate-900 shadow-sm hover:shadow-xl hover:-translate-y-1.5"
      }`}
    >
      <div>
        {/* Tool Icon Container */}
        <div className="flex items-center justify-center pt-2 pb-4">
          {renderLogo()}
        </div>

        {/* Name */}
        <h3
          className={`text-base sm:text-lg font-bold text-center transition-colors ${
            isDark ? "text-white group-hover:text-blue-400" : "text-slate-900 group-hover:text-blue-600"
          }`}
        >
          {tool.name}
        </h3>

        {/* Description */}
        <p
          className={`text-xs sm:text-sm text-center mt-2 line-clamp-2 leading-relaxed min-h-[38px] ${
            isDark ? "text-slate-400" : "text-slate-600"
          }`}
        >
          {tool.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 mt-4">
          {tool.tags.map((tag) => (
            <button
              key={tag}
              onClick={() => onTagClick?.(tag)}
              className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full transition-colors cursor-pointer ${
                isDark
                  ? "bg-blue-950/70 border border-blue-800/50 text-blue-300 hover:bg-blue-900/80"
                  : "bg-blue-50 text-blue-700 hover:bg-blue-100"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Visit Tool Button */}
      <div className="mt-5 pt-2">
        <a
          href={tool.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`w-full rounded-xl py-2.5 px-4 text-xs font-semibold text-center transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-95 ${
            isDark
              ? "bg-[#131f3d] hover:bg-blue-600 text-white border border-slate-700/80 hover:border-transparent"
              : "bg-[#0c1322] hover:bg-blue-600 text-white group-hover:bg-[#09101f] hover:!bg-blue-600"
          }`}
          aria-label={`Visit official website for ${tool.name}`}
        >
          <span>Visit Tool</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </a>
      </div>
    </div>
  );
};
