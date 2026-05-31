"use client";

import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

interface Fund {
  id: string; name: string; color: string; total: number;
}

interface Props { funds: Fund[] }

export function FundBreakdown({ funds }: Props) {
  const data = funds.filter((f) => f.total > 0);

  if (data.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center text-sm text-gray-400">
        No expenses yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={80}
          paddingAngle={3}
          dataKey="total"
          nameKey="name"
        >
          {data.map((f) => (
            <Cell key={f.id} fill={f.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(v) => [formatCurrency(Number(v)), "Spent"]}
          contentStyle={{
            border: "none", borderRadius: "10px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.10)", fontSize: "13px",
          }}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value) => (
            <span style={{ fontSize: "12px", color: "#64748b" }}>{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
