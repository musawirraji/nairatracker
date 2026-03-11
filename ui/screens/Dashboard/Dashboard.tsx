'use client';
import { useRouter }    from 'next/navigation';
import { T }            from '@/ui/tokens';
import { fmt }          from '@/ui/utils';
import { Card }         from '@/ui/components/Card/Card';
import { BarChart }     from '@/ui/components/BarChart/BarChart';
import { DonutChart }   from '@/ui/components/DonutChart/DonutChart';
import { Spinner }      from '@/ui/components/Spinner/Spinner';
import { EmptyState }   from '@/ui/components/EmptyState/EmptyState';
import { Transaction, CATEGORY_COLORS } from '@/domain/transaction/Transaction';
import { transactionService }           from '@/domain/transaction/transactionService';
import { goalService }                  from '@/domain/goal/Goal';

interface Props { txns: Transaction[]; goal: number; loading: boolean; }

function SectionLabel({ children }: { children: string }) {
  return (
    <div style={{ fontSize: 9, letterSpacing: '0.22em', color: T.color.dim, marginBottom: 14, fontWeight: 600 }}>
      {children}
    </div>
  );
}

function StatCard({ label, value, color, sub }: { label: string; value: number; color: string; sub?: string }) {
  return (
    <Card style={{ padding: T.s.lg }}>
      <div style={{ fontSize: 9, letterSpacing: '0.2em', color: T.color.dim, marginBottom: 10, fontWeight: 600 }}>
        {label}
      </div>
      <div style={{ fontSize: T.f.xl, fontWeight: 800, color }}>{fmt(value)}</div>
      {sub && (
        <div style={{ fontSize: 10, color: T.color.dim, marginTop: 4 }}>{sub}</div>
      )}
    </Card>
  );
}

function BreakdownList({ items, color }: { items: ReturnType<typeof transactionService.categoryBreakdown>; color: string }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 9 }}>
      {items.map(({ category, amount, color: c }) => (
        <div key={category} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: 2, background: c, flexShrink: 0 }} />
          <div style={{ flex: 1, fontSize: 11, color: T.color.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {category}
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, color, flexShrink: 0 }}>{fmt(amount)}</div>
        </div>
      ))}
    </div>
  );
}

export function Dashboard({ txns, goal, loading }: Props) {
  const router = useRouter();

  if (loading) return <Spinner fullPage />;

  // Empty state — no transactions yet
  if (txns.length === 0) {
    return (
      <div style={{ padding: 16 }}>
        <EmptyState
          icon="₦"
          title="Nothing tracked yet"
          body="Your goal tracker and charts will come alive as you log your income and expenses."
          action={{ label: '+ RECORD FIRST TRANSACTION', onClick: () => router.push('/add') }}
        />
      </div>
    );
  }

  const net       = transactionService.net(txns);
  const totalIn   = transactionService.totalIn(txns);
  const totalOut  = transactionService.totalOut(txns);
  const projected = transactionService.projectYearEnd(txns);
  const progress  = goalService.progress(net, goal);
  const onTrack   = goalService.isOnTrack(projected, goal);
  const gap       = goalService.gap(projected, goal);
  const mthTxns   = transactionService.thisMonthTxns(txns);
  const mthNet    = transactionService.net(mthTxns);
  const summaries = transactionService.monthlySummaries(txns, 6);
  const expBreak  = transactionService.categoryBreakdown(txns, 'out', CATEGORY_COLORS);
  const incBreak  = transactionService.categoryBreakdown(txns, 'in',  CATEGORY_COLORS);

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* Goal Hero */}
      <Card accent style={{ background: 'linear-gradient(135deg,#111108 0%,#0A0A18 100%)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, background: 'radial-gradient(circle,rgba(255,208,50,0.12) 0%,transparent 65%)', borderRadius: '50%', pointerEvents: 'none' }} />
        <SectionLabel>{new Date().getFullYear()} GOAL</SectionLabel>
        <div style={{ fontSize: T.f['4xl'], fontWeight: 800, letterSpacing: '-0.04em', marginBottom: 2 }}>{fmt(net)}</div>
        <div style={{ fontSize: T.f.sm, color: T.color.soft, marginBottom: 20 }}>net saved of {fmt(goal)} target</div>

        <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 6, height: 8, marginBottom: 8, overflow: 'hidden' }}>
          <div style={{ width: `${progress}%`, height: '100%', background: `linear-gradient(90deg,${T.color.gold},#FF9800)`, borderRadius: 6, boxShadow: `0 0 16px rgba(255,208,50,0.5)`, transition: 'width 0.9s cubic-bezier(0.4,0,0.2,1)' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: T.f.xs, marginBottom: 18 }}>
          <span style={{ color: T.color.gold, fontWeight: 700 }}>{progress.toFixed(2)}%</span>
          <span style={{ color: T.color.soft }}>{fmt(goal - net)} remaining</span>
        </div>

        <div style={{ padding: '14px 16px', background: 'rgba(255,208,50,0.06)', borderRadius: T.r.md, border: '1px solid rgba(255,208,50,0.12)' }}>
          <div style={{ fontSize: 10, color: T.color.dim, letterSpacing: '0.14em', marginBottom: 6, fontWeight: 600 }}>
            PROJECTED — DEC {new Date().getFullYear()}
          </div>
          <div style={{ fontSize: T.f['2xl'], fontWeight: 800, color: onTrack ? T.color.green : T.color.gold }}>{fmt(projected)}</div>
          <div style={{ fontSize: T.f.xs, marginTop: 4, color: onTrack ? T.color.green : T.color.red }}>
            {onTrack ? '✓ On track to hit your goal' : `${fmt(gap)} gap — push harder`}
          </div>
        </div>
      </Card>

      {/* This month — net savings + breakdown */}
      <Card>
        <SectionLabel>THIS MONTH</SectionLabel>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: T.f['2xl'], fontWeight: 800, color: mthNet >= 0 ? T.color.green : T.color.red }}>
              {mthNet >= 0 ? '+' : ''}{fmt(mthNet)}
            </div>
            <div style={{ fontSize: T.f.xs, color: T.color.soft, marginTop: 3 }}>net this month</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: T.f.sm, fontWeight: 700, color: T.color.green }}>+{fmt(transactionService.totalIn(mthTxns))}</div>
            <div style={{ fontSize: T.f.sm, fontWeight: 700, color: T.color.red }}>−{fmt(transactionService.totalOut(mthTxns))}</div>
          </div>
        </div>
      </Card>

      {/* All time */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <StatCard label="TOTAL IN"  value={totalIn}  color={T.color.green} />
        <StatCard label="TOTAL OUT" value={totalOut} color={T.color.red}   />
      </div>

      {/* Bar chart */}
      {summaries.length > 0 && (
        <Card>
          <SectionLabel>MONTHLY OVERVIEW</SectionLabel>
          <BarChart summaries={summaries} />
        </Card>
      )}

      {/* Expense breakdown */}
      {expBreak.length > 0 && (
        <Card>
          <SectionLabel>SPENDING BREAKDOWN</SectionLabel>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <DonutChart slices={expBreak} size={110} />
            <BreakdownList items={expBreak} color={T.color.red} />
          </div>
        </Card>
      )}

      {/* Income breakdown */}
      {incBreak.length > 0 && (
        <Card>
          <SectionLabel>INCOME SOURCES</SectionLabel>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <DonutChart slices={incBreak} size={110} />
            <BreakdownList items={incBreak} color={T.color.green} />
          </div>
        </Card>
      )}

    </div>
  );
}
