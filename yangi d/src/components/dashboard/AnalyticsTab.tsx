import { motion } from "motion/react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Sparkles, Brain, TrendingUp } from "lucide-react";

const AREA_DATA = [
  { name: 'Yan', daromad: 24000, xarajat: 14000 },
  { name: 'Fev', daromad: 32000, xarajat: 18000 },
  { name: 'Mar', daromad: 45000, xarajat: 12000 },
  { name: 'Apr', daromad: 38000, xarajat: 22000 },
  { name: 'May', daromad: 65000, xarajat: 28000 },
  { name: 'Iyn', daromad: 72000, xarajat: 24000 },
  { name: 'Iyl', daromad: 84000, xarajat: 29000 },
];

const PIE_DATA = [
  { name: 'Logistika', value: 400 },
  { name: 'Soliqlar', value: 300 },
  { name: 'Marketing', value: 300 },
  { name: 'Oyliklar', value: 200 },
];
const COLORS = ['#8B5CF6', '#10B981', '#3B82F6', '#F43F5E'];

export default function AnalyticsTab() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
      
      {/* Charts Column */}
      <div className="lg:col-span-2 space-y-8">
        
        {/* Main Area Chart */}
        <div className="glass-panel p-6 relative">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <TrendingUp className="text-electric-violet" size={20} />
              Pul Oqimi Dinamikasi
            </h3>
            <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm outline-none text-white focus:border-electric-violet/50 transition-colors">
              <option>Oxirgi 7 oy</option>
              <option>Oxirgi yil</option>
            </select>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={AREA_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDaromad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorXarajat" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} dy={10} />
                <YAxis stroke="rgba(255,255,255,0.3)" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} tickFormatter={(val) => `$${val/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#050505', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ fontSize: '14px', fontWeight: 500 }}
                />
                <Area type="monotone" dataKey="daromad" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorDaromad)" activeDot={{ r: 6, fill: '#10B981', stroke: '#050505', strokeWidth: 2 }} />
                <Area type="monotone" dataKey="xarajat" stroke="#8B5CF6" strokeWidth={3} fillOpacity={1} fill="url(#colorXarajat)" activeDot={{ r: 6, fill: '#8B5CF6', stroke: '#050505', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom charts row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass-panel p-6 relative">
             <h3 className="font-semibold mb-6">Xarajatlar Iyerarxiyasi</h3>
             <div className="h-[200px] flex justify-center items-center relative">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={PIE_DATA}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {PIE_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#050505', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col">
                  <span className="text-white/40 text-xs text-center">Jami</span>
                  <span className="font-semibold">$1,200</span>
                </div>
             </div>
          </div>
          
          <div className="glass-panel p-6 flex flex-col justify-center">
            <h3 className="font-semibold mb-4">Moliyaviy Salomatlik</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-white/60">Foyda Marjasi</span>
                  <span className="text-cyber-green">42%</span>
                </div>
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                  <div className="bg-cyber-green h-full rounded-full" style={{ width: '42%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-white/60">Liksidlig ko'rsatkichi</span>
                  <span className="text-electric-violet">2.4</span>
                </div>
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                  <div className="bg-electric-violet h-full rounded-full" style={{ width: '60%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-white/60">Qarz yuklamasi</span>
                  <span className="text-red-400">Past</span>
                </div>
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                  <div className="bg-red-400 h-full rounded-full" style={{ width: '15%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Gemini AI Side Column */}
      <div className="lg:col-span-1">
        <motion.div 
          className="h-full sticky top-6 flex flex-col gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-electric-violet to-purple-400 flex items-center justify-center animate-pulse-slow shadow-[0_0_15px_rgba(139,92,246,0.5)]">
              <Sparkles size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg font-mono">Gemini AI Insight</h3>
              <p className="text-xs text-electric-violet flex items-center gap-1">
                <Brain size={12} /> Real-time Tahlil
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="glass-panel p-5 border-l-4 border-l-electric-violet bg-electric-violet/5 rounded-r-[24px] rounded-l-none border-t-0 border-r-0 border-b-0 text-sm leading-relaxed hover:bg-electric-violet/10 transition-colors cursor-default relative overflow-hidden text-white/80">
              <strong className="flex items-center gap-2 mb-3 text-xs uppercase tracking-widest text-white mt-1">
                <div className="w-6 h-6 bg-electric-violet rounded-full flex items-center justify-center text-[10px] font-bold">G</div>
                Gemini Insight
              </strong>
              Joriy oyda <span className="text-electric-violet font-bold opacity-100">Logistikaga sarf 15% oshdi</span>. Bu yoqilg'i narxi bilan bog'liq bo'lishi mumkin. <span className="text-electric-violet font-bold opacity-100">Optimallashtirish</span> tavsiya etiladi.
            </div>

            <div className="glass-panel p-5 border-l-4 border-l-cyber-green bg-cyber-green/5 rounded-r-[24px] rounded-l-none border-t-0 border-r-0 border-b-0 text-sm leading-relaxed hover:bg-cyber-green/10 transition-colors cursor-default relative overflow-hidden text-white/80">
              <strong className="flex items-center gap-2 mb-3 text-xs uppercase tracking-widest text-white mt-1">
                 <div className="w-6 h-6 bg-cyber-green rounded-full flex items-center justify-center text-[10px] font-bold text-black">P</div>
                 Ijobiy O'sish
              </strong>
              Marketing ROI <span className="text-cyber-green font-bold opacity-100">22% ga yaxshilandi</span>. Oxirgi reklama kampaniyangiz juda samarali ishlamoqda.
            </div>

            <div className="glass-panel p-5 border-l-4 border-l-blue-500 bg-blue-500/5 rounded-r-[24px] rounded-l-none border-t-0 border-r-0 border-b-0 text-sm leading-relaxed hover:bg-blue-500/10 transition-colors cursor-default relative overflow-hidden text-white/80">
               <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 blur-[20px] rounded-full pointer-events-none" />
              <strong className="flex items-center gap-2 mb-3 text-xs uppercase tracking-widest text-white mt-1">
                 <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-[10px] font-bold">S</div>
                 Smart Maslahat
              </strong>
               Bo'sh turgan $24,000 mablag'ni qisqa muddatli depozitga yo'naltirish orqali qo'shimcha daromad olishingiz mumkin.
            </div>
          </div>

          <button className="w-full mt-6 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors font-medium text-sm flex items-center justify-center gap-2">
            AI Tahlilni Yangilash
          </button>

        </motion.div>
      </div>

    </div>
  );
}
