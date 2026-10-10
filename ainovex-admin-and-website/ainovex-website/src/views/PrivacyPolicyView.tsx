import React from "react";
import { Breadcrumbs } from "@/src/components/Breadcrumbs";
import { SITE_CONFIG } from "@/src/config/site";
import { useTheme } from "@/src/context/ThemeContext";

interface PrivacyPolicyViewProps {
  onNavigate: (route: string) => void;
}

export const PrivacyPolicyView: React.FC<PrivacyPolicyViewProps> = ({ onNavigate }) => {
  const { isDark } = useTheme();

  return (
    <div
      className={`min-h-screen pb-20 transition-colors duration-200 ${
        isDark ? "bg-[#060d1b] text-slate-100" : "bg-[#f8fafc] text-slate-900"
      }`}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <Breadcrumbs
          items={[{ name: "Privacy Policy", url: "/privacy-policy/" }]}
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
              Legal Transparency
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-3">
              Privacy Policy
            </h1>
            <p className={`text-xs sm:text-sm mt-2 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Effective Date: October 2026 • Canonical Domain: {SITE_CONFIG.url}
            </p>
          </div>

          <section className="space-y-3">
            <h2 className="text-xl font-bold">1. Information We Collect</h2>
            <p className={`text-sm leading-relaxed ${isDark ? "text-slate-300" : "text-slate-600"}`}>
              AINOVEX is a static-first informational publication. We do not require account registration or user logins to access any articles, tool directories, or comparisons.
            </p>
            <p className={`text-sm leading-relaxed ${isDark ? "text-slate-300" : "text-slate-600"}`}>
              When you voluntarily reach out via our contact email or contact form, we collect only the information you choose to provide (such as your name, email address, and message content) solely for the purpose of responding to your inquiry.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold">2. Cookies and Storage</h2>
            <p className={`text-sm leading-relaxed ${isDark ? "text-slate-300" : "text-slate-600"}`}>
              We do not utilize tracking cookies or user fingerprinting technologies. Standard browser local storage is utilized solely to remember client-side visual preferences (such as light or dark theme mode).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold">3. Analytics and Advertising Notice</h2>
            <p className={`text-sm leading-relaxed ${isDark ? "text-slate-300" : "text-slate-600"}`}>
              We do not currently operate third-party tracking scripts or advertising networks. If analytics services (such as Google Analytics) or advertising partners are integrated in the future, this privacy policy will be promptly revised to specify the data collected and provide appropriate opt-out mechanisms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold">4. Third-Party External Links</h2>
            <p className={`text-sm leading-relaxed ${isDark ? "text-slate-300" : "text-slate-600"}`}>
              Our website provides links to external artificial intelligence services and developer documentation. We do not control and are not responsible for the privacy practices, content, or data collection policies of external third-party websites.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold">5. Contact Information</h2>
            <p className={`text-sm leading-relaxed ${isDark ? "text-slate-300" : "text-slate-600"}`}>
              For any questions or privacy concerns regarding AINOVEX, please contact:
            </p>
            <p className="text-sm font-semibold text-blue-500">
              <a href="mailto:mdshamimhossaincom129@gmail.com">mdshamimhossaincom129@gmail.com</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
