import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import QRCode from "react-qr-code";
import { Bot, Smartphone, CheckCircle, RefreshCcw, WifiHigh, ScanLine } from "lucide-react";

export default function SyncTab() {
  const [syncState, setSyncState] = useState<"waiting" | "scanning" | "connected" | "empty">("waiting");

  // Simple simulation of sync process for UI purposes
  useEffect(() => {
    if (syncState === "scanning") {
      const timer = setTimeout(() => setSyncState("connected"), 3000);
      return () => clearTimeout(timer);
    }
  }, [syncState]);

  return (
    <div className="w-full flex flex-col items-center justify-center min-h-[70vh]">
      
      {/* Dynamic Background Radar Simulation */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden object-cover opacity-30">
         <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 10, ease: "linear", repeat: Infinity }}
            className="w-[800px] h-[800px] border border-electric-violet/20 rounded-full flex items-center justify-center relative"
          >
            <div className="w-[600px] h-[600px] border border-electric-violet/20 rounded-full" />
            <div className="w-[400px] h-[400px] border border-electric-violet/20 rounded-full" />
            {/* Radar Sweep */}
            <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] border-r-2 border-t-2 border-electric-violet/40 rounded-tr-full origin-bottom-left" style={{ background: 'linear-gradient(45deg, transparent, rgba(139,92,246,0.1))'}} />
         </motion.div>
      </div>

      <div className="glass-panel p-10 rounded-[2.5rem] w-full max-w-xl relative z-10 overflow-hidden neon-glow-violet text-center flex flex-col items-center border-t-electric-violet/30">
        
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 relative">
          <Bot size={32} className={syncState === 'connected' ? 'text-cyber-green' : 'text-electric-violet'} />
          {syncState === 'connected' && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyber-green flex items-center justify-center">
              <CheckCircle size={10} className="text-black" />
            </span>
          )}
        </div>

        <h2 className="text-3xl font-bold mb-2 tracking-tight">Telegram Bot Sinxronizatsiyasi</h2>
        <p className="text-white/60 mb-10 max-w-md">
          Moliya tizimingizni avtomatlashtirish uchun botga ulaning. Kamera orqali QR kodni skanerlang.
        </p>

        <div className="relative mb-10">
          <AnimatePresence mode="wait">
            {syncState === "waiting" || syncState === "scanning" ? (
              <motion.div
                key="qr"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative p-6 bg-white rounded-3xl"
              >
                <QRCode 
                  value="https://t.me/vision_finance_bot?start=auth_12345" 
                  size={200}
                  bgColor="#ffffff"
                  fgColor="#050505"
                  level="Q"
                />
                
                {syncState === "scanning" && (
                  <motion.div 
                    initial={{ top: 0 }}
                    animate={{ top: "100%" }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    className="absolute left-0 right-0 h-1 bg-electric-violet shadow-[0_0_15px_rgba(139,92,246,0.8)] z-10"
                  />
                )}
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-[248px] h-[248px] bg-cyber-green/10 border border-cyber-green/30 rounded-3xl flex flex-col items-center justify-center text-cyber-green shadow-[0_0_30px_rgba(16,185,129,0.2)]"
              >
                <CheckCircle size={64} className="mb-4" />
                <h3 className="text-xl font-bold">Muvaffaqiyatli ulangan</h3>
                <p className="text-xs text-cyber-green/70 mt-2 text-center px-4">
                  Barcha ma'lumotlar real vaqtda yangilanib turadi
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex gap-4">
          {syncState === "waiting" && (
            <button 
              onClick={() => setSyncState("scanning")}
              className="bg-electric-violet text-white px-8 py-3 rounded-full font-semibold hover:bg-electric-violet/90 transition shadow-[0_0_15px_rgba(139,92,246,0.4)] flex items-center gap-2"
            >
              <ScanLine size={18} /> Skanerlashni boshlash
            </button>
          )}

          {syncState === "connected" && (
            <button 
              onClick={() => setSyncState("waiting")}
              className="bg-white/10 hover:bg-white/20 border border-white/10 text-white px-8 py-3 rounded-full font-semibold transition flex items-center gap-2"
            >
              <RefreshCcw size={18} /> Qayta ulanish
            </button>
          )}
        </div>

      </div>

      <div className="mt-12 flex gap-12 text-white/40">
        <div className="flex flex-col items-center gap-2">
          <Smartphone size={24} />
          <span className="text-xs">Telefoningizni tayyorlang</span>
        </div>
        <div className="h-full border-r border-white/10" />
        <div className="flex flex-col items-center gap-2">
          <ScanLine size={24} />
          <span className="text-xs">QR kodga qarating</span>
        </div>
        <div className="h-full border-r border-white/10" />
        <div className="flex flex-col items-center gap-2">
          <WifiHigh size={24} />
          <span className="text-xs">Live Sync yoqiladi</span>
        </div>
      </div>

    </div>
  );
}
