import { Complex } from './complex';
import { Expr, isComplete, evaluate } from './expr';
import { PRESETS } from './presets';

const TOLERANCE = 1e-6;
const MIN_VALID_POINTS = 3;

// Sample points: mix of (0,1) range (covers arcsin/arccos domain) and larger values
const SAMPLE_POINTS = [0.2, 0.4, 0.6, 0.8, 0.9, 0.3, 0.7, 1.0, 1.5, 2.0];

export type MatchResult = {
  candidate: { label: string; description: string };
  maxError: number;
  matched: boolean;
};

export function identifyFunction(expr: Expr): MatchResult[] {
  const results: MatchResult[] = [];

  for (const preset of PRESETS) {
    if (!isComplete(preset.expr) || preset.category === 'その他') continue;

    const candidateExpr = preset.expr as Expr;
    let maxError = 0;
    let validPoints = 0;

    for (const xVal of SAMPLE_POINTS) {
      const expected = evaluate(candidateExpr, new Complex(xVal, 0));
      if (!expected.result.ok) continue; // this candidate has no value here — skip point

      const got = evaluate(expr, new Complex(xVal, 0));
      if (!got.result.ok) continue; // input expression has no value here — skip point

      const errRe = Math.abs(got.result.value.re - expected.result.value.re);
      const errIm = Math.abs(got.result.value.im - expected.result.value.im);
      const err = Math.max(errRe, errIm);
      if (err > maxError) maxError = err;
      validPoints++;
    }

    if (validPoints < MIN_VALID_POINTS) continue;

    results.push({
      candidate: { label: preset.label, description: preset.description },
      maxError,
      matched: maxError < TOLERANCE,
    });
  }

  results.sort((a, b) => a.maxError - b.maxError);
  return results;
}

// Generate plot data for real x sweep
export type PlotPoint = {
  x: number;
  re: number | null;
  im: number | null;
};

export function generatePlotData(
  expr: Expr,
  xMin: number,
  xMax: number,
  steps = 200,
): PlotPoint[] {
  const points: PlotPoint[] = [];
  const dx = (xMax - xMin) / steps;

  for (let i = 0; i <= steps; i++) {
    const xVal = xMin + i * dx;
    const trace = evaluate(expr, new Complex(xVal, 0));
    if (!trace.result.ok) {
      points.push({ x: xVal, re: null, im: null });
    } else {
      const { re, im } = trace.result.value;
      // Clamp extreme values for display
      const clamp = (v: number) => (Math.abs(v) > 1e6 ? null : v);
      points.push({ x: xVal, re: clamp(re), im: clamp(im) });
    }
  }

  return points;
}
