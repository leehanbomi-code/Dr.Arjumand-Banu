import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Send, 
  Sparkles, 
  Settings2, 
  User, 
  Bot,
  Zap,
  Coffee,
  Lightbulb,
  Eye,
  GraduationCap,
  ShieldAlert,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ChatStyle } from '../types';
import { getGeminiChatResponse } from '../services/gemini';
import ReactMarkdown from 'react-markdown';
import { auth, getUserPrefs, saveUserPrefs, getChatHistory, addHistoryMessage } from '../lib/firebase';
import { onAuthStateChanged, User as AuthUser } from 'firebase/auth';

interface ChatbotOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  role: 'user' | 'model';
  content: string;
}

const STYLE_OPTIONS: { id: ChatStyle, label: string, icon: React.ReactNode, desc: string }[] = [
  { id: 'simple', label: 'Simple Text', icon: <GraduationCap size={16} />, desc: 'Clear, easy language' },
  { id: 'real-life', label: 'Examples', icon: <Coffee size={16} />, desc: 'Relatable daily analogies' },
  { id: 'visual', label: 'Visual Aid', icon: <Eye size={16} />, desc: 'Descriptive & mental images' },
  { id: 'advanced', label: 'Advanced', icon: <Zap size={16} />, desc: 'Academic & rigorous' }
];

export default function ChatbotOverlay({ isOpen, onClose }: ChatbotOverlayProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentStyle, setCurrentStyle] = useState<ChatStyle>('simple');
  const [showSettings, setShowSettings] = useState(false);
  const [privacyAlert, setPrivacyAlert] = useState<string | null>(null);
  const [hasAgreedToPrivacy, setHasAgreedToPrivacy] = useState<boolean>(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize from LocalStorage (Fallback)
  useEffect(() => {
    if (!user) {
      const savedHistory = localStorage.getItem('dr_arjumand_chat_history');
      if (savedHistory) setMessages(JSON.parse(savedHistory));
      else setMessages([{ role: 'model', content: "Hi! I'm Dr. Arjumand's AI assistant. I'm here to support your learning journey in a safe and private environment. I'll never ask for your sensitive personal data. How can I help you understand your lessons today?" }]);

      const savedStyle = localStorage.getItem('dr_arjumand_teaching_style') as ChatStyle;
      if (savedStyle) setCurrentStyle(savedStyle);

      const savedAgreed = localStorage.getItem('dr_arjumand_privacy_agreed') === 'true';
      setHasAgreedToPrivacy(savedAgreed);
    }
  }, [user]);

  // Auth Listener & Sync
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Load from Firestore
        const prefs = await getUserPrefs(currentUser.uid);
        if (prefs) {
          setCurrentStyle(prefs.teachingStyle);
          setHasAgreedToPrivacy(prefs.hasAgreedToPrivacy);
        } else {
          // One-time setup: Migrate local to firestore if first login
          const localStyle = (localStorage.getItem('dr_arjumand_teaching_style') as ChatStyle) || 'simple';
          const localAgreed = localStorage.getItem('dr_arjumand_privacy_agreed') === 'true';
          await saveUserPrefs(currentUser.uid, { teachingStyle: localStyle, hasAgreedToPrivacy: localAgreed });
        }

        const history = await getChatHistory(currentUser.uid);
        if (history.length > 0) {
          setMessages(history.map(m => ({ role: m.role, content: m.content })));
        } else if (messages.length > 1) {
          // One-time history migration
          for (const msg of messages) {
            await addHistoryMessage(currentUser.uid, msg.role, msg.content);
          }
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleAgree = async () => {
    localStorage.setItem('dr_arjumand_privacy_agreed', 'true');
    setHasAgreedToPrivacy(true);
    if (user) {
      await saveUserPrefs(user.uid, { hasAgreedToPrivacy: true });
    }
  };

  useEffect(() => {
    if (!user) {
      localStorage.setItem('dr_arjumand_teaching_style', currentStyle);
    } else {
      saveUserPrefs(user.uid, { teachingStyle: currentStyle });
    }
  }, [currentStyle, user]);

  useEffect(() => {
    if (!user) {
      localStorage.setItem('dr_arjumand_chat_history', JSON.stringify(messages));
    }
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, user]);

  const containsSensitiveInfo = (text: string) => {
    // Basic regex for Credit Cards (13-16 digits)
    const cardRegex = /\b(?:\d[ -]*?){13,16}\b/g;
    // Basic regex for common Bank Account/IBAN patterns
    const bankRegex = /\b[A-Z]{2}\d{2}[A-Z0-9]{11,30}\b/g;
    return cardRegex.test(text) || bankRegex.test(text);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    if (containsSensitiveInfo(input)) {
      setPrivacyAlert("Safety Alert: We detected potentially sensitive information (like financial data or bank details). For your security, this message was blocked and deleted. Please never share private personal info with the AI.");
      setInput('');
      return;
    }

    const userMsg = input.trim();
    setInput('');
    setPrivacyAlert(null);
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    if (user) {
      await addHistoryMessage(user.uid, 'user', userMsg);
    }
    setIsLoading(true);

    const history = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.content }]
    }));

    const response = await getGeminiChatResponse(userMsg, currentStyle, history);
    
    setMessages(prev => [...prev, { role: 'model', content: response }]);
    if (user) {
      await addHistoryMessage(user.uid, 'model', response);
    }
    setIsLoading(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 300 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed top-0 right-0 h-full w-full sm:w-[450px] bg-white shadow-2xl z-50 flex flex-col border-l border-brand-muted"
        >
          {/* Header */}
          <div className="p-6 bg-brand-primary text-white flex items-center justify-between shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-brand-primary/40 opacity-20 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/20 to-transparent" />
            <div className="relative z-10 flex items-center gap-3">
               <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-sm">
                 <Bot size={24} />
               </div>
               <div>
                 <h2 className="text-xl font-display font-bold">Concept Buddy</h2>
                 <p className="text-brand-muted text-xs flex items-center gap-1 font-medium">
                   <span className="w-2 h-2 rounded-full bg-brand-accent animate-pulse" /> AI Educator Online
                 </p>
               </div>
            </div>
            
            <div className="flex items-center gap-2 relative z-10">
              <button 
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2 rounded-xl transition-colors ${showSettings ? 'bg-white text-brand-primary' : 'hover:bg-white/10'}`}
              >
                <Settings2 size={20} />
              </button>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Style Selector Popover */}
          <AnimatePresence>
            {showSettings && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute top-24 left-6 right-6 bg-white p-4 rounded-3xl shadow-2xl border border-slate-100 z-20"
              >
                <h3 className="text-sm font-bold text-brand-text-muted mb-3 px-2">CHOOSE TEACHING STYLE</h3>
                <div className="grid grid-cols-2 gap-2">
                  {STYLE_OPTIONS.map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => { setCurrentStyle(opt.id); setShowSettings(false); }}
                      className={`p-3 rounded-2xl border-2 text-left transition-all ${
                        currentStyle === opt.id 
                        ? 'border-brand-primary bg-brand-primary/10 text-brand-primary' 
                        : 'border-brand-bg hover:bg-brand-bg text-brand-text-muted'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {opt.icon} <span className="font-bold text-xs">{opt.label}</span>
                      </div>
                      <p className="text-[10px] opacity-70 leading-tight font-medium">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Messages */}
          <div ref={scrollRef} className="flex-grow p-6 overflow-y-auto space-y-6 bg-brand-bg scroll-hide">
             <AnimatePresence mode="wait">
               {!hasAgreedToPrivacy ? (
                 <motion.div 
                   key="consent"
                   initial={{ opacity: 0, scale: 0.9 }}
                   animate={{ opacity: 1, scale: 1 }}
                   exit={{ opacity: 0, scale: 0.9 }}
                   className="bg-brand-secondary/5 border border-brand-secondary/20 p-5 rounded-[2rem] flex flex-col gap-4 mb-6 shadow-xl shadow-brand-secondary/5"
                 >
                    <div className="flex items-center gap-2 text-brand-secondary">
                      <ShieldAlert size={20} />
                      <span className="font-bold text-sm uppercase tracking-wider">Privacy & Safety Commitment</span>
                    </div>
                    <p className="text-[12px] text-brand-text leading-relaxed font-medium">
                      To ensure a safe learning space, please avoid sharing <span className="underline decoration-brand-secondary/30">passwords, bank details, or financial data</span>. Dr. Arjumand defaults to strict privacy, but your awareness is key.
                    </p>
                    <div className="p-3 bg-white/50 rounded-xl border border-brand-secondary/10">
                      <p className="text-[10px] text-brand-text-muted italic leading-tight">
                        Note: Sharing sensitive info despite this warning is at your own responsibility. Dr. Arjumand is not liable for data shared voluntarily.
                      </p>
                    </div>
                    <button 
                      onClick={handleAgree}
                      className="w-full py-3 bg-brand-secondary text-white rounded-2xl font-bold text-xs hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-brand-secondary/20"
                    >
                      I Understand & Agree
                    </button>
                 </motion.div>
               ) : (
                 <motion.div 
                    key="reminder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col gap-3"
                 >
                    <div className="bg-brand-secondary/5 border border-brand-secondary/10 px-4 py-2 rounded-xl flex items-center justify-between">
                       <p className="text-[10px] text-brand-text-muted font-medium flex items-center gap-1.5">
                         <ShieldCheck size={12} className="text-brand-secondary" /> Secure Learning Mode Active
                       </p>
                       <span className="text-[9px] text-brand-text-muted/50 font-bold uppercase tracking-tighter">Private & Safe</span>
                    </div>
                    <div className="bg-brand-accent/5 border border-brand-accent/20 p-4 rounded-2xl flex items-start gap-3">
                        <ShieldCheck className="text-brand-accent shrink-0 mt-0.5" size={18} />
                        <p className="text-[11px] text-brand-text-muted leading-relaxed font-medium">
                          Internal Protection: I am prohibited from retaining PII. Any sensitive data encountered is immediately purged.
                        </p>
                    </div>
                 </motion.div>
               )}
             </AnimatePresence>

             {messages.map((msg, idx) => (
               <motion.div 
                 key={idx}
                 initial={{ opacity: 0, y: 10, scale: 0.95 }}
                 animate={{ opacity: 1, y: 0, scale: 1 }}
                 className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
               >
                 <div className={`max-w-[85%] flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border border-brand-muted/20 ${msg.role === 'user' ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' : 'bg-white shadow-sm'}`}>
                       {msg.role === 'user' ? <User size={16} /> : <Sparkles size={16} className="text-brand-primary" />}
                    </div>
                    <div className={`p-4 rounded-2xl text-sm shadow-sm ${
                      msg.role === 'user' 
                      ? 'bg-brand-primary text-white rounded-tr-none' 
                      : 'bg-white border border-brand-muted text-brand-text rounded-tl-none font-medium'
                    }`}>
                      <div className="markdown-body prose prose-sm max-w-none prose-slate">
                        <ReactMarkdown>
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                 </div>
               </motion.div>
             ))}
             {isLoading && (
               <div className="flex justify-start">
                  <div className="bg-white p-4 rounded-2xl shadow-sm border border-brand-muted flex gap-1">
                    <span className="w-1.5 h-1.5 bg-brand-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                    <span className="w-1.5 h-1.5 bg-brand-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <span className="w-1.5 h-1.5 bg-brand-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                  </div>
               </div>
             )}

             <AnimatePresence>
               {privacyAlert && (
                 <motion.div 
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0 }}
                   className="p-4 bg-brand-secondary/10 border border-brand-secondary/30 rounded-2xl flex items-start gap-3"
                 >
                    <ShieldAlert className="text-brand-secondary shrink-0 mt-0.5" size={18} />
                    <p className="text-xs text-brand-secondary font-bold leading-tight">
                      {privacyAlert}
                    </p>
                 </motion.div>
               )}
             </AnimatePresence>
          </div>

          {/* Action Footer */}
          <div className="p-6 bg-white border-t border-brand-muted">
             <div className="flex items-center gap-2 mb-3">
               <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-widest">Active Style</span>
               <div className="px-2 py-0.5 bg-brand-bg rounded-full text-[10px] font-bold text-brand-primary flex items-center gap-1 border border-brand-muted/30">
                 {STYLE_OPTIONS.find(o => o.id === currentStyle)?.icon} {STYLE_OPTIONS.find(o => o.id === currentStyle)?.label}
               </div>
             </div>
             
             <div className="flex gap-2">
                <input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask a question..."
                  className="flex-grow bg-brand-bg border border-brand-muted rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all font-medium text-brand-text placeholder:text-brand-text-muted/50"
                />
                <button 
                  onClick={handleSend}
                  disabled={isLoading}
                  className="p-3 bg-brand-primary text-white rounded-2xl shadow-xl shadow-brand-primary/20 hover:scale-105 active:scale-95 transition-all"
                >
                  <Send size={20} />
                </button>
             </div>
             <p className="mt-3 text-[10px] text-center text-brand-text-muted px-4 font-medium italic">
               By using this AI, you agree to not share sensitive PII. Shared data is at your own risk.
             </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
