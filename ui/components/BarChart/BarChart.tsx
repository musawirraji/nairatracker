'use client';
import { T } from '@/ui/tokens';
import { MonthlySummary } from '@/domain/transaction/transactionService';

export function BarChart({ summaries }: { summaries: MonthlySummary[] }) {
  if (!summaries.length) return null;
  const max = Math.max(...summaries.map(s => Math.max(s.income, s.expense)), 1);
  return (
    <div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', height: 90 }}>
        {summaries.map(s => (
          <div key={s.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: 80 }}>
              <div style={{ width: 10, height: Math.max((s.income  / max) * 80, 3), background: T.color.green, borderRadius: '3px 3px 0 0' }} />
              <div style={{ width: 10, height: Math.max((s.expense / max) * 80, 3), background: T.color.red,   borderRadius: '3px 3px 0 0' }} />
            </div>
            <div style={{ fontSize: 9, color: T.color.dim }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
        {[{ c: T.color.green, l: 'Income' }, { c: T.color.red, l: 'Expenses' }].map(({ c, l }) => (
          <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: T.color.dim }}>
            <div style={{ width: 8, height: 8, background: c, borderRadius: 2 }} />{l}
          </div>
        ))}
      </div>
    </div>
  );
}
