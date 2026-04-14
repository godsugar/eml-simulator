import { Complex, ComplexResult, C_ONE } from './complex';

// ---------------- Expression Tree ----------------

export type Expr =
  | { type: 'one' }
  | { type: 'var' }
  | { type: 'eml'; left: Slot; right: Slot };

export type Slot = Expr | { type: 'empty' };

export function isComplete(slot: Slot): slot is Expr {
  if (slot.type === 'empty') return false;
  if (slot.type === 'eml') {
    return isComplete(slot.left) && isComplete(slot.right);
  }
  return true;
}

// ---------------- Evaluation ----------------

export type EvalTrace = {
  expr: Expr;
  result: ComplexResult;
  children?: { left: EvalTrace; right: EvalTrace; expLeft: ComplexResult; lnRight: ComplexResult };
};

export function evaluate(expr: Expr, x: Complex): EvalTrace {
  if (expr.type === 'one') {
    return { expr, result: { ok: true, value: C_ONE } };
  }
  if (expr.type === 'var') {
    return { expr, result: { ok: true, value: x } };
  }

  // eml node — both sides must be complete (caller must check isComplete)
  const leftExpr = expr.left as Expr;
  const rightExpr = expr.right as Expr;

  const leftTrace = evaluate(leftExpr, x);
  const rightTrace = evaluate(rightExpr, x);

  if (!leftTrace.result.ok) {
    return { expr, result: leftTrace.result };
  }
  if (!rightTrace.result.ok) {
    return { expr, result: rightTrace.result };
  }

  const expLeft = Complex.exp(leftTrace.result.value);
  const lnRight = Complex.ln(rightTrace.result.value);

  if (!lnRight.ok) {
    return {
      expr,
      result: lnRight,
      children: {
        left: leftTrace,
        right: rightTrace,
        expLeft: { ok: true, value: expLeft },
        lnRight,
      },
    };
  }

  const result = expLeft.sub(lnRight.value);
  return {
    expr,
    result: { ok: true, value: result },
    children: {
      left: leftTrace,
      right: rightTrace,
      expLeft: { ok: true, value: expLeft },
      lnRight,
    },
  };
}

// ---------------- Utilities ----------------

export function exprToString(slot: Slot): string {
  if (slot.type === 'empty') return '_';
  if (slot.type === 'one') return '1';
  if (slot.type === 'var') return 'x';
  return `eml(${exprToString(slot.left)}, ${exprToString(slot.right)})`;
}

export function leafCount(slot: Slot): number {
  if (slot.type === 'empty') return 0;
  if (slot.type === 'one' || slot.type === 'var') return 1;
  return leafCount(slot.left) + leafCount(slot.right);
}

export function depth(slot: Slot): number {
  if (slot.type === 'empty' || slot.type === 'one' || slot.type === 'var') return 0;
  return 1 + Math.max(depth(slot.left), depth(slot.right));
}

// Path into the tree: array of 'left' | 'right'
export type Path = ('left' | 'right')[];

const MAX_DEPTH = 200;

export function setSlot(root: Slot, path: Path, value: Slot): Slot {
  // Reject if inserting value would push total tree depth over the limit.
  // path.length is the nesting level of the insertion point.
  if (path.length + depth(value) > MAX_DEPTH) return root;

  if (path.length === 0) return value;
  if (root.type !== 'eml') return root;
  const [head, ...rest] = path;
  if (head === 'left') {
    return { ...root, left: setSlot(root.left, rest, value) };
  } else {
    return { ...root, right: setSlot(root.right, rest, value) };
  }
}
