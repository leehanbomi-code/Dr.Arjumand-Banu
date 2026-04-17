import React from 'react';
import { Play, BookOpen, Clock, ChevronRight } from 'lucide-react';
import { UserStats, Lesson } from '../types';
import { MOCK_LESSONS } from '../constants';

interface DashboardProps {
  userStats: UserStats;
  onLessonSelect: (lesson: Lesson) => void;
}

export default function Dashboard({ userStats, onLessonSelect }: DashboardProps) {
  return (
    <div className="space-y-10">
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-display font-bold text-brand-text">Welcome back, Explorer! 🌿</h2>
          <span className="text-sm font-medium text-brand-text-muted">Friday, April 17</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            title="Total Points" 
            value={userStats.points.toLocaleString()} 
            icon={<Star className="text-brand-secondary" />} 
            color="bg-brand-secondary/10"
          />
          <StatCard 
            title="Current Streak" 
            value={`${userStats.streak} Days`} 
            icon={<Zap className="text-brand-primary" />} 
            color="bg-brand-primary/10"
          />
          <StatCard 
            title="Lessons Completed" 
            value="12" 
            icon={<BookOpen className="text-brand-accent" />} 
            color="bg-brand-accent/10"
          />
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">Continue Learning</h3>
            <button className="text-sm font-semibold text-brand-primary hover:underline underline-offset-4">View all</button>
          </div>
          <div className="space-y-4">
            {MOCK_LESSONS.map(lesson => (
              <div 
                key={lesson.id}
                onClick={() => onLessonSelect(lesson)}
                className="group p-4 bg-white rounded-3xl border border-brand-muted shadow-sm hover:shadow-md hover:border-brand-primary/30 transition-all cursor-pointer flex gap-4 items-center"
              >
                <div className="w-20 h-20 rounded-2xl bg-brand-bg flex items-center justify-center relative overflow-hidden shrink-0">
                   <Play className="w-8 h-8 text-brand-text-muted group-hover:text-brand-primary transition-colors z-10" />
                   <div className="absolute inset-0 bg-brand-primary opacity-0 group-hover:opacity-10 transition-opacity" />
                </div>
                <div className="flex-grow">
                  <h4 className="font-bold text-brand-text mb-1 group-hover:text-brand-primary transition-colors">{lesson.title}</h4>
                  <div className="flex items-center gap-4 text-xs text-brand-text-muted font-medium">
                    <span className="flex items-center gap-1"><Clock size={14}/> 15 min</span>
                    <span className="flex items-center gap-1"><BookOpen size={14}/> 2 Chapters</span>
                  </div>
                </div>
                <ChevronRight className="text-brand-muted group-hover:text-brand-primary group-hover:translate-x-1 transition-all" />
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-xl font-bold mb-6">Recent Badges</h3>
          <div className="bg-white p-6 rounded-3xl border border-brand-muted shadow-sm grid grid-cols-2 gap-4">
            {userStats.badges.map(badge => (
              <div key={badge.id} className="p-4 bg-brand-bg rounded-2xl text-center border border-brand-muted/20">
                <div className="text-4xl mb-2">{badge.icon}</div>
                <p className="font-bold text-sm mb-1">{badge.name}</p>
                <p className="text-xs text-brand-text-muted">{badge.description}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string, value: string, icon: React.ReactNode, color: string }) {
  return (
    <div className={`p-6 rounded-3xl shadow-sm border border-brand-muted/50 ${color}`}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-bold text-brand-text-muted uppercase tracking-wider">{title}</span>
        {icon}
      </div>
      <div className="text-3xl font-display font-bold text-brand-text">{value}</div>
    </div>
  );
}

import { Star, Zap } from 'lucide-react';
