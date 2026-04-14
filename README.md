# EML演算子シミュレータ

論文 **"All Elementary Functions from a Single Operator"** (arXiv:2603.21852, Andrzej Odrzywołek) の検証用インタラクティブシミュレータ。

```
eml(x, y) = exp(x) − ln(y)
```

この1つの演算子だけで、指数関数・対数関数・三角関数などすべての初等関数が表現できる。ブラウザ上で式木を組み立てて実際に確かめられる。

## ドキュメント

- [EML演算子の概念](docs/eml-concept.md)
- [EML演算子による初等関数の表現方法](docs/eml-functions.md)
- [システム概要（機能）](docs/system-features.md)
- [システム概要（モジュール構成）](docs/system-modules.md)
- [コマンド・起動方法](docs/commands.md)

## セットアップ

```bash
npm install
npm run dev    # http://localhost:3000
npm run build  # 静的ファイル生成 → out/
```

## 参考文献

- 論文: [arXiv:2603.21852](https://arxiv.org/abs/2603.21852)
- 解説: [lilting.ch](https://lilting.ch/articles/eml-single-operator-elementary-functions)
