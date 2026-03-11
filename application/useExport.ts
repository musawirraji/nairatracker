'use client';

import { Transaction } from '@/domain/transaction/Transaction';

export function useExport() {
  const exportCSV = (txns: Transaction[]) => {
    const rows = [
      ['Date', 'Type', 'Category', 'Amount (₦)', 'Note', 'Source'],
      ...txns.map(t => [t.date, t.type === 'in' ? 'Income' : 'Expense', t.category, t.amount.toString(), t.note || '', t.source]),
    ];
    const csv  = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `naira-tracker-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
  return { exportCSV };
}
