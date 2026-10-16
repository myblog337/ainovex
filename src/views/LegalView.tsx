import React from 'react';
import { Breadcrumbs } from '../components/Breadcrumbs';

interface LegalViewProps {
  page: 'privacy' | 'terms' | 'editorial' | 'affiliate';
  onNavigate: (path: string) => void;
}

export const LegalView: React.FC<LegalViewProps> = ({ page, onNavigate }) => {
  const titles = {
    privacy: 'Privacy Policy',
    terms: 'Terms of Service',
    editorial: 'Editorial Policy',
    affiliate: 'Affiliate & Monetization Disclosure',
  };

  const breadcrumbLabels = {
    privacy: 'Privacy Policy',
    terms: 'Terms of Service',
    editorial: 'Editorial Policy',
    affiliate: 'Affiliate Disclosure',
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs items={[{ label: breadcrumbLabels[page] }]} onNavigate={onNavigate} />

      <div className="py-6 border-b border-slate-200 dark:border-slate-800/80 mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
          {titles[page]}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Last updated: October 10, 2026 • Published by AINOVEX Editorial Team
        </p>
      </div>

      <div className="space-y-8 text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
        {page === 'privacy' && (
          <>
            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">1. Introduction</h2>
              <p>
                At AINOVEX (accessible from https://ai-novex.netlify.app), the privacy of our visitors is of paramount importance. This Privacy Policy document outlines the types of information collected and how it is used.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">2. Log Files & Analytics</h2>
              <p>
                AINOVEX follows a standard procedure of utilizing log files. These files log visitors when they access websites. The information collected includes internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and number of clicks.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">3. Cookies & Session Storage</h2>
              <p>
                AINOVEX uses essential cookies for storing user interface preferences (such as light or dark theme choices). We do not use intrusive third-party cross-site behavioral tracking cookies.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">4. Contact Information</h2>
              <p>
                If you have questions about our privacy practices, contact us via email at <strong>mdshamimhossaincom129@gmail.com</strong>.
              </p>
            </section>
          </>
        )}

        {page === 'terms' && (
          <>
            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">1. Terms Acceptance</h2>
              <p>
                By accessing this website, you agree to be bound by these Terms and Conditions of Use and agree that you are responsible for compliance with any applicable local laws.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">2. Informational Purpose</h2>
              <p>
                All content, comparisons, prompt examples, and software directories provided on AINOVEX are for informational and educational purposes only. While we rigorously test the tools we review, external artificial intelligence software changes rapidly and without notice.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">3. Intellectual Property</h2>
              <p>
                The materials contained in this website are protected by applicable copyright and trademark law. Brand logos and trademarks of external AI tools (such as ChatGPT, Midjourney, Canva) belong to their respective corporate owners.
              </p>
            </section>
          </>
        )}

        {page === 'editorial' && (
          <>
            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Our Editorial Standards</h2>
              <p>
                At AINOVEX, our mission is to publish accurate, trustworthy, and actionable artificial intelligence guides. Every tutorial, comparison, and tool listing is authored or vetted by lead editor <strong>Md Shamim</strong>.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Testing Methodology</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>We test tools on real-world prompts, datasets, and creative projects.</li>
                <li>We independently verify pricing models (Free vs. Freemium vs. Paid) to prevent deceptive advertising.</li>
                <li>We highlight potential limitations, hallucination risks, and data privacy policies.</li>
              </ul>
            </section>
          </>
        )}

        {page === 'affiliate' && (
          <>
            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Affiliate & Advertising Transparency</h2>
              <p>
                In compliance with FTC guidelines, we maintain full disclosure regarding any current or future monetization models on AINOVEX.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Current Monetization Status</h2>
              <p>
                Google AdSense is currently not active, and affiliate tracking links are not currently active on the site. If in the future we include affiliate links for software we recommend, we will explicitly disclose it at the top of that specific guide. Our editorial reviews remain completely independent.
              </p>
            </section>
          </>
        )}
      </div>
    </div>
  );
};
