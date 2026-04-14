# コマンド・起動方法

## 前提

- Node.js（LTS推奨）
- npm

---

## セットアップ

```bash
npm install
```

---

## 開発サーバー

```bash
npm run dev
```

`http://localhost:3000` でアプリが起動する。ホットリロード対応。

---

## 本番ビルド（静的出力）

```bash
npm run build
```

`out/` ディレクトリに静的ファイルが生成される。サーバー不要で配置可能。

### 配置例

```bash
# out/ をそのままホスティングサービスにアップロード
# 例: GitHub Pages, Netlify, Cloudflare Pages など
```

---

## ローカルで静的ファイルを確認

```bash
npm run build
npx serve out
```

---

## 技術スタック

| 項目 | バージョン |
|------|-----------|
| Next.js (App Router, SSG) | 16.x |
| React | 19.x |
| TypeScript | 6.x |
| Tailwind CSS | v4 |
| Recharts | 3.x |

---

## 制約事項

- `output: 'export'` 設定により、SSR / APIルートは使用不可
- Recharts はブラウザAPIを使うため、`ComplexPlane` と `FunctionGraph` は `next/dynamic + ssr: false` でロード
