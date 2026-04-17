import React, { useState } from 'react';
import { ArrowLeft, Play, FileText, ChevronRight, Video, List, Info, ExternalLink } from 'lucide-react';
import { Lesson, Chapter } from '../types';
import { MOCK_LESSONS } from '../constants';
import { motion, AnimatePresence } from 'motion/react';

interface LessonHubProps {
  selectedLesson: Lesson | null;
  onBack: () => void;
  onSelect: (lesson: Lesson) => void;
}

export default function LessonHub({ selectedLesson, onBack, onSelect }: LessonHubProps) {
  const [activeTab, setActiveTab] = useState<'video' | 'text'>('video');
  const [activeChapter, setActiveChapter] = useState<Chapter | null>(null);

  if (selectedLesson) {
    const currentChapter = activeChapter || selectedLesson.chapters[0];
    
    return (
      <div className="space-y-8">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-brand-text-muted hover:text-brand-primary font-semibold mb-6 transition-colors"
        >
          <ArrowLeft size={18} />
          Back to Hub
        </button>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-grow space-y-6">
            <h2 className="text-3xl font-bold text-brand-text">{selectedLesson.title}</h2>
            
            {/* Tab Navigation */}
            <div className="flex gap-4 p-1 bg-brand-muted/30 rounded-2xl w-fit">
              <button 
                onClick={() => setActiveTab('video')}
                className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                  activeTab === 'video' ? 'bg-white shadow-sm text-brand-primary' : 'text-brand-text-muted'
                }`}
              >
                <Video size={16} /> Video Lesson
              </button>
              <button 
                onClick={() => setActiveTab('text')}
                className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                  activeTab === 'text' ? 'bg-white shadow-sm text-brand-primary' : 'text-brand-text-muted'
                }`}
              >
                <FileText size={16} /> Textbook Content
              </button>
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'video' ? (
                <motion.div 
                  key="video"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="aspect-video w-full bg-black rounded-3xl overflow-hidden shadow-2xl relative"
                >
                  <iframe 
                    src={selectedLesson.videoUrl} 
                    title={selectedLesson.title}
                    className="w-full h-full border-none"
                    allowFullScreen
                  />
                  <div className="absolute top-4 right-4 flex flex-col gap-2">
                     {Object.entries(selectedLesson.videoClippedSegments).map(([key, time]) => (
                       <button 
                        key={key} 
                        className="glass-panel text-xs font-bold px-3 py-1 rounded-full text-brand-primary hover:bg-white transition-colors flex items-center gap-1 border border-brand-primary/10"
                       >
                         <Play size={10} fill="currentColor" /> {key} ({time})
                       </button>
                     ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="text"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="bg-white p-8 rounded-3xl border border-brand-muted shadow-sm min-h-[500px]"
                >
                  <h3 className="text-2xl font-bold mb-4 text-brand-text">{currentChapter.title}</h3>
                  <div className="prose prose-slate max-w-none text-brand-text-muted leading-relaxed text-lg">
                    {currentChapter.content}
                  </div>
                  <div className="mt-10 p-6 bg-brand-muted/20 rounded-2xl border border-brand-muted flex items-start gap-4">
                    <Info className="text-brand-primary shrink-0 mt-1" />
                    <div>
                      <p className="font-bold text-brand-text mb-1">Concept Focus</p>
                      <p className="text-sm text-brand-text-muted font-medium">This section is frequently referenced in final examinations. Pay close attention to the diagrams.</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <aside className="w-full lg:w-80 shrink-0">
            <div className="bg-white p-6 rounded-3xl border border-brand-muted shadow-sm sticky top-28">
              <h4 className="font-bold flex items-center gap-2 mb-4 text-brand-text">
                <List size={18} /> Lesson Content
              </h4>
              <div className="space-y-2">
                {selectedLesson.chapters.map((chapter) => (
                  <button
                    key={chapter.id}
                    onClick={() => { setActiveChapter(chapter); setActiveTab('text'); }}
                    className={`w-full text-left p-4 rounded-2xl text-sm font-semibold transition-all border flex items-center justify-between ${
                      activeChapter?.id === chapter.id || (!activeChapter && selectedLesson.chapters[0].id === chapter.id)
                        ? 'bg-brand-muted/30 border-brand-primary/20 text-brand-primary'
                        : 'bg-transparent border-transparent text-brand-text-muted hover:bg-brand-bg'
                    }`}
                  >
                    {chapter.title}
                    <ChevronRight size={14} className={activeChapter?.id === chapter.id ? 'opacity-100' : 'opacity-0'} />
                  </button>
                ))}
              </div>
              
              <div className="mt-8 pt-8 border-t border-brand-muted">
                <h4 className="font-bold mb-4">Exam Context</h4>
                <div className="p-4 bg-brand-bg rounded-2xl text-xs text-brand-text-muted">
                  <p className="mb-2 font-semibold">Historical Frequency:</p>
                  <div className="flex gap-1 mb-3">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-1.5 flex-grow bg-brand-primary rounded-full" />)}
                    <div className="h-1.5 flex-grow bg-brand-muted rounded-full" />
                  </div>
                  <p>Common question types: Multiple Choice, Short Answer, Diagram Labeling.</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-8 text-brand-text">Learning Hub</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {MOCK_LESSONS.map(lesson => (
          <div 
            key={lesson.id} 
            onClick={() => onSelect(lesson)}
            className="group bg-white p-2 rounded-[2rem] border border-brand-muted shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer overflow-hidden"
          >
            <div className="aspect-video bg-brand-muted/30 rounded-[1.5rem] mb-4 flex items-center justify-center relative overflow-hidden">
               <Play className="w-12 h-12 text-white drop-shadow-lg opacity-80 group-hover:scale-110 transition-transform z-10" />
               <img 
                src={`https://picsum.photos/seed/${lesson.id}/800/450`} 
                alt={lesson.title} 
                className="absolute inset-0 w-full h-full object-cover brightness-90 group-hover:brightness-100 transition-all"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="px-4 pb-4">
              <h3 className="font-bold text-xl mb-2 group-hover:text-brand-primary transition-colors line-clamp-1 text-brand-text">{lesson.title}</h3>
              <p className="text-brand-text-muted text-sm line-clamp-2 mb-4 font-medium">{lesson.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-3 py-1 bg-brand-accent/10 text-brand-accent rounded-full">New Content</span>
                <span className="text-brand-primary font-bold text-sm flex items-center gap-1">Start <ChevronRight size={14}/></span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

