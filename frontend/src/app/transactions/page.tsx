"use client"
import { useEffect, useState } from 'react';
import axios from 'axios';
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

export default function TransactionsPage() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/transactions').then(res => setData(res.data)).catch(console.error);
  }, []);

  return (
    <div className="space-y-6 bg-white p-6 rounded-lg border shadow-sm">
      <h1 className="text-2xl font-bold">Tranzaksiyalar Tarixi</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Sana</TableHead>
            <TableHead>Tur</TableHead>
            <TableHead>Kategoriya</TableHead>
            <TableHead>Izoh</TableHead>
            <TableHead className="text-right">Summa</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((tx) => (
            <TableRow key={tx.id}>
              <TableCell>{format(new Date(tx.date), 'dd.MM.yyyy HH:mm')}</TableCell>
              <TableCell>
                {tx.type === 'income' ? 
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Kirim</Badge> : 
                  <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Chiqim</Badge>
                }
              </TableCell>
              <TableCell>{tx.category?.name || "Noma'lum"}</TableCell>
              <TableCell>{tx.comment || "-"}</TableCell>
              <TableCell className="text-right font-semibold">
                {tx.amount.toLocaleString()} so'm
              </TableCell>
            </TableRow>
          ))}
          {data.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-gray-500 py-6">
                Tranzaksiyalar topilmadi.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
