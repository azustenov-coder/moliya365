"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, Wallet, Activity, Zap, X, Users, CreditCard } from "lucide-react";
import { TiltCard } from "@/components/ui/TiltCard";
import { useLanguage } from "@/context/LanguageContext";
import { API_URL } from "@/config";

export default function OverviewTab() {
  const [stats, setStats] = useState({ totalIncome: 0, totalExpense: 0, totalBalance: 0 });
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [authCode, setAuthCode] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState("");

  const [debts, setDebts] = useState({ berilgan: 0, olingan: 0 });
  const [debtList, setDebtList] = useState<any[]>([]);
  const { t } = useLanguage();

  const checkAuth = () => {
    const userId = localStorage.getItem("finance_userId");
    if (userId) {
      setIsLoggedIn(true);
      fetchData(userId);
    }
  };

  const fetchData = (userId: string) => {
    fetch(`${API_URL}/api/stats?userId=${userId}`)
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(console.error);

    fetch(`${API_URL}/api/transactions?userId=${userId}`)
      .then(res => res.json())
      .then(data => {
          const sorted = data.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setTransactions(sorted.slice(0, 5));
      })
      .catch(console.error);

    fetch(`${API_URL}/api/debts/summary?userId=${userId}`)
      .then(res => res.json())
      .then(data => setDebts(data))
      .catch(console.error);
      
    fetch(`${API_URL}/api/debts?userId=${userId}`)
      .then(res => res.json())
      .then(data => {
          setDebtList(data.filter((d: any) => d.status !== 'paid').slice(0, 3));
      })
      .catch(console.error);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authCode.length < 6) return;
    
    try {
      const res = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: authCode })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("finance_userId", data.userId);
        setIsLoggedIn(true);
        fetchData(data.userId);
      } else {
        setError(data.message || "Xato!");
      }
    } catch (err) {
      setError("Server bilan ulanishda xato");
    }
  };

  const formatMoney = (amount: number, type?: 'income' | 'expense' | 'neutral') => {
    const sign = type === 'income' ? '+' : type === 'expense' ? '-' : '';
    return `${sign}${Math.abs(amount).toLocaleString()} UZS`;
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel p-10 w-full max-w-md text-center border-[#8B5CF6]/30"
        >
          <div className="w-16 h-16 bg-[#8B5CF6]/20 rounded-2xl flex items-center justify-center mx-auto mb-6 neon-glow-violet">
            <Wallet className="text-[#8B5CF6]" size={30} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">FinFlow Admin Panel</h1>
          <p className="text-white/50 text-sm mb-8">Botdan olgan 6 xonali kodingizni kiriting</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
             <input 
               type="text" 
               placeholder="123456" 
               maxLength={6}
               value={authCode}
               onChange={(e) => setAuthCode(e.target.value)}
               className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-center text-3xl font-mono tracking-[10px] text-white outline-none focus:border-[#8B5CF6]/50 transition-colors"
             />
             {error && <p className="text-red-400 text-sm">{error}</p>}
             <button 
               type="submit"
               className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-white/90 transition transform active:scale-95"
             >
                Kirish
             </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 w-full relative">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="col-span-1 lg:col-span-2 glass-panel p-8 min-h-[300px] flex px-10 items-center justify-between relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-[#8B5CF6]/5 hover:from-[#8B5CF6]/10 to-transparent transition-colors z-0" />
          
          <div className="relative z-10 w-1/2">
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-4xl md:text-5xl font-bold tracking-tight mb-4 leading-tight text-white"
            >
              {t("dashboard.heroTitle")} <br/><span className="text-gradient-violet">{t("dashboard.heroSpan")}</span>
            </motion.h1>
            <p className="text-white/60 text-lg mb-8 max-w-sm">
              {t("dashboard.greeting")}
            </p>
            <button 
              onClick={() => setIsReportOpen(true)}
              className="bg-white text-black px-6 py-3 rounded-full font-semibold hover:bg-white/90 transition transform hover:scale-105 active:scale-95 flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
            >
              {t("dashboard.fullReportBtn")} <ArrowUpRight size={18} />
            </button>
          </div>

          <div className="relative z-10 w-1/2 flex justify-center items-center h-full">
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
              <div className="absolute inset-0 bg-[#8B5CF6]/40 blur-[50px] animate-pulse-slow rounded-full" />
              <div className="absolute inset-0 border border-[#8B5CF6]/50 rounded-2xl bg-gradient-to-br from-[#8B5CF6]/20 to-[#10B981]/20 backdrop-blur-sm" 
                   style={{ transform: "translateZ(20px)", clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }} />
              <div className="absolute inset-4 border border-[#10B981]/50 bg-[#10B981]/10 backdrop-blur-md" 
                   style={{ transform: "translateZ(40px) rotate(45deg)", clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" }} />
            </motion.div>
          </div>
        </div>

        <div className="col-span-1 flex flex-col gap-6">
          
          {debtList.length > 0 && (
            <div className="glass-panel p-6 relative overflow-hidden">
              <div className="flex justify-between items-center mb-4 relative z-10">
                <h3 className="text-sm font-bold uppercase tracking-widest text-[#3B82F6]/60 flex items-center gap-2">
                  <Users size={14} /> {t("dashboard.debtsTitle")}
                </h3>
              </div>
              <div className="space-y-3 relative z-10">
                {debtList.map((d: any, idx) => (
                  <div key={d.id || idx} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex justify-center items-center font-bold text-xs ${d.type === 'from_me' ? 'bg-[#3B82F6]/20 text-[#3B82F6]' : 'bg-[#F97316]/20 text-[#F97316]'}`}>
                        {d.personName ? d.personName.charAt(0).toUpperCase() : '?'}
                      </div>
                      <div className="truncate max-w-[100px]">
                        <p className="text-xs font-semibold text-white truncate">{d.personName}</p>
                        <p className="text-[10px] text-white/40">{d.type === 'from_me' ? t("dashboard.debtGiven") : t("dashboard.debtTaken")}</p>
                      </div>
                    </div>
                    <div className={`font-semibold shrink-0 text-sm ${d.type === 'from_me' ? 'text-[#3B82F6]' : 'text-[#F97316]'}`}>
                      {formatMoney(d.amount, 'neutral')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="glass-panel p-6 flex flex-col justify-between relative overflow-hidden flex-1 min-h-[300px]">
            <div className="flex justify-between items-center mb-6 relative z-10">
              <h3 className="text-sm font-bold uppercase tracking-widest text-white/40 flex items-center gap-2">
                <Activity size={14} /> {t("dashboard.activityFeed")}
              </h3>
            </div>
          
          <div className="space-y-4 relative z-10 overflow-y-auto max-h-[220px] pr-2">
            {transactions.length === 0 ? (
                <p className="text-white/40 text-sm text-center py-4">{t("dashboard.noData")}</p>
            ) : transactions.map((tx, idx) => (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                key={tx.id || idx} 
                className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className={`p-2 rounded-lg shrink-0 ${tx.type === 'income' ? 'bg-[#10B981]/10 text-[#10B981]' : 'bg-[#EF4444]/10 text-[#EF4444]'}`}>
                    {tx.type === 'income' ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />}
                  </div>
                  <div className="truncate">
                    <p className="text-sm font-medium text-white truncate">{tx.comment || tx.category?.name || "Xarajat"}</p>
                    <p className="text-[10px] text-white/40 flex items-center gap-1">
                      <span className="text-[#8B5CF6] font-bold">{tx.user?.name || "System"}</span>
                      {tx.user?.job_title && <span className="text-white/20">({tx.user.job_title})</span>}
                      <span className="mx-1">•</span>
                      {new Date(tx.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                </div>
                <div className={`font-semibold shrink-0 text-sm ${tx.type === 'income' ? 'text-[#10B981] text-glow' : 'text-white'}`}>
                  {formatMoney(tx.amount, tx.type)}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[var(--color-brand-bg)] to-transparent pointer-events-none" />
        </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <TiltCard intensity={10} className="neon-glow-violet overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#8B5CF6] opacity-5 blur-3xl group-hover:opacity-10 transition-opacity"></div>
          <div className="flex justify-between items-start mb-6 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/10 flex items-center justify-center">
              <Wallet size={20} className="text-[#8B5CF6]" />
            </div>
            <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-[#10B981]/10 text-[#10B981]">
              {t("dashboard.overviewRight")}: {t("dashboard.statusActive")}
            </span>
          </div>
          <p className="text-xs uppercase tracking-widest text-[#ffffff]/40 mb-2 relative z-10">{t("dashboard.mainBalance")}</p>
          <h2 className="text-3xl font-bold relative z-10 text-white">{formatMoney(stats.totalBalance, 'neutral')}</h2>
        </TiltCard>

        <TiltCard intensity={10} className="overflow-hidden">
          <div className="flex justify-between items-start mb-6 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-[#10B981]/10 flex items-center justify-center">
              <Zap size={20} className="text-[#10B981]" />
            </div>
          </div>
          <p className="text-xs uppercase tracking-widest text-[#ffffff]/40 mb-2 relative z-10">{t("dashboard.income")}</p>
          <h2 className="text-3xl font-bold text-[#10B981] relative z-10">{formatMoney(stats.totalIncome, 'income')}</h2>
        </TiltCard>

        <TiltCard intensity={10} className="overflow-hidden">
          <div className="flex justify-between items-start mb-6 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-[#EF4444]/10 flex items-center justify-center">
              <Activity size={20} className="text-[#EF4444]" />
            </div>
          </div>
          <p className="text-xs uppercase tracking-widest text-[#ffffff]/40 mb-2 relative z-10">{t("dashboard.expense")}</p>
          <h2 className="text-3xl font-bold text-[#EF4444] relative z-10">{formatMoney(stats.totalExpense, 'expense')}</h2>
        </TiltCard>
      </div>

      <AnimatePresence>
        {isReportOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
            onClick={() => setIsReportOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-3xl glass-panel relative overflow-hidden border border-[#8B5CF6]/30 shadow-[0_0_80px_rgba(139,92,246,0.15)] flex flex-col p-8"
            >
              <div className="absolute top-[-20%] left-[-10%] w-[300px] h-[300px] bg-[#8B5CF6]/20 blur-[100px] rounded-full pointer-events-none" />
              <div className="absolute bottom-[-20%] right-[-10%] w-[300px] h-[300px] bg-[#10B981]/10 blur-[100px] rounded-full pointer-events-none" />

              <div className="flex justify-between items-center mb-8 relative z-10">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight mb-1 text-white flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#8B5CF6]/20 flex justify-center items-center neon-glow-violet">
                        <Wallet size={16} className="text-[#8B5CF6]" />
                    </div>
                    {t("dashboard.modalTitle")}
                  </h2>
                  <p className="text-white/50 text-sm">{t("dashboard.modalSubtitle")}</p>
                </div>
                <button 
                  onClick={() => setIsReportOpen(false)}
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-red-500/20 hover:text-red-400 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex flex-col gap-4 relative z-10">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 rounded-[20px] bg-gradient-to-br from-[#10B981]/10 to-transparent border border-[#10B981]/20">
                     <div className="flex justify-between items-start mb-2">
                         <span className="text-white/60 text-xs tracking-wider uppercase font-medium">{t("dashboard.modalIncome")}</span>
                         <ArrowDownRight className="text-[#10B981]" size={18} />
                     </div>
                     <span className="text-2xl font-bold text-[#10B981]">{formatMoney(stats.totalIncome, 'income')}</span>
                  </div>
                  <div className="p-5 rounded-[20px] bg-gradient-to-br from-[#EF4444]/10 to-transparent border border-[#EF4444]/20">
                     <div className="flex justify-between items-start mb-2">
                         <span className="text-white/60 text-xs tracking-wider uppercase font-medium">{t("dashboard.modalExpense")}</span>
                         <ArrowUpRight className="text-[#EF4444]" size={18} />
                     </div>
                     <span className="text-2xl font-bold text-[#EF4444]">{formatMoney(stats.totalExpense, 'expense')}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 rounded-[20px] bg-white/5 border border-white/10 hover:border-[#3B82F6]/30 transition-colors group">
                     <div className="flex justify-between items-start mb-2">
                         <span className="text-white/60 text-xs tracking-wider uppercase font-medium group-hover:text-white transition-colors">{t("dashboard.modalDebtGiven")}</span>
                         <Users className="text-[#3B82F6]" size={18} />
                     </div>
                     <span className="text-2xl font-bold text-white/90">{formatMoney(debts.berilgan, 'neutral')}</span>
                     <p className="text-[11px] text-[#3B82F6] mt-2 bg-[#3B82F6]/10 py-1 px-2 rounded-md inline-block">{t("dashboard.modalDebtGivenSub")}</p>
                  </div>
                  <div className="p-5 rounded-[20px] bg-white/5 border border-white/10 hover:border-[#F97316]/30 transition-colors group">
                     <div className="flex justify-between items-start mb-2">
                         <span className="text-white/60 text-xs tracking-wider uppercase font-medium group-hover:text-white transition-colors">{t("dashboard.modalDebtTaken")}</span>
                         <CreditCard className="text-[#F97316]" size={18} />
                     </div>
                     <span className="text-2xl font-bold text-white/90">{formatMoney(debts.olingan, 'neutral')}</span>
                     <p className="text-[11px] text-[#F97316] mt-2 bg-[#F97316]/10 py-1 px-2 rounded-md inline-block">{t("dashboard.modalDebtTakenSub")}</p>
                  </div>
                </div>

                <div className="p-6 rounded-[20px] bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 neon-glow-violet relative overflow-hidden mt-2">
                     <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Wallet size={80} />
                     </div>
                     <span className="text-white/80 text-sm tracking-widest uppercase font-bold relative z-10 flex items-center gap-2">
                         {t("dashboard.modalNetBalance")} <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
                     </span>
                     <h3 className="text-4xl font-bold text-white mt-1 relative z-10">{formatMoney(stats.totalBalance, 'neutral')}</h3>
                     <p className="text-xs text-white/50 mt-2 relative z-10">{t("dashboard.modalNetBalanceSub")}</p>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end gap-3 relative z-10 pt-4 border-t border-white/10">
                  <button onClick={() => setIsReportOpen(false)} className="px-6 py-2.5 rounded-xl border border-white/10 text-white/70 font-medium hover:bg-white/5 hover:text-white transition-colors">Yopish</button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
