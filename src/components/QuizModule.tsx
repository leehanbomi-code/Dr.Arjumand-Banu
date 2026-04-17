import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  ArrowRight, 
  RotateCcw, 
  ExternalLink, 
  Play, 
  BookOpen,
  Trophy,
  Zap
} from 'lucide-react';
import { MOCK_QUIZ } from '../constants';
import { QuizQuestion } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';

interface QuizModuleProps {
  onComplete: (points: number) => void;
}

export default function QuizModule({ onComplete }: QuizModuleProps) {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showTeachMe, setShowTeachMe] = useState(false);
  const [finished, setFinished] = useState(false);

  const currentQuestion = MOCK_QUIZ[currentStep];

  const handleAnswer = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);
    if (index === currentQuestion.correctAnswer) {
      setScore(s => s + 1);
    }
  };

  const nextQuestion = () => {
    if (currentStep < MOCK_QUIZ.length - 1) {
      setCurrentStep(s => s + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setShowTeachMe(false);
    } else {
      setFinished(true);
      onComplete(score * 100 + 50);
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#5B7B7A', '#D4A373', '#A3B18A']
      });
    }
  };

  const reset = () => {
    setCurrentStep(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setFinished(false);
    setShowTeachMe(false);
  };

  if (finished) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12 px-6 bg-white rounded-[2.5rem] shadow-xl border border-brand-muted">
        <div className="w-24 h-24 bg-brand-secondary/10 rounded-full flex items-center justify-center mx-auto mb-8">
           <Trophy className="w-12 h-12 text-brand-secondary" />
        </div>
        <h2 className="text-4xl font-display font-bold mb-4 text-brand-text">Quiz Complete! 🌿</h2>
        <p className="text-brand-text-muted text-lg mb-10">You've mastered these concepts and earned some serious XP.</p>
        
        <div className="grid grid-cols-2 gap-6 mb-10 text-left">
           <div className="p-6 bg-brand-primary/10 rounded-3xl border border-brand-primary/20">
              <p className="text-brand-primary font-bold text-sm uppercase mb-1">Score</p>
              <p className="text-3xl font-display font-bold text-brand-text">{score} / {MOCK_QUIZ.length}</p>
           </div>
           <div className="p-6 bg-brand-accent/10 rounded-3xl border border-brand-accent/20">
              <p className="text-brand-accent font-bold text-sm uppercase mb-1">XP Earned</p>
              <p className="text-3xl font-display font-bold text-brand-text">+{score * 100 + 50}</p>
           </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={reset}
            className="flex items-center justify-center gap-2 px-8 py-4 bg-brand-bg text-brand-text rounded-2xl font-bold hover:bg-brand-muted transition-colors border border-brand-muted"
          >
            <RotateCcw size={20} /> Try Again
          </button>
          <button className="flex items-center justify-center gap-2 px-8 py-4 bg-brand-primary text-white rounded-2xl font-bold shadow-lg shadow-brand-primary/20 hover:scale-105 transition-transform">
            Continue Journey <ArrowRight size={20} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto text-brand-text">
      <div className="flex items-center justify-between mb-8 px-4">
        <div>
           <p className="text-xs font-bold text-brand-primary uppercase tracking-widest mb-1">Exam Prep Quiz</p>
           <h2 className="text-2xl font-bold">Question {currentStep + 1} of {MOCK_QUIZ.length}</h2>
        </div>
        <div className="flex items-center gap-3">
           <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-brand-text-muted">SCORE</p>
              <p className="font-display font-bold text-xl">{score}</p>
           </div>
           <div className="w-12 h-12 rounded-full border-4 border-brand-muted border-t-brand-primary flex items-center justify-center font-bold">
              {Math.round((currentStep / MOCK_QUIZ.length) * 100)}%
           </div>
        </div>
      </div>

      <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-brand-muted/30 relative overflow-hidden">
        {/* Progress bar background decor */}
        <div className="absolute top-0 left-0 h-1.5 w-full bg-brand-bg">
          <motion.div 
            className="h-full bg-brand-primary" 
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / MOCK_QUIZ.length) * 100}%` }}
          />
        </div>

        <p className="text-xl font-bold text-brand-text leading-relaxed mb-8 italic border-l-4 border-brand-secondary pl-4">
          {currentQuestion.question}
        </p>

        <div className="space-y-4 mb-10">
          {currentQuestion.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswer(idx)}
              disabled={isAnswered}
              className={`w-full text-left p-6 rounded-2xl border-2 transition-all flex items-center justify-between group ${
                isAnswered
                  ? idx === currentQuestion.correctAnswer
                    ? 'bg-brand-accent/10 border-brand-accent text-brand-accent'
                    : idx === selectedOption
                    ? 'bg-brand-secondary/5 border-brand-secondary text-brand-secondary'
                    : 'bg-brand-bg border-brand-muted/50 text-brand-text-muted opacity-60'
                  : 'bg-white border-brand-muted hover:border-brand-primary/30 hover:bg-brand-primary/5'
              }`}
            >
              <span className="font-semibold text-lg">{option}</span>
              {isAnswered && idx === currentQuestion.correctAnswer && <CheckCircle2 className="text-brand-accent scale-110" />}
              {isAnswered && idx === selectedOption && idx !== currentQuestion.correctAnswer && <XCircle className="text-brand-secondary scale-110" />}
            </button>
          ))}
        </div>

        <AnimatePresence>
          {isAnswered && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-6 rounded-3xl mb-8 ${
                selectedOption === currentQuestion.correctAnswer 
                ? 'bg-brand-accent/10 text-brand-accent border border-brand-accent/20' 
                : 'bg-brand-secondary/5 text-brand-secondary border border-brand-secondary/20'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-xl bg-white shrink-0 shadow-sm border border-brand-muted/20">
                  {selectedOption === currentQuestion.correctAnswer ? <Zap className="text-brand-accent" /> : <HelpCircle className="text-brand-secondary" />}
                </div>
                <div>
                  <h4 className="font-bold mb-1">
                    {selectedOption === currentQuestion.correctAnswer ? "Excellent! You got it." : "Not quite, but it's a great learning opportunity!"}
                  </h4>
                  <p className="text-sm opacity-90 mb-4">{currentQuestion.explanation}</p>
                  
                  {selectedOption !== currentQuestion.correctAnswer && (
                    <button 
                      onClick={() => setShowTeachMe(!showTeachMe)}
                      className="text-sm font-bold underline decoration-2 underline-offset-4 decoration-brand-secondary hover:text-brand-secondary transition-all flex items-center gap-2"
                    >
                      🌱 Teach me why this is wrong
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showTeachMe && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 p-6 bg-[#2F3E3D] text-white rounded-3xl overflow-hidden shadow-inner border-l-8 border-brand-secondary"
            >
               <h5 className="text-brand-secondary font-bold text-sm uppercase mb-2 flex items-center gap-2">
                 <BookOpen size={14} /> Referenced from Study Material
               </h5>
               <p className="text-sm text-brand-muted italic mb-4 leading-relaxed font-medium">
                 "... {currentQuestion.sourceLink.textSnippet} ..."
               </p>
               <div className="flex gap-3">
                 <button className="flex items-center gap-2 px-4 py-2 bg-brand-primary rounded-xl text-xs font-bold hover:bg-brand-primary/80 transition-colors">
                   {currentQuestion.sourceLink.type === 'video' ? <Play size={12} fill="currentColor" /> : <BookOpen size={12} />} 
                   Jump to {currentQuestion.sourceLink.type === 'video' ? `Timestamp ${currentQuestion.sourceLink.timestamp}` : "Chapter"}
                 </button>
                 <button className="flex items-center gap-2 px-4 py-2 bg-brand-muted/20 border border-brand-muted/20 rounded-xl text-xs font-bold hover:bg-brand-muted/30 transition-colors">
                   Ask AI Chatbot <ArrowRight size={12} />
                 </button>
               </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-end">
          {isAnswered && (
            <button 
              onClick={nextQuestion}
              className="flex items-center gap-2 px-10 py-4 bg-brand-primary text-white rounded-2xl font-bold shadow-xl shadow-brand-primary/20 hover:bg-brand-primary/90 transition-all hover:translate-x-1"
            >
              {currentStep < MOCK_QUIZ.length - 1 ? 'Next Question' : 'Finish Quiz'} <ArrowRight size={20} />
            </button>
          )}
        </div>
      </div>
      
      <div className="mt-8 flex items-center justify-center gap-6">
        <div className="flex items-center gap-2 text-brand-text-muted text-sm font-medium">
          <CheckCircle2 size={16} /> Instant Grading
        </div>
        <div className="flex items-center gap-2 text-brand-text-muted text-sm font-medium">
          <BookOpen size={16} /> Source Links
        </div>
        <div className="flex items-center gap-2 text-brand-text-muted text-sm font-medium">
          <ExternalLink size={16} /> Exam-Oriented
        </div>
      </div>
    </div>
  );
}
