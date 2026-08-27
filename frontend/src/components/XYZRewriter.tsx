import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Copy, Check, Info } from 'lucide-react';

interface Suggestion {
  text: string;
  x: string;
  y: string;
  z: string;
}

interface XYZRewriterProps {
  initialBullet?: string;
  jobContext?: string;
}

const PRESETS = [
  "Responsible for writing code and developing features.",
  "Fixed bugs in the company database and website.",
  "Managed a team of engineers to build a dashboard.",
  "Helped increase sales and client onboarding."
];

export const XYZRewriter: React.FC<XYZRewriterProps> = ({ 
  initialBullet = '', 
  jobContext = '' 
}) => {
  const [bullet, setBullet] = useState(initialBullet);
  const [context, setContext] = useState(jobContext);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  // Handle preset clicks
  const applyPreset = (preset: string) => {
    setBullet(preset);
  };

  // Call the backend API
  const handleOptimize = async () => {
    if (!bullet.trim()) return;
    setLoading(true);
    setError('');
    setSuggestions([]);
    try {
      const response = await fetch('http://localhost:5000/api/optimize-bullet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bulletPoint: bullet,
          jobContext: context,
        }),
      });

      if (!response.ok) {
        throw new Error('API server returned an error. Make sure backend is running and Gemini API key is configured.');
      }

      const data = await response.json();
      if (data.suggestions && data.suggestions.length > 0) {
        setSuggestions(data.suggestions);
        setSelectedIndex(0);
      } else {
        throw new Error('No suggestions returned from the model.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to connect to backend optimization service.');
    } finally {
      setLoading(false);
    }
  };

  // Copy to clipboard
  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  const selectedSuggestion = suggestions[selectedIndex];

  return (
    <div className="flex flex-col gap-6">
      {/* Input area */}
      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Paste a weak bullet point to rewrite
          </label>
          <textarea
            value={bullet}
            onChange={(e) => setBullet(e.target.value)}
            placeholder="e.g., Worked on the frontend and fixed bug tickets"
            rows={3}
            className="w-full bg-[#111827]/80 border border-gray-800 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-white placeholder-gray-600 resize-none"
          />
        </div>

        {/* Quick presets */}
        {suggestions.length === 0 && !loading && (
          <div>
            <span className="text-xs text-gray-500 block mb-2">Quick Presets (Click to test):</span>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => applyPreset(preset)}
                  className="text-xs bg-[#111827] border border-gray-800 hover:border-indigo-500/50 hover:bg-[#1a2333] transition-all rounded-lg py-1.5 px-3 text-gray-400 cursor-pointer"
                >
                  {preset.length > 40 ? preset.substring(0, 40) + '...' : preset}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Target Job Title / Context (Optional)
          </label>
          <input
            type="text"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="e.g., Senior Full Stack Engineer"
            className="w-full bg-[#111827]/80 border border-gray-800 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-white placeholder-gray-600"
          />
        </div>

        <button
          onClick={handleOptimize}
          disabled={loading || !bullet.trim()}
          className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 disabled:opacity-50 text-white font-medium text-sm py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-indigo-900/20 active:scale-[0.99]"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Analyzing & Rewriting...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Optimize with Google XYZ Method</span>
            </>
          )}
        </button>

        {error && (
          <div className="p-3 bg-red-950/50 border border-red-900/50 rounded-xl text-xs text-red-400 flex gap-2">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Loading Skeletons */}
      {loading && (
        <div className="flex flex-col gap-4 animate-pulse">
          <div className="h-6 w-1/3 bg-gray-800 rounded" />
          <div className="space-y-2">
            <div className="h-10 bg-gray-800 rounded-xl" />
            <div className="h-10 bg-gray-800 rounded-xl" />
            <div className="h-10 bg-gray-800 rounded-xl" />
          </div>
        </div>
      )}

      {/* Suggestions Display */}
      {suggestions.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-5 border-t border-gray-800/80 pt-5"
        >
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-1.5 mb-3">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Google XYZ Method Variations
            </h3>

            {/* Variation Selection Tabs */}
            <div className="flex gap-2">
              {suggestions.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedIndex(idx)}
                  className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                    selectedIndex === idx 
                      ? 'bg-indigo-600/10 border-indigo-500/50 text-indigo-300' 
                      : 'bg-[#111827]/40 border-gray-800 text-gray-500 hover:text-gray-300 hover:border-gray-700'
                  }`}
                >
                  Option {idx + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Current Suggestion Details */}
          {selectedSuggestion && (
            <div className="flex flex-col gap-4">
              {/* Copyable Box */}
              <div className="relative group bg-[#0e1420] border border-indigo-950/80 hover:border-indigo-900/60 rounded-xl p-4 transition-all">
                <p className="text-sm text-gray-100 pr-10 leading-relaxed font-medium">
                  {selectedSuggestion.text}
                </p>
                <button
                  onClick={() => handleCopy(selectedSuggestion.text)}
                  className="absolute top-3 right-3 p-1.5 bg-gray-900 border border-gray-800 rounded-lg text-gray-400 hover:text-white hover:border-gray-600 transition-all cursor-pointer"
                  title="Copy bullet point"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* XYZ breakdown cards */}
              <div className="flex flex-col gap-3">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Formula Component Analysis
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {/* X Component */}
                  <div className="flex flex-col bg-indigo-950/20 border border-indigo-900/25 rounded-xl p-3">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-1">
                      [X] Accomplished Achievement
                    </span>
                    <p className="text-xs text-indigo-200">{selectedSuggestion.x || 'N/A'}</p>
                  </div>

                  {/* Y Component */}
                  <div className="flex flex-col bg-emerald-950/20 border border-emerald-900/25 rounded-xl p-3">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1">
                      [Y] Measurement & Impact (Metrics)
                    </span>
                    <p className="text-xs text-emerald-200">{selectedSuggestion.y || 'N/A'}</p>
                  </div>

                  {/* Z Component */}
                  <div className="flex flex-col bg-purple-950/20 border border-purple-900/25 rounded-xl p-3">
                    <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider mb-1">
                      [Z] Actions & Methods Used
                    </span>
                    <p className="text-xs text-purple-200">{selectedSuggestion.z || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};
