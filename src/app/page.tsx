'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Slot, setSlot, Path } from '@/lib/expr';
import { ExprNode } from '@/components/ExprNode';
import { ExprDisplay } from '@/components/ExprDisplay';
import { PresetSelector } from '@/components/PresetSelector';
import { FunctionIdentifier } from '@/components/FunctionIdentifier';
import { LangContext, Lang, translations } from '@/lib/i18n';

const FunctionGraph = dynamic(() => import('@/components/FunctionGraph').then((m) => m.FunctionGraph), {
  ssr: false,
});

export default function Page() {
  const [slot, setSlot_] = useState<Slot>({ type: 'empty' });
  const [treeExpanded, setTreeExpanded] = useState(false);
  const [lang, setLang] = useState<Lang>('en');

  const t = translations[lang];

  const handleSetSlot = (path: Path, value: Slot) => {
    setSlot_((prev) => setSlot(prev, path, value));
  };

  return (
    <LangContext.Provider value={lang}>
      <main className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold text-gray-900">{t.appTitle}</h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  {t.appPaperPrefix}{' '}
                  <a
                    href="https://arxiv.org/abs/2603.21852"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:underline"
                  >
                    "All Elementary Functions from a Single Operator" (arXiv:2603.21852)
                  </a>
                  {t.appPaperSuffix && <> {t.appPaperSuffix}</>}
                </p>
                <div className="mt-2 bg-indigo-50 border border-indigo-100 rounded px-3 py-2 inline-block">
                  <span className="font-mono text-indigo-800 text-sm">
                    eml(x, y) = exp(x) − ln(y)
                  </span>
                  <span className="ml-4 text-xs text-indigo-500">{t.grammar}: S → 1 | x | eml(S, S)</span>
                </div>
              </div>
              <div className="shrink-0 mt-1 flex text-xs border border-gray-200 rounded overflow-hidden font-mono">
                <button
                  onClick={() => setLang('ja')}
                  className={`px-2.5 py-1 transition-colors ${lang === 'ja' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-indigo-600'}`}
                >
                  JP
                </button>
                <button
                  onClick={() => setLang('en')}
                  className={`px-2.5 py-1 transition-colors ${lang === 'en' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-indigo-600'}`}
                >
                  EN
                </button>
              </div>
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
                  <h2 className="text-sm font-semibold text-gray-700">{t.treeBuilder}</h2>
                  <button
                    onClick={() => setTreeExpanded(true)}
                    className="text-xs text-gray-400 hover:text-indigo-600 border border-gray-200 hover:border-indigo-300 rounded px-2 py-0.5 transition-colors"
                  >
                    {t.expand}
                  </button>
                </div>
                <p className="text-xs text-gray-400">
                  {t.treeHint.split('_').map((part, i) =>
                    i === 0 ? part : <span key={i}><code className="bg-gray-100 px-1 rounded">_</code>{part}</span>
                  )}
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
                <h2 className="text-sm font-semibold text-gray-700">{t.functionGraph}</h2>
                <p className="text-xs text-gray-500">{t.graphDesc}</p>
                <FunctionGraph slot={slot} />
              </section>

              <section className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
                <h2 className="text-sm font-semibold text-gray-700">{t.functionId}</h2>
                <p className="text-xs text-gray-500">{t.functionIdDesc}</p>
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
                <h2 className="text-sm font-semibold text-gray-700 shrink-0">{t.treeBuilder}</h2>
                <div className="min-w-0">
                  <ExprDisplay slot={slot} />
                </div>
              </div>
              <button
                onClick={() => setTreeExpanded(false)}
                className="ml-4 shrink-0 text-sm text-gray-500 hover:text-gray-900 border border-gray-200 hover:border-gray-400 rounded px-3 py-1 transition-colors"
              >
                {t.close}
              </button>
            </div>
            <div className="flex-1 flex overflow-hidden">
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
              <div className="w-80 shrink-0 border-l border-gray-200 bg-white flex flex-col">
                <div className="px-4 py-3 border-b border-gray-100">
                  <h3 className="text-xs font-semibold text-gray-600">{t.functionGraph}</h3>
                </div>
                <div className="flex-1 overflow-y-auto px-3 py-3">
                  <FunctionGraph slot={slot} />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </LangContext.Provider>
  );
}
