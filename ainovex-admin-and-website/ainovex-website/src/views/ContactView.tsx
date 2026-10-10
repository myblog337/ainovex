import React, { useState } from "react";
import { Mail, Send, CheckCircle2 } from "lucide-react";
import { Breadcrumbs } from "@/src/components/Breadcrumbs";
import { useTheme } from "@/src/context/ThemeContext";

interface ContactViewProps {
  onNavigate: (route: string) => void;
}

export const ContactView: React.FC<ContactViewProps> = ({ onNavigate }) => {
  const { isDark } = useTheme();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("Tool Suggestion");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !message) return;

    const body = [
      `Name: ${name || "Not provided"}`,
      `Reply email: ${email}`,
      `Inquiry category: ${subject}`,
      "",
      message,
    ].join("\\n");

    const mailto = `mailto:mdshamimhossaincom129@gmail.com?subject=${encodeURIComponent(`[AINOVEX] ${subject}`)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
    setSubmitted(true);
  };

  return (
    <div
      className={`min-h-screen pb-20 transition-colors duration-200 ${
        isDark ? "bg-[#060d1b] text-slate-100" : "bg-[#f8fafc] text-slate-900"
      }`}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <Breadcrumbs
          items={[{ name: "Contact", url: "/contact/" }]}
          onNavigate={onNavigate}
        />

        <div
          className={`rounded-3xl p-6 sm:p-12 border shadow-sm mt-4 transition-colors duration-200 ${
            isDark ? "bg-[#0d162d] border-slate-800 text-white" : "bg-white border-slate-200/80 text-slate-900"
          }`}
        >
          <div className="max-w-2xl mb-10">
            <span
              className={`text-xs font-semibold px-3 py-1 rounded-full ${
                isDark ? "bg-blue-950/70 text-blue-400 border border-blue-800/50" : "bg-blue-50 text-blue-700"
              }`}
            >
              Get in Touch
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-3">
              Contact AINOVEX
            </h1>
            <p className={`text-sm sm:text-base mt-3 leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              We welcome reader feedback, tool suggestions, factual corrections, and editorial inquiries.
              All messages are personally reviewed by our editorial team.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
            {/* Contact Details (5 cols) */}
            <div className="md:col-span-5 space-y-6">
              <div
                className={`p-6 rounded-2xl border space-y-3 ${
                  isDark ? "bg-[#080f1e] border-slate-800" : "bg-slate-50 border-slate-200/80"
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
                  <Mail className="w-5 h-5" />
                </div>
                <h2 className="text-base font-bold">Direct Editorial Email</h2>
                <p className={`text-xs leading-relaxed ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  For formal communications, corrections, or media queries, please email us directly:
                </p>
                <a
                  href="mailto:mdshamimhossaincom129@gmail.com"
                  className="text-sm font-semibold text-blue-500 hover:text-blue-400 break-all block"
                >
                  mdshamimhossaincom129@gmail.com
                </a>
              </div>

              <div
                className={`p-6 rounded-2xl border space-y-2 ${
                  isDark ? "bg-[#080f1e] border-slate-800" : "bg-slate-50 border-slate-200/80"
                }`}
              >
                <h3 className="text-sm font-bold">Response Window</h3>
                <p className={`text-xs leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                  We endeavor to reply to all legitimate inquiries within 24 to 48 business hours.
                </p>
              </div>

              <div
                className={`p-6 rounded-2xl border space-y-2 ${
                  isDark ? "bg-[#080f1e] border-slate-800" : "bg-slate-50 border-slate-200/80"
                }`}
              >
                <h3 className="text-sm font-bold">Tool Submissions</h3>
                <p className={`text-xs leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                  Submitting a tool does not guarantee inclusion. All tools must satisfy our editorial criteria for utility, stability, and pricing transparency.
                </p>
              </div>
            </div>

            {/* Message Form (7 cols) */}
            <div className="md:col-span-7">
              {submitted ? (
                <div
                  className={`p-8 rounded-2xl border text-center space-y-4 ${
                    isDark ? "bg-emerald-950/40 border-emerald-800 text-emerald-200" : "bg-emerald-50 border-emerald-200 text-emerald-950"
                  }`}
                >
                  <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold">Thank You for Reaching Out</h3>
                  <p className="text-xs sm:text-sm leading-relaxed">
                    Your email app should open with your message addressed to the AINOVEX editorial desk. Please send it from your email app to complete delivery.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setMessage("");
                      setName("");
                      setEmail("");
                    }}
                    className="mt-4 px-4 py-2 bg-emerald-700 text-white text-xs font-semibold rounded-xl hover:bg-emerald-800 cursor-pointer"
                  >
                    Send Another Note
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label
                      htmlFor="contact-name"
                      className={`block text-xs font-semibold mb-1.5 ${
                        isDark ? "text-slate-300" : "text-slate-700"
                      }`}
                    >
                      Your Name
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Alex Taylor"
                      className={`w-full rounded-xl px-4 py-2.5 text-xs sm:text-sm border transition-colors focus:outline-none focus:border-blue-500 ${
                        isDark
                          ? "bg-[#080f1e] border-slate-700 text-white placeholder:text-slate-500"
                          : "bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:bg-white"
                      }`}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="contact-email"
                      className={`block text-xs font-semibold mb-1.5 ${
                        isDark ? "text-slate-300" : "text-slate-700"
                      }`}
                    >
                      Your Email Address
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alex@example.com"
                      className={`w-full rounded-xl px-4 py-2.5 text-xs sm:text-sm border transition-colors focus:outline-none focus:border-blue-500 ${
                        isDark
                          ? "bg-[#080f1e] border-slate-700 text-white placeholder:text-slate-500"
                          : "bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:bg-white"
                      }`}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="contact-subject"
                      className={`block text-xs font-semibold mb-1.5 ${
                        isDark ? "text-slate-300" : "text-slate-700"
                      }`}
                    >
                      Inquiry Category
                    </label>
                    <select
                      id="contact-subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className={`w-full rounded-xl px-4 py-2.5 text-xs sm:text-sm border transition-colors focus:outline-none focus:border-blue-500 ${
                        isDark
                          ? "bg-[#080f1e] border-slate-700 text-white"
                          : "bg-slate-50 border-slate-200 text-slate-800 focus:bg-white"
                      }`}
                    >
                      <option value="Tool Suggestion">AI Tool Suggestion</option>
                      <option value="Correction">Factual Correction / Update</option>
                      <option value="Editorial Query">Editorial Query</option>
                      <option value="General Feedback">General Feedback</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="contact-message"
                      className={`block text-xs font-semibold mb-1.5 ${
                        isDark ? "text-slate-300" : "text-slate-700"
                      }`}
                    >
                      Message
                    </label>
                    <textarea
                      id="contact-message"
                      rows={5}
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Please provide details about your inquiry, tool suggestion, or feedback..."
                      className={`w-full rounded-xl px-4 py-2.5 text-xs sm:text-sm border transition-colors focus:outline-none focus:border-blue-500 resize-y ${
                        isDark
                          ? "bg-[#080f1e] border-slate-700 text-white placeholder:text-slate-500"
                          : "bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:bg-white"
                      }`}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow-blue-500/20 active:scale-95"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Message to Editorial Desk</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
