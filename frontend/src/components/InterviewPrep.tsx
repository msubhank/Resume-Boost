import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  HelpCircle,
  Sparkles,
  MessageSquare,
  Award,
  CheckCircle2,
  ListTodo
} from 'lucide-react';

export interface Question {
  question: string;
  type: string; // 'Technical', 'Behavioral', 'Resume-Gap'
  whyAsked: string;
  answerStrategy: string;
  sampleAnswer: string;
}

interface InterviewPrepProps {
  questions: Question[];
  isLoading: boolean;
  onFetchQuestions: () => void;
  hasLoaded: boolean;
}

export function InterviewPrep({ questions, isLoading, onFetchQuestions, hasLoaded }: InterviewPrepProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [practicedIds, setPracticedIds] = useState<Record<number, boolean>>({});
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState<'All' | 'Technical' | 'Behavioral' | 'Resume-Gap'>('All');

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const togglePracticed = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setPracticedIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleCopy = async (id: number, text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  // Filter questions
  const filteredQuestions = questions.filter(q => {
    if (activeFilter === 'All') return true;
    return q.type.toLowerCase() === activeFilter.toLowerCase();
  });

  // Calculate completion progress
  const totalQuestions = questions.length;
  const practicedCount = Object.values(practicedIds).filter(Boolean).length;
  const percentPracticed = totalQuestions > 0 ? Math.round((practicedCount / totalQuestions) * 100) : 0;

  // Filter options
  const filterOptions: Array<'All' | 'Technical' | 'Behavioral' | 'Resume-Gap'> = [
    'All',
    'Technical',
    'Behavioral',
    'Resume-Gap'
  ];

  // 1. Loading Skeleton Screen
  if (isLoading) {
    return (
      <div className="space-y-4 py-2">
        {/* Progress simulator skeleton */}
        <div className="h-14 bg-gray-900/40 border border-gray-800/80 rounded-xl p-3 animate-pulse flex justify-between items-center">
          <div className="w-1/3 h-4 bg-gray-800 rounded" />
          <div className="w-1/4 h-3 bg-gray-800 rounded" />
        </div>

        {/* Filter chips skeleton */}
        <div className="flex gap-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-8 w-20 bg-gray-900/40 border border-gray-800/80 rounded-lg animate-pulse" />
          ))}
        </div>

        {/* Question cards skeleton */}
        {[1, 2, 3].map(i => (
          <div key={i} className="border border-gray-900/80 bg-[#0b0f19]/40 rounded-xl p-4 space-y-3 animate-pulse">
            <div className="flex justify-between items-start gap-4">
              <div className="flex gap-2 items-center flex-1">
                <div className="w-5 h-5 rounded-full bg-gray-800 shrink-0" />
                <div className="h-4 bg-gray-800 rounded w-3/4" />
              </div>
              <div className="w-16 h-5 bg-gray-800 rounded shrink-0" />
            </div>
            <div className="h-3 bg-gray-800 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  // 2. Initial CTA Screen (if not loaded yet)
  if (!hasLoaded) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-10 px-4 bg-[#0b0f19]/30 border border-gray-900/80 rounded-2xl">
        <div className="w-14 h-14 rounded-full bg-indigo-950/30 border border-indigo-900/40 flex items-center justify-center mb-4">
          <Sparkles className="w-6 h-6 text-indigo-400" />
        </div>
        <h3 className="text-base font-bold text-white mb-2">Generate Tailored Interview Questions</h3>
        <p className="text-xs text-gray-400 max-w-sm mb-6 leading-relaxed">
          Gemini will analyze your resume achievements and the target job description to build a custom interview prep kit containing technical, behavioral, and resume gap questions.
        </p>
        <button
          onClick={onFetchQuestions}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs py-3 px-6 rounded-xl transition-all cursor-pointer shadow-lg shadow-indigo-900/20 flex items-center gap-2"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Generate Interview Prep Kit
        </button>
      </div>
    );
  }

  // 3. Question Dashboard Screen
  return (
    <div className="space-y-5">
      {/* Practice Progress Bar */}
      <div className="bg-gray-900/30 border border-gray-950/90 rounded-xl p-4">
        <div className="flex justify-between items-center mb-2.5">
          <div className="flex items-center gap-2">
            <ListTodo className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold text-white">Interview Practice Progress</span>
          </div>
          <span className="text-xs font-semibold text-gray-400">
            {practicedCount} of {totalQuestions} Practiced ({percentPracticed}%)
          </span>
        </div>
        <div className="w-full bg-gray-950 h-2 rounded-full overflow-hidden border border-gray-900/40">
          <motion.div
            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${percentPracticed}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {filterOptions.map(option => (
          <button
            key={option}
            onClick={() => setActiveFilter(option)}
            className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${activeFilter === option
                ? 'bg-indigo-600/10 border-indigo-500/50 text-indigo-300'
                : 'bg-gray-900/30 border-gray-900 text-gray-400 hover:text-gray-300 hover:border-gray-800'
              }`}
          >
            {option === 'Resume-Gap' ? 'Resume Gaps' : option}
          </button>
        ))}
      </div>

      {/* Questions list */}
      <div className="space-y-3">
        {filteredQuestions.length === 0 ? (
          <div className="text-center py-8 text-xs text-gray-500 border border-dashed border-gray-900 rounded-xl">
            No questions of type "{activeFilter}" generated.
          </div>
        ) : (
          filteredQuestions.map((q) => {
            const actualIdx = questions.findIndex(originalQ => originalQ.question === q.question);
            const isExpanded = expandedId === actualIdx;
            const isPracticed = !!practicedIds[actualIdx];

            return (
              <div
                key={actualIdx}
                className={`border rounded-xl transition-all overflow-hidden ${isExpanded
                    ? 'border-indigo-500/40 bg-indigo-950/5'
                    : 'border-gray-900 bg-[#0b0f19]/30 hover:border-gray-800'
                  }`}
              >
                {/* Header */}
                <div
                  onClick={() => toggleExpand(actualIdx)}
                  className="p-4 flex items-start justify-between gap-4 cursor-pointer select-none"
                >
                  <div className="flex gap-3 items-start flex-1">
                    <button
                      onClick={(e) => togglePracticed(actualIdx, e)}
                      className={`mt-0.5 shrink-0 w-5 h-5 rounded-full border flex items-center justify-center transition-all ${isPracticed
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                          : 'border-gray-700 hover:border-indigo-400 text-transparent'
                        }`}
                      title={isPracticed ? "Mark as unpracticed" : "Mark as practiced"}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </button>

                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${q.type === 'Technical'
                            ? 'bg-blue-950/40 border border-blue-900/50 text-blue-300'
                            : q.type === 'Behavioral'
                              ? 'bg-purple-950/40 border border-purple-900/50 text-purple-300'
                              : 'bg-amber-950/40 border border-amber-900/50 text-amber-300'
                          }`}>
                          {q.type}
                        </span>
                        {isPracticed && (
                          <span className="text-[10px] font-medium text-emerald-400 flex items-center gap-0.5">
                            ✓ Practiced
                          </span>
                        )}
                      </div>
                      <h4 className={`text-xs font-bold leading-relaxed ${isExpanded ? 'text-indigo-200' : 'text-gray-200'}`}>
                        {q.question}
                      </h4>
                    </div>
                  </div>

                  <div className="text-gray-500 hover:text-gray-300 mt-1 shrink-0">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>

                {/* Details Accordion Content */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="overflow-hidden border-t border-gray-900/60"
                    >
                      <div className="p-4 space-y-4 text-xs leading-relaxed">

                        {/* Why Asked */}
                        <div className="bg-gray-900/10 border border-gray-950 p-3 rounded-lg">
                          <h5 className="font-bold text-gray-300 flex items-center gap-1.5 mb-1.5">
                            <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                            Why is this asked?
                          </h5>
                          <p className="text-gray-400">{q.whyAsked}</p>
                        </div>

                        {/* Answer Strategy */}
                        <div className="bg-gray-900/10 border border-gray-950 p-3 rounded-lg">
                          <h5 className="font-bold text-gray-300 flex items-center gap-1.5 mb-1.5">
                            <Award className="w-3.5 h-3.5 text-purple-400" />
                            Suggested Strategy
                          </h5>
                          <p className="text-gray-400">{q.answerStrategy}</p>
                        </div>

                        {/* Sample Answer */}
                        <div className="bg-indigo-950/10 border border-indigo-900/20 p-4 rounded-lg relative group">
                          <div className="flex justify-between items-center mb-2">
                            <h5 className="font-bold text-indigo-300 flex items-center gap-1.5">
                              <MessageSquare className="w-3.5 h-3.5" />
                              Tailored Sample Answer
                            </h5>
                            <button
                              onClick={(e) => handleCopy(actualIdx, q.sampleAnswer, e)}
                              className="text-[10px] font-bold text-gray-400 hover:text-white bg-gray-900 border border-gray-800 rounded px-2 py-1 flex items-center gap-1 cursor-pointer transition-colors active:scale-95"
                            >
                              {copiedId === actualIdx ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-400" />
                                  Copied
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  Copy Answer
                                </>
                              )}
                            </button>
                          </div>
                          <p className="text-gray-300 italic whitespace-pre-line leading-loose bg-[#06080d]/40 p-3 rounded border border-gray-900/50">
                            "{q.sampleAnswer}"
                          </p>
                        </div>

                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>

      {/* Regene / reload option */}
      <div className="flex justify-end">
        <button
          onClick={onFetchQuestions}
          className="text-[10px] font-bold text-gray-500 hover:text-indigo-400 flex items-center gap-1 transition-colors cursor-pointer"
        >
          <Sparkles className="w-3 h-3" /> Regenerate Interview Questions
        </button>
      </div>
    </div>
  );
}
