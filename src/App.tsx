/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  BookOpen, 
  LayoutDashboard, 
  Trophy, 
  Gift, 
  Target, 
  MessageSquare,
  Search,
  Zap,
  Star,
  ChevronRight,
  Play,
  Award,
  LogIn,
  LogOut,
  User as UserIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Lesson, UserStats, ChatStyle } from './types';
import { MOCK_LESSONS, MOCK_QUIZ } from './constants';
import Dashboard from './components/Dashboard';
import LessonHub from './components/LessonHub';
import QuizModule from './components/QuizModule';
import RewardsHub from './components/RewardsHub';
import ChatbotOverlay from './components/ChatbotOverlay';
import { auth, googleProvider } from './lib/firebase';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';

type View = 'dashboard' | 'lessons' | 'quiz' | 'rewards' | 'leaderboard';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userStats, setUserStats] = useState<UserStats>({
    points: 1250,
    level: 4,
    streak: 7,
    badges: [
      { id: 'b1', name: 'Early Bird', icon: '🌅', description: 'Study before 8 AM' },
      { id: 'b2', name: 'Quiz Master', icon: '🧠', description: 'Score 100% on 5 quizzes' }
    ]
  });
  const [isChatOpen, setIsChatOpen] = useState(false);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const addPoints = (amount: number) => {
    setUserStats(prev => ({ ...prev, points: prev.points + amount }));
  };

  const handleLessonSelect = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setCurrentView('lessons');
  };

  return (
    <div className="flex h-screen w-full bg-brand-bg text-brand-text overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <nav className="w-20 md:w-64 flex flex-col sidebar-natural border-r border-brand-primary/10 h-full p-4 shrink-0 overflow-y-auto">
        <div className="flex items-center gap-3 px-2 mb-10 overflow-hidden text-brand-primary">
          <div className="p-2 bg-brand-primary rounded-xl text-white">
            <Zap className="w-6 h-6" />
          </div>
          <span className="text-xl font-display font-bold hidden md:block">Dr. Arjumand</span>
        </div>

        <div className="space-y-2 flex-grow">
          <NavItem 
            icon={<LayoutDashboard />} 
            label="Dashboard" 
            active={currentView === 'dashboard'} 
            onClick={() => setCurrentView('dashboard')} 
          />
          <NavItem 
            icon={<BookOpen />} 
            label="Lessons" 
            active={currentView === 'lessons'} 
            onClick={() => { setCurrentView('lessons'); setSelectedLesson(null); }} 
          />
          <NavItem 
            icon={<Target />} 
            label="Practice Quiz" 
            active={currentView === 'quiz'} 
            onClick={() => setCurrentView('quiz')} 
          />
          <NavItem 
            icon={<Trophy />} 
            label="Leaderboard" 
            active={currentView === 'leaderboard'} 
            onClick={() => setCurrentView('leaderboard')} 
          />
          <NavItem 
            icon={<Gift />} 
            label="Rewards" 
            active={currentView === 'rewards'} 
            onClick={() => setCurrentView('rewards')} 
          />
        </div>

        <div className="mt-auto pt-6 border-t border-brand-primary/10">
          <div className="flex items-center gap-3 p-2 bg-white/50 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-brand-primary flex items-center justify-center font-bold text-white">
              {userStats.level}
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-semibold truncate">Student Explorer</p>
              <p className="text-xs text-brand-primary font-medium">{userStats.points} pts</p>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative natural-bg">
        <header className="sticky top-0 z-10 bg-white/70 backdrop-blur-md border-b border-brand-muted px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4 bg-brand-muted/30 px-4 py-2 rounded-2xl w-full max-w-md">
            <Search className="w-4 h-4 text-brand-text-muted" />
            <input 
              type="text" 
              placeholder="Search topics, videos, concepts..." 
              className="bg-transparent border-none outline-none text-sm w-full placeholder:text-brand-text-muted/60"
            />
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-brand-secondary fill-brand-secondary" />
              <span className="font-bold text-brand-text">{userStats.streak} Day Streak!</span>
            </div>
            
            <div className="h-8 w-[1px] bg-brand-muted mx-2 hidden md:block" />

            {user ? (
              <div className="flex items-center gap-3">
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-sm font-bold text-brand-text leading-none">{user.displayName}</span>
                  <span className="text-[10px] text-brand-text-muted font-medium">Syncing Active</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-2.5 bg-brand-bg border border-brand-muted text-brand-text-muted rounded-xl hover:bg-brand-secondary/10 hover:text-brand-secondary hover:border-brand-secondary/30 transition-all group"
                  title="Sign Out"
                >
                  <LogOut size={18} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            ) : (
              <button 
                onClick={handleLogin}
                className="flex items-center gap-2 px-5 py-2.5 bg-brand-secondary text-white rounded-xl shadow-lg shadow-brand-secondary/20 hover:scale-[1.02] active:scale-[0.98] transition-all font-bold text-sm"
              >
                <LogIn size={18} />
                <span>Sign In</span>
              </button>
            )}

            <button 
              onClick={() => setIsChatOpen(!isChatOpen)}
              className="p-3 bg-brand-primary text-white rounded-2xl shadow-lg shadow-brand-primary/20 hover:scale-105 transition-transform"
            >
              <MessageSquare className="w-5 h-5" />
            </button>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {currentView === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Dashboard userStats={userStats} onLessonSelect={handleLessonSelect} />
              </motion.div>
            )}
            
            {currentView === 'lessons' && (
              <motion.div
                key="lessons"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <LessonHub 
                  selectedLesson={selectedLesson} 
                  onBack={() => setSelectedLesson(null)} 
                  onSelect={setSelectedLesson}
                />
              </motion.div>
            )}

            {currentView === 'quiz' && (
              <motion.div
                key="quiz"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
              >
                <QuizModule onComplete={addPoints} />
              </motion.div>
            )}

            {currentView === 'rewards' && (
              <motion.div
                key="rewards"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <RewardsHub userStats={userStats} />
              </motion.div>
            )}

            {currentView === 'leaderboard' && (
              <div className="text-center py-20">
                <Trophy className="w-20 h-20 text-brand-secondary mx-auto mb-6" />
                <h2 className="text-3xl font-bold mb-2">Competing with Millions</h2>
                <p className="text-brand-text-muted max-w-md mx-auto">You are currently ranked #1,245 out of 2.5M students! Reach the top 100 for special edition badges.</p>
                <div className="mt-10 space-y-4 max-w-2xl mx-auto bg-white p-6 rounded-3xl shadow-sm border border-brand-muted">
                   {[1, 2, 3, 4, 5].map(i => (
                     <div key={i} className={`flex items-center gap-4 p-4 rounded-2xl ${i === 4 ? 'bg-brand-primary text-white shadow-lg' : 'hover:bg-brand-bg transition-colors'}`}>
                        <span className="font-bold w-6">{i === 4 ? userStats.level + 1240 : i}</span>
                        <div className="w-10 h-10 rounded-full bg-brand-muted" />
                        <span className="font-semibold flex-grow text-left">{i === 1 ? "Alex Pro" : i === 4 ? "You" : "Student " + i}</span>
                        <span className="font-mono">{i === 4 ? userStats.points : 2500 - (i * 100)} pts</span>
                     </div>
                   ))}
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Chatbot Overlay */}
      <ChatbotOverlay isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl transition-all ${
        active 
          ? 'bg-brand-primary text-white shadow-brand-primary/20 shadow-lg' 
          : 'text-brand-text-muted hover:bg-white/50 hover:text-brand-primary'
      }`}
    >
      <div className={`${active ? 'text-white' : 'text-brand-secondary/70'}`}>
        {React.cloneElement(icon as React.ReactElement<{ size?: number }>, { size: 22 })}
      </div>
      <span className="font-semibold text-sm hidden md:block">{label}</span>
      {active && <motion.div layoutId="indicator" className="ml-auto w-1.5 h-1.5 rounded-full bg-white hidden md:block" />}
    </button>
  );
}

