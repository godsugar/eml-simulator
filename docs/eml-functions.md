# EML演算子による初等関数の表現

## 基本的な構成例

| 関数 | EML式 | K | depth | 補足 |
|------|-------|---|-------|------|
| exp(x) | `eml(x, 1)` | 2 | 1 | exp(x) − ln(1) = exp(x) |
| e | `eml(1, 1)` | 2 | 1 | exp(1) − ln(1) = e |
| ln(x) | `eml(1, eml(eml(1, x), 1))` | 4 | 3 | 後述 |
| 0 | `eml(1, eml(eml(1, 1), 1))` | 4 | 3 | e − ln(e^e) = 0 |

---

## ln(x) の導出

ln(x) は3段の入れ子で構成される:

```
step 1:  eml(1, x)     = exp(1) − ln(x)  = e − ln(x)
step 2:  eml(step1, 1) = exp(e − ln(x)) − 0 = e^e / x
step 3:  eml(1, step2) = exp(1) − ln(e^e / x)
                       = e − (e − ln(x))
                       = ln(x)
```

`exp` と `ln` が内側で相殺し合うことで、純粋な対数関数が取り出される。

---

## 拡張実数規約を使った定数

`ln(0) = −∞`, `exp(−∞) = 0` という拡張実数の規約が必要な構成。

### 定数 2 (K=14, depth=8)

```
zero = eml(1, eml(eml(1, 1), 1))    = 0
r    = eml(1, zero)                  = e − ln(0) = e − (−∞) = +∞
q    = eml(r, 1)                     = exp(∞) − 0 = +∞
p    = eml(1, q)         [two_p]     = e − ln(∞) = −∞
f    = eml(p, e)         [two_f]     = exp(−∞) − ln(e) = 0 − 1 = −1
b    = eml(f, 1)         [two_b]     = exp(−1) − 0 = 1/e
2    = eml(zero, b)                  = exp(0) − ln(1/e) = 1 − (−1) = 2
```

`two_p`（−∞）と `two_f`（−1）は他の定数の構成にも再利用される。

### e⁻¹ (K=10, depth=8)

```
b = eml(two_f, 1) = exp(−1) − 0 = 1/e
```

### 1/x (K=9, depth=8)

```
eml(eml(two_p, x), 1) = exp(0 − ln(x)) − 0 = 1/x
```

### −1 (K=9, depth=8)

`two_f` と `two_b` を経由し、`eml(two_p, e)` で構成:

```
f = eml(two_p, e) = exp(−∞) − ln(e) = 0 − 1 = −1
```

---

## 演算ビルダー

`src/lib/presets.ts` で定義されているヘルパー関数群。これらを組み合わせてすべての複雑なプリセットが構成される。

### 乗算 `mul(a, b)` (K≈13 for a=b=x)

```
a × b = exp(ln(a) + ln(b))
```

EML で ln(a) + ln(b) を表現するために、ln の差 `eml(ln_a, eml(ln_b, 1))` の形を利用する:

```typescript
const mul = (a, b) => {
  const L = eml(one, eml(eml(one, eml(one, a)), one));  // ln(e/a) = 1 - ln(a)
  const R = eml(one, eml(eml(one, eml(b, one)), one));  // ln(e/exp(b)) = 1 - b
  return eml(eml(one, eml(eml(L, R), one)), one);
};
```

### 除算 `div(a, b)`

```
a / b = exp(ln(a) - ln(b))
```

```typescript
const div = (a, b) => {
  const t4_b = eml(one, eml(eml(one, eml(one, b)), one));  // ln(b)
  const c_a  = eml(eml(one, a), one);                       // exp(a)
  return eml(eml(t4_b, c_a), one);
};
```

### 否定 `neg(a)` = −a

```
neg(a) = eml(two_p, eml(a, 1))
       = exp(−∞) − ln(exp(a))
       = 0 − a = −a
```

`two_p` は前述の −∞ ノード。

### 減算 `sub(a, b)` = a − b

```
sub(a, b) = eml(ln(a), eml(b, 1))
          = exp(ln(a)) − ln(exp(b))
          = a − b
```

### 加算 `add(a, b)` = a + b

```
add(a, b) = sub(a, neg(b)) = a − (−b) = a + b
```


---

## 虚数単位 i の導出 (K=34, depth=19)

### 数学的根拠

複素対数の主値より `ln(−1) = πi`。これを2で割って指数を取ると i が得られる:

```
i = exp(πi/2) = exp(ln(−1)/2)
```

### EML による段階的構成

```
neg_one = two_f              = −1
ln_neg1 = ln_of(−1)          = πi
ln2_neg1 = ln_of(πi)         = ln(πi)
ln3_neg1 = ln_of(ln(πi))     = ln(ln(πi))
i_sub = eml(ln3_neg1, two_const)
       = exp(ln(ln(πi))) − ln(2)
       = ln(πi) − ln(2)
       = ln(πi/2)
i_half = eml(i_sub, 1)       = exp(ln(πi/2)) = πi/2
i      = eml(i_half, 1)      = exp(πi/2) = i
```

---

## 円周率 π の導出 (K=53, depth=25)

```
πi = ln(−1)
π  = πi / i  = ln(−1) / i
```

`div(ln_neg1, i_expr)` で構成。

---

## 三角関数

### sin(x) (K=172, depth=36)

オイラーの公式より:

```
sin(x) = (exp(ix) − exp(−ix)) / (2i)
```

```
ix       = mul(i, x)
exp_ix   = eml(ix, 1)        = exp(ix)
exp_neg_ix = eml(neg(ix), 1) = exp(−ix)
sin(x)   = div(sub(exp_ix, exp_neg_ix), mul(2, i))
```

### cos(x) (K=135, depth=38)

```
cos(x) = (exp(ix) + exp(−ix)) / 2
       = div(add(exp_ix, exp_neg_ix), 2)
```

### tan(x) (K=314, depth=44)

```
tan(x) = sin(x) / cos(x)
       = div(sin_x, cos_x)
```

---

## プリセット一覧（全26種）

### 定数カテゴリ（順: −1, 0, 1, 2, e, i, π）

| ラベル | K | 式の概要 |
|--------|---|---------|
| −1 | 9 | `eml(two_p, e)` = 0 − 1 |
| 0 | 4 | `eml(1, eml(eml(1, 1), 1))` |
| 1 | 1 | 文法の基底項 |
| 2 | 14 | 拡張実数 ln(0)=−∞ を経由 |
| e | 2 | `eml(1, 1)` |
| i | 34 | `exp(πi/2)` — ln(−1) の3重適用 |
| π | 53 | `ln(−1) / i` |

### 指数・対数カテゴリ

| ラベル | K | 式の概要 |
|--------|---|---------|
| exp(x) | 2 | `eml(x, 1)` |
| ln(x) | 4 | `eml(1, eml(eml(1, x), 1))` |

### 代数カテゴリ（順: x, x+x, x\*x, x³, √x, 1/x）

| ラベル | K | 式の概要 |
|--------|---|---------|
| x | 5 | `eml(ln(x), 1)` |
| x + x | 14 | `add(x, x)` = 2x |
| x \* x | 13 | `mul(x, x)` = x² |
| x³ | 25 | `mul(x², x)` |
| √x | 26 | `exp(ln(x)/2)` |
| 1/x | 9 | `eml(eml(−∞, x), 1)` |

### 三角関数カテゴリ

| ラベル | K | 式の概要 |
|--------|---|---------|
| sin(x) | 172 | `(exp(ix)−exp(−ix)) / (2i)` |
| cos(x) | 135 | `(exp(ix)+exp(−ix)) / 2` |
| tan(x) | 314 | `sin(x) / cos(x)` |

### 逆三角関数カテゴリ

| ラベル | K | 式の概要 |
|--------|---|---------|
| arcsin(x) | 157 | `−i·ln(ix+√(1−x²))` |
| arccos(x) | 157 | `−i·ln(x+i√(1−x²))` |
| arctan(x) | 186 | `(i/2)·ln((1−ix)/(1+ix))` |

### 双曲線関数カテゴリ

| ラベル | K | 式の概要 |
|--------|---|---------|
| sinh(x) | 37 | `(exp(x)−exp(−x))/2` |
| cosh(x) | 45 | `(exp(x)+exp(−x))/2` |
| tanh(x) | 89 | `sinh(x)/cosh(x)` |

### その他

| ラベル | K | 式の概要 |
|--------|---|---------|
| 空のスロット | 0 | 最初から式を組み立てる |
