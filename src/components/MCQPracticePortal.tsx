import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { MCQQuestion, MCQCategory, InstituteSettings } from '../types/index.ts';
import {
  HelpCircle,
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  BookOpen,
  Filter,
  Search,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Check,
  BrainCircuit,
  Trophy,
  ArrowRight,
  Flame,
  BarChart3,
  Target,
  AlertCircle,
  Eye,
  X,
} from 'lucide-react';

interface Props {
  settings: InstituteSettings;
  onOpenAdmission?: () => void;
  onOpenNotes?: () => void;
}

export const MCQPracticePortal: React.FC<Props> = ({ settings, onOpenAdmission, onOpenNotes }) => {
  const [questions, setQuestions] = useState<MCQQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMode, setActiveMode] = useState<'PRACTICE' | 'MOCK_TEST'>('PRACTICE');

  // Practice Mode state (questionId -> selectedOptionIndex)
  const [practiceAnswers, setPracticeAnswers] = useState<Record<string, number>>({});
  const [showExplanation, setShowExplanation] = useState<Record<string, boolean>>({});
  const [practiceSubmitted, setPracticeSubmitted] = useState(false);
  const [practiceFilter, setPracticeFilter] = useState<'ALL' | 'CORRECT' | 'WRONG' | 'UNATTEMPTED'>('ALL');

  // Mock Test Mode state
  const [mockActive, setMockActive] = useState(false);
  const [mockCurrentIndex, setMockCurrentIndex] = useState(0);
  const [mockAnswers, setMockAnswers] = useState<Record<number, number>>({});
  const [mockTimeLeft, setMockTimeLeft] = useState(900); // 15 mins
  const [mockSubmitted, setMockSubmitted] = useState(false);
  const [mockReviewFilter, setMockReviewFilter] = useState<'ALL' | 'CORRECT' | 'WRONG' | 'SKIPPED'>('ALL');

  useEffect(() => {
    loadMCQs();
  }, [selectedCategory]);

  const loadMCQs = async () => {
    setLoading(true);
    try {
      const data = await api.getMCQs(selectedCategory === 'ALL' ? undefined : selectedCategory);
      setQuestions(data);
    } catch (e) {
      console.error('Failed to load MCQs', e);
    } finally {
      setLoading(false);
    }
  };

  // Timer for Mock Test
  useEffect(() => {
    if (!mockActive || mockSubmitted) return;
    const timer = setInterval(() => {
      setMockTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setMockSubmitted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [mockActive, mockSubmitted]);

  const filteredQuestions = questions.filter((q) => {
    if (searchQuery.trim() === '') return true;
    const qText = q.question.toLowerCase();
    const catText = (q.categoryName || '').toLowerCase();
    return qText.includes(searchQuery.toLowerCase()) || catText.includes(searchQuery.toLowerCase());
  });

  const handleSelectPracticeOption = (qId: string, optIdx: number) => {
    setPracticeAnswers((prev) => ({ ...prev, [qId]: optIdx }));
    setShowExplanation((prev) => ({ ...prev, [qId]: true }));
  };

  const handleStartMockTest = () => {
    setMockActive(true);
    setMockSubmitted(false);
    setMockCurrentIndex(0);
    setMockAnswers({});
    setMockReviewFilter('ALL');
    setMockTimeLeft(Math.min(900, Math.max(300, filteredQuestions.length * 60))); // 1 min per question
  };

  const handleMockOptionSelect = (optIdx: number) => {
    if (mockSubmitted) return;
    setMockAnswers((prev) => ({ ...prev, [mockCurrentIndex]: optIdx }));
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Practice Mode statistics
  const getPracticeStats = () => {
    let correct = 0;
    let wrong = 0;
    filteredQuestions.forEach((q) => {
      const ans = practiceAnswers[q.id];
      if (ans !== undefined) {
        if (ans === q.correctAnswerIndex) {
          correct += 1;
        } else {
          wrong += 1;
        }
      }
    });
    const attempted = correct + wrong;
    const total = filteredQuestions.length;
    const unattempted = Math.max(0, total - attempted);
    const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
    const grade =
      percentage >= 85
        ? 'S (Distinction)'
        : percentage >= 75
        ? 'A (Excellent)'
        : percentage >= 65
        ? 'B (Good)'
        : percentage >= 50
        ? 'C (Pass)'
        : 'F (Needs Revision)';
    const isPass = percentage >= 50;
    return { correct, wrong, unattempted, attempted, total, accuracy, percentage, grade, isPass };
  };

  // Calculate Mock Test Score
  const calculateMockScore = () => {
    let score = 0;
    let wrong = 0;
    let unattempted = 0;
    filteredQuestions.forEach((q, idx) => {
      const ans = mockAnswers[idx];
      if (ans === undefined) {
        unattempted += 1;
      } else if (ans === q.correctAnswerIndex) {
        score += 1;
      } else {
        wrong += 1;
      }
    });
    const total = filteredQuestions.length;
    const attempted = score + wrong;
    const accuracy = attempted > 0 ? Math.round((score / attempted) * 100) : 0;
    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
    const grade =
      percentage >= 85
        ? 'S (Distinction)'
        : percentage >= 75
        ? 'A (Excellent)'
        : percentage >= 65
        ? 'B (Good)'
        : percentage >= 50
        ? 'C (Pass)'
        : 'F (Needs Revision)';
    const isPass = percentage >= 50;
    return { score, wrong, unattempted, attempted, total, accuracy, percentage, grade, isPass };
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Header */}
      <section className="bg-gradient-to-r from-[#0b1b3d] via-[#0f2942] to-[#1e3a8a] text-white py-12 px-4 border-b-4 border-[#d4af37]">
        <div className="max-w-6xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-amber-500/20 border border-amber-400/40 text-amber-300 rounded-full text-xs font-semibold">
            <BrainCircuit className="w-4 h-4 text-amber-400" />
            <span>Autonomous Examination Prep • CCC • O-Level • UPSSSC • IT Exams</span>
          </div>

          <h1 className="font-cinzel text-3xl sm:text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-200 to-amber-400">
            Online MCQ Practice &amp; Mock Tests
          </h1>
          <p className="text-slate-200 text-xs sm:text-sm max-w-2xl mx-auto font-sans">
            Prepared and reviewed by Director <strong>Mr. Amar Soni (MCA, Data Science)</strong>. Master high-yield objective questions for NIELIT CCC, O-Level IT Tools, Python, and Competitive Exams with instant solution rationale.
          </p>

          {/* Mode Switcher */}
          <div className="flex items-center justify-center gap-3 pt-3">
            <button
              onClick={() => {
                setActiveMode('PRACTICE');
                setMockActive(false);
              }}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeMode === 'PRACTICE'
                  ? 'bg-amber-500 text-slate-950 shadow-lg scale-105'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>Instant Practice Mode</span>
            </button>

            <button
              onClick={() => {
                setActiveMode('MOCK_TEST');
                if (!mockActive) handleStartMockTest();
              }}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeMode === 'MOCK_TEST'
                  ? 'bg-amber-500 text-slate-950 shadow-lg scale-105'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Timed Mock Exam (15 Min)</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 space-y-6">
        {/* Category Pills & Search */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'ALL', label: 'All Exams' },
              { id: 'CCC', label: 'CCC (NIELIT)' },
              { id: 'O_LEVEL', label: "O'Level (IT & Python)" },
              { id: 'COMPETITIVE', label: 'Competitive Exams' },
              { id: 'ADCA_DCA', label: 'ADCA / DCA & Tally' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  if (mockActive) handleStartMockTest();
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-[#0f2942] text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search questions or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-[#0f2942]"
            />
          </div>
        </div>

        {/* ============================================================= */}
        {/* MODE 1: INSTANT PRACTICE MODE */}
        {/* ============================================================= */}
        {activeMode === 'PRACTICE' && (
          <div className="space-y-4">
            {/* Live Practice Scoreboard & Result Tracker Card */}
            {(() => {
              const pStats = getPracticeStats();
              return (
                <div className="bg-gradient-to-r from-slate-900 via-[#0f2942] to-blue-950 text-white rounded-2xl p-5 shadow-lg border border-slate-800 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700/60 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
                        <BarChart3 className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm sm:text-base text-white">
                          Live Practice Result Tracker
                        </h3>
                        <p className="text-[11px] text-slate-300">
                          Real-time evaluation of correct and incorrect answers • Detailed solutions
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {pStats.attempted > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm('Reset all practice answers?')) {
                              setPracticeAnswers({});
                              setShowExplanation({});
                              setPracticeFilter('ALL');
                              setPracticeSubmitted(false);
                            }
                          }}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Reset</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setPracticeSubmitted(true);
                          const el = document.getElementById('practice-result-card');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="px-4 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-lg text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Trophy className="w-3.5 h-3.5 text-amber-300" />
                        <span>Submit &amp; View Result</span>
                      </button>
                    </div>
                  </div>

                  {/* 4 Key Metric Boxes: Total, Correct, Incorrect, Unattempted */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block tracking-wider">Total Questions</span>
                      <div className="text-xl sm:text-2xl font-black text-white mt-0.5">{pStats.total}</div>
                      <span className="text-[10px] text-slate-400">Attempted: {pStats.attempted}</span>
                    </div>

                    <div className="p-3 bg-emerald-500/15 border border-emerald-400/40 rounded-xl">
                      <span className="text-[10px] text-emerald-300 uppercase font-bold block tracking-wider flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>Correct Answers</span>
                      </span>
                      <div className="text-xl sm:text-2xl font-black text-emerald-300 mt-0.5">{pStats.correct}</div>
                      <span className="text-[10px] text-emerald-200/80">{pStats.percentage}% of total</span>
                    </div>

                    <div className="p-3 bg-red-500/15 border border-red-400/40 rounded-xl">
                      <span className="text-[10px] text-red-300 uppercase font-bold block tracking-wider flex items-center justify-center gap-1">
                        <XCircle className="w-3 h-3 text-red-400" />
                        <span>Incorrect Answers</span>
                      </span>
                      <div className="text-xl sm:text-2xl font-black text-red-300 mt-0.5">{pStats.wrong}</div>
                      <span className="text-[10px] text-red-200/80">Needs review</span>
                    </div>

                    <div className="p-3 bg-amber-500/15 border border-amber-400/40 rounded-xl">
                      <span className="text-[10px] text-amber-300 uppercase font-bold block tracking-wider flex items-center justify-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span>Skipped Questions</span>
                      </span>
                      <div className="text-xl sm:text-2xl font-black text-amber-300 mt-0.5">{pStats.unattempted}</div>
                      <span className="text-[10px] text-amber-200/80">Accuracy: {pStats.accuracy}%</span>
                    </div>
                  </div>

                  {/* Filter Tabs for Questions */}
                  <div className="pt-2 border-t border-slate-700/60 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="text-[11px] text-slate-300 font-semibold">Filter Question View:</span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setPracticeFilter('ALL')}
                        className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                          practiceFilter === 'ALL'
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'bg-white/10 text-slate-300 hover:bg-white/20'
                        }`}
                      >
                        All ({pStats.total})
                      </button>
                      <button
                        type="button"
                        onClick={() => setPracticeFilter('CORRECT')}
                        className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                          practiceFilter === 'CORRECT'
                            ? 'bg-emerald-500 text-white shadow-sm'
                            : 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-900/60'
                        }`}
                      >
                        ✓ Correct ({pStats.correct})
                      </button>
                      <button
                        type="button"
                        onClick={() => setPracticeFilter('WRONG')}
                        className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                          practiceFilter === 'WRONG'
                            ? 'bg-red-500 text-white shadow-sm'
                            : 'bg-red-950/60 text-red-300 border border-red-500/30 hover:bg-red-900/60'
                        }`}
                      >
                        ✗ Incorrect ({pStats.wrong})
                      </button>
                      <button
                        type="button"
                        onClick={() => setPracticeFilter('UNATTEMPTED')}
                        className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                          practiceFilter === 'UNATTEMPTED'
                            ? 'bg-amber-500 text-slate-950 shadow-sm'
                            : 'bg-amber-950/60 text-amber-300 border border-amber-500/30 hover:bg-amber-900/60'
                        }`}
                      >
                        ⊘ Unattempted ({pStats.unattempted})
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}

            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <span>Showing <strong>{
                filteredQuestions.filter((q) => {
                  if (practiceFilter === 'ALL') return true;
                  const ans = practiceAnswers[q.id];
                  if (practiceFilter === 'CORRECT') return ans !== undefined && ans === q.correctAnswerIndex;
                  if (practiceFilter === 'WRONG') return ans !== undefined && ans !== q.correctAnswerIndex;
                  if (practiceFilter === 'UNATTEMPTED') return ans === undefined;
                  return true;
                }).length
              }</strong> questions ({practiceFilter === 'ALL' ? 'All' : practiceFilter === 'CORRECT' ? 'Correct' : practiceFilter === 'WRONG' ? 'Incorrect' : 'Unattempted'})</span>
              <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                <Sparkles className="w-3.5 h-3.5" /> Instant explanation by Director Amar Soni
              </span>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-400">
                <div className="inline-block w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mb-2" />
                <div>Loading MCQ Question Bank...</div>
              </div>
            ) : filteredQuestions.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500">
                <HelpCircle className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <h3 className="font-bold text-slate-800">No MCQs Found</h3>
                <p className="text-xs text-slate-500 mt-1">Try selecting another exam category or clearing your search.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredQuestions
                  .filter((q) => {
                    if (practiceFilter === 'ALL') return true;
                    const ans = practiceAnswers[q.id];
                    if (practiceFilter === 'CORRECT') return ans !== undefined && ans === q.correctAnswerIndex;
                    if (practiceFilter === 'WRONG') return ans !== undefined && ans !== q.correctAnswerIndex;
                    if (practiceFilter === 'UNATTEMPTED') return ans === undefined;
                    return true;
                  })
                  .map((q, idx) => {
                    const selectedOpt = practiceAnswers[q.id];
                    const hasAnswered = selectedOpt !== undefined;
                    const isCorrect = selectedOpt === q.correctAnswerIndex;

                    return (
                      <div
                        key={q.id}
                        className={`bg-white rounded-2xl border shadow-xs transition-all p-5 space-y-4 ${
                          hasAnswered
                            ? isCorrect
                              ? 'border-emerald-300 ring-1 ring-emerald-200'
                              : 'border-red-300 ring-1 ring-red-200'
                            : 'border-slate-200 hover:border-amber-300'
                        }`}
                      >
                        {/* Question Meta */}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-slate-900 text-amber-300 text-xs font-bold flex items-center justify-center font-mono">
                              {idx + 1}
                            </span>
                            <span className="px-2.5 py-0.5 bg-blue-50 text-blue-900 border border-blue-200 rounded font-semibold text-[10px]">
                              {q.categoryName || q.category}
                            </span>
                            {q.difficulty && (
                              <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-medium">
                                {q.difficulty}
                              </span>
                            )}
                          </div>

                          {hasAnswered && (
                            <div
                              className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {isCorrect ? (
                                <>
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                  <span>Correct Answer!</span>
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-4 h-4 text-red-600" />
                                  <span>Incorrect • See Solution Below</span>
                                </>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Question Text */}
                        <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-relaxed">
                          {q.question}
                        </h3>

                        {/* 4 Options Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {q.options.map((opt, optIdx) => {
                            const isOptionSelected = selectedOpt === optIdx;
                            const isOptionCorrect = optIdx === q.correctAnswerIndex;

                            let btnStyle = 'border-slate-200 bg-slate-50 hover:bg-amber-50 hover:border-amber-400 text-slate-800';

                            if (hasAnswered) {
                              if (isOptionCorrect) {
                                btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-400/40';
                              } else if (isOptionSelected && !isCorrect) {
                                btnStyle = 'border-red-500 bg-red-50 text-red-950 font-bold ring-2 ring-red-400/40';
                              } else {
                                btnStyle = 'border-slate-200 bg-white/50 text-slate-400 opacity-60';
                              }
                            }

                            return (
                              <button
                                key={optIdx}
                                onClick={() => handleSelectPracticeOption(q.id, optIdx)}
                                className={`p-3 rounded-xl border text-left text-xs transition-all flex items-start gap-2.5 cursor-pointer ${btnStyle}`}
                              >
                                <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center font-mono font-bold shrink-0 text-[10px]">
                                  {String.fromCharCode(65 + optIdx)}
                                </span>
                                <span className="flex-1 leading-snug">{opt}</span>
                                {hasAnswered && isOptionCorrect && (
                                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                )}
                                {hasAnswered && isOptionSelected && !isCorrect && (
                                  <X className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {/* Verified Director Explanation */}
                        {hasAnswered && q.explanation && (
                          <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-950 animate-in fade-in">
                            <div className="font-bold text-amber-900 flex items-center gap-1.5 mb-1">
                              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                              <span>Director Amar Soni's Examination Solution &amp; Fact Note:</span>
                            </div>
                            <p className="text-slate-700 leading-relaxed font-sans">{q.explanation}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}

            {/* End of Practice Test Submission Action Banner */}
            {filteredQuestions.length > 0 && (
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div>
                  <h4 className="font-bold text-amber-950 text-sm">Completed your practice test?</h4>
                  <p className="text-xs text-amber-800">
                    Review your final scorecard: summary of correct and incorrect questions.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPracticeSubmitted(true);
                    const el = document.getElementById('practice-result-card');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-5 py-2.5 bg-[#0f2942] hover:bg-[#1a3d60] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md cursor-pointer shrink-0"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Submit Practice Test &amp; View Result</span>
                </button>
              </div>
            )}

            {/* End of Practice Evaluation Card */}
            {(() => {
              const pStats = getPracticeStats();
              if (pStats.attempted === 0 && !practiceSubmitted) return null;
              return (
                <div
                  id="practice-result-card"
                  className="bg-white rounded-2xl border-2 border-slate-300 p-6 sm:p-8 text-center space-y-6 shadow-xl mt-6 animate-in fade-in"
                >
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${
                      pStats.isPass ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    <Trophy className="w-8 h-8" />
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">
                      Advance Institute of Digital Technology • Practice Examination Board
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                      MCQ Practice Examination Result &amp; Scorecard
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
                      Final Scorecard Summary: <strong className="text-emerald-700">{pStats.correct} Correct</strong> • <strong className="text-red-700">{pStats.wrong} Incorrect</strong>
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Verified by Director Amar Soni (MCA, Data Science)
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Total Questions</span>
                      <div className="text-2xl font-black text-slate-900 mt-0.5">{pStats.total}</div>
                      <span className="text-[10px] text-slate-400">Attempted: {pStats.attempted}</span>
                    </div>

                    <div className="p-4 bg-emerald-50 border-2 border-emerald-400 rounded-2xl shadow-xs">
                      <span className="text-[10px] text-emerald-800 uppercase font-bold block flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Correct Answers</span>
                      </span>
                      <div className="text-2xl font-black text-emerald-700 mt-0.5">{pStats.correct}</div>
                      <span className="text-[10px] text-emerald-800 font-semibold">{pStats.percentage}% Score</span>
                    </div>

                    <div className="p-4 bg-red-50 border-2 border-red-400 rounded-2xl shadow-xs">
                      <span className="text-[10px] text-red-800 uppercase font-bold block flex items-center justify-center gap-1">
                        <XCircle className="w-3.5 h-3.5 text-red-600" />
                        <span>Incorrect Answers</span>
                      </span>
                      <div className="text-2xl font-black text-red-700 mt-0.5">{pStats.wrong}</div>
                      <span className="text-[10px] text-red-800 font-semibold">Needs Review</span>
                    </div>

                    <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl shadow-xs">
                      <span className="text-[10px] text-amber-800 uppercase font-bold block flex items-center justify-center gap-1">
                        <Target className="w-3.5 h-3.5 text-amber-600" />
                        <span>Skipped Questions</span>
                      </span>
                      <div className="text-2xl font-black text-amber-800 mt-0.5">{pStats.unattempted}</div>
                      <span className="text-[10px] text-amber-900 font-semibold">Accuracy: {pStats.accuracy}%</span>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl max-w-xl mx-auto flex items-center justify-between text-xs font-semibold">
                    <span>Performance Assessment:</span>
                    <span className={`px-3 py-1 rounded-full font-bold ${
                      pStats.isPass ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {pStats.isPass ? 'PASSED • READY FOR BOARD EXAM' : 'NEEDS REVISION • REVIEW MISTAKES'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    {pStats.wrong > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setPracticeFilter('WRONG');
                          window.scrollTo({ top: 300, behavior: 'smooth' });
                        }}
                        className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm cursor-pointer"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Review Mistakes Only ({pStats.wrong} Incorrect Questions)</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setPracticeAnswers({});
                        setShowExplanation({});
                        setPracticeFilter('ALL');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="px-5 py-2.5 bg-[#0f2942] hover:bg-[#1a3d60] text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Retake Full Practice</span>
                    </button>

                    {onOpenNotes && (
                      <button
                        type="button"
                        onClick={onOpenNotes}
                        className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm cursor-pointer"
                      >
                        <BookOpen className="w-4 h-4" />
                        <span>Download Revision PDF Notes</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* ============================================================= */}
        {/* MODE 2: TIMED MOCK TEST MODE */}
        {/* ============================================================= */}
        {activeMode === 'MOCK_TEST' && (
          <div className="space-y-6">
            {!mockActive ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-4 shadow-sm">
                <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto text-amber-700">
                  <Clock className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-slate-900 text-xl">
                  {selectedCategory === 'ALL' ? 'Comprehensive IT Mock Exam' : `${selectedCategory} Mock Examination`}
                </h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  Test your real exam readiness under timed examination board conditions: {filteredQuestions.length} questions, 15 minutes clock, automated grading certificate.
                </p>
                <button
                  onClick={handleStartMockTest}
                  className="px-6 py-2.5 bg-[#0f2942] hover:bg-[#1a3d60] text-white font-bold rounded-xl text-xs flex items-center gap-2 mx-auto cursor-pointer shadow-md"
                >
                  <span>Start 15-Minute Exam Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : mockSubmitted ? (
              /* Comprehensive Mock Exam Scorecard View */
              (() => {
                const { score, wrong, unattempted, attempted, total, accuracy, percentage, grade, isPass } = calculateMockScore();

                const reviewQuestions = filteredQuestions.filter((q, idx) => {
                  const ans = mockAnswers[idx];
                  if (mockReviewFilter === 'CORRECT') return ans === q.correctAnswerIndex;
                  if (mockReviewFilter === 'WRONG') return ans !== undefined && ans !== q.correctAnswerIndex;
                  if (mockReviewFilter === 'SKIPPED') return ans === undefined;
                  return true;
                });

                return (
                  <div className="space-y-8 animate-in fade-in">
                    {/* Scorecard Hero Banner */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-6 text-center">
                      <div
                        className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto ${
                          isPass ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                        }`}
                      >
                        <Trophy className="w-10 h-10" />
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">
                          Autonomous Skill Examination Board Result
                        </span>
                        <h2 className="font-cinzel font-bold text-2xl sm:text-3xl text-slate-900 mt-1">
                          Mock Exam Evaluation Sheet &amp; Scorecard
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-700 mt-1 font-medium">
                          Final Result Summary: <strong className="text-emerald-700">{score} Correct</strong> • <strong className="text-red-700">{wrong} Incorrect</strong>
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Advance Institute of Digital Technology • Verified by Director Amar Soni
                        </p>
                      </div>

                      {/* 4 Main Result Metric Cards: Total, Correct, Incorrect, Unattempted */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                          <span className="text-[10px] text-slate-500 uppercase font-bold block">Total Questions</span>
                          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-0.5">{total}</div>
                          <span className="text-[10px] text-slate-400">Attempted: {attempted}</span>
                        </div>

                        <div className="p-4 bg-emerald-50 border-2 border-emerald-400 rounded-2xl shadow-xs">
                          <span className="text-[10px] text-emerald-800 uppercase font-bold block flex items-center justify-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Correct Answers</span>
                          </span>
                          <div className="text-2xl sm:text-3xl font-black text-emerald-700 mt-0.5">{score}</div>
                          <span className="text-[10px] text-emerald-800 font-semibold">{percentage}% Score</span>
                        </div>

                        <div className="p-4 bg-red-50 border-2 border-red-400 rounded-2xl shadow-xs">
                          <span className="text-[10px] text-red-800 uppercase font-bold block flex items-center justify-center gap-1">
                            <XCircle className="w-3.5 h-3.5 text-red-600" />
                            <span>Incorrect Answers</span>
                          </span>
                          <div className="text-2xl sm:text-3xl font-black text-red-700 mt-0.5">{wrong}</div>
                          <span className="text-[10px] text-red-800 font-semibold">Needs Review</span>
                        </div>

                        <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl shadow-xs">
                          <span className="text-[10px] text-amber-800 uppercase font-bold block flex items-center justify-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            <span>Skipped Questions</span>
                          </span>
                          <div className="text-2xl sm:text-3xl font-black text-amber-800 mt-0.5">{unattempted}</div>
                          <span className="text-[10px] text-amber-900 font-semibold">{accuracy}% Accuracy</span>
                        </div>
                      </div>

                      {/* Performance Grade Row */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-xl mx-auto pt-2">
                        <div className="p-3 bg-slate-50 border rounded-xl">
                          <span className="text-[10px] text-slate-400 uppercase font-bold">Percentage</span>
                          <div className="text-xl font-black text-amber-700 mt-0.5">
                            {percentage}%
                          </div>
                        </div>
                        <div className="p-3 bg-slate-50 border rounded-xl">
                          <span className="text-[10px] text-slate-400 uppercase font-bold">Assigned Grade</span>
                          <div className="text-xl font-black text-blue-800 mt-0.5">
                            {grade.split(' ')[0]}
                          </div>
                        </div>
                        <div className="p-3 bg-slate-50 border rounded-xl col-span-2 sm:col-span-1">
                          <span className="text-[10px] text-slate-400 uppercase font-bold">Board Result</span>
                          <div
                            className={`text-xl font-black mt-0.5 ${
                              isPass ? 'text-emerald-700' : 'text-red-700'
                            }`}
                          >
                            {isPass ? 'PASSED' : 'NEEDS REVISION'}
                          </div>
                        </div>
                      </div>

                      {/* Primary Action Buttons */}
                      <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                        <button
                          onClick={handleStartMockTest}
                          className="px-5 py-2.5 bg-[#0f2942] hover:bg-[#1a3d60] text-white font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-sm"
                        >
                          <RotateCcw className="w-4 h-4" />
                          <span>Retake Mock Exam</span>
                        </button>

                        {wrong > 0 && (
                          <button
                            onClick={() => {
                              setMockReviewFilter('WRONG');
                              const el = document.getElementById('mock-solutions-sheet');
                              if (el) el.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-sm"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>Review Mistakes ({wrong} Incorrect Questions)</span>
                          </button>
                        )}

                        {onOpenNotes && (
                          <button
                            onClick={onOpenNotes}
                            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-sm"
                          >
                            <BookOpen className="w-4 h-4" />
                            <span>Download Revision PDF Notes</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Detailed Question Solution Sheet & Answers Breakdown */}
                    <div id="mock-solutions-sheet" className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 sm:p-8 space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
                        <div>
                          <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-blue-600" />
                            <span>Detailed Examination Solutions &amp; Answer Key</span>
                          </h3>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Check correct answers, review where you made mistakes, and read Director Amar Soni's verified solution notes.
                          </p>
                        </div>

                        {/* Filter Tabs */}
                        <div className="flex flex-wrap items-center gap-1.5 text-xs">
                          <button
                            type="button"
                            onClick={() => setMockReviewFilter('ALL')}
                            className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                              mockReviewFilter === 'ALL'
                                ? 'bg-[#0f2942] text-white shadow-xs'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            All ({total})
                          </button>
                          <button
                            type="button"
                            onClick={() => setMockReviewFilter('CORRECT')}
                            className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                              mockReviewFilter === 'CORRECT'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                            }`}
                          >
                            ✓ Correct ({score})
                          </button>
                          <button
                            type="button"
                            onClick={() => setMockReviewFilter('WRONG')}
                            className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                              mockReviewFilter === 'WRONG'
                                ? 'bg-red-600 text-white shadow-xs'
                                : 'bg-red-50 text-red-800 border border-red-300 hover:bg-red-100'
                            }`}
                          >
                            ✗ Incorrect ({wrong})
                          </button>
                          <button
                            type="button"
                            onClick={() => setMockReviewFilter('SKIPPED')}
                            className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                              mockReviewFilter === 'SKIPPED'
                                ? 'bg-amber-600 text-white shadow-xs'
                                : 'bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100'
                            }`}
                          >
                            ⊘ Skipped ({unattempted})
                          </button>
                        </div>
                      </div>

                      {/* Review Questions List */}
                      <div className="space-y-5">
                        {reviewQuestions.map((q) => {
                          const originalIdx = filteredQuestions.findIndex((orig) => orig.id === q.id);
                          const studentSelected = mockAnswers[originalIdx];
                          const isAnswered = studentSelected !== undefined;
                          const isCorrect = isAnswered && studentSelected === q.correctAnswerIndex;

                          return (
                            <div
                              key={q.id}
                              className={`p-5 rounded-2xl border transition-all ${
                                !isAnswered
                                  ? 'border-amber-200 bg-amber-50/20'
                                  : isCorrect
                                  ? 'border-emerald-300 bg-emerald-50/20'
                                  : 'border-red-300 bg-red-50/20'
                              }`}
                            >
                              {/* Header Status */}
                              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5 mb-3">
                                <div className="flex items-center gap-2">
                                  <span className="w-6 h-6 rounded-full bg-slate-900 text-amber-300 text-xs font-bold flex items-center justify-center font-mono">
                                    {originalIdx + 1}
                                  </span>
                                  <span className="px-2 py-0.5 bg-blue-50 text-blue-900 border border-blue-200 rounded font-semibold text-[10px]">
                                    {q.categoryName || q.category}
                                  </span>
                                </div>

                                <div>
                                  {!isAnswered ? (
                                    <span className="px-2.5 py-1 bg-amber-100 text-amber-900 rounded-full font-bold text-xs inline-flex items-center gap-1">
                                      <Clock className="w-3.5 h-3.5 text-amber-700" />
                                      <span>Skipped • Correct: Option {String.fromCharCode(65 + q.correctAnswerIndex)}</span>
                                    </span>
                                  ) : isCorrect ? (
                                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-xs inline-flex items-center gap-1 border border-emerald-300">
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                      <span>Correct Answer! • +1 Mark</span>
                                    </span>
                                  ) : (
                                    <span className="px-2.5 py-1 bg-red-100 text-red-800 rounded-full font-bold text-xs inline-flex items-center gap-1 border border-red-300">
                                      <XCircle className="w-3.5 h-3.5 text-red-600" />
                                      <span>Incorrect (Your Choice: Option {String.fromCharCode(65 + studentSelected)} • Correct: Option {String.fromCharCode(65 + q.correctAnswerIndex)})</span>
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Question */}
                              <h4 className="font-bold text-slate-900 text-sm sm:text-base mb-4 leading-relaxed">
                                {q.question}
                              </h4>

                              {/* Options */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-3">
                                {q.options.map((opt, optIdx) => {
                                  const isCorrectOpt = optIdx === q.correctAnswerIndex;
                                  const isStudentWrong = isAnswered && optIdx === studentSelected && !isCorrect;

                                  let optClass = 'border-slate-200 bg-white text-slate-700';

                                  if (isCorrectOpt) {
                                    optClass = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-400/40';
                                  } else if (isStudentWrong) {
                                    optClass = 'border-red-500 bg-red-50 text-red-950 font-bold ring-2 ring-red-400/40 line-through';
                                  }

                                  return (
                                    <div
                                      key={optIdx}
                                      className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${optClass}`}
                                    >
                                      <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center font-mono font-bold shrink-0 text-[10px]">
                                        {String.fromCharCode(65 + optIdx)}
                                      </span>
                                      <span className="flex-1 leading-snug">{opt}</span>
                                      {isCorrectOpt && (
                                        <span className="px-2 py-0.5 bg-emerald-600 text-white rounded text-[10px] font-bold shrink-0">
                                          Correct Option
                                        </span>
                                      )}
                                      {isStudentWrong && (
                                        <span className="px-2 py-0.5 bg-red-600 text-white rounded text-[10px] font-bold shrink-0">
                                          Your Choice
                                        </span>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Verified Explanation */}
                              {q.explanation && (
                                <div className="mt-3 p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-950">
                                  <div className="font-bold text-amber-900 flex items-center gap-1.5 mb-1">
                                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                                    <span>Director Amar Soni's Verified Examination Explanation:</span>
                                  </div>
                                  <p className="text-slate-700 leading-relaxed font-sans">{q.explanation}</p>
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {reviewQuestions.length === 0 && (
                          <div className="p-8 text-center text-slate-400 border border-dashed rounded-xl">
                            No questions matching this filter.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()
            ) : (
              /* Active Mock Test Question Screen */
              (() => {
                const currentQ = filteredQuestions[mockCurrentIndex];
                if (!currentQ) return null;
                const selectedOpt = mockAnswers[mockCurrentIndex];

                return (
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 space-y-6">
                    {/* Top Status Bar */}
                    <div className="flex items-center justify-between border-b pb-4">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Question {mockCurrentIndex + 1} of {filteredQuestions.length}
                        </span>
                        <span className="text-xs font-semibold text-blue-900">
                          {currentQ.categoryName || currentQ.category}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 font-mono font-bold text-xs">
                        <Clock className="w-4 h-4 text-amber-600" />
                        <span>Time Remaining: {formatTimer(mockTimeLeft)}</span>
                      </div>
                    </div>

                    {/* Question Content */}
                    <div className="space-y-4">
                      <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                        {currentQ.question}
                      </h3>

                      <div className="space-y-2.5">
                        {currentQ.options.map((opt, optIdx) => (
                          <button
                            key={optIdx}
                            onClick={() => handleMockOptionSelect(optIdx)}
                            className={`w-full p-3.5 rounded-xl border text-left text-xs transition-all flex items-center gap-3 cursor-pointer ${
                              selectedOpt === optIdx
                                ? 'border-[#0f2942] bg-[#0f2942]/5 ring-2 ring-[#0f2942]/20 font-bold text-[#0f2942]'
                                : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800'
                            }`}
                          >
                            <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center font-mono font-bold shrink-0">
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span className="flex-1">{opt}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Question Palette Navigation */}
                    <div className="pt-4 border-t flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <button
                          disabled={mockCurrentIndex === 0}
                          onClick={() => setMockCurrentIndex((prev) => Math.max(0, prev - 1))}
                          className="px-4 py-2 border rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          <span>Previous</span>
                        </button>

                        <button
                          disabled={mockCurrentIndex === filteredQuestions.length - 1}
                          onClick={() =>
                            setMockCurrentIndex((prev) => Math.min(filteredQuestions.length - 1, prev + 1))
                          }
                          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-800 flex items-center gap-1 cursor-pointer"
                        >
                          <span>Next Question</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>

                      <button
                        onClick={() => {
                          if (confirm('Are you ready to submit your exam and calculate final marks?')) {
                            setMockSubmitted(true);
                          }
                        }}
                        className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Submit Examination</span>
                      </button>
                    </div>

                    {/* Question Palette Circles */}
                    <div className="pt-2 border-t">
                      <div className="text-[10px] text-slate-400 font-bold uppercase mb-2">
                        Question Palette ({Object.keys(mockAnswers).length}/{filteredQuestions.length} Attempted)
                      </div>
                      <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                        {filteredQuestions.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setMockCurrentIndex(idx)}
                            className={`w-7 h-7 rounded-lg text-[10px] font-bold font-mono transition-colors cursor-pointer ${
                              mockCurrentIndex === idx
                                ? 'ring-2 ring-amber-500 bg-[#0f2942] text-white'
                                : mockAnswers[idx] !== undefined
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {idx + 1}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()
            )}
          </div>
        )}
      </div>
    </div>
  );
};
