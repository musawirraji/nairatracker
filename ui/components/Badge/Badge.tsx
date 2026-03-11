'use client';
import { T } from '@/ui/tokens';

interface Props { label: string; color?: string; bg?: string; }

export function Badge({ label, color = T.color.gold, bg = T.color.goldDim }: Props) {
  return (
    <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', color, background: bg, padding: '2px 7px', borderRadius: T.r.sm }}>
      {label}
    </span>
  );
}
