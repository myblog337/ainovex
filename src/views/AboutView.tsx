import React from 'react';
import { ShieldCheck, Award, Zap, Users, Mail, Globe } from 'lucide-react';
import { Breadcrumbs } from '../components/Breadcrumbs';

interface AboutViewProps {
  onNavigate: (path: string) => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs items={[{ label: 'About Us' }]} onNavigate={onNavigate} />

      <div className="py-6 border-b border-slate-200 dark:border-slate-800/80 mb-10 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20 mb-3">
          <span>Our Story & Mission</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
          Empowering Creators with Artificial Intelligence
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          AINOVEX was created to cut through the marketing noise and deliver handpicked, thoroughly tested AI tools, tutorials, and benchmarks.
        </p>
      </div>

      <div className="space-y-10 text-slate-700 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
        <section className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
            Who We Are
          </h2>
          <p className="mb-3">
            Founded by <strong>Md Shamim</strong>, AINOVEX is an independent digital publication and curated software directory headquartered on the open web. We cater to an audience across the United States, United Kingdom, Canada, and English-speaking technologists worldwide.
          </p>
          <p>
            With thousands of artificial intelligence startups launching monthly, finding tools that truly deliver ROI, protect user privacy, and preserve workflow sanity has become a daunting task. AINOVEX serves as your trusted filter.
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 shadow-sm">
            <ShieldCheck className="w-8 h-8 text-sky-500 dark:text-sky-400 mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Hands-on Testing</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Every tool featured in our directory undergoes real testing on real tasks before receiving a recommendation.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 shadow-sm">
            <Award className="w-8 h-8 text-amber-500 dark:text-amber-400 mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Editorial Integrity</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Our guides are independent. We do not accept paid placements to inflate reviews or rankings.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 shadow-sm">
            <Zap className="w-8 h-8 text-emerald-500 dark:text-emerald-400 mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Practical Workflows</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              We focus on actionable recipes, prompt templates, and integrations that deliver tangible time savings.
            </p>
          </div>
        </section>

        <section className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Get in Touch</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Have a tool you would like us to review, or feedback on a guide?
            </p>
          </div>
          <button
            onClick={() => onNavigate('/contact')}
            className="px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/30 whitespace-nowrap cursor-pointer"
          >
            Contact the Editorial Team
          </button>
        </section>
      </div>
    </div>
  );
};
