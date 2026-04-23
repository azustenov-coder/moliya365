"use client"
import { useEffect, useState } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28CF8', '#F87171'];

export default function AnalyticsPage() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/transactions').then(res => {
      // Group expenses by category
      const expenses = res.data.filter((t: any) => t.type === 'expense');
      
      const categoryMap = expenses.reduce((acc: any, tx: any) => {
        const catName = tx.category?.name || "Noma'lum";
        acc[catName] = (acc[catName] || 0) + tx.amount;
        return acc;
      }, {});

      const chartData = Object.keys(categoryMap).map(key => ({
        name: key,
        value: categoryMap[key]
      }));

      setData(chartData);
    }).catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Analitika (Xarajatlar tarkibi)</h1>
      <div className="bg-white p-6 rounded-lg border shadow-sm h-96">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={120}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                nameKey="name"
                label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `${value.toLocaleString()} so'm`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-gray-500 text-lg">
            Malumot yetarli emas. Kamida 1 ta chiqim qo'shing.
          </div>
        )}
      </div>
    </div>
  );
}
