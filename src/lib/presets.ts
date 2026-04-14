import { Slot } from './expr';

export type Preset = {
  label: string;
  description: string;
  expr: Slot;
  k: number;
  category: string;
};

// Helpers
const one: Slot = { type: 'one' };
const x: Slot = { type: 'var' };
const eml = (left: Slot, right: Slot): Slot => ({ type: 'eml', left, right });

// ─── Named sub-expressions ───────────────────────────────────────────────────
// e   = eml(1, 1)          : exp(1) − ln(1) = e − 0 = e
const e_const = eml(one, one);

// 0   = eml(1, eml(e, 1))  : exp(1) − ln(e^e) = e − e = 0
const zero_expr = eml(one, eml(e_const, one));

// ln(x) = eml(1, eml(eml(1, x), 1))
//   step1: eml(1, x)      = e − ln(x)
//   step2: eml(step1, 1)  = exp(e − ln(x)) = e^e / x
//   step3: eml(1, step2)  = e − ln(e^e / x) = e − e + ln(x) = ln(x)
const ln_x = eml(one, eml(eml(one, x), one));

// 2   = eml(0, 1/e)
//   Uses extended real conventions: ln(0) = -∞, exp(-∞) = 0
//   r = eml(1, 0)         : e − ln(0)  = e − (−∞) = +∞
//   q = eml(r, 1)         : exp(∞) − 0 = +∞
//   p = eml(1, q)         : e − ln(∞)  = −∞
//   f = eml(p, e)         : exp(−∞) − ln(e) = 0 − 1 = −1
//   b = eml(f, 1)         : exp(−1) − 0 = 1/e
//   2 = eml(0, b)         : exp(0) − ln(1/e) = 1 − (−1) = 2
const two_r = eml(one, zero_expr);
const two_q = eml(two_r, one);
const two_p = eml(one, two_q);
const two_f = eml(two_p, e_const);
const two_b = eml(two_f, one);
const two_const = eml(zero_expr, two_b);

// ─── ln_of: 任意の定数式 a の対数を取る ────────────────────────────────────
// ln(a) = eml(1, eml(eml(1, a), 1))
const ln_of = (a: Slot): Slot => eml(one, eml(eml(one, a), one));

// ─── 虚数単位 i ─────────────────────────────────────────────────────────────
// i = exp(πi/2)
//   ln(−1) = πi              (複素対数の主値)
//   ln(−1)/2 = πi/2
//   exp(πi/2) = i
const neg_one = two_f;
const ln_neg1 = ln_of(neg_one);          // πi
const ln2_neg1 = ln_of(ln_neg1);         // ln(πi)
const ln3_neg1 = ln_of(ln2_neg1);        // ln(ln(πi))
const i_sub = eml(ln3_neg1, two_const);  // ln(πi) − ln(2) = ln(πi/2)
const i_half = eml(i_sub, one);          // πi/2
const i_expr = eml(i_half, one);         // exp(πi/2) = i

// ─── 演算ビルダー ───────────────────────────────────────────────────────────
// mul(a, b) = a × b
const mul = (a: Slot, b: Slot): Slot => {
  const L = eml(one, eml(eml(one, eml(one, a)), one));
  const R = eml(one, eml(eml(one, eml(b, one)), one));
  return eml(eml(one, eml(eml(L, R), one)), one);
};
// div(a, b) = a / b
const div = (a: Slot, b: Slot): Slot => {
  const t4_b = eml(one, eml(eml(one, eml(one, b)), one));
  const c_a = eml(eml(one, a), one);
  return eml(eml(t4_b, c_a), one);
};
// neg(a) = −a
const neg = (a: Slot): Slot => eml(two_p, eml(a, one));
// sub(a, b) = a − b
const sub = (a: Slot, b: Slot): Slot => eml(ln_of(a), eml(b, one));
// add(a, b) = a + b
const add = (a: Slot, b: Slot): Slot => sub(a, neg(b));

// ─── 円周率 π ───────────────────────────────────────────────────────────────
// π = ln(−1) / i = πi / i = π
const pi_expr = div(ln_neg1, i_expr);

// ─── 代数 ───────────────────────────────────────────────────────────────────
// x   = eml(ln(x), 1)     : exp(ln(x)) − 0 = x
const x_via_ln = eml(ln_x, one);

// x−1 = eml(ln(x), e)     : exp(ln(x)) − ln(e) = x − 1
const x_minus_1 = eml(ln_x, e_const);

// 1/x = eml(eml(−∞, x), 1) = exp(−ln(x)) = 1/x
const inv_x = eml(eml(two_p, x), one);

const x2_expr = mul(x, x);              // x²  K=13
const x3_expr = mul(x2_expr, x);        // x³  K=25
const x4_expr = mul(x2_expr, x2_expr);  // x⁴  K=37

// ─── 平方根 ─────────────────────────────────────────────────────────────────
// sqrt(x) = exp(ln(x) / 2)
const sqrt_x = eml(div(ln_x, two_const), one);  // K=26

// ─── 三角関数 ───────────────────────────────────────────────────────────────
const ix = mul(i_expr, x);
const exp_ix = eml(ix, one);                  // exp(ix)
const exp_neg_ix = eml(neg(ix), one);         // exp(−ix)

// sin(x) = (exp(ix) − exp(−ix)) / (2i)
const sin_numerator = sub(exp_ix, exp_neg_ix);
const two_i = mul(two_const, i_expr);
const sin_x = div(sin_numerator, two_i);

// cos(x) = (exp(ix) + exp(−ix)) / 2
const cos_numerator = add(exp_ix, exp_neg_ix);
const cos_x = div(cos_numerator, two_const);

// tan(x) = sin(x) / cos(x)
const tan_x = div(sin_x, cos_x);

// ─── 逆三角関数 ─────────────────────────────────────────────────────────────
// arctan(x) = (i/2) · ln((1 − ix) / (1 + ix))
const half_i = div(i_expr, two_const);                               // K=55
const arctan_x = mul(half_i, ln_of(div(sub(one, ix), add(one, ix)))); // K=186

// arcsin(x) = −i · ln(ix + sqrt(1 − x²))
const x2_inv = mul(x, x);                                            // K=13
const sqrt_1mx2 = eml(div(ln_of(sub(one, x2_inv)), two_const), one); // K=43
const arcsin_x = mul(neg(i_expr), ln_of(add(ix, sqrt_1mx2)));        // K=157

// arccos(x) = −i · ln(x + i·sqrt(1 − x²))
const arccos_x = mul(neg(i_expr), ln_of(add(x, mul(i_expr, sqrt_1mx2)))); // K=157

// ─── 双曲線関数 ─────────────────────────────────────────────────────────────
// sinh(x) = (exp(x) − exp(−x)) / 2
const exp_x_h = eml(x, one);           // K=2
const exp_neg_x_h = eml(neg(x), one);  // K=10

const sinh_x = div(sub(exp_x_h, exp_neg_x_h), two_const);  // K=37
const cosh_x = div(add(exp_x_h, exp_neg_x_h), two_const);  // K=45
const tanh_x = div(sinh_x, cosh_x);                        // K=89

export const PRESETS: Preset[] = [
  // ─── 定数 ────────────────────────────────────────────────────────────────
  {
    label: '−1',
    description: 'K=9 — eml(two_p, e) = exp(−∞) − ln(e) = 0 − 1 = −1',
    expr: neg_one,
    k: 9,
    category: '定数',
  },
  {
    label: '0',
    description: 'eml(1, eml(eml(1,1), 1)) = e − ln(e^e) = 0',
    expr: zero_expr,
    k: 4,
    category: '定数',
  },
  {
    label: '1',
    description: 'eml(0, 1) = exp(0) − ln(1) = 1 − 0 = 1',
    expr: one,
    k: 1,
    category: '定数',
  },
  {
    label: '2',
    description: 'K=14 — 拡張実数 ln(0)=−∞ を経由して 2 を構成',
    expr: two_const,
    k: 14,
    category: '定数',
  },
  {
    label: 'e',
    description: 'eml(1, 1) = exp(1) − ln(1) = e ≈ 2.718',
    expr: e_const,
    k: 2,
    category: '定数',
  },
  {
    label: 'i',
    description: 'K=34 — exp(πi/2) = i, πi=ln(−1) を利用',
    expr: i_expr,
    k: 34,
    category: '定数',
  },
  {
    label: 'π',
    description: 'K=53 — ln(−1)/i = πi/i = π',
    expr: pi_expr,
    k: 53,
    category: '定数',
  },

  // ─── 指数・対数 ──────────────────────────────────────────────────────────
  {
    label: 'exp(x)',
    description: 'eml(x, 1) = exp(x) − ln(1) = exp(x)',
    expr: eml(x, one),
    k: 2,
    category: '指数・対数',
  },
  {
    label: 'ln(x)',
    description: 'eml(1, eml(eml(1, x), 1)) — K=4',
    expr: ln_x,
    k: 4,
    category: '指数・対数',
  },

  // ─── 代数 ────────────────────────────────────────────────────────────────
  {
    label: 'x',
    description: 'eml(ln(x), 1) = exp(ln(x)) − 0 = x',
    expr: x_via_ln,
    k: 5,
    category: '代数',
  },
  {
    label: 'x + x',
    description: 'K=14 — add(x, x) = 2x',
    expr: add(x, x),
    k: 14,
    category: '代数',
  },
  {
    label: 'x * x',
    description: 'K=13 — mul(x, x) = x²',
    expr: x2_expr,
    k: 13,
    category: '代数',
  },
  {
    label: 'x³',
    description: 'K=25 — mul(x², x) = x²·x',
    expr: x3_expr,
    k: 25,
    category: '代数',
  },
  {
    label: '√x',
    description: 'K=26 — exp(ln(x)/2)',
    expr: sqrt_x,
    k: 26,
    category: '代数',
  },
  {
    label: '1/x',
    description: 'K=9 — eml(eml(−∞, x), 1) = exp(−ln(x)) = 1/x',
    expr: inv_x,
    k: 9,
    category: '代数',
  },

  // ─── 三角関数 ────────────────────────────────────────────────────────────
  {
    label: 'sin(x)',
    description: 'K=172 — (exp(ix)−exp(−ix))/(2i)',
    expr: sin_x,
    k: 172,
    category: '三角関数',
  },
  {
    label: 'cos(x)',
    description: 'K=135 — (exp(ix)+exp(−ix))/2',
    expr: cos_x,
    k: 135,
    category: '三角関数',
  },
  {
    label: 'tan(x)',
    description: 'K=314 — sin(x)/cos(x)',
    expr: tan_x,
    k: 314,
    category: '三角関数',
  },

  // ─── 逆三角関数 ──────────────────────────────────────────────────────────
  {
    label: 'arcsin(x)',
    description: 'K=157 — −i·ln(ix+√(1−x²))',
    expr: arcsin_x,
    k: 157,
    category: '逆三角関数',
  },
  {
    label: 'arccos(x)',
    description: 'K=157 — −i·ln(x+i√(1−x²))',
    expr: arccos_x,
    k: 157,
    category: '逆三角関数',
  },
  {
    label: 'arctan(x)',
    description: 'K=186 — (i/2)·ln((1−ix)/(1+ix))',
    expr: arctan_x,
    k: 186,
    category: '逆三角関数',
  },

  // ─── 双曲線関数 ──────────────────────────────────────────────────────────
  {
    label: 'sinh(x)',
    description: 'K=37 — (exp(x)−exp(−x))/2',
    expr: sinh_x,
    k: 37,
    category: '双曲線関数',
  },
  {
    label: 'cosh(x)',
    description: 'K=45 — (exp(x)+exp(−x))/2',
    expr: cosh_x,
    k: 45,
    category: '双曲線関数',
  },
  {
    label: 'tanh(x)',
    description: 'K=89 — sinh(x)/cosh(x)',
    expr: tanh_x,
    k: 89,
    category: '双曲線関数',
  },

  // ─── その他 ──────────────────────────────────────────────────────────────
  {
    label: '空のスロット',
    description: '最初から式を組み立てる',
    expr: { type: 'empty' },
    k: 0,
    category: 'その他',
  },
];
