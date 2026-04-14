import { createContext, useContext } from 'react';

export type Lang = 'ja' | 'en';

export const translations = {
  ja: {
    appTitle: 'EML演算子シミュレータ',
    appPaperPrefix: '論文',
    appPaperSuffix: 'に基づく',
    grammar: '文法',

    presetTitle: 'プリセット式',
    treeBuilder: '式木ビルダー',
    treeHint: '空スロット _ にカーソルを合わせてクリック',
    expand: '⛶ 拡大',
    close: '✕ 閉じる',

    functionGraph: '関数グラフ',
    graphDesc: 'x を実数として走査し、Re(f(x)) と Im(f(x)) をプロット',
    graphEmpty: '式を完成させるとグラフが表示されます',
    xMin: 'x 最小',
    xMax: 'x 最大',
    xAxisLabel: 'x (実軸)',
    yAxisLabel: 'f(x)',

    functionId: '関数同定',
    functionIdDesc: '複数の x サンプル点で評価し、既知の初等関数との誤差を比較',
    idEmpty: '式を完成させると候補関数との一致度が表示されます',
    idFailed: '評価できませんでした',
    matched: '一致した関数',
    topCandidates: '候補との最大誤差（上位8件）',

    leafCount: 'リーフ数 K',
    depth: '深さ',

    deleteNode: '削除',
    preset: 'プリセット',

    categories: {
      '定数': '定数',
      '指数・対数': '指数・対数',
      '代数': '代数',
      '三角関数': '三角関数',
      '逆三角関数': '逆三角関数',
      '双曲線関数': '双曲線関数',
      'その他': 'その他',
    } as Record<string, string>,
    presetLabels: {
      '空のスロット': '空のスロット',
    } as Record<string, string>,
    undefined: '未定義',
  },
  en: {
    appTitle: 'EML Operator Simulator',
    appPaperPrefix: 'Based on',
    appPaperSuffix: '',
    grammar: 'Grammar',

    presetTitle: 'Preset Expressions',
    treeBuilder: 'Expression Tree Builder',
    treeHint: 'Hover over empty slot _ and click to select',
    expand: '⛶ Expand',
    close: '✕ Close',

    functionGraph: 'Function Graph',
    graphDesc: 'Sweep x over the real axis, plotting Re(f(x)) and Im(f(x))',
    graphEmpty: 'Complete the expression to show the graph',
    xMin: 'x min',
    xMax: 'x max',
    xAxisLabel: 'x (real)',
    yAxisLabel: 'f(x)',

    functionId: 'Function Identification',
    functionIdDesc: 'Evaluate at multiple x sample points and compare error with known elementary functions',
    idEmpty: 'Complete the expression to show match scores',
    idFailed: 'Could not evaluate',
    matched: 'Matched functions',
    topCandidates: 'Max error vs. candidates (top 8)',

    leafCount: 'Leaf count K',
    depth: 'Depth',

    deleteNode: 'Remove',
    preset: 'Presets',

    categories: {
      '定数': 'Constants',
      '指数・対数': 'Exp / Log',
      '代数': 'Algebra',
      '三角関数': 'Trig',
      '逆三角関数': 'Inv. Trig',
      '双曲線関数': 'Hyperbolic',
      'その他': 'Other',
    } as Record<string, string>,
    presetLabels: {
      '空のスロット': 'Empty slot',
    } as Record<string, string>,
    undefined: 'undefined',
  },
} as const satisfies Record<Lang, Record<string, unknown>>;

export type Translations = typeof translations.ja;

export const LangContext = createContext<Lang>('ja');

export function useLang(): Translations {
  const lang = useContext(LangContext);
  return translations[lang] as unknown as Translations;
}
