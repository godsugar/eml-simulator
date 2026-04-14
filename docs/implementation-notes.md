# 実装上の注意事項

次のセッションで作業するときに知っておくべき、コードを読むだけでは気づきにくい挙動をまとめる。

---

## リーフ数 K の定義

`leafCount()` (`src/lib/expr.ts`) は `one` / `var` 型のノードだけを数える。
eml ノード自体はカウントしない。

```
eml(x, 1)  → K = 2   (x と 1 の 2 リーフ)
eml(1, 1)  → K = 2
eml(1, eml(eml(1, x), 1))  → K = 4
```

**PresetSelector ボタンの `K=` 表示は `preset.k` を使う**（`src/lib/presets.ts` の静的フィールド）。
ExprDisplay が表示する K は `leafCount()` をリアルタイムで呼ぶ。両者は同じ値になるよう揃えてある。

---

## エラー伝搬の構造（`evaluate()` in `src/lib/expr.ts`）

エラーは `ComplexResult = { ok: false, reason }` として値で伝搬する。例外を投げない。

`Complex.ln()` は **NaN のときのみ** `{ ok: false }` を返す。
`ln(0)` は論文の拡張実数規約に従い `Complex(-Infinity, 0)` として `{ ok: true }` で返す（JavaScript の `Math.log(0) = -Infinity` をそのまま使用）。これにより `exp(-Infinity) = 0` が連鎖して定数 2 などの構成が機能する。

`evaluate()` の内部フロー:

```
左右サブツリーを両方評価
  ↓
左サブツリーがエラー → { expr, result: leftError }  ← children なし
右サブツリーがエラー → { expr, result: rightError }  ← children なし
  ↓
exp(left), ln(right) を計算
ln(right) がエラー   → { expr, result: lnError, children: {left, right, expLeft, lnRight} }
  ↓
成功               → { expr, result: value,   children: {left, right, expLeft, lnRight} }
```

**サブツリーエラーのとき `children` が付かない**点に注意。ResultPanel はエラー理由のみ表示し、どのノードで起きたかのツリー表示は行わない。

---

## `isComplete()` ガードについて

`page.tsx` は `evaluate()` を呼ぶ前に必ず `isComplete(slot)` で空スロットがないか確認する。

`evaluate()` の型は `evaluate(expr: Expr, ...)` なので、空スロット含みの `Slot` 型を渡すには型アサーションが必要。`page.tsx` では `slot as Expr` でキャストしている（`isComplete` がガードになっているため安全）。

**`ExprNode` を別の場所で使う場合は同様のガードが必要。**

---

## 履歴バッファの仕様

- 上限: `HISTORY_MAX = 200`（古いエントリから削除）
- **式木を変更すると即リセット**される（`handleSetSlot` 内で `setHistory([])` を呼ぶ）
- x 値だけの変更では履歴は保持される
- 履歴は ComplexPlane の軌跡表示にのみ使用

---

## プロット値のクランプ（`generatePlotData` in `src/lib/identify.ts`）

`|value| > 1e6` の点は `re: null, im: null` に変換される。

- FunctionGraph 側は `connectNulls: false`（デフォルト）なのでその点は空白になる
- **ユーザーへの通知はない**（グラフが途切れるだけ）

---

## 関数同定の詳細（`identifyFunction` in `src/lib/identify.ts`）

- サンプル点: 実軸上の 10 点 `[0.1, 0.5, 1.0, 1.5, 2.0, 3.0, 0.25, 0.75, 1.2, 1.8]`
  - 0 と負の値を避けている（ln / sqrt のドメイン制限を回避）
- 候補: PRESETS 配列の「その他」カテゴリ以外の全プリセット（独自 CANDIDATES 配列は廃止）
  - プリセット追加で比較対象が自動的に増える
- 誤差: max(|Δre|, |Δim|) の最大値
- 一致判定: `maxError < 1e-6`（`TOLERANCE` 定数）
- **いずれかのサンプル点で候補関数か EML 式がエラーになると、その候補は除外される**（usable フラグ）

---

## 許容誤差の使い分け

| 用途 | 値 | 場所 |
|------|----|------|
| 関数同定の一致判定 | `1e-6` | `identify.ts: TOLERANCE` |
| `Complex.equals()` のデフォルト | `1e-10` | `complex.ts` |

`Complex.equals()` は VariableInput のクイック選択ボタンのハイライトに使用。
`1e-9` など近い値を入力してもボタンは光らない（厳密一致に近い精度が必要）。

---

## 加算ビルダーの実装

加算は `add(a, b) = sub(a, neg(b))` として実現している。

```typescript
const neg = (a) => eml(two_p, eml(a, one));       // 0 - a
const sub = (a, b) => eml(ln_of(a), eml(b, one)); // a - b
const add = (a, b) => sub(a, neg(b));              // a - (-b) = a + b
```

---

## 大規模プリセットのパフォーマンス

sin(x) は K=172、tan(x) は K=314 とノード数が多い。`evaluate()` は各ノードで再帰評価するため、計算回数は K×2 程度のオーダーになる。ブラウザでは問題ないが、関数同定（10サンプル点 × プリセット全数）や関数グラフ（200点走査）では少し時間がかかることがある。

プリセット数が増えるほど関数同定の計算コストも増加することに注意。

---

## ExprNode のサイズ設計（`src/components/ExprNode.tsx`）

コンパクト表示時（`compact=true`）とノーマル表示時でクラスを出し分けている:

| 要素 | ノーマル | コンパクト |
|------|---------|-----------|
| チップ文字サイズ | `text-xs` | `text-xs` |
| 幹・枝の高さ | `h-3` | `h-2` |
| eml chip padding | `px-1.5 py-0.5` | `px-1 py-0` |
| 列間隔 | `px-0.5`（Tailwind） | `padding: 0 1px`（style属性） |
| 角丸 | `rounded`（small） | `rounded` |

コンパクト時の列間隔は `1px` を `style` 属性で直接指定している。Tailwind のユーティリティクラスに対応する値がないため。

---

## Recharts と SSR

`ComplexPlane` と `FunctionGraph` は `next/dynamic + ssr: false` でロードされる（`src/app/page.tsx` L14-19）。

Recharts が初回レンダリング時に DOM API を要求するため、`output: 'export'` の静的ビルドでは SSR を無効化しなければならない。
**これらのコンポーネントに新しい Recharts コンポーネントを追加する場合は同じパターンを踏襲すること。**
