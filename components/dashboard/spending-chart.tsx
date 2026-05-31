"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

interface Props {
  data: { month: string; amount: number }[];
}

export function SpendingChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis
          dataKey="month"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: "#94a3b8" }}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
          width={45}
        />
        <Tooltip
          formatter={(v) => [formatCurrency(Number(v)), "Spent"]}
          contentStyle={{
            border: "none", borderRadius: "10px", boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
            fontSize: "13px",
          }}
          cursor={{ fill: "#f1f5f9" }}
        />
        <Bar dataKey="amount" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={40} />
      </BarChart>
    </ResponsiveContainer>
  );
}
