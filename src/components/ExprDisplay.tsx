'use client';

import { useState } from 'react';
import { Slot, exprToString, leafCount, depth } from '@/lib/expr';
import { useLang } from '@/lib/i18n';

type Props = {
  slot: Slot;
};

export function ExprDisplay({ slot }: Props) {
  const [copied, setCopied] = useState(false);
  const t = useLang();

  const str = exprToString(slot);
  const k = leafCount(slot);
  const d = depth(slot);

  const handleCopy = () => {
    navigator.clipboard.writeText(str).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-1">
      <div className="flex items-start gap-2">
        <div
          className="font-mono text-sm text-gray-800 break-all overflow-y-auto flex-1"
          style={{ maxHeight: '4.5em' }}
        >
          {str}
        </div>
        <button
          onClick={handleCopy}
          className="shrink-0 text-xs text-gray-400 hover:text-indigo-600 transition-colors p-0.5 mt-0.5"
          title="コピー"
        >
          {copied ? '✓' : '⎘'}
        </button>
      </div>
      <div className="flex gap-4 text-xs text-gray-500">
        <span>{t.leafCount} = {k}</span>
        <span>{t.depth} = {d}</span>
      </div>
    </div>
  );
}
