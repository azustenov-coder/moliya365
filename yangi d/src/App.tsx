import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { LayoutDashboard, BarChart3, Radio, Wallet, ScanLine, Bot, Bell } from "lucide-react";
import OverviewTab from "./components/dashboard/OverviewTab";
import AnalyticsTab from "./components/dashboard/AnalyticsTab";
import SyncTab from "./components/dashboard/SyncTab";

export type TabType = "overview" | "analytics" | "sync";

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  const NavItem = ({ id, icon: Icon, label }: { id: TabType, icon: any, label: string }) => {
    const isActive = activeTab === id;
    return (
      <button
        onClick={() => setActiveTab(id)}
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
    );
  };

  return (
    <div className="flex h-screen w-full p-6 gap-6 overflow-hidden relative box-border">
      {/* Animated Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-electric-violet/20 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[40%] bg-cyber-green/10 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />

      {/* Sidebar */}
      <nav className="w-64 glass-panel h-full flex flex-col p-6 z-20 shrink-0">
        <div className="flex items-center gap-3 mb-10 px-2 mt-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-electric-violet to-purple-600 flex items-center justify-center neon-glow-violet">
            <Wallet size={18} className="text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">Vision<span className="font-light text-white/50">Finance</span></span>
        </div>

        <div className="space-y-2 flex-grow">
          <NavItem id="overview" icon={LayoutDashboard} label="Boshqaruv Paneli" />
          <NavItem id="analytics" icon={BarChart3} label="Tahlil va Gemini AI" />
          <NavItem id="sync" icon={Radio} label="Bot Sinxronizatsiyasi" />
        </div>

        <div className="mt-auto px-4 py-4 rounded-xl glass-panel relative overflow-hidden group cursor-pointer">
          <div className="absolute inset-0 bg-gradient-to-r from-electric-violet/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center pb-0.5">
              <Bot size={16} className="text-electric-violet" />
            </div>
            <div>
              <p className="text-xs font-semibold">VisionBot Active</p>
              <p className="text-[10px] text-cyber-green flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyber-green animate-pulse"></span>
                Ulanish o'rnatilgan
              </p>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-y-auto h-full z-10 scroll-smooth flex flex-col gap-6">
        <header className="flex justify-between items-center pt-2">
          <h1 className="text-3xl font-bold tracking-tight">
            {activeTab === 'overview' && <>Moliyaviy <span className="text-electric-violet">Intellekt</span></>}
            {activeTab === 'analytics' && <>Chuqur <span className="text-electric-violet">Tahlil</span></>}
            {activeTab === 'sync' && <>Platforma <span className="text-electric-violet">bilan bog'lanish</span></>}
          </h1>
          <div className="flex items-center gap-4">
            <button className="w-10 h-10 rounded-full glass-panel flex items-center justify-center hover:bg-white/10 transition-colors relative">
              <Bell size={18} className="text-white/70" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-electric-violet animate-pulse border border-black"></span>
            </button>
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-white/20 to-white/5 border border-white/10 p-[1px]">
              <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                <span className="text-sm font-medium">Uz</span>
              </div>
            </div>
          </div>
        </header>
        
        <div className="w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              {activeTab === "overview" && <OverviewTab />}
              {activeTab === "analytics" && <AnalyticsTab />}
              {activeTab === "sync" && <SyncTab />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
