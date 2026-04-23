import { motion } from "motion/react";
import { ArrowUpRight, ArrowDownRight, Wallet, Activity, Zap } from "lucide-react";
import { TiltCard } from "../ui/TiltCard";

const RECENT_TRANSACTIONS = [
  { id: 1, type: "income", title: "Gemini API To'lov", amount: "+$4,500.00", time: "Hozirgina", status: "completed" },
  { id: 2, type: "expense", title: "Server Xarajatlari (AWS)", amount: "-$840.20", time: "2 daqiqa oldin", status: "completed" },
  { id: 3, type: "income", title: "Yangi Mijoz: TechCorp", amount: "+$12,000.00", time: "15 daqiqa oldin", status: "completed" },
];

export default function OverviewTab() {
  return (
    <div className="space-y-8 pb-12">
      {/* Top Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* The 3D Hero Object simulation */}
        <div className="col-span-1 lg:col-span-2 glass-panel p-8 min-h-[300px] flex px-10 items-center justify-between relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-electric-violet/5 hover:from-electric-violet/10 to-transparent transition-colors z-0" />
          
          <div className="relative z-10 w-1/2">
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-4xl md:text-5xl font-bold tracking-tight mb-4 leading-tight"
            >
              Chet ellik mijozlar oqimi <br/>
              <span className="text-gradient-violet">18% ga oshdi</span>
            </motion.h1>
            <p className="text-white/60 text-lg mb-8 max-w-sm">
              Bot orqali tahlil qilingan ma'lumotlaringiz asosida kompaniya aktivlari stabil o'smoqda.
            </p>
            <button className="bg-white text-black px-6 py-3 rounded-full font-semibold hover:bg-white/90 transition transform hover:scale-105 active:scale-95 flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.3)]">
              To'liq hisobot <ArrowUpRight size={18} />
            </button>
          </div>

          <div className="relative z-10 w-1/2 flex justify-center items-center h-full">
            {/* 3D Crystal Simulation */}
            <motion.div
              animate={{
                rotateY: [0, 360],
                rotateX: [10, -10, 10],
                y: [-10, 10, -10],
              }}
              transition={{
                rotateY: { duration: 20, repeat: Infinity, ease: "linear" },
                rotateX: { duration: 5, repeat: Infinity, ease: "easeInOut" },
                y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
              }}
              className="w-48 h-48 relative"
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Core glow */}
              <div className="absolute inset-0 bg-electric-violet/40 blur-[50px] animate-pulse-slow rounded-full" />
              
              {/* Outer shape */}
              <div className="absolute inset-0 border border-electric-violet/50 rounded-2xl bg-gradient-to-br from-electric-violet/20 to-cyber-green/20 backdrop-blur-sm" 
                   style={{ transform: "translateZ(20px)", clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }} />
              
              {/* Inner shape */}
              <div className="absolute inset-4 border border-cyber-green/50 bg-cyber-green/10 backdrop-blur-md" 
                   style={{ transform: "translateZ(40px) rotate(45deg)", clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" }} />
            </motion.div>
          </div>
        </div>

        {/* Live Stream / AI feed */}
        <div className="col-span-1 glass-panel p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="flex justify-between items-center mb-6 relative z-10">
            <h3 className="text-sm font-bold uppercase tracking-widest opacity-40">
              Activity Feed
            </h3>
          </div>
          
          <div className="space-y-4 relative z-10">
            {RECENT_TRANSACTIONS.map((tx, idx) => (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                key={tx.id} 
                className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${tx.type === 'income' ? 'bg-cyber-green/10 text-cyber-green' : 'bg-red-500/10 text-red-400'}`}>
                    {tx.type === 'income' ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{tx.title}</p>
                    <p className="text-[10px] text-white/40">{tx.time}</p>
                  </div>
                </div>
                <div className={`font-semibold ${tx.type === 'income' ? 'text-cyber-green text-glow' : 'text-white'}`}>
                  {tx.amount}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[var(--color-brand-bg)] to-transparent pointer-events-none" />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <TiltCard intensity={10} className="neon-glow-violet overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-electric-violet opacity-5 blur-3xl group-hover:opacity-10 transition-opacity"></div>
          <div className="flex justify-between items-start mb-6 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-electric-violet/10 flex items-center justify-center">
              <Wallet size={20} className="text-electric-violet" />
            </div>
            <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-cyber-green/10 text-cyber-green">
              +14.5%
            </span>
          </div>
          <p className="text-xs uppercase tracking-widest opacity-40 mb-2 relative z-10">Umumiy Balans</p>
          <h2 className="text-3xl font-bold relative z-10">$124,500.00</h2>
        </TiltCard>

        <TiltCard intensity={10} className="overflow-hidden">
          <div className="flex justify-between items-start mb-6 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-cyber-green/10 flex items-center justify-center">
              <Zap size={20} className="text-cyber-green" />
            </div>
            <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-cyber-green/10 text-cyber-green">
              +8.2%
            </span>
          </div>
          <p className="text-xs uppercase tracking-widest opacity-40 mb-2 relative z-10">Kirim (Cyber Green)</p>
          <h2 className="text-3xl font-bold text-cyber-green relative z-10">$48,210.15</h2>
        </TiltCard>

        <TiltCard intensity={10} className="overflow-hidden">
          <div className="flex justify-between items-start mb-6 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
              <Activity size={20} className="text-red-400" />
            </div>
             <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-red-500/10 text-red-400">
              -2.1%
            </span>
          </div>
          <p className="text-xs uppercase tracking-widest opacity-40 mb-2 relative z-10">Chiqim</p>
          <h2 className="text-3xl font-bold text-red-400 relative z-10">$12,405.50</h2>
        </TiltCard>
      </div>

    </div>
  );
}
