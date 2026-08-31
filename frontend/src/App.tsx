import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  FileText, 
  Trash2,
  RefreshCw,
  Award,
  ChevronRight,
  MessageSquare,
  Mail
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ScoreGauge } from './components/ScoreGauge';
import { XYZRewriter } from './components/XYZRewriter';
import { InterviewPrep, Question } from './components/InterviewPrep';
import { CoverLetterGenerator } from './components/CoverLetterGenerator';

interface AnalysisResult {
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  feedback: string[];
}

export default function App() {
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [parsingPdf, setParsingPdf] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [pdfFileName, setPdfFileName] = useState('');
  const [bullets, setBullets] = useState<string[]>([]);
  const [activeBullet, setActiveBullet] = useState('');
  const [error, setError] = useState('');

  // Tab state
  const [activeTab, setActiveTab] = useState<'optimizer' | 'interview' | 'cover-letter'>('optimizer');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [hasLoadedQuestions, setHasLoadedQuestions] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Extract bullet points from text
  const extractBulletsFromText = (text: string) => {
    if (!text) return [];
    return text
      .split('\n')
      .map(line => line.trim())
      .filter(line => {
        // Match standard bullet points, asterisks, dashes, or numbered lists
        return line.startsWith('•') || 
               line.startsWith('-') || 
               line.startsWith('*') || 
               line.startsWith('o ') || 
               /^\d+[\.\)]/.test(line);
      })
      .map(line => line.replace(/^[•\-\*o]\s*/, '').replace(/^\d+[\.\)]\s*/, '').trim())
      .filter(line => line.length > 15); // filter out tiny lines
  };

  // Update bullets whenever resume text changes
  useEffect(() => {
    const extracted = extractBulletsFromText(resumeText);
    setBullets(extracted);
  }, [resumeText]);

  // Trigger confetti for high scores
  useEffect(() => {
    if (analysisResult && analysisResult.score >= 80) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#10b981', '#a855f7']
      });
    }
  }, [analysisResult]);

  // Handle file drop/upload
  const handleFileUpload = async (file: File) => {
    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file only.');
      return;
    }
    
    setPdfFileName(file.name);
    setParsingPdf(true);
    setError('');
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:5000/api/parse-resume', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to parse PDF on the backend. Ensure server is running.');
      }

      const data = await response.json();
      setResumeText(data.text);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error occurred while parsing the resume.');
      setPdfFileName('');
    } finally {
      setParsingPdf(false);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  // Perform full ATS Match Analysis
  const handleAnalyze = async () => {
    if (!resumeText.trim() || !jobDescription.trim()) return;
    setAnalyzing(true);
    setError('');
    setAnalysisResult(null);
    setQuestions([]);
    setHasLoadedQuestions(false);
    setLoadingQuestions(false);
    setActiveTab('optimizer');

    try {
      const response = await fetch('http://localhost:5000/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumeText,
          jobDescription,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze resume. Verify API Key and backend server.');
      }

      const data = await response.json();
      setAnalysisResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error running ATS analysis.');
    } finally {
      setAnalyzing(false);
    }
  };

  const fetchQuestions = async () => {
    if (!resumeText.trim() || !jobDescription.trim()) return;
    setLoadingQuestions(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/generate-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumeText,
          jobDescription,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate interview questions. Verify backend server.');
      }

      const data = await response.json();
      setQuestions(data.questions || []);
      setHasLoadedQuestions(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error generating interview questions.');
    } finally {
      setLoadingQuestions(false);
    }
  };

  const resetAll = () => {
    setResumeText('');
    setJobDescription('');
    setAnalysisResult(null);
    setPdfFileName('');
    setBullets([]);
    setActiveBullet('');
    setError('');
    setQuestions([]);
    setLoadingQuestions(false);
    setHasLoadedQuestions(false);
    setActiveTab('optimizer');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen bg-[#080b11] text-gray-100 flex flex-col selection:bg-indigo-600/30 selection:text-white">
      {/* Glow effects in background */}
      <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-indigo-900/10 rounded-full filter blur-[80px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[350px] h-[350px] bg-purple-900/10 rounded-full filter blur-[80px] pointer-events-none" />

      {/* Header */}
      <header className="border-b border-gray-900/80 bg-[#080b11]/70 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-900/40">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight font-display text-white">
                Resume<span className="text-indigo-400">Boost</span>
              </span>
              <span className="text-[10px] block font-semibold text-gray-500 uppercase tracking-widest leading-none">
                AI ATS Optimizer
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-xs font-medium text-gray-400 bg-gray-900 border border-gray-800 rounded-full px-3 py-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Gemini 1.5 Flash Connected
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full">
        {/* Intro */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl font-display text-white">
            Optimize Your Resume with the <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-indigo-300 to-purple-400">Google XYZ Method</span>
          </h1>
          <p className="text-gray-400 text-sm md:text-base mt-3 leading-relaxed">
            Upload your resume PDF, paste the job description, and use AI to match keywords, score your ATS alignment, and transform weak points into metric-driven achievements.
          </p>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="max-w-4xl mx-auto mb-6 p-4 bg-red-950/40 border border-red-900/40 rounded-2xl flex items-start gap-3 text-red-400">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-sm">Action Required</h4>
              <p className="text-xs mt-1 text-red-400/90">{error}</p>
            </div>
          </div>
        )}

        {/* Two-Column Workspace layout */}
        <AnimatePresence mode="wait">
          {!analysisResult ? (
            /* ================= INPUT SCREEN ================= */
            <motion.div
              key="input-screen"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              {/* Left Column: Resume Upload */}
              <div className="glass-card rounded-2xl p-6 flex flex-col gap-5">
                <div className="flex justify-between items-center">
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-400" />
                    1. Upload Resume
                  </h2>
                  {resumeText && (
                    <button 
                      onClick={resetAll}
                      className="text-xs font-semibold text-gray-500 hover:text-red-400 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Reset
                    </button>
                  )}
                </div>

                {/* PDF Drag & Drop */}
                {!resumeText && (
                  <div
                    onDragOver={onDragOver}
                    onDrop={onDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border border-dashed rounded-xl p-8 text-center flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
                      parsingPdf 
                        ? 'border-indigo-500 bg-indigo-950/10' 
                        : 'border-gray-800 hover:border-indigo-500/50 hover:bg-gray-900/10'
                    }`}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                      className="hidden"
                      accept=".pdf"
                    />
                    
                    {parsingPdf ? (
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-3 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                        <span className="text-sm font-semibold text-indigo-300">Extracting text from PDF...</span>
                      </div>
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center mb-3">
                          <Upload className="w-5 h-5 text-gray-400" />
                        </div>
                        <span className="text-sm font-semibold text-white">Drag & drop your resume PDF here</span>
                        <span className="text-xs text-gray-500 mt-1">or click to browse files (PDF only)</span>
                      </>
                    )}
                  </div>
                )}

                {/* Paste Area (Visible after upload, or can copy paste directly) */}
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Or paste resume text directly
                    </span>
                    {pdfFileName && (
                      <span className="text-xs font-medium text-emerald-400 bg-emerald-950/20 border border-emerald-900/30 px-2 py-0.5 rounded">
                        Parsed: {pdfFileName}
                      </span>
                    )}
                  </div>
                  <textarea
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    placeholder="Paste the text contents of your resume here..."
                    className="w-full flex-1 min-h-[220px] bg-[#0b0f19]/80 border border-gray-800 rounded-xl p-3.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-white placeholder-gray-600 resize-none"
                  />
                </div>
              </div>

              {/* Right Column: Job Description & Analyze */}
              <div className="glass-card rounded-2xl p-6 flex flex-col gap-5 justify-between">
                <div className="flex flex-col gap-4 flex-1">
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Award className="w-4 h-4 text-indigo-400" />
                    2. Target Job Description
                  </h2>

                  <div className="flex flex-col flex-1">
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      Paste the full job posting text
                    </label>
                    <textarea
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="Paste the job description (responsibilities, skills, and qualifications) to calculate your match score..."
                      className="w-full flex-1 min-h-[220px] bg-[#0b0f19]/80 border border-gray-800 rounded-xl p-3.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-white placeholder-gray-600 resize-none"
                    />
                  </div>
                </div>

                {/* Submit Action */}
                <button
                  onClick={handleAnalyze}
                  disabled={analyzing || !resumeText.trim() || !jobDescription.trim()}
                  className="w-full bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-semibold text-sm py-4 px-6 rounded-xl flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-lg shadow-indigo-900/30 active:scale-[0.99]"
                >
                  {analyzing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Running ATS Match Analysis...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-indigo-200" />
                      <span>Analyze Match Score</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          ) : (
            /* ================= DASHBOARD SCREEN ================= */
            <motion.div
              key="dashboard-screen"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
            >
              {/* Back to inputs / reset bar */}
              <div className="lg:col-span-12 flex justify-between items-center bg-gray-900/40 border border-gray-800 rounded-xl p-3 px-4">
                <div className="text-xs text-gray-400">
                  Showing analysis for target role.
                </div>
                <button
                  onClick={() => setAnalysisResult(null)}
                  className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Adjust Resume or Job Description
                </button>
              </div>

              {/* Left Column: ATS Score, Match Report (col-span-5) */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                {/* Score panel */}
                <div className="glass-card rounded-2xl p-5">
                  <ScoreGauge score={analysisResult.score} />
                </div>

                {/* Keywords panel */}
                <div className="glass-card rounded-2xl p-5 flex flex-col gap-4">
                  <h3 className="text-sm font-bold text-white border-b border-gray-800/80 pb-2">
                    Keyword Optimization
                  </h3>

                  {/* Matched Keywords */}
                  <div>
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block mb-2">
                      Matched Skills ({analysisResult.matchedKeywords.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {analysisResult.matchedKeywords.length === 0 ? (
                        <span className="text-xs text-gray-500 italic">No matches found.</span>
                      ) : (
                        analysisResult.matchedKeywords.map((keyword, idx) => (
                          <span 
                            key={idx}
                            className="text-xs font-semibold bg-emerald-950/20 text-emerald-300 border border-emerald-900/45 px-2.5 py-1 rounded-lg flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            {keyword}
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Missing Keywords */}
                  <div className="mt-2">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block mb-2">
                      Missing Critical Keywords ({analysisResult.missingKeywords.length})
                    </span>
                    <p className="text-[11px] text-gray-400 mb-2 leading-relaxed">
                      💡 Tip: Incorporate these keywords naturally in your resume bullet points.
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {analysisResult.missingKeywords.length === 0 ? (
                        <span className="text-xs text-emerald-400 font-semibold italic">Great! No missing keywords.</span>
                      ) : (
                        analysisResult.missingKeywords.map((keyword, idx) => (
                          <span 
                            key={idx}
                            className="text-xs font-semibold bg-amber-950/20 text-amber-300 border border-amber-900/40 px-2.5 py-1 rounded-lg"
                          >
                            {keyword}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Feedback Panel */}
                <div className="glass-card rounded-2xl p-5 flex flex-col gap-3">
                  <h3 className="text-sm font-bold text-white border-b border-gray-800/80 pb-2">
                    ATS Audit Insights
                  </h3>
                  <ul className="flex flex-col gap-2.5">
                    {analysisResult.feedback.map((item, idx) => (
                      <li key={idx} className="flex gap-2 text-xs text-gray-300 leading-relaxed items-start">
                        <ChevronRight className="w-3.5 h-3.5 shrink-0 mt-0.5 text-indigo-400" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Right Column: Optimizer & Interview Prep Tabs (col-span-7) */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                {/* Tab Switcher Headers */}
                <div className="flex border border-gray-900 bg-[#0b0f19]/30 p-1.5 rounded-xl gap-2">
                  <button
                    onClick={() => setActiveTab('optimizer')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                      activeTab === 'optimizer'
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-950/40'
                        : 'bg-transparent border-transparent text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    <Sparkles className="w-4 h-4" />
                    <span className="hidden sm:inline">Bullet Point</span> Optimizer
                  </button>
                  <button
                    onClick={() => setActiveTab('interview')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                      activeTab === 'interview'
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-950/40'
                        : 'bg-transparent border-transparent text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    Interview Prep
                  </button>
                  <button
                    onClick={() => setActiveTab('cover-letter')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                      activeTab === 'cover-letter'
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-950/40'
                        : 'bg-transparent border-transparent text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    <Mail className="w-4 h-4" />
                    Cover Letter
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {activeTab === 'optimizer' ? (
                    <motion.div
                      key="optimizer-tab"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.15 }}
                      className="glass-card rounded-2xl p-5"
                    >
                      <h2 className="text-base font-bold text-white flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-indigo-400" />
                        Google XYZ Bullet Point Optimizer
                      </h2>
                      <p className="text-xs text-gray-400 mb-5 leading-relaxed">
                        Rewrite your accomplishments to showcase impact. Select a bullet point extracted from your uploaded resume below, or type your own directly.
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                        {/* Left: Extracted bullet points list if any (col-span-5) */}
                        {bullets.length > 0 && (
                          <div className="md:col-span-5 border-r border-gray-900/80 pr-2 flex flex-col max-h-[460px]">
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-2.5">
                              Extracted from Resume
                            </span>
                            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                              {bullets.map((bulletLine, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => setActiveBullet(bulletLine)}
                                  className={`w-full text-left p-2.5 text-[11px] rounded-lg border transition-all cursor-pointer leading-normal line-clamp-3 ${
                                    activeBullet === bulletLine
                                      ? 'bg-indigo-950/20 border-indigo-500/40 text-indigo-300'
                                      : 'bg-[#111827]/40 border-gray-800 text-gray-400 hover:text-gray-300 hover:border-gray-700'
                                  }`}
                                >
                                  "{bulletLine}"
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Right: The optimizer tool (col-span-7 or 12 depending on bullets presence) */}
                        <div className={bullets.length > 0 ? "md:col-span-7" : "md:col-span-12"}>
                          <XYZRewriter 
                            key={activeBullet}
                            initialBullet={activeBullet}
                            jobContext={jobDescription.slice(0, 100)} 
                          />
                        </div>
                      </div>
                    </motion.div>
                  ) : activeTab === 'interview' ? (
                    <motion.div
                      key="interview-tab"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.15 }}
                      className="glass-card rounded-2xl p-5"
                    >
                      <h2 className="text-base font-bold text-white flex items-center gap-2 mb-2">
                        <MessageSquare className="w-4 h-4 text-indigo-400" />
                        AI Interview Questions Generator
                      </h2>
                      <p className="text-xs text-gray-400 mb-5 leading-relaxed">
                        Prepare for your target job with tailored technical, behavioral, and resume-gap questions powered by Gemini.
                      </p>
                      
                      <InterviewPrep 
                        questions={questions}
                        isLoading={loadingQuestions}
                        onFetchQuestions={fetchQuestions}
                        hasLoaded={hasLoadedQuestions}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="cover-letter-tab"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.15 }}
                      className="glass-card rounded-2xl p-5"
                    >
                      <h2 className="text-base font-bold text-white flex items-center gap-2 mb-2">
                        <Mail className="w-4 h-4 text-indigo-400" />
                        AI Tailored Cover Letter Generator
                      </h2>
                      <p className="text-xs text-gray-400 mb-5 leading-relaxed">
                        Craft a high-converting, personalized cover letter tailored to the job description and your resume strengths.
                      </p>

                      <CoverLetterGenerator
                        resumeText={resumeText}
                        jobDescription={jobDescription}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-900/80 bg-[#080b11]/80 py-6 mt-12 text-center text-xs text-gray-600">
        <div className="max-w-7xl mx-auto px-6">
          <p>© {new Date().getFullYear()} ResumeBoost. Structured according to the Google XYZ Formula: Accomplished [X] as measured by [Y], by doing [Z].</p>
        </div>
      </footer>
    </div>
  );
}
