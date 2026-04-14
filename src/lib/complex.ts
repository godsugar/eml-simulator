export class Complex {
  constructor(
    public readonly re: number,
    public readonly im: number,
  ) {}

  add(other: Complex): Complex {
    return new Complex(this.re + other.re, this.im + other.im);
  }

  sub(other: Complex): Complex {
    return new Complex(this.re - other.re, this.im - other.im);
  }

  mul(other: Complex): Complex {
    return new Complex(
      this.re * other.re - this.im * other.im,
      this.re * other.im + this.im * other.re,
    );
  }

  abs(): number {
    return Math.sqrt(this.re * this.re + this.im * this.im);
  }

  arg(): number {
    return Math.atan2(this.im, this.re);
  }

  isZero(): boolean {
    return this.re === 0 && this.im === 0;
  }

  equals(other: Complex, eps = 1e-10): boolean {
    return Math.abs(this.re - other.re) < eps && Math.abs(this.im - other.im) < eps;
  }

  toString(precision = 4): string {
    const fmt = (n: number): string => {
      if (isNaN(n)) return 'NaN';
      if (n === Infinity) return '∞';
      if (n === -Infinity) return '-∞';
      return `${round(n, precision)}`;
    };
    if (this.im === 0) return fmt(this.re);
    if (this.re === 0) return `${fmt(this.im)}i`;
    if (this.im < 0) return `${fmt(this.re)} − ${fmt(-this.im)}i`;
    return `${fmt(this.re)} + ${fmt(this.im)}i`;
  }

  static exp(z: Complex): Complex {
    // exp(a+bi) = e^a * (cos(b) + i*sin(b))
    const ea = Math.exp(z.re);
    // When ea is ±Infinity and im=0: Infinity * sin(0) = Infinity * 0 = NaN in JS.
    // For real input the result is always (ea, 0), so skip the trig multiplication.
    if (z.im === 0) return new Complex(ea, 0);
    return new Complex(ea * Math.cos(z.im), ea * Math.sin(z.im));
  }

  static ln(z: Complex): ComplexResult {
    // ln(0) = -∞ under the extended real conventions used in the paper.
    // JavaScript naturally gives Math.log(0) = -Infinity, which propagates
    // correctly through exp: exp(-Infinity) = 0.
    const re = Math.log(z.abs());
    const im = z.arg();
    if (isNaN(re) || isNaN(im)) {
      return { ok: false, reason: 'ln: 計算できない値 (NaN)' };
    }
    // ln(a+bi) = ln|z| + i*arg(z)
    return { ok: true, value: new Complex(re, im) };
  }
}

export type ComplexResult =
  | { ok: true; value: Complex }
  | { ok: false; reason: string };

function round(n: number, precision: number): number {
  const factor = Math.pow(10, precision);
  return Math.round(n * factor) / factor;
}

// well-known input constants
export const C_ONE = new Complex(1, 0);
export const C_ZERO = new Complex(0, 0);
