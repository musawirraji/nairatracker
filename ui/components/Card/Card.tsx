'use client';
import { CSSProperties } from 'react';
import { T } from '@/ui/tokens';

interface Props {
  children: React.ReactNode;
  style?:   CSSProperties;
  accent?:  boolean;
  onClick?: () => void;
}

export function Card({ children, style, accent, onClick }: Props) {
  return (
    <div onClick={onClick} style={{
      background:   T.color.surface,
      border:       `1px solid ${accent ? T.color.borderStrong : T.color.border}`,
      borderRadius: T.r.lg,
      padding:      T.s.xl,
      cursor:       onClick ? 'pointer' : undefined,
      ...style,
    }}>
      {children}
    </div>
  );
}
