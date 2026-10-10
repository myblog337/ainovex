import React from "react";
import { AlertCircle } from "lucide-react";
import { Breadcrumbs } from "@/src/components/Breadcrumbs";
import { useTheme } from "@/src/context/ThemeContext";

interface EditorialPolicyViewProps {
  onNavigate: (route: string) => void;
}

export const EditorialPolicyView: React.FC<EditorialPolicyViewProps> = ({ onNavigate }) => {
  const { isDark } = useTheme();

  return (
    <div
      className={`min-h-screen pb-20 transition-colors duration-200 ${
        isDark ? "bg-[#060d1b] text-slate-100" : "bg-[#f8fafc] text-slate-900"
      }`}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <Breadcrumbs
          items={[{ name: "Editorial Policy", url: "/editorial-policy/" }]}
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
              Editorial Guidelines
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-3">
              Editorial Policy &amp; Review Standards
            </h1>
            <p className={`text-xs sm:text-sm mt-2 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Last updated: October 2026 • Maintained by Md Shamim
            </p>
          </div>

          <section className="space-y-3">
            <h2 className="text-xl font-bold">1. Our Commitment to Accuracy</h2>
            <p className={`text-sm leading-relaxed ${isDark ? "text-slate-300" : "text-slate-600"}`}>
              At AINOVEX, our foremost priority is providing accurate, practical, and objective information about artificial intelligence software and workflows. Our content is written for humans first, focusing on real-world utility rather than sensationalized claims.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold">2. How We Test and Review AI Tools</h2>
            <p className={`text-sm leading-relaxed ${isDark ? "text-slate-300" : "text-slate-600"}`}>
              Whenever we conduct tool comparisons or reviews, we evaluate tools based on factual criteria:
            </p>
            <ul className={`space-y-2 text-sm pl-4 list-disc ${isDark ? "text-slate-300" : "text-slate-600"}`}>
              <li>
                <strong>Free Tier Validity:</strong> We verify whether an advertised free plan is genuinely usable or merely an ephemeral trial.
              </li>
              <li>
                <strong>Output Consistency:</strong> We evaluate whether prompt results are reproducible across multiple tests.
              </li>
              <li>
                <strong>Pricing Clarity:</strong> We cite official published pricing at the time of review, noting recurring costs and credit caps.
              </li>
              <li>
                <strong>Operational Limitations:</strong> We openly document token constraints, speed throttles, and edge-case failures.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold">3. Human Review &amp; Use of AI in Content Production</h2>
            <p className={`text-sm leading-relaxed ${isDark ? "text-slate-300" : "text-slate-600"}`}>
              As an AI publication, we utilize generative models to assist with research clustering, outlines, and exploratory testing. However, <strong>all published content is human-reviewed, edited, and fact-checked</strong> by our editorial team prior to publication.
            </p>
            <div
              className={`border rounded-2xl p-4 text-xs sm:text-sm flex items-start gap-3 ${
                isDark
                  ? "bg-amber-950/30 border-amber-800 text-amber-200"
                  : "bg-amber-50/70 border-amber-200 text-amber-950"
              }`}
            >
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <strong>Prohibition of Fabricated Information: </strong>
                We strictly prohibit the publication of unverified statistics, hallucinated citations, synthetic author credentials, or simulated benchmarks. If a metric cannot be verified via official documentation, it is excluded.
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold">4. Update &amp; Maintenance Schedule</h2>
            <p className={`text-sm leading-relaxed ${isDark ? "text-slate-300" : "text-slate-600"}`}>
              AI software changes rapidly. We regularly revisit core guide pillars and update feature descriptions, pricing structures, and model releases. Articles indicate both original publication dates and recent verified update timestamps.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold">5. Corrections Policy</h2>
            <p className={`text-sm leading-relaxed ${isDark ? "text-slate-300" : "text-slate-600"}`}>
              If an error of fact is identified, we correct it promptly. Readers who detect outdated pricing or inaccurate technical descriptions are encouraged to email our editorial desk at{" "}
              <a href="mailto:mdshamimhossaincom129@gmail.com" className="text-blue-500 underline">
                mdshamimhossaincom129@gmail.com
              </a>
              .
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold">6. Future Affiliate Disclosure Policy</h2>
            <p className={`text-sm leading-relaxed ${isDark ? "text-slate-300" : "text-slate-600"}`}>
              AINOVEX currently operates with zero affiliate compensation. If affiliate partnerships are implemented in the future, all relevant links will be explicitly disclosed in accordance with FTC guidelines and web standards. Commercial arrangements will never influence editorial rankings.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
