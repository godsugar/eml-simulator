'use client';

import { PRESETS } from '@/lib/presets';
import { Slot } from '@/lib/expr';

type Props = {
  onSelect: (expr: Slot) => void;
};

const CATEGORY_ORDER = [
  '定数',
  '指数・対数',
  '代数',
  '三角関数',
  '逆三角関数',
  '双曲線関数',
  'その他',
];

export function PresetSelector({ onSelect }: Props) {
  const grouped = PRESETS.reduce<Record<string, typeof PRESETS>>((acc, p) => {
    (acc[p.category] ??= []).push(p);
    return acc;
  }, {});

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-600">プリセット式（論文より）</h3>
      {CATEGORY_ORDER.filter((cat) => grouped[cat]).map((cat) => (
        <div key={cat} className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="text-xs text-gray-400 w-20 shrink-0">{cat}</span>
          <div className="flex flex-wrap gap-1.5">
            {grouped[cat].map((preset) => (
              <button
                key={preset.label}
                onClick={() => onSelect(preset.expr)}
                className="relative px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-sm hover:bg-indigo-50 hover:border-indigo-300 transition-colors group"
              >
                <span className="font-mono text-indigo-700">{preset.label}</span>
                {preset.k > 0 && (
                  <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1 z-20 hidden group-hover:block bg-gray-700 text-white text-xs px-1.5 py-0.5 rounded whitespace-nowrap">
                    K={preset.k}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
