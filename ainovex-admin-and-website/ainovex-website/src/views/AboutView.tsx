import React from "react";
import { Mail, CheckCircle2 } from "lucide-react";
import { Breadcrumbs } from "@/src/components/Breadcrumbs";
import { useTheme } from "@/src/context/ThemeContext";

interface AboutViewProps {
  onNavigate: (route: string) => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onNavigate }) => {
  const { isDark } = useTheme();

  return (
    <div
      className={`min-h-screen pb-20 transition-colors duration-200 ${
        isDark ? "bg-[#060d1b] text-slate-100" : "bg-[#f8fafc] text-slate-900"
      }`}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <Breadcrumbs
          items={[{ name: "About", url: "/about/" }]}
          onNavigate={onNavigate}
        />

        <div
          className={`rounded-3xl p-6 sm:p-12 border shadow-sm mt-4 space-y-10 transition-colors duration-200 ${
            isDark ? "bg-[#0d162d] border-slate-800 text-white" : "bg-white border-slate-200/80 text-slate-900"
          }`}
        >
          <div>
            <span
              className={`text-xs font-semibold px-3 py-1 rounded-full ${
                isDark ? "bg-blue-950/70 text-blue-400 border border-blue-800/50" : "bg-blue-50 text-blue-700"
              }`}
            >
              Our Mission &amp; Editorial Standards
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-3">
              About AINOVEX
            </h1>
            <p className={`text-base sm:text-lg mt-4 leading-relaxed ${isDark ? "text-slate-300" : "text-slate-600"}`}>
              AINOVEX is an independent global English-language publication dedicated to helping professionals,
              students, creators, and developers navigate the rapidly evolving world of artificial intelligence.
            </p>
          </div>

          {/* Core Purpose */}
          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold">
              Why We Built AINOVEX
            </h2>
            <p className={`text-sm sm:text-base leading-relaxed ${isDark ? "text-slate-300" : "text-slate-600"}`}>
              Every week, hundreds of new AI software applications launch, accompanied by aggressive marketing
              claims, artificial benchmarks, and opaque pricing tiers. Finding genuinely useful, reliable software
              has become challenging.
            </p>
            <p className={`text-sm sm:text-base leading-relaxed ${isDark ? "text-slate-300" : "text-slate-600"}`}>
              AINOVEX cuts through the hype with transparent, human-reviewed assessments. We identify verified free
              tiers, analyze practical workflows, highlight real limitations, and compare competing models so you can
              work smarter without wasting time or money.
            </p>
          </section>

          {/* Editorial Philosophy */}
          <section
            className={`space-y-4 p-6 sm:p-8 rounded-2xl border ${
              isDark ? "bg-[#080f1e] border-slate-800" : "bg-slate-50 border-slate-200/80"
            }`}
          >
            <h2 className="text-xl font-bold">
              Our 4 Editorial Principles
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold">1. People-First Value</h3>
                  <p className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    Every article and review addresses genuine reader questions and practical problems rather than targeting empty keywords.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold">2. No Fabricated Benchmarks</h3>
                  <p className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    We never invent search metrics, fake user ratings, or unverified feature capabilities.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold">3. Human Review &amp; Fact-Checking</h3>
                  <p className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    While we leverage AI for research organization, all published guidance is reviewed and vetted by human editors.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold">4. Transparent Disclosures</h3>
                  <p className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    We clearly distinguish free tiers from paid enterprise plans and state real operational limitations.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Author Attribution */}
          <section className={`border-t pt-8 ${isDark ? "border-slate-800" : "border-slate-100"}`}>
            <h2 className="text-xl font-bold mb-4">
              Editorial Leadership
            </h2>
            <div
              className={`flex items-center gap-4 p-5 rounded-2xl border shadow-sm ${
                isDark ? "bg-[#080f1e] border-slate-800" : "bg-white border-slate-200"
              }`}
            >
              <div className="w-14 h-14 rounded-2xl bg-[#0a1128] text-blue-400 flex items-center justify-center font-bold text-lg shadow-sm">
                MS
              </div>
              <div>
                <div className="font-bold text-base sm:text-lg flex items-center gap-2">
                  <span>Md Shamim</span>
                  <span
                    className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                      isDark ? "bg-blue-950 text-blue-300 border border-blue-800" : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    Lead Editor &amp; AI Specialist
                  </span>
                </div>
                <p className={`text-xs sm:text-sm mt-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                  Oversees content accuracy, fact-checking workflows, and AI tool evaluations for AINOVEX.
                </p>
              </div>
            </div>
          </section>

          {/* Contact callout */}
          <section
            className={`border rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              isDark
                ? "bg-[#080f1e] border-slate-800 text-white"
                : "bg-blue-50/70 border-blue-200/80 text-blue-950"
            }`}
          >
            <div>
              <h3 className={`text-base font-bold ${isDark ? "text-white" : "text-blue-950"}`}>Have a Question or Tool Suggestion?</h3>
              <p className={`text-xs sm:text-sm mt-1 ${isDark ? "text-slate-400" : "text-blue-800"}`}>
                Reach out directly to our editorial desk for corrections, feedback, or tool submissions.
              </p>
            </div>
            <a
              href="mailto:mdshamimhossaincom129@gmail.com"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl text-xs transition-colors shrink-0 shadow-sm"
            >
              <Mail className="w-4 h-4" />
              <span>mdshamimhossaincom129@gmail.com</span>
            </a>
          </section>
        </div>
      </div>
    </div>
  );
};
