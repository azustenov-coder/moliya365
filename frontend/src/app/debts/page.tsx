"use client"
import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from "@/config";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from 'date-fns'

export default function DebtsPage() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    axios.get(`${API_URL}/api/debts`).then(res => setData(res.data)).catch(console.error);
  }, []);

  return (
    <div className="space-y-6 bg-white p-6 rounded-lg border shadow-sm">
      <h1 className="text-2xl font-bold">Qarzlar Daftari (Nasiyalar)</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Sana</TableHead>
            <TableHead>Tur</TableHead>
            <TableHead>Shaxs</TableHead>
            <TableHead>Holat</TableHead>
            <TableHead className="text-right">Summa</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((debt) => (
            <TableRow key={debt.id}>
              <TableCell>{format(new Date(debt.date), 'dd.MM.yyyy HH:mm')}</TableCell>
              <TableCell>
                {debt.type === 'from_me' ? 
                  <Badge variant="outline" className="text-orange-600 border-orange-200">Nasiya berildi (Bizdan)</Badge> : 
                  <Badge variant="outline" className="text-purple-600 border-purple-200">Qarz olindi (Bizga)</Badge>
                }
              </TableCell>
              <TableCell className="font-medium">{debt.personName}</TableCell>
              <TableCell>
                {debt.status === 'pending' ?
                  <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Kutilmoqda</Badge> :
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Yopildi</Badge>
                }
              </TableCell>
              <TableCell className="text-right font-semibold">
                {debt.amount.toLocaleString()} so'm
              </TableCell>
            </TableRow>
          ))}
          {data.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-gray-500 py-6">
                Qarzlar ro'yxati bo'sh.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
