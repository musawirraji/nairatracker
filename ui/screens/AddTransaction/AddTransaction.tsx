'use client';
import { useRef, useEffect, useState } from 'react';
import { T } from '@/ui/tokens';
import { Card } from '@/ui/components/Card/Card';
import { Button } from '@/ui/components/Button/Button';
import { Input } from '@/ui/components/Input/Input';
import { FormState } from '@/ui/types';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '@/domain/transaction/Transaction';

interface Props {
  form:       FormState;
  setForm:    React.Dispatch<React.SetStateAction<FormState>>;
  onSubmit:   () => Promise<void>;
  submitting: boolean;
  // shown after successful save — replaces form with a success screen
  saved?:     boolean;
  onAddAnother?: () => void;
  onGoBack?:     () => void;
}

// Format raw number string for display: 1000000 → 1,000,000
function formatAmountDisplay(raw: string): string {
  if (!raw) return '';
  const n = parseFloat(raw.replace(/,/g, ''));
  if (isNaN(n)) return raw;
  return n.toLocaleString('en-NG');
}

export function AddTransaction({ form, setForm, onSubmit, submitting, saved, onAddAnother, onGoBack }: Props) {
  const amtRef = useRef<HTMLInputElement>(null);
  // Raw numeric string for input value; display string shown to user
  const [rawAmount, setRawAmount] = useState(form.amount);

  useEffect(() => {
    // Auto-focus amount field when screen opens
    setTimeout(() => amtRef.current?.focus(), 120);
  }, []);

  // Keep form.amount and rawAmount in sync when form resets from outside
  useEffect(() => {
    if (form.amount === '') setRawAmount('');
  }, [form.amount]);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm(f => ({ ...f, [k]: v }));

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Strip commas so parseFloat works — store clean number string in form
    const clean = e.target.value.replace(/,/g, '');
    setRawAmount(clean);
    set('amount', clean);
  };

  const cats   = form.type === 'in' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const accent = form.type === 'in' ? T.color.green : T.color.red;

  // ── Success screen — shown after save ─────────────────────────────────────
  if (saved) {
    return (
      <div style={{ padding: 16 }}>
        <Card style={{ textAlign: 'center', padding: '40px 24px' }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: form.type === 'in' ? T.color.greenDim : 'rgba(255,208,50,0.1)',
            border: `2px solid ${form.type === 'in' ? 'rgba(0,230,118,0.3)' : 'rgba(255,208,50,0.3)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
            fontSize: 32,
          }}>
            {form.type === 'in' ? '🎉' : '✓'}
          </div>

          <div style={{ fontSize: T.f.lg, fontWeight: 800, color: T.color.text, marginBottom: 8 }}>
            {form.type === 'in' ? 'Income recorded!' : 'Expense logged!'}
          </div>
          <div style={{ fontSize: T.f.sm, color: T.color.soft, marginBottom: 32, lineHeight: 1.6 }}>
            Your transaction has been saved successfully.
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Button full onClick={onAddAnother} style={{ background: accent }}>
              + ADD ANOTHER
            </Button>
            <Button full variant="secondary" onClick={onGoBack}>
              ← BACK TO DASHBOARD
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // ── Main form ──────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: '16px' }}>
      <Card>
        {/* Type toggle */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 22 }}>
          {(['in', 'out'] as const).map(t => (
            <button
              key={t}
              onClick={() => setForm(f => ({ ...f, type: t, category: '' }))}
              onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.97)')}
              onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
              onTouchStart={e => (e.currentTarget.style.transform = 'scale(0.97)')}
              onTouchEnd={e => (e.currentTarget.style.transform = 'scale(1)')}
              style={{
                flex: 1, padding: 13,
                background: form.type === t ? (t === 'in' ? T.color.green : T.color.red) : 'rgba(255,255,255,0.04)',
                color: form.type === t ? '#fff' : T.color.soft,
                border: 'none', borderRadius: T.r.md, fontWeight: 800,
                fontSize: T.f.xs, letterSpacing: '0.1em', cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all 0.2s, transform 0.12s cubic-bezier(0.4,0,0.2,1)',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {t === 'in' ? '↑ INCOME' : '↓ EXPENSE'}
            </button>
          ))}
        </div>

        {/* Amount with ₦ prefix */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: T.f.xs, letterSpacing: '0.2em', color: T.color.dim, marginBottom: 8, fontWeight: 600 }}>
            AMOUNT
          </div>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span style={{
              position: 'absolute', left: 16,
              fontSize: 28, fontWeight: 800,
              color: T.color.gold, lineHeight: 1,
              pointerEvents: 'none',
              userSelect: 'none',
            }}>₦</span>
            <input
              ref={amtRef}
              type="text"
              inputMode="decimal"
              placeholder="0"
              value={formatAmountDisplay(rawAmount)}
              onChange={handleAmountChange}
              // scrollIntoView keeps the field above keyboard on mobile
              onFocus={e => setTimeout(() => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300)}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: T.r.md,
                padding: '14px 16px 14px 44px',
                color: T.color.text,
                fontSize: 32, fontWeight: 800,
                outline: 'none',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
              }}
            />
          </div>
        </div>

        {/* Categories */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: T.f.xs, letterSpacing: '0.2em', color: T.color.dim, marginBottom: 10, fontWeight: 600 }}>
            CATEGORY
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {cats.map(cat => (
              <button
                key={cat}
                onClick={() => set('category', cat)}
                onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.94)')}
                onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
                onTouchStart={e => (e.currentTarget.style.transform = 'scale(0.94)')}
                onTouchEnd={e => (e.currentTarget.style.transform = 'scale(1)')}
                style={{
                  padding: '8px 14px',
                  background: form.category === cat ? accent : 'rgba(255,255,255,0.04)',
                  color: form.category === cat ? '#fff' : T.color.soft,
                  border: `1px solid ${form.category === cat ? 'transparent' : 'rgba(255,255,255,0.07)'}`,
                  borderRadius: T.r.sm, cursor: 'pointer',
                  fontSize: T.f.xs, fontWeight: 600,
                  fontFamily: 'inherit',
                  transition: 'all 0.15s, transform 0.1s cubic-bezier(0.4,0,0.2,1)',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <Input
          label="NOTE (optional)"
          placeholder="What's this for?"
          value={form.note}
          onChange={v => set('note', v)}
          style={{ marginBottom: 18 }}
        />

        <div style={{ marginBottom: 26 }}>
          <div style={{ fontSize: T.f.xs, letterSpacing: '0.2em', color: T.color.dim, marginBottom: 8, fontWeight: 600 }}>
            DATE
          </div>
          <input
            type="date"
            value={form.date}
            onChange={e => set('date', e.target.value)}
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: T.r.md, padding: '11px 14px',
              color: T.color.text, fontSize: T.f.sm,
              outline: 'none', fontFamily: 'inherit',
              colorScheme: 'dark',
            }}
          />
        </div>

        <Button
          full
          onClick={onSubmit}
          disabled={submitting}
          style={{ background: accent, fontSize: T.f.sm, letterSpacing: '0.1em' }}
        >
          {submitting ? 'Saving…' : form.type === 'in' ? 'RECORD INCOME' : 'RECORD EXPENSE'}
        </Button>
      </Card>
    </div>
  );
}
