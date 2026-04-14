'use client';

import { useRef, useState } from 'react';
import { Slot, Path } from '@/lib/expr';
import { PRESETS } from '@/lib/presets';
import { useLang } from '@/lib/i18n';

type Props = {
  slot: Slot;
  path: Path;
  onSetSlot: (path: Path, value: Slot) => void;
  compact?: boolean;
};

export function ExprNode({ slot, path, onSetSlot, compact = false }: Props) {
  const childProps = { onSetSlot, compact };
  const t = useLang();

  if (slot.type === 'empty') {
    return <EmptySlot onSelect={(s) => onSetSlot(path, s)} compact={compact} />;
  }

  if (slot.type === 'one') {
    return (
      <LeafChip
        label="1"
        color="bg-blue-100 border-blue-300 text-blue-800"
        compact={compact}
        onRemove={() => onSetSlot(path, { type: 'empty' })}
      />
    );
  }

  if (slot.type === 'var') {
    return (
      <LeafChip
        label="x"
        color="bg-green-100 border-green-300 text-green-800"
        compact={compact}
        onRemove={() => onSetSlot(path, { type: 'empty' })}
      />
    );
  }


  const colPad = compact ? undefined : 'px-0.5';
  const nodePad = compact ? 'px-1 py-0' : 'px-1.5 py-0.5';
  const trunkH = compact ? 'h-2' : 'h-3';

  return (
    <div className="flex flex-col items-center gap-0">
      {/* Node chip */}
      <div className={`relative flex items-center gap-0.5 bg-purple-100 border border-purple-300 rounded ${nodePad} text-purple-800 text-xs font-mono z-10`}>
        <span>eml</span>
        <button
          onClick={() => onSetSlot(path, { type: 'empty' })}
          className="text-gray-400 hover:text-red-500 leading-none text-xs"
          title={t.deleteNode}
        >
          ✕
        </button>
      </div>

      {/* Trunk */}
      <div className={`w-px ${trunkH} bg-gray-300`} />

      {/* Children with connecting lines */}
      <div className="flex items-start gap-0 relative">
        <HorizontalBridge />

        <div className={`flex flex-col items-center gap-0 ${colPad ?? ''}`} style={compact ? { padding: '0 1px' } : undefined}>
          <div className={`w-px ${trunkH} bg-gray-300`} />
          <ExprNode {...childProps} slot={slot.left} path={[...path, 'left']} />
        </div>

        <div className={`flex flex-col items-center gap-0 ${colPad ?? ''}`} style={compact ? { padding: '0 1px' } : undefined}>
          <div className={`w-px ${trunkH} bg-gray-300`} />
          <ExprNode {...childProps} slot={slot.right} path={[...path, 'right']} />
        </div>
      </div>
    </div>
  );
}

// A horizontal line that spans the full width of the children container,
// acting as the "fork" between left and right branches.
function HorizontalBridge() {
  return (
    <div
      className="pointer-events-none absolute top-0 left-0 right-0 h-px bg-gray-300"
      style={{ top: 0 }}
    />
  );
}

// ─── Cascading menu types ─────────────────────────────────────────────────────

type DropdownPos = { x: number; top: number } | { x: number; bottom: number };
type SubPos = { left: number; top: number };

const PRESET_CATEGORY_ORDER = [
  '定数',
  '指数・対数',
  '代数',
  '三角関数',
  '逆三角関数',
  '双曲線関数',
];

const groupedPresets = PRESETS.reduce<Record<string, typeof PRESETS>>((acc, p) => {
  if (p.category !== 'その他') (acc[p.category] ??= []).push(p);
  return acc;
}, {});

/** サブメニューの left/top を計算。画面右端・下端を超えないようクランプ */
function calcSubPos(anchorRect: DOMRect, submenuWidth = 140, maxMenuHeight = 240): SubPos {
  const openRight = anchorRect.right + submenuWidth + 8 <= window.innerWidth;
  const left = openRight ? anchorRect.right + 4 : anchorRect.left - submenuWidth - 4;
  // アンカーに合わせて開き、はみ出す分だけ上にずらす
  const overflow = anchorRect.top + maxMenuHeight + 8 - window.innerHeight;
  const top = overflow > 0 ? Math.max(8, anchorRect.top - overflow) : anchorRect.top;
  return { left, top };
}

// ─── EmptySlot ────────────────────────────────────────────────────────────────

function EmptySlot({ onSelect, compact = false }: { onSelect: (slot: Slot) => void; compact?: boolean }) {
  const t = useLang();
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<DropdownPos | null>(null);
  const [catMenuPos, setCatMenuPos] = useState<SubPos | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [presetMenuPos, setPresetMenuPos] = useState<SubPos | null>(null);

  const triggerRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const openMain = () => {
    clearTimeout(closeTimer.current);
    if (!open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      if (rect.bottom + 108 > window.innerHeight) {
        setPos({ x, bottom: window.innerHeight - rect.top + 4 });
      } else {
        setPos({ x, top: rect.bottom + 4 });
      }
      setOpen(true);
    } else {
      clearTimeout(closeTimer.current);
    }
  };

  const startClose = () => {
    closeTimer.current = setTimeout(() => {
      setOpen(false);
      setCatMenuPos(null);
      setActiveCategory(null);
      setPresetMenuPos(null);
    }, 200);
  };

  const close = () => {
    setOpen(false);
    setCatMenuPos(null);
    setActiveCategory(null);
    setPresetMenuPos(null);
  };

  const handlePresetHover = (e: React.MouseEvent<HTMLButtonElement>) => {
    // 6カテゴリ × 約32px ≈ 200px
    const sub = calcSubPos(e.currentTarget.getBoundingClientRect(), 130, 200);
    setCatMenuPos(sub);
    setActiveCategory(null);
    setPresetMenuPos(null);
  };

  const handleCategoryHover = (cat: string, e: React.MouseEvent<HTMLButtonElement>) => {
    setActiveCategory(cat);
    const itemCount = groupedPresets[cat]?.length ?? 0;
    const estimatedHeight = itemCount * 34 + 8;
    setPresetMenuPos(calcSubPos(e.currentTarget.getBoundingClientRect(), 130, estimatedHeight));
  };

  const menuClass =
    'flex flex-col bg-white border border-gray-200 rounded-lg shadow-lg overflow-y-auto';

  return (
    <div
      ref={triggerRef}
      onMouseEnter={openMain}
      onMouseLeave={startClose}
    >
      {/* _スロットチップ */}
      <div className={`border-2 border-dashed border-gray-300 rounded ${compact ? 'px-1 py-0' : 'px-1.5 py-0'} text-gray-400 text-xs font-mono cursor-pointer hover:border-indigo-400 hover:text-indigo-500 transition-colors select-none`}>
        _
      </div>

      {/* レベル1: 1 / x / eml / プリセット▶ */}
      {open && pos && (
        <div
          style={{
            position: 'fixed',
            left: pos.x,
            transform: 'translateX(-50%)',
            ...('top' in pos ? { top: pos.top } : { bottom: pos.bottom }),
            zIndex: 50,
          }}
          className={`${menuClass} min-w-[120px]`}
        >
          <button
            onClick={() => { onSelect({ type: 'one' }); close(); }}
            className="px-3 py-1.5 text-sm text-left hover:bg-blue-50 text-blue-700 font-mono"
          >
            1
          </button>
          <button
            onClick={() => { onSelect({ type: 'var' }); close(); }}
            className="px-3 py-1.5 text-sm text-left hover:bg-green-50 text-green-700 font-mono"
          >
            x
          </button>
          <button
            onClick={() => { onSelect({ type: 'eml', left: { type: 'empty' }, right: { type: 'empty' } }); close(); }}
            className="px-3 py-1.5 text-sm text-left hover:bg-purple-50 text-purple-700 font-mono"
          >
            eml(_, _)
          </button>
          <button
            onMouseEnter={handlePresetHover}
            className="px-3 py-1.5 text-sm text-left hover:bg-amber-50 text-amber-700 font-mono border-t border-gray-100 flex items-center justify-between gap-3"
          >
            <span>{t.preset}</span>
            <span className="text-xs">▶</span>
          </button>
        </div>
      )}

      {/* レベル2: カテゴリ一覧 */}
      {catMenuPos && (
        <div
          style={{
            position: 'fixed',
            left: catMenuPos.left,
            top: catMenuPos.top,
            zIndex: 51,
          }}
          className={`${menuClass} min-w-[130px]`}
        >
          {PRESET_CATEGORY_ORDER.filter((cat) => groupedPresets[cat]).map((cat) => (
            <button
              key={cat}
              onMouseEnter={(e) => handleCategoryHover(cat, e)}
              className={`px-3 py-1.5 text-sm text-left font-sans flex items-center justify-between gap-3 ${
                activeCategory === cat
                  ? 'bg-amber-50 text-amber-800'
                  : 'hover:bg-amber-50 text-gray-700'
              }`}
            >
              <span>{t.categories[cat] ?? cat}</span>
              <span className="text-xs text-gray-400">▶</span>
            </button>
          ))}
        </div>
      )}

      {/* レベル3: 関数一覧 */}
      {activeCategory && presetMenuPos && groupedPresets[activeCategory] && (
        <div
          style={{
            position: 'fixed',
            left: presetMenuPos.left,
            top: presetMenuPos.top,
            zIndex: 52,
            maxHeight: '70vh',
          }}
          className={`${menuClass} min-w-[120px]`}
        >
          {groupedPresets[activeCategory].map((preset) => (
            <button
              key={preset.label}
              onClick={() => { onSelect(preset.expr); close(); }}
              title={preset.description}
              className="px-3 py-1.5 text-sm text-left hover:bg-indigo-50 text-indigo-700 font-mono"
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── LeafChip ─────────────────────────────────────────────────────────────────

function LeafChip({
  label,
  subLabel,
  color,
  compact = false,
  onRemove,
}: {
  label: string;
  subLabel?: string;
  color: string;
  compact?: boolean;
  onRemove: () => void;
}) {
  const t = useLang();
  return (
    <div
      className={`inline-flex items-center gap-0.5 border rounded ${compact ? 'px-0.5 py-0' : 'px-1 py-0'} text-xs font-mono ${color}`}
    >
      <span>{label}</span>
      {subLabel && <span className="text-xs opacity-60">{subLabel}</span>}
      <button
        onClick={onRemove}
        className="text-gray-400 hover:text-red-500 ml-0.5 leading-none text-xs"
        title={t.deleteNode}
      >
        ✕
      </button>
    </div>
  );
}
