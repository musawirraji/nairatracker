'use client';
import { T } from '@/ui/tokens';

interface Props { size?: number; fullPage?: boolean; }

export function Spinner({ size = 36, fullPage = false }: Props) {
  const el = (
    <div style={{
      width: size, height: size,
      border: `3px solid ${T.color.gold}`,
      borderTopColor: 'transparent',
      borderRadius: '50%',
      animation: 'nt-spin 0.7s linear infinite',
    }} />
  );
  if (!fullPage) return el;
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh', background: T.color.bg }}>
      {el}
    </div>
  );
}
