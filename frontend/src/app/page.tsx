"use client"
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    // Note: Assuming backend runs on 5000
    axios.get('http://localhost:5000/api/stats').then(res => setStats(res.data)).catch(console.error);
  }, []);

  if (!stats) return <p>Yuklanmoqda...</p>;

  const isEmpty = stats.totalIncome === 0 && stats.totalExpense === 0;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Umumiy Malumotlar</h1>
      
      {isEmpty && (
        <div className="bg-blue-100 border border-blue-200 p-6 rounded-lg text-blue-900 shadow-sm animate-pulse">
          <h2 className="text-xl font-bold mb-2">Hali tranzaksiyalar yo'q. Botga birinchi xabarni yuboring!</h2>
          <p>Telegram botga kiring va "100 ming so'm ovqatlanishga sarfladim" deb yozing yoki ovozli xabar yuboring.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader><CardTitle>Jami Balans</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{stats.totalBalance.toLocaleString()} so'm</p></CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardHeader><CardTitle className="text-green-800">Oylik Kirim</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-green-600">+{stats.totalIncome.toLocaleString()} so'm</p></CardContent>
        </Card>
        <Card className="bg-red-50 border-red-200">
          <CardHeader><CardTitle className="text-red-800">Oylik Chiqim</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-red-600">-{stats.totalExpense.toLocaleString()} so'm</p></CardContent>
        </Card>
      </div>
    </div>
  );
}
