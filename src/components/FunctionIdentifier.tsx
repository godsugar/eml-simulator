'use client';

import { useMemo } from 'react';
import { Expr, isComplete } from '@/lib/expr';
import { identifyFunction } from '@/lib/identify';

type Props = {
  slot: import('@/lib/expr').Slot;
};

export function FunctionIdentifier({ slot }: Props) {
  const results = useMemo(() => {
    if (!isComplete(slot)) return null;
    return identifyFunction(slot as Expr);
  }, [slot]);

  if (!isComplete(slot)) {
    return (
      <div className="text-sm text-gray-400">
        式を完成させると候補関数との一致度が表示されます
      </div>
    );
  }

  if (!results || results.length === 0) {
    return <div className="text-sm text-gray-400">評価できませんでした</div>;
  }

  const matched = results.filter((r) => r.matched);
  const topCandidates = results.slice(0, 8);

  return (
    <div className="space-y-3">
      {matched.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="text-xs font-semibold text-green-700 mb-1">一致した関数</div>
          <div className="flex flex-wrap gap-2">
            {matched.map((r) => (
              <span
                key={r.candidate.label}
                className="px-2.5 py-1 bg-green-600 text-white rounded text-sm font-mono"
                title={r.candidate.description}
              >
                {r.candidate.label}
              </span>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="text-xs text-gray-500 mb-1.5">候補との最大誤差（上位8件）</div>
        <div className="space-y-1">
          {topCandidates.map((r) => {
            const pct = Math.max(0, 1 - Math.log10(r.maxError + 1e-12) / -12);
            return (
              <div key={r.candidate.label} className="flex items-center gap-2">
                <span
                  className={`font-mono text-xs w-24 shrink-0 ${r.matched ? 'text-green-700 font-semibold' : 'text-gray-600'}`}
                >
                  {r.candidate.label}
                </span>
                <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${r.matched ? 'bg-green-500' : 'bg-indigo-300'}`}
                    style={{ width: `${pct * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400 font-mono w-20 text-right shrink-0">
                  {r.maxError < 1e-10
                    ? '≈ 0'
                    : r.maxError < 1e-3
                      ? r.maxError.toExponential(1)
                      : r.maxError.toFixed(3)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
