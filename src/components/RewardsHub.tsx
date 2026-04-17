import React from 'react';
import { Gift, Award, Zap, Coffee, ShoppingBag, ShieldCheck, Ticket } from 'lucide-react';
import { UserStats } from '../types';
import { motion } from 'motion/react';

interface RewardsHubProps {
  userStats: UserStats;
}

const REDEEMABLES = [
  { id: 'r1', name: 'Premium Coffee Voucher', cost: 1500, icon: <Coffee />, desc: 'Redeem at any partner cafe for a hot brew.' },
  { id: 'r2', name: 'Learning Kit Pro', cost: 5000, icon: <ShoppingBag />, desc: 'Physical notebook and stationery set delivered home.' },
  { id: 'r3', name: 'One-Month Extra Storage', cost: 800, icon: <ShieldCheck />, desc: 'Keep all your learning assets saved for longer.' },
  { id: 'r4', name: 'Partner Discount Code', cost: 1200, icon: <Ticket />, desc: '20% off at our educational stationery partners.' }
];

export default function RewardsHub({ userStats }: RewardsHubProps) {
  return (
    <div className="space-y-12">
      <div className="bg-brand-primary rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-10 opacity-10">
           <Gift size={200} />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
           <div className="w-32 h-32 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 text-5xl">
             🎁
           </div>
           <div className="flex-grow text-center md:text-left">
             <h2 className="text-4xl font-display font-bold mb-2">Your Reward Center</h2>
             <p className="text-brand-muted/80 text-lg mb-6">Learn more, earn more. Redeem your hard-earned points for academic excellence.</p>
             <div className="flex flex-wrap justify-center md:justify-start gap-4">
               <div className="px-6 py-2 bg-white/20 rounded-full font-bold flex items-center gap-2">
                 <Zap size={18} fill="currentColor" /> {userStats.points} Available Points
               </div>
               <div className="px-6 py-2 bg-brand-secondary rounded-full font-bold flex items-center gap-2 shadow-lg shadow-brand-secondary/20">
                 <Award size={18} /> {userStats.badges.length} Unlocked Badges
               </div>
             </div>
           </div>
        </div>
      </div>

      <section>
        <h3 className="text-2xl font-bold mb-8 text-brand-text">Redeem Points</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {REDEEMABLES.map(item => (
            <div key={item.id} className="bg-white p-6 rounded-[2rem] border border-brand-muted shadow-sm flex flex-col items-center text-center group hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-brand-bg text-brand-primary rounded-2xl flex items-center justify-center mb-4 group-hover:bg-brand-primary group-hover:text-white transition-colors border border-brand-muted/20">
                {React.cloneElement(item.icon as React.ReactElement<{ size?: number }>, { size: 28 })}
              </div>
              <h4 className="font-bold mb-2 text-brand-text">{item.name}</h4>
              <p className="text-xs text-brand-text-muted mb-6 flex-grow font-medium">{item.desc}</p>
              <button 
                disabled={userStats.points < item.cost}
                className={`w-full py-3 rounded-2xl font-bold text-sm transition-all shadow-lg ${
                  userStats.points >= item.cost 
                  ? 'bg-brand-primary text-white hover:scale-105 active:scale-95 shadow-brand-primary/20' 
                  : 'bg-brand-muted text-brand-text-muted/50 cursor-not-allowed shadow-none'
                }`}
              >
                {userStats.points >= item.cost ? `Redeem ${item.cost} pts` : `Need ${item.cost - userStats.points} more`}
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white p-10 rounded-[2.5rem] border border-brand-muted shadow-sm text-center">
        <h3 className="text-2xl font-bold mb-4 text-brand-text">Milestone Achievements</h3>
        <p className="text-brand-text-muted mb-10 max-w-xl mx-auto font-medium">Complete challenging tasks to unlock special edition awards and bragging rights in the community.</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
           <Milestone 
            title="The 30-Day Warrior" 
            progress={Math.min((userStats.streak / 30) * 100, 100)} 
            icon="⚔️" 
            reward="Unique Sword Badge + 5,000 pts"
          />
           <Milestone 
            title="Quiz Perfectionist" 
            progress={40} 
            icon="💎" 
            reward="Diamond Brain Badge + 2,500 pts"
          />
           <Milestone 
            title="Dr. Arjumand Ambassador" 
            progress={15} 
            icon="🌍" 
            reward="Global Ambassador Status + Mystery Gift"
          />
        </div>
      </section>
    </div>
  );
}

function Milestone({ title, progress, icon, reward }: { title: string, progress: number, icon: string, reward: string }) {
  return (
    <div className="space-y-4">
      <div className="w-20 h-20 bg-brand-bg rounded-[2rem] flex items-center justify-center text-3xl mx-auto border border-brand-muted">
        {icon}
      </div>
      <div>
        <h5 className="font-bold text-brand-text">{title}</h5>
        <p className="text-[10px] text-brand-primary font-bold uppercase tracking-widest">{reward}</p>
      </div>
      <div className="h-2 w-full bg-brand-muted/40 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className="h-full bg-brand-primary"
        />
      </div>
      <p className="text-xs font-bold text-brand-text-muted">{Math.round(progress)}% Complete</p>
    </div>
  );
}
