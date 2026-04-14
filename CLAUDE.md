# EML演算子シミュレータ — Claude向けガイド

論文 "All Elementary Functions from a Single Operator" (arXiv:2603.21852) の検証実装。
`eml(x, y) = exp(x) − ln(y)` という1演算子から全初等関数が構成できることを確かめるNext.js SSGアプリ。

---

## ドキュメント

| 内容 | ファイル |
|------|---------|
| EML演算子の概念・数学的背景 | [docs/eml-concept.md](docs/eml-concept.md) |
| EML演算子による初等関数の表現方法 | [docs/eml-functions.md](docs/eml-functions.md) |
| システム概要（機能一覧） | [docs/system-features.md](docs/system-features.md) |
| システム概要（モジュール・データフロー） | [docs/system-modules.md](docs/system-modules.md) |
| コマンド・起動方法 | [docs/commands.md](docs/commands.md) |
| 実装上の注意・落とし穴 | [docs/implementation-notes.md](docs/implementation-notes.md) |

---

## クイックリファレンス

### コマンド

```bash
npm run dev      # 開発サーバー (http://localhost:3000)
npm run build    # 静的出力 → out/
```

### 主要な型（`src/lib/expr.ts`）

```typescript
type Expr = { type: 'one' } | { type: 'var' } | { type: 'eml'; left: Slot; right: Slot }
type Slot = Expr | { type: 'empty' }
type ComplexResult = { ok: true; value: Complex } | { ok: false; reason: string }
```

### 状態管理

全状態は `src/app/page.tsx` に集約。子コンポーネントはコールバックで状態を上げる。
ツリー更新は `setSlot(root, path, value)` でイミュータブルに行う（`path: ('left'|'right')[]`）。

---

## 制約

- **静的出力のみ** — SSR・APIルート不可（`next.config.ts` に `output: 'export'`）
- **複素数は自前実装** — 外部数学ライブラリを追加しない
- **UIは日本語**
- **Recharts は `ssr: false`** で dynamic import 済み
- **Tailwind v4** — 設定ファイルなし、`@import "tailwindcss"` のみ
