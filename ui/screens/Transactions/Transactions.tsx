'use client';
import { useState, useRef, useCallback } from 'react';
import { T } from '@/ui/tokens';
import { fmt, monthLabel } from '@/ui/utils';
import { Button } from '@/ui/components/Button/Button';
import { Badge } from '@/ui/components/Badge/Badge';
import { EmptyState } from '@/ui/components/EmptyState/EmptyState';
import { ConfirmDialog } from '@/ui/components/ConfirmDialog/ConfirmDialog';
import { BottomSheet } from '@/ui/components/BottomSheet/BottomSheet';
import { Input } from '@/ui/components/Input/Input';
import { Transaction, CATEGORY_COLORS, INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '@/domain/transaction/Transaction';
import { transactionService } from '@/domain/transaction/transactionService';
import { UpdateTransactionDTO } from '@/infrastructure/supabase/repositories/transactionRepository';

type Filter = 'all' | 'in' | 'out';

interface Props {
  txns:       Transaction[];
  onDelete:   (id: string) => Promise<void>;
  onUpdate:   (id: string, dto: UpdateTransactionDTO) => Promise<void>;
  onExport:   () => void;
  onAddClick: () => void;
}

interface EditState {
  id: string; type: 'in' | 'out';
  amount: string; category: string; note: string; date: string;
}

function Label({ text }: { text: string }) {
  return (
    <div style={{ fontSize: 9, letterSpacing: '0.2em', color: T.color.dim, marginBottom: 10, fontWeight: 600 }}>
      {text}
    </div>
  );
}

// ─── Transaction row with long-press to edit ──────────────────────────────────

function TxnRow({
  t, balance, onLongPress, onDelete,
}: {
  t:           Transaction;
  balance:     number;
  onLongPress: (t: Transaction) => void;
  onDelete:    (id: string) => void;
}) {
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [pressing, setPressing] = useState(false);

  const startPress = useCallback(() => {
    setPressing(true);
    pressTimer.current = setTimeout(() => {
      setPressing(false);
      onLongPress(t);
      // Haptic feedback on devices that support it
      if (navigator.vibrate) navigator.vibrate(40);
    }, 500);
  }, [t, onLongPress]);

  const cancelPress = useCallback(() => {
    if (pressTimer.current) clearTimeout(pressTimer.current);
    setPressing(false);
  }, []);

  return (
    <div
      onMouseDown={startPress}
      onMouseUp={cancelPress}
      onMouseLeave={cancelPress}
      onTouchStart={startPress}
      onTouchEnd={cancelPress}
      onTouchMove={cancelPress}
      style={{
        background: pressing ? 'rgba(255,208,50,0.05)' : T.color.surface,
        border: `1px solid ${pressing ? 'rgba(255,208,50,0.25)' : T.color.border}`,
        borderLeft: `3px solid ${CATEGORY_COLORS[t.category] || (t.type === 'in' ? T.color.green : T.color.red)}`,
        borderRadius: T.r.lg,
        padding: '13px 14px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 12,
        transition: 'background 0.15s, border-color 0.15s',
        cursor: 'pointer',
        WebkitTapHighlightColor: 'transparent',
        userSelect: 'none',
      }}
    >
      {/* Left: category + note + meta */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
          <span style={{ fontSize: T.f.sm, fontWeight: 700, color: T.color.text }}>{t.category}</span>
          {t.source === 'auto' && <Badge label="AUTO" />}
        </div>
        {t.note && (
          <div style={{ fontSize: T.f.xs, color: T.color.soft, marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {t.note}
          </div>
        )}
        <div style={{ display: 'flex', gap: 10 }}>
          <span style={{ fontSize: 10, color: T.color.dim }}>{t.date}</span>
          <span style={{ fontSize: 10, color: balance >= 0 ? 'rgba(0,230,118,0.45)' : 'rgba(255,61,87,0.45)' }}>
            bal {fmt(balance)}
          </span>
        </div>
      </div>

      {/* Right: amount + delete */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
        <div style={{ fontSize: T.f.md, fontWeight: 800, color: t.type === 'in' ? T.color.green : T.color.red }}>
          {t.type === 'in' ? '+' : '−'}{fmt(t.amount)}
        </div>
        <button
          onClick={e => { e.stopPropagation(); onDelete(t.id); }}
          onMouseDown={e => e.stopPropagation()}
          onTouchStart={e => e.stopPropagation()}
          style={{
            background: T.color.redDim, border: 'none',
            color: T.color.red, cursor: 'pointer',
            fontSize: 14, borderRadius: T.r.sm,
            padding: '3px 8px', fontFamily: 'inherit',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export function Transactions({ txns, onDelete, onUpdate, onExport, onAddClick }: Props) {
  const [filter,   setFilter]   = useState<Filter>('all');
  const [search,   setSearch]   = useState('');
  const [month,    setMonth]    = useState('');
  const [delId,    setDelId]    = useState<string | null>(null);
  const [edit,     setEdit]     = useState<EditState | null>(null);
  const [saving,   setSaving]   = useState(false);
  const [deleting, setDeleting] = useState(false);

  const filtered = txns.filter(t => {
    if (filter !== 'all' && t.type !== filter) return false;
    if (month && !t.date.startsWith(month)) return false;
    if (search) {
      const q = search.toLowerCase();
      return t.category.toLowerCase().includes(q) || (t.note || '').toLowerCase().includes(q);
    }
    return true;
  });

  const net    = filtered.reduce((s, t) => s + (t.type === 'in' ? t.amount : -t.amount), 0);
  const groups = transactionService.groupByMonth(filtered);
  const months = Object.keys(groups).sort().reverse();

  // Running balance across ALL txns (not just filtered)
  const allSorted = [...txns].sort((a, b) => a.date.localeCompare(b.date) || a.created_at.localeCompare(b.created_at));
  const runningMap = new Map<string, number>();
  let running = 0;
  allSorted.forEach(t => {
    running += t.type === 'in' ? t.amount : -t.amount;
    runningMap.set(t.id, running);
  });

  const confirmDelete = async () => {
    if (!delId) return;
    setDeleting(true);
    try { await onDelete(delId); }
    finally { setDeleting(false); setDelId(null); }
  };

  const openEdit = useCallback((t: Transaction) => {
    setEdit({ id: t.id, type: t.type, amount: t.amount.toString(), category: t.category, note: t.note || '', date: t.date });
  }, []);

  const saveEdit = async () => {
    if (!edit) return;
    const amount = parseFloat(edit.amount);
    if (!amount || amount <= 0 || !edit.category) return;
    setSaving(true);
    try {
      await onUpdate(edit.id, { type: edit.type, amount, category: edit.category, note: edit.note, date: edit.date });
      setEdit(null);
    } finally {
      setSaving(false);
    }
  };

  const editCats   = edit?.type === 'in' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const editAccent = edit?.type === 'in' ? T.color.green : T.color.red;

  if (txns.length === 0) {
    return (
      <div style={{ padding: 16 }}>
        <EmptyState
          icon="₦"
          title="No transactions yet"
          body="Every naira in and out goes here. Start by recording your first transaction."
          action={{ label: '+ ADD FIRST', onClick: onAddClick }}
        />
      </div>
    );
  }

  return (
    <div style={{ padding: 16 }}>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        {(['all', 'in', 'out'] as Filter[]).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '8px 14px',
            background: filter === f ? T.color.gold : 'rgba(255,255,255,0.04)',
            color: filter === f ? '#0A0A0F' : T.color.soft,
            border: 'none', borderRadius: T.r.sm,
            cursor: 'pointer', fontSize: T.f.xs, fontWeight: 700,
            letterSpacing: '0.1em', fontFamily: 'inherit',
            transition: 'all 0.15s',
            WebkitTapHighlightColor: 'transparent',
          }}>
            {f === 'all' ? 'All' : f === 'in' ? '↑ Income' : '↓ Expenses'}
          </button>
        ))}
        <Button small variant="secondary" onClick={onExport} style={{ marginLeft: 'auto' }}>
          ↓ CSV
        </Button>
      </div>

      {/* Search + month */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input
          placeholder="Search…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: `1px solid ${T.color.border}`, borderRadius: T.r.md, padding: '10px 14px', color: T.color.text, fontSize: T.f.sm, outline: 'none', fontFamily: 'inherit' }}
        />
        <input
          type="month"
          value={month}
          onChange={e => setMonth(e.target.value)}
          style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${T.color.border}`, borderRadius: T.r.md, padding: '10px 12px', color: month ? T.color.text : T.color.dim, fontSize: T.f.sm, outline: 'none', fontFamily: 'inherit', colorScheme: 'dark' }}
        />
      </div>

      {/* Summary */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: T.r.md, border: `1px solid ${T.color.border}`, marginBottom: 16 }}>
        <span style={{ fontSize: T.f.xs, color: T.color.soft }}>
          {filtered.length} transaction{filtered.length !== 1 ? 's' : ''}
        </span>
        <span style={{ fontSize: T.f.sm, fontWeight: 800, color: net >= 0 ? T.color.green : T.color.red }}>
          {net >= 0 ? '+' : ''}{fmt(net)}
        </span>
      </div>

      {/* Long-press hint — shown only when there are transactions */}
      <div style={{ fontSize: 10, color: T.color.dim, textAlign: 'center', marginBottom: 12, letterSpacing: '0.06em' }}>
        Hold a transaction to edit
      </div>

      {filtered.length === 0 && (
        <EmptyState icon="🔍" title="No results" body="Nothing matches your filters. Try clearing the search or changing the month." />
      )}

      {/* Transaction list */}
      {months.map(m => {
        const mTxns = groups[m];
        return (
          <div key={m} style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ fontSize: T.f.xs, fontWeight: 700, color: T.color.gold, letterSpacing: '0.12em' }}>
                {monthLabel(m)}
              </div>
              <div style={{ display: 'flex', gap: 12, fontSize: T.f.xs }}>
                <span style={{ color: T.color.green }}>+{fmt(transactionService.totalIn(mTxns))}</span>
                <span style={{ color: T.color.red }}>−{fmt(transactionService.totalOut(mTxns))}</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {mTxns.map(t => (
                <TxnRow
                  key={t.id}
                  t={t}
                  balance={runningMap.get(t.id) ?? 0}
                  onLongPress={openEdit}
                  onDelete={id => setDelId(id)}
                />
              ))}
            </div>
          </div>
        );
      })}

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!delId}
        title="Delete transaction?"
        message="This can't be undone. The transaction will be permanently removed."
        confirmLabel={deleting ? 'Deleting…' : 'Delete'}
        danger
        onConfirm={confirmDelete}
        onCancel={() => setDelId(null)}
      />

      {/* Edit sheet — opens on long press */}
      <BottomSheet open={!!edit} onClose={() => setEdit(null)} title="Edit Transaction">
        {edit && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Type toggle */}
            <div style={{ display: 'flex', gap: 8 }}>
              {(['in', 'out'] as const).map(t => (
                <button key={t}
                  onClick={() => setEdit(e => e ? { ...e, type: t, category: '' } : e)}
                  style={{ flex: 1, padding: 11, background: edit.type === t ? (t === 'in' ? T.color.green : T.color.red) : 'rgba(255,255,255,0.04)', color: edit.type === t ? '#fff' : T.color.soft, border: 'none', borderRadius: T.r.md, fontWeight: 800, fontSize: T.f.xs, letterSpacing: '0.08em', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>
                  {t === 'in' ? '↑ Income' : '↓ Expense'}
                </button>
              ))}
            </div>

            <div>
              <Label text="AMOUNT (₦)" />
              <input
                type="number" inputMode="decimal"
                value={edit.amount}
                onChange={e => setEdit(p => p ? { ...p, amount: e.target.value } : p)}
                style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: T.r.md, padding: '12px 16px', color: T.color.text, fontSize: 28, fontWeight: 800, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
              />
            </div>

            <div>
              <Label text="CATEGORY" />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {editCats.map(cat => (
                  <button key={cat}
                    onClick={() => setEdit(p => p ? { ...p, category: cat } : p)}
                    style={{ padding: '7px 12px', background: edit.category === cat ? editAccent : 'rgba(255,255,255,0.04)', color: edit.category === cat ? '#fff' : T.color.soft, border: `1px solid ${edit.category === cat ? 'transparent' : 'rgba(255,255,255,0.07)'}`, borderRadius: T.r.sm, cursor: 'pointer', fontSize: T.f.xs, fontWeight: 600, fontFamily: 'inherit', transition: 'all 0.12s' }}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <Input label="NOTE (optional)" placeholder="What's this for?" value={edit.note} onChange={v => setEdit(p => p ? { ...p, note: v } : p)} />

            <div>
              <Label text="DATE" />
              <input
                type="date" value={edit.date}
                onChange={e => setEdit(p => p ? { ...p, date: e.target.value } : p)}
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: T.r.md, padding: '11px 14px', color: T.color.text, fontSize: T.f.sm, outline: 'none', fontFamily: 'inherit', colorScheme: 'dark' }}
              />
            </div>

            <Button full onClick={saveEdit} disabled={saving || !edit.category || !edit.amount} style={{ background: editAccent }}>
              {saving ? 'Saving…' : 'SAVE CHANGES'}
            </Button>
          </div>
        )}
      </BottomSheet>
    </div>
  );
}
