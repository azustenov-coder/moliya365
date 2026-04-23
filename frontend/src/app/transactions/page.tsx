"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from "@/config";
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { History, ArrowUpCircle, ArrowDownCircle, Search, Filter } from 'lucide-react';
import { useLanguage } from "@/context/LanguageContext";

export default function TransactionsPage() {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    const userId = localStorage.getItem("finance_userId");
    if (userId) {
      axios.get(`${API_URL}/api/transactions?userId=${userId}`)
        .then(res => setData(res.data))
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, []);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold flex items-center gap-3">
          <div className="p-2 rounded-lg bg-electric-violet/20">
            <History className="text-electric-violet" size={24} />
          </div>
          Tranzaksiyalar Tarixi
        </h2>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
            <input 
              type="text" 
              placeholder="Qidirish..." 
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:border-electric-violet/50 transition-colors"
            />
          </div>
          <button className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
            <Filter size={20} className="text-white/60" />
          </button>
        </div>
      </div>

      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-white/40">Sana</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-white/40">Tur</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-white/40">Kategoriya</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-white/40">Kim tomondan</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-white/40">Izoh</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-white/40 text-right">Summa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-6 py-6"><div className="h-4 bg-white/5 rounded w-full"></div></td>
                  </tr>
                ))
              ) : data.map((tx, idx) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={tx.id} 
                  className="hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-6 py-4 text-sm text-white/60">
                    {format(new Date(tx.date), 'dd.MM.yyyy HH:mm')}
                  </td>
                  <td className="px-6 py-4">
                    {tx.type === 'income' ? (
                      <span className="flex items-center gap-1.5 text-xs font-medium text-cyber-green px-2.5 py-1 rounded-full bg-cyber-green/10 border border-cyber-green/20">
                        <ArrowUpCircle size={12} /> Kirim
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs font-medium text-red-400 px-2.5 py-1 rounded-full bg-red-400/10 border border-red-400/20">
                        <ArrowDownCircle size={12} /> Chiqim
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    {tx.category?.name || t("dashboard.other")}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-electric-violet/20 flex items-center justify-center text-[10px] font-bold text-electric-violet">
                        {tx.user?.name?.charAt(0) || 'U'}
                      </div>
                      <span className="text-sm text-white/80">{tx.user?.name || 'Sistema'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-white/40 italic">
                    {tx.comment || "-"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`text-sm font-bold ${tx.type === 'income' ? 'text-cyber-green' : 'text-white'}`}>
                      {tx.type === 'income' ? '+' : '-'}{tx.amount.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-white/20 ml-1">UZS</span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {data.length === 0 && !isLoading && (
          <div className="py-20 text-center">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
              <History className="text-white/20" size={32} />
            </div>
            <p className="text-white/40 text-sm">Hozircha hech qanday tranzaksiya mavjud emas.</p>
          </div>
        )}
      </div>
    </div>
  );
}
