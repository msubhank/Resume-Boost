import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Copy,
  Check,
  Download,
  Printer,
  RefreshCw,
  Building2,
  User,
  Sliders,
  Mail,
  Award,
  AlertCircle,
  FileCheck,
  SendHorizontal
} from 'lucide-react';

interface CoverLetterGeneratorProps {
  resumeText: string;
  jobDescription: string;
}

type ToneType = 'professional' | 'modern' | 'concise' | 'enthusiastic';

interface ToneOption {
  id: ToneType;
  label: string;
  desc: string;
  icon: string;
  badgeColor: string;
}

const TONE_OPTIONS: ToneOption[] = [
  {
    id: 'professional',
    label: 'Formal & Corporate',
    desc: 'Authoritative, polished, enterprise-ready',
    icon: '👔',
    badgeColor: 'border-blue-500/40 text-blue-300 bg-blue-950/20'
  },
  {
    id: 'modern',
    label: 'Modern & Startup',
    desc: 'Dynamic, agile, engaging, tech-focused',
    icon: '🚀',
    badgeColor: 'border-indigo-500/40 text-indigo-300 bg-indigo-950/20'
  },
  {
    id: 'concise',
    label: 'Concise & Impactful',
    desc: 'Direct, under 250 words, metric-driven',
    icon: '⚡',
    badgeColor: 'border-emerald-500/40 text-emerald-300 bg-emerald-950/20'
  },
  {
    id: 'enthusiastic',
    label: 'Passionate & Warm',
    desc: 'Mission-driven, high-energy, culture-fit',
    icon: '✨',
    badgeColor: 'border-purple-500/40 text-purple-300 bg-purple-950/20'
  }
];

export const CoverLetterGenerator: React.FC<CoverLetterGeneratorProps> = ({
  resumeText,
  jobDescription
}) => {
  const [tone, setTone] = useState<ToneType>('professional');
  const [companyName, setCompanyName] = useState('');
  const [hiringManager, setHiringManager] = useState('');
  const [loading, setLoading] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [subjectLine, setSubjectLine] = useState('');
  const [keyHighlights, setKeyHighlights] = useState<string[]>([]);
  const [copiedLetter, setCopiedLetter] = useState(false);
  const [copiedSubject, setCopiedSubject] = useState(false);
  const [error, setError] = useState('');
  const [hasGenerated, setHasGenerated] = useState(false);

  const wordCount = coverLetter.trim() ? coverLetter.trim().split(/\s+/).length : 0;
  const charCount = coverLetter.length;

  const handleGenerate = async () => {
    if (!resumeText.trim() || !jobDescription.trim()) {
      setError('Please upload your resume and provide a job description first.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/generate-cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText,
          jobDescription,
          tone,
          companyName: companyName.trim() || undefined,
          hiringManager: hiringManager.trim() || undefined
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate cover letter. Ensure backend is running and Gemini API key is configured.');
      }

      const data = await response.json();
      setCoverLetter(data.coverLetter || '');
      setSubjectLine(data.subjectLine || '');
      setKeyHighlights(data.keyHighlights || []);
      setHasGenerated(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred while generating the cover letter.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLetter = async () => {
    if (!coverLetter) return;
    try {
      await navigator.clipboard.writeText(coverLetter);
      setCopiedLetter(true);
      setTimeout(() => setCopiedLetter(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleCopySubject = async () => {
    if (!subjectLine) return;
    try {
      await navigator.clipboard.writeText(subjectLine);
      setCopiedSubject(true);
      setTimeout(() => setCopiedSubject(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleDownloadTxt = () => {
    if (!coverLetter) return;
    const content = `Subject: ${subjectLine}\n\n${coverLetter}`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${companyName ? companyName.replace(/\s+/g, '_') + '_' : ''}Cover_Letter.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    if (!coverLetter) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Cover Letter - ${companyName || 'Application'}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              line-height: 1.6;
              color: #111827;
              padding: 40px;
              max-width: 800px;
              margin: 0 auto;
              white-space: pre-wrap;
              font-size: 14px;
            }
            .subject {
              font-weight: bold;
              margin-bottom: 24px;
              color: #1f2937;
              border-bottom: 1px solid #e5e7eb;
              padding-bottom: 12px;
            }
          </style>
        </head>
        <body>
          ${subjectLine ? `<div class="subject">Subject: ${subjectLine}</div>` : ''}
          <div>${coverLetter.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Configuration Box */}
      <div className="bg-[#0b0f19]/60 border border-gray-800/80 rounded-xl p-4 space-y-4">
        {/* Tone Selector */}
        <div>
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2.5 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-indigo-400" />
            Select Tone Style
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {TONE_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setTone(opt.id)}
                className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                  tone === opt.id
                    ? `${opt.badgeColor} ring-1 ring-indigo-500/50 shadow-md shadow-indigo-950/30`
                    : 'bg-[#111827]/40 border-gray-800/80 text-gray-400 hover:text-gray-200 hover:border-gray-700'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <span>{opt.icon}</span>
                  <span className="truncate">{opt.label}</span>
                </div>
                <span className="text-[10px] text-gray-500 line-clamp-1">{opt.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Optional Metadata: Company Name & Hiring Manager */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-gray-800/60">
          <div>
            <label className="text-[11px] font-semibold text-gray-400 block mb-1.5 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-gray-500" />
              Company Name (Optional)
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Stripe, Google, Airbnb"
              className="w-full bg-[#111827]/80 border border-gray-800 rounded-lg px-3 py-2 text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-gray-400 block mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-gray-500" />
              Hiring Manager / Recruiter Name (Optional)
            </label>
            <input
              type="text"
              value={hiringManager}
              onChange={(e) => setHiringManager(e.target.value)}
              placeholder="e.g. Sarah Jenkins"
              className="w-full bg-[#111827]/80 border border-gray-800 rounded-lg px-3 py-2 text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs px-5 py-2.5 rounded-lg shadow-lg shadow-indigo-950/50 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                Crafting Tailored Cover Letter...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-indigo-200" />
                {hasGenerated ? 'Regenerate Cover Letter' : 'Generate Tailored Cover Letter'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-rose-950/30 border border-rose-900/50 rounded-xl text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Output Results */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-8 border border-gray-800/80 rounded-xl bg-[#0b0f19]/30 flex flex-col items-center justify-center gap-3 text-center"
          >
            <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-semibold text-gray-300">
              Analyzing candidate achievements & matching against job description...
            </p>
            <p className="text-[11px] text-gray-500">
              Applying selected tone style ({tone}) and drafting customized paragraphs.
            </p>
          </motion.div>
        ) : hasGenerated && coverLetter ? (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Subject Line Pill */}
            {subjectLine && (
              <div className="p-3 bg-[#0f172a]/60 border border-indigo-900/40 rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 overflow-hidden">
                  <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider shrink-0">
                    Subject Line:
                  </span>
                  <span className="text-xs font-medium text-gray-200 truncate">
                    {subjectLine}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopySubject}
                  className="flex items-center gap-1 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 bg-indigo-950/40 hover:bg-indigo-950/80 border border-indigo-900/60 px-2.5 py-1 rounded-md transition-colors shrink-0 cursor-pointer"
                >
                  {copiedSubject ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      Copy Subject
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Key Strengths Highlighted */}
            {keyHighlights.length > 0 && (
              <div className="p-3 bg-[#0b0f19]/50 border border-gray-800/80 rounded-xl space-y-1.5">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block flex items-center gap-1.5">
                  <Award className="w-3 h-3" />
                  Key Strengths Woven into this Letter ({keyHighlights.length})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {keyHighlights.map((highlight, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] font-medium bg-indigo-950/25 border border-indigo-800/30 text-indigo-300 px-2.5 py-0.5 rounded-md flex items-center gap-1"
                    >
                      <FileCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                      {highlight}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Cover Letter Text Area */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span className="font-semibold text-gray-300 flex items-center gap-1.5">
                  <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Generated Letter (Editable)
                </span>
                <span className="text-[11px] text-gray-500 font-mono">
                  {wordCount} words • {charCount} chars
                </span>
              </div>

              <textarea
                rows={14}
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                className="w-full bg-[#0b0f19]/80 border border-gray-800 rounded-xl p-4 text-xs sm:text-sm text-gray-200 leading-relaxed font-sans focus:outline-none focus:border-indigo-500 transition-colors resize-y shadow-inner"
              />
            </div>

            {/* Bottom Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <span className="text-[11px] text-gray-500 italic">
                💡 Feel free to edit the text directly in the box above before exporting.
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyLetter}
                  className="flex items-center gap-1.5 bg-[#111827] hover:bg-gray-800 border border-gray-700 text-gray-200 text-xs font-semibold px-3 py-2 rounded-lg transition-colors cursor-pointer"
                >
                  {copiedLetter ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copy Letter
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleDownloadTxt}
                  className="flex items-center gap-1.5 bg-[#111827] hover:bg-gray-800 border border-gray-700 text-gray-200 text-xs font-semibold px-3 py-2 rounded-lg transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-indigo-400" />
                  Download (.txt)
                </button>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 bg-[#111827] hover:bg-gray-800 border border-gray-700 text-gray-200 text-xs font-semibold px-3 py-2 rounded-lg transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-emerald-400" />
                  Print / PDF
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="p-8 border border-dashed border-gray-800 rounded-xl bg-[#0b0f19]/20 flex flex-col items-center justify-center gap-2 text-center">
            <SendHorizontal className="w-8 h-8 text-gray-600 mb-1" />
            <p className="text-xs font-semibold text-gray-400">
              Ready to generate your customized cover letter
            </p>
            <p className="text-[11px] text-gray-500 max-w-sm">
              Select your preferred tone above and click "Generate Tailored Cover Letter" to craft an application letter aligned with your resume.
            </p>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
