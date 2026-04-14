# システム概要 — モジュール構成

## ディレクトリ構成

```
src/
├── lib/                    数学ライブラリ（UIなし）
│   ├── complex.ts          複素数クラス
│   ├── expr.ts             式木の型・評価・更新
│   ├── presets.ts          プリセット式の定義
│   └── identify.ts         関数同定・グラフデータ生成
├── components/             UIコンポーネント（状態なし）
│   ├── ExprNode.tsx        式木ビルダー（再帰）
│   ├── ExprDisplay.tsx     括弧表記 / K値 / 深さの表示
│   ├── PresetSelector.tsx  プリセット選択ボタン群
│   ├── VariableInput.tsx   変数 x の入力UI
│   ├── ResultPanel.tsx     評価ステップのツリー表示
│   ├── ComplexPlane.tsx    複素平面プロット
│   ├── FunctionGraph.tsx   関数グラフ
│   └── FunctionIdentifier.tsx  関数同定パネル
└── app/
    ├── page.tsx            メインページ（全状態管理）
    ├── layout.tsx          ルートレイアウト
    └── globals.css         Tailwind v4 インポート
```

---

## ライブラリ層 (`src/lib/`)

### `complex.ts` — 複素数クラス

外部ライブラリを使わない自前実装。

| 要素 | 内容 |
|------|------|
| `Complex` クラス | イミュータブル。`re`, `im` フィールド |
| `Complex.exp(z)` | `e^a · (cos b + i sin b)` |
| `Complex.ln(z)` | `ln|z| + i·arg(z)`（主値） |
| `ComplexResult` 型 | `{ ok: true, value }` または `{ ok: false, reason }`。`ln(0)` などのエラーを値として伝搬 |

### `expr.ts` — 式木の型・評価・更新

| 要素 | 内容 |
|------|------|
| `Expr` 型 | `one` / `var` / `eml(left, right)` の判別共用体 |
| `Slot` 型 | `Expr` または `empty`（未確定スロット） |
| `evaluate(expr, x)` | 再帰的後順評価。`EvalTrace` を返す（中間値を全ノードで記録） |
| `setSlot(root, path, value)` | イミュータブルなツリー更新。`path` は `('left'\|'right')[]` |
| `isComplete(slot)` | 空スロットが残っていないかチェック |
| `exprToString(slot)` | 括弧表記文字列に変換 |
| `leafCount(slot)` | リーフ数 K を計算 |
| `depth(slot)` | 最大深さを計算 |

### `presets.ts` — プリセット式

`PRESETS` 配列でラベル・式・K値をまとめて定義。26種のプリセットと以下の演算ビルダーを定義:

| ビルダー | 演算 | 概要 |
|---------|------|------|
| `mul(a, b)` | a × b | exp(ln(a) + ln(b)) をEML入れ子で実現 |
| `div(a, b)` | a / b | exp(ln(a) − ln(b)) |
| `neg(a)` | −a | `eml(two_p, eml(a, 1))` — −∞ を利用 |
| `sub(a, b)` | a − b | `eml(ln(a), eml(b, 1))` |
| `add(a, b)` | a + b | `sub(a, neg(b))` |

定数サブ式: `e_const`, `zero_expr`, `two_p`(−∞), `two_f`(−1), `two_const`(2), `i_expr`, `pi_expr` が再利用可能な形で定義されている。

カテゴリは `定数` / `指数・対数` / `代数` / `三角関数` / `逆三角関数` / `双曲線関数` / `その他` の7種。

### `identify.ts` — 関数同定

| 関数 | 内容 |
|------|------|
| `identifyFunction(expr)` | PRESETS（`その他` を除く）を候補として実軸10点でサンプリング照合。最大誤差でランキング |
| `generatePlotData(expr, xMin, xMax, steps)` | 関数グラフ用データ生成 |

独自の CANDIDATES 配列は廃止され、PRESETS をそのまま候補として使用する設計に変更された。プリセットを追加するだけで関数同定の比較対象も自動的に増える。

---

## コンポーネント層 (`src/components/`)

| コンポーネント | 責務 |
|--------------|------|
| `ExprNode` | 式木を再帰的にレンダリング。空スロットのドロップダウン、中間値のインライン表示 |
| `ExprDisplay` | 括弧表記・K値・深さをテキスト表示 |
| `PresetSelector` | プリセットボタン群。クリックで `onSelect(expr)` を呼ぶ |
| `VariableInput` | 数値入力・クイック選択・スライダー |
| `ResultPanel` | `EvalTrace` を受け取りインデントツリーで表示 |
| `ComplexPlane` | Recharts `ScatterChart`。現在値・x・軌跡をプロット |
| `FunctionGraph` | Recharts `LineChart`。Re(f(x)) と Im(f(x)) をライン表示 |
| `FunctionIdentifier` | `identifyFunction` の結果をランキング表示 |

> `ComplexPlane` と `FunctionGraph` は `next/dynamic + ssr: false` でロード（Recharts がブラウザAPIを要求するため）。

---

## アプリ層 (`src/app/page.tsx`)

全状態のシングルソースオブトゥルース。レイアウト順:

```
header
└── 2カラムグリッド
    ├── 左:
    │   ├── PresetSelector（プリセット選択）
    │   ├── ExprDisplay（括弧表記・K値・depth）
    │   └── ExprNode（式木ビルダー）
    └── 右:
        ├── FunctionGraph（関数グラフ）
        └── FunctionIdentifier（関数同定）
```

### 状態

| state | 型 | 意味 |
|-------|-----|------|
| `slot` | `Slot` | 現在の式木 |
| `treeExpanded` | `boolean` | 式木拡大モーダルの開閉 |
| `treeCompact` | `boolean` | 式木のコンパクト表示モード |

### 式木拡大モーダル

`treeExpanded` が true のとき、fixed 全画面モーダルを表示。左右2ペイン構成:

```
モーダル全画面
├── ヘッダー（ExprDisplay + 閉じるボタン）
└── body（flex-row）
    ├── 左: ExprNode（flex-1、overflow-auto）
    └── 右: FunctionGraph（w-80、border-l）
```

### データフロー

```
ExprNode / PresetSelector → slot 更新（handleSetSlot）

slot → FunctionGraph（内部で generatePlotData を実行）
slot → FunctionIdentifier（内部で identifyFunction を実行）
slot → ExprDisplay（リアルタイム K値・depth 表示）
```
