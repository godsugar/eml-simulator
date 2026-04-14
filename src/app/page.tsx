'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Slot, setSlot, Path } from '@/lib/expr';
import { ExprNode } from '@/components/ExprNode';
import { ExprDisplay } from '@/components/ExprDisplay';
import { PresetSelector } from '@/components/PresetSelector';
import { FunctionIdentifier } from '@/components/FunctionIdentifier';

const FunctionGraph = dynamic(() => import('@/components/FunctionGraph').then((m) => m.FunctionGraph), {
  ssr: false,
});

export default function Page() {
  const [slot, setSlot_] = useState<Slot>({ type: 'empty' });
  const [treeExpanded, setTreeExpanded] = useState(false);

  const handleSetSlot = (path: Path, value: Slot) => {
    setSlot_((prev) => setSlot(prev, path, value));
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-xl font-bold text-gray-900">EML演算子シミュレータ</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            論文{' '}
            <a
              href="https://arxiv.org/abs/2603.21852"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:underline"
            >
              "All Elementary Functions from a Single Operator" (arXiv:2603.21852)
            </a>{' '}
            に基づく
          </p>
          <div className="mt-2 bg-indigo-50 border border-indigo-100 rounded px-3 py-2 inline-block">
            <span className="font-mono text-indigo-800 text-sm">
              eml(x, y) = exp(x) − ln(y)
            </span>
            <span className="ml-4 text-xs text-indigo-500">文法: S → 1 | x | eml(S, S)</span>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

          {/* ─── Left: Input ──────────────────────────────────────────── */}
          <div className="space-y-4">

            <section className="bg-white border border-gray-200 rounded-xl p-4">
              <PresetSelector onSelect={(expr) => setSlot_(expr)} />
            </section>

            <ExprDisplay slot={slot} />

            <section className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-700">式木ビルダー</h2>
                <button
                  onClick={() => setTreeExpanded(true)}
                  className="text-xs text-gray-400 hover:text-indigo-600 border border-gray-200 hover:border-indigo-300 rounded px-2 py-0.5 transition-colors"
                >
                  ⛶ 拡大
                </button>
              </div>
              <p className="text-xs text-gray-400">
                空スロット <code className="bg-gray-100 px-1 rounded">_</code> にカーソルを合わせてクリック
              </p>
              <div className="min-h-[80px] overflow-x-auto">
                <div className="flex items-start justify-center min-w-max mx-auto px-4">
                  <ExprNode
                    slot={slot}
                    path={[]}
                    onSetSlot={handleSetSlot}
                    compact={true}
                  />
                </div>
              </div>
            </section>

          </div>

          {/* ─── Right: Output ────────────────────────────────────────── */}
          <div className="space-y-4">

            <section className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
              <h2 className="text-sm font-semibold text-gray-700">関数グラフ</h2>
              <p className="text-xs text-gray-500">
                x を実数として走査し、Re(f(x)) と Im(f(x)) をプロット
              </p>
              <FunctionGraph slot={slot} />
            </section>

            <section className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
              <h2 className="text-sm font-semibold text-gray-700">関数同定</h2>
              <p className="text-xs text-gray-500">
                複数の x サンプル点で評価し、既知の初等関数との誤差を比較
              </p>
              <FunctionIdentifier slot={slot} />
            </section>

          </div>

        </div>
      </div>

      {/* ─── 式木拡大モーダル ──────────────────────────────────────────── */}
      {treeExpanded && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col">
          <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-white shrink-0">
            <div className="flex items-center gap-4 min-w-0">
              <h2 className="text-sm font-semibold text-gray-700 shrink-0">式木ビルダー</h2>
              <div className="min-w-0">
                <ExprDisplay slot={slot} />
              </div>
            </div>
            <button
              onClick={() => setTreeExpanded(false)}
              className="ml-4 shrink-0 text-sm text-gray-500 hover:text-gray-900 border border-gray-200 hover:border-gray-400 rounded px-3 py-1 transition-colors"
            >
              ✕ 閉じる
            </button>
          </div>
          <div className="flex-1 flex overflow-hidden">
            {/* 式木エリア */}
            <div className="flex-1 overflow-auto bg-gray-50">
              <div className="flex items-start justify-center min-w-max min-h-full mx-auto p-8">
                <ExprNode
                  slot={slot}
                  path={[]}
                  onSetSlot={handleSetSlot}
                  compact={true}
                />
              </div>
            </div>

            {/* グラフパネル */}
            <div className="w-80 shrink-0 border-l border-gray-200 bg-white flex flex-col">
              <div className="px-4 py-3 border-b border-gray-100">
                <h3 className="text-xs font-semibold text-gray-600">関数グラフ</h3>
              </div>
              <div className="flex-1 overflow-y-auto px-3 py-3">
                <FunctionGraph slot={slot} />
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
