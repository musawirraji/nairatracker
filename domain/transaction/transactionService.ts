import { Transaction, TxnType } from './Transaction';

export interface MonthlySummary {
  month:   string;
  label:   string;
  income:  number;
  expense: number;
  net:     number;
}

export interface CategoryBreakdown {
  category: string;
  amount:   number;
  color:    string;
  pct:      number;
}

const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export const transactionService = {

  totalIn: (txns: Transaction[]) =>
    txns.filter(t => t.type === 'in').reduce((s, t) => s + t.amount, 0),

  totalOut: (txns: Transaction[]) =>
    txns.filter(t => t.type === 'out').reduce((s, t) => s + t.amount, 0),

  net: (txns: Transaction[]) =>
    transactionService.totalIn(txns) - transactionService.totalOut(txns),

  thisMonthTxns: (txns: Transaction[]) => {
    const prefix = new Date().toISOString().slice(0, 7);
    return txns.filter(t => t.date.startsWith(prefix));
  },

  projectYearEnd: (txns: Transaction[]) => {
    const net      = transactionService.net(txns);
    const months   = new Set(txns.map(t => t.date.slice(0, 7))).size || 1;
    const remaining = 12 - new Date().getMonth();
    return net + (net / months) * remaining;
  },

  monthlySummaries: (txns: Transaction[], count = 6): MonthlySummary[] => {
    const map: Record<string, { income: number; expense: number }> = {};
    txns.forEach(t => {
      const m = t.date.slice(0, 7);
      if (!map[m]) map[m] = { income: 0, expense: 0 };
      if (t.type === 'in') map[m].income  += t.amount;
      else                 map[m].expense += t.amount;
    });
    return Object.keys(map).sort().slice(-count).map(m => ({
      month:   m,
      label:   MONTH_LABELS[parseInt(m.split('-')[1]) - 1],
      income:  map[m].income,
      expense: map[m].expense,
      net:     map[m].income - map[m].expense,
    }));
  },

  categoryBreakdown: (
    txns: Transaction[],
    type: TxnType,
    colors: Record<string, string>,
  ): CategoryBreakdown[] => {
    const totals: Record<string, number> = {};
    txns.filter(t => t.type === type).forEach(t => {
      totals[t.category] = (totals[t.category] || 0) + t.amount;
    });
    const total = Object.values(totals).reduce((s, v) => s + v, 0) || 1;
    return Object.entries(totals)
      .sort((a, b) => b[1] - a[1]).slice(0, 7)
      .map(([category, amount]) => ({
        category, amount,
        color: colors[category] || '#78909C',
        pct:   (amount / total) * 100,
      }));
  },

  groupByMonth: (txns: Transaction[]): Record<string, Transaction[]> =>
    txns.reduce((acc, t) => {
      const m = t.date.slice(0, 7);
      if (!acc[m]) acc[m] = [];
      acc[m].push(t);
      return acc;
    }, {} as Record<string, Transaction[]>),

  validateAmount: (raw: string): number | null => {
    const n = parseFloat(raw.replace(/,/g, ''));
    return (isNaN(n) || n <= 0 || n > 500_000_000) ? null : n;
  },
};
