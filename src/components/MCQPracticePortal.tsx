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

  // Mock Test Mode state
  const [mockActive, setMockActive] = useState(false);
  const [mockCurrentIndex, setMockCurrentIndex] = useState(0);
  const [mockAnswers, setMockAnswers] = useState<Record<number, number>>({});
  const [mockTimeLeft, setMockTimeLeft] = useState(900); // 15 mins
  const [mockSubmitted, setMockSubmitted] = useState(false);

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

  // Calculate Mock Test Score
  const calculateMockScore = () => {
    let score = 0;
    filteredQuestions.forEach((q, idx) => {
      if (mockAnswers[idx] === q.correctAnswerIndex) {
        score += 1;
      }
    });
    const total = filteredQuestions.length;
    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
    const grade = percentage >= 85 ? 'S (Distinction)' : percentage >= 75 ? 'A (Excellent)' : percentage >= 65 ? 'B (Good)' : percentage >= 50 ? 'C (Pass)' : 'F (Fail)';
    const isPass = percentage >= 50;
    return { score, total, percentage, grade, isPass };
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
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Showing <strong>{filteredQuestions.length}</strong> practice questions</span>
              <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                <Sparkles className="w-3.5 h-3.5" /> Click any option to reveal instantaneous verified answer
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
                {filteredQuestions.map((q, idx) => {
                  const selectedOpt = practiceAnswers[q.id];
                  const hasAnswered = selectedOpt !== undefined;
                  const isCorrect = selectedOpt === q.correctAnswerIndex;

                  return (
                    <div
                      key={q.id}
                      className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-amber-300 transition-all p-5 space-y-4"
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
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-medium">
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
                                <span>Incorrect (Try Again or See Solution)</span>
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
              /* Scorecard View */
              (() => {
                const { score, total, percentage, grade, isPass } = calculateMockScore();
                return (
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-6 text-center animate-in fade-in">
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
                      <h2 className="font-cinzel font-bold text-2xl text-slate-900 mt-1">
                        Mock Exam Evaluation Sheet
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Advance Institute of Digital Technology • Ayodhya Cantt
                      </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto">
                      <div className="p-3 bg-slate-50 border rounded-xl">
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Total Score</span>
                        <div className="text-xl font-black text-slate-900 mt-0.5">
                          {score} / {total}
                        </div>
                      </div>
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
                      <div className="p-3 bg-slate-50 border rounded-xl">
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Result</span>
                        <div
                          className={`text-xl font-black mt-0.5 ${
                            isPass ? 'text-emerald-700' : 'text-red-700'
                          }`}
                        >
                          {isPass ? 'PASSED' : 'NEEDS STUDY'}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                      <button
                        onClick={handleStartMockTest}
                        className="px-5 py-2 bg-[#0f2942] hover:bg-[#1a3d60] text-white font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-sm"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>Retake Mock Exam</span>
                      </button>

                      {onOpenNotes && (
                        <button
                          onClick={onOpenNotes}
                          className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-sm"
                        >
                          <BookOpen className="w-4 h-4" />
                          <span>Download Revision PDF Notes</span>
                        </button>
                      )}
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
