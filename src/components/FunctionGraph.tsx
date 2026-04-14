'use client';

import { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import { Expr, isComplete } from '@/lib/expr';
import { generatePlotData } from '@/lib/identify';
import { useLang } from '@/lib/i18n';

type Props = {
  slot: import('@/lib/expr').Slot;
};

const parseOrFallback = (s: string, fallback: number) => {
  const v = parseFloat(s);
  return isNaN(v) ? fallback : v;
};

export function FunctionGraph({ slot }: Props) {
  const [xMinStr, setXMinStr] = useState('-1');
  const [xMaxStr, setXMaxStr] = useState('1');
  const t = useLang();

  const xMin = parseOrFallback(xMinStr, -3);
  const xMax = parseOrFallback(xMaxStr, 3);

  const data = useMemo(() => {
    if (!isComplete(slot)) return [];
    return generatePlotData(slot as Expr, xMin, xMax, 300);
  }, [slot, xMin, xMax]);

  if (!isComplete(slot)) {
    return (
      <div className="text-sm text-gray-400">
        {t.graphEmpty}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <label className="flex items-center gap-1.5">
          {t.xMin}
          <input
            type="number"
            value={xMinStr}
            step="0.5"
            onChange={(e) => setXMinStr(e.target.value)}
            className="border border-gray-200 rounded px-1.5 py-0.5 w-16 font-mono text-sm"
          />
        </label>
        <label className="flex items-center gap-1.5">
          {t.xMax}
          <input
            type="number"
            value={xMaxStr}
            step="0.5"
            onChange={(e) => setXMaxStr(e.target.value)}
            className="border border-gray-200 rounded px-1.5 py-0.5 w-16 font-mono text-sm"
          />
        </label>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 8, right: 20, bottom: 24, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="x"
            type="number"
            domain={[xMin, xMax]}
            tickFormatter={(v) => v.toFixed(1)}
            label={{ value: t.xAxisLabel, position: 'insideBottom', offset: -12, fontSize: 11 }}
          />
          <YAxis
            tickFormatter={(v) => v.toFixed(1)}
            label={{ value: t.yAxisLabel, angle: -90, position: 'insideLeft', fontSize: 11 }}
          />
          <ReferenceLine x={0} stroke="#d1d5db" />
          <ReferenceLine y={0} stroke="#d1d5db" />
          <Tooltip
            formatter={(v) => typeof v === 'number' ? v.toFixed(4) : t.undefined}
            labelFormatter={(label) => `x = ${Number(label).toFixed(3)}`}
          />
          <Legend verticalAlign="top" height={28} />
          <Line
            dataKey="re"
            name="Re(f(x))"
            stroke="#6366f1"
            dot={false}
            strokeWidth={2}
            connectNulls={false}
          />
          <Line
            dataKey="im"
            name="Im(f(x))"
            stroke="#f59e0b"
            dot={false}
            strokeWidth={2}
            strokeDasharray="5 3"
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
