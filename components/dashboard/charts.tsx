"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import { ChartCard } from "@/components/ui/chart-card";

const pieColors = ["#0f172a", "#2563eb", "#94a3b8", "#e2e8f0"];

export function RevenueChart({
  data,
}: {
  data: Array<{ month: string; revenue: number }>;
}) {
  return (
    <ChartCard title="Monthly revenue" description="Collections recorded across finance entries.">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="month" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} />
          <Tooltip />
          <Bar dataKey="revenue" fill="#0f172a" radius={[10, 10, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function DealsStageChart({
  data,
}: {
  data: Array<{ name: string; value: number }>;
}) {
  return (
    <ChartCard title="Deals by stage" description="Distribution of your current sales pipeline.">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            innerRadius={56}
            outerRadius={96}
            paddingAngle={4}
            dataKey="value"
            nameKey="name"
          >
            {data.map((item, index) => (
              <Cell key={item.name} fill={pieColors[index % pieColors.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function HelpersTrendChart({
  data,
}: {
  data: Array<{ month: string; helpers: number }>;
}) {
  return (
    <ChartCard title="Helpers added" description="Growth of your helper inventory over time.">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="month" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="helpers"
            stroke="#2563eb"
            strokeWidth={3}
            dot={{ fill: "#0f172a", r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
