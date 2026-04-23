"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, BarChart3, Radio, Wallet, Bot, Bell, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { useLanguage } from "@/context/LanguageContext";
import { API_URL } from "@/config";

export default function RootLayoutContent({ children }: { children: React.ReactNode }) {
  const [isAuth, setIsAuth] = useState<boolean | null>(null);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const pathname = usePathname();
  const router = useRouter();
  const { t, lang, cycleLang } = useLanguage();

  useEffect(() => {
    const userId = localStorage.getItem("finance_userId");
    if (userId) {
      setIsAuth(true);
      
      // Fetch latest activities for notifications
      Promise.all([
        fetch(`${API_URL}/api/transactions?userId=${userId}`).then(res => res.json()),
        fetch(`${API_URL}/api/debts?userId=${userId}`).then(res => res.json())
      ]).then(([txs, dbts]) => {
         const all = [
            ...txs.map((tx: any) => ({ ...tx, _notifType: tx.type })),
            ...dbts.map((d: any) => ({ ...d, _notifType: 'debt' }))
         ].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
         setNotifications(all.slice(0, 4));
      }).catch(console.error);

    } else {
      fetch(`${API_URL}/api/init`)
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                localStorage.setItem("finance_userId", data.userId);
                localStorage.setItem("finance_userName", data.name);
                setIsAuth(true);
            } else {
                setIsAuth(false);
            }
        })
        .catch(() => setIsAuth(false));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("finance_userId");
    setIsAuth(false);
    router.push("/");
  };

  const NavItem = ({ path, icon: Icon, label }: { path: string, icon: any, label: string }) => {
    const isActive = pathname === path || (pathname.startsWith('/analytics') && path === '/analytics');
    
    return (
      <Link href={path} className="block w-full">
        <button
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative ${
            isActive ? "text-white" : "text-white/40 hover:text-white/80 hover:bg-white/5"
          }`}
        >
          <Icon size={20} className={isActive ? "text-electric-violet" : ""} />
          <span className="font-medium text-sm tracking-wide">{label}</span>
          {isActive && (
            <motion.div
              layoutId="nav-indicator"
              className="absolute inset-0 bg-white/5 border border-white/10 rounded-xl -z-10"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
        </button>
      </Link>
    );
  };

  if (isAuth === null) return <div className="flex h-screen bg-[#050505]" />;

  return (
    <div className="flex h-screen w-full p-6 gap-6 overflow-hidden relative box-border">
      {/* Animated Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-electric-violet/20 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[40%] bg-cyber-green/10 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />

      {/* Sidebar */}
      <nav className="w-64 glass-panel h-full flex flex-col p-6 z-30 shrink-0 relative">
        <div className="flex items-center gap-3 mb-10 px-2 mt-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-electric-violet to-purple-600 flex items-center justify-center neon-glow-violet">
            <Wallet size={18} className="text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">Fin<span className="font-light text-white/50">Flow</span></span>
        </div>

        <div className="space-y-2 flex-grow">
          <NavItem path="/" icon={LayoutDashboard} label={t("sidebar.dashboard")} />
          <NavItem path="/analytics" icon={BarChart3} label={t("sidebar.analytics")} />
          <NavItem path="/sync" icon={Radio} label={t("sidebar.sync")} />
        </div>

        <div className="flex flex-col gap-2 mt-auto">
            <div className="px-4 py-4 rounded-xl glass-panel relative overflow-hidden group cursor-pointer text-left">
              <div className="absolute inset-0 bg-gradient-to-r from-electric-violet/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center gap-3 relative z-10 w-full">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center pb-0.5">
                  <Bot size={16} className="text-electric-violet" />
                </div>
                <div>
                  <p className="text-xs font-semibold">{t("sidebar.active")}</p>
                  <p className="text-[10px] text-cyber-green flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyber-green animate-pulse"></span>
                    {t("sidebar.connected")}
                  </p>
                </div>
              </div>
            </div>
            
            <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-white/40 hover:text-red-400 hover:bg-white/5"
            >
                <LogOut size={20} />
                <span className="font-medium text-sm tracking-wide">{t("sidebar.logout")}</span>
            </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-y-auto h-full z-20 scroll-smooth flex flex-col gap-6">
        <header className="flex justify-between items-center pt-2 relative z-50">
          <h1 className="text-3xl font-bold tracking-tight">
            {pathname === '/' && <>{t("header.dashboard")} <span className="text-electric-violet">{t("header.dashboardSpan")}</span></>}
            {pathname === '/analytics' && <>{t("header.analytics")} <span className="text-electric-violet">{t("header.analyticsSpan")}</span></>}
            {pathname === '/sync' && <>{t("header.sync")} <span className="text-electric-violet">{t("header.syncSpan")}</span></>}
          </h1>
          <div className="flex items-center gap-4 relative">
            <div className="relative">
                <button 
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className={`w-10 h-10 rounded-full glass-panel flex items-center justify-center transition-colors relative ${isNotifOpen ? "bg-white/20" : "hover:bg-white/10"}`}
                >
                  <Bell size={18} className="text-white/70" />
                  {notifications.length > 0 && (
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-electric-violet animate-pulse border border-black"></span>
                  )}
                </button>
                
                {/* Notification Dropdown */}
                <AnimatePresence>
                  {isNotifOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 top-14 w-80 glass-panel border border-[#8B5CF6]/30 shadow-2xl rounded-2xl p-4 overflow-hidden"
                    >
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-white/60 mb-4">{t("header.notifications")}</h4>
                      <div className="space-y-3">
                        {notifications.length === 0 ? (
                           <p className="text-sm text-white/40 text-center py-2">{t("header.noNotifications")}</p>
                        ) : notifications.map((n, idx) => (
                           <div key={idx} className="flex items-center gap-3 p-2 rounded-lg bg-white/5 border border-white/5">
                              <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${n._notifType==='income' ? 'bg-[#10B981]/20 text-[#10B981]' : n._notifType==='expense' ? 'bg-[#EF4444]/20 text-[#EF4444]' : 'bg-[#3B82F6]/20 text-[#3B82F6]'}`}>
                                <Bell size={12} />
                              </div>
                              <div className="flex-1 truncate">
                                <p className="text-xs font-medium text-white truncate">{n.comment || n.personName || "Yangi hodisa"}</p>
                                <p className="text-[10px] text-white/40">{new Date(n.date).toLocaleString()}</p>
                              </div>
                              <span className="text-xs font-bold text-white shrink-0">{n.amount.toLocaleString()} UZS</span>
                           </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
            </div>
            
            <button 
               onClick={cycleLang}
               className="h-10 w-10 cursor-pointer rounded-full bg-gradient-to-tr from-white/20 to-white/5 border border-white/10 p-[1px] hover:scale-105 transition-transform"
            >
              <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                <span className="text-sm font-medium uppercase">{lang}</span>
              </div>
            </button>
          </div>
        </header>
        
        <div className="w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
