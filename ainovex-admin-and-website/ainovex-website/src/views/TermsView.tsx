import React from "react";
import { Breadcrumbs } from "@/src/components/Breadcrumbs";
import { SITE_CONFIG } from "@/src/config/site";
import { useTheme } from "@/src/context/ThemeContext";

interface TermsViewProps {
  onNavigate: (route: string) => void;
}

export const TermsView: React.FC<TermsViewProps> = ({ onNavigate }) => {
  const { isDark } = useTheme();

  return (
    <div
      className={`min-h-screen pb-20 transition-colors duration-200 ${
        isDark ? "bg-[#060d1b] text-slate-100" : "bg-[#f8fafc] text-slate-900"
      }`}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <Breadcrumbs
          items={[{ name: "Terms of Service", url: "/terms/" }]}
          onNavigate={onNavigate}
        />

        <div
          className={`rounded-3xl p-6 sm:p-12 border shadow-sm mt-4 space-y-8 transition-colors duration-200 ${
            isDark ? "bg-[#0d162d] border-slate-800 text-white" : "bg-white border-slate-200/80 text-slate-800"
          }`}
        >
          <div>
            <span
              className={`text-xs font-semibold px-3 py-1 rounded-full ${
                isDark ? "bg-blue-950/70 text-blue-400 border border-blue-800/50" : "bg-blue-50 text-blue-700"
              }`}
            >
              Terms &amp; Conditions
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-3">
              Terms of Service
            </h1>
            <p className={`text-xs sm:text-sm mt-2 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Effective Date: October 2026 • Canonical Domain: {SITE_CONFIG.url}
            </p>
          </div>

          <section className="space-y-3">
            <h2 className="text-xl font-bold">1. Acceptance of Terms</h2>
            <p className={`text-sm leading-relaxed ${isDark ? "text-slate-300" : "text-slate-600"}`}>
              By accessing and browsing AINOVEX (accessible at {SITE_CONFIG.url}), you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please discontinue using the website.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold">2. Informational Disclaimer</h2>
            <p className={`text-sm leading-relaxed ${isDark ? "text-slate-300" : "text-slate-600"}`}>
              All content provided on AINOVEX is for informational, educational, and editorial evaluation purposes only. While we endeavor to keep information current and factually accurate, artificial intelligence tools, pricing models, terms of service, and technical capabilities change frequently. AINOVEX makes no warranties regarding the complete accuracy or current availability of third-party software products.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold">3. External Links Disclaimer</h2>
            <p className={`text-sm leading-relaxed ${isDark ? "text-slate-300" : "text-slate-600"}`}>
              AINOVEX contains outbound links to external third-party software websites and documentation. We have no control over the content, uptime, security, or practices of external services, and inclusion of a link does not imply formal endorsement or affiliation.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold">4. Intellectual Property</h2>
            <p className={`text-sm leading-relaxed ${isDark ? "text-slate-300" : "text-slate-600"}`}>
              The original written articles, guides, comparative analyses, and website layout on AINOVEX are the intellectual property of AINOVEX and Md Shamim. Product names, logos, and trademarks referenced belong to their respective corporate owners.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold">5. Limitation of Liability</h2>
            <p className={`text-sm leading-relaxed ${isDark ? "text-slate-300" : "text-slate-600"}`}>
              To the fullest extent permitted by applicable law, AINOVEX and its author shall not be held liable for any direct, indirect, incidental, or consequential damages resulting from your use of or inability to use third-party AI software mentioned on this website.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold">6. Inquiries</h2>
            <p className={`text-sm leading-relaxed ${isDark ? "text-slate-300" : "text-slate-600"}`}>
              For any questions regarding these terms, contact us at:{" "}
              <a href="mailto:mdshamimhossaincom129@gmail.com" className="text-blue-500 underline">
                mdshamimhossaincom129@gmail.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
