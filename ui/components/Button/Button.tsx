'use client';
import { CSSProperties } from 'react';
import { T } from '@/ui/tokens';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';

const V: Record<Variant, CSSProperties> = {
  primary:   { background: `linear-gradient(135deg,${T.color.gold},#FF9800)`, color: '#0A0A0F' },
  secondary: { background: 'rgba(255,255,255,0.05)', color: T.color.soft, border: `1px solid ${T.color.border}` },
  danger:    { background: T.color.redDim, color: T.color.red, border: `1px solid rgba(255,61,87,0.25)` },
  ghost:     { background: 'transparent', color: T.color.soft },
};

interface Props {
  children:  React.ReactNode;
  onClick?:  () => void;
  variant?:  Variant;
  disabled?: boolean;
  full?:     boolean;
  small?:    boolean;
  style?:    CSSProperties;
  type?:     'button' | 'submit';
}

export function Button({ children, onClick, variant = 'primary', disabled, full, small, style, type = 'button' }: Props) {
  // Press animation handlers — scale down on press, snap back on release
  const press   = (e: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>) => {
    if (!disabled) (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.96)';
  };
  const release = (e: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>) => {
    (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      onMouseDown={press}
      onMouseUp={release}
      onMouseLeave={release}
      onTouchStart={press}
      onTouchEnd={release}
      style={{
        display:    'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap:        6,
        width:      full ? '100%' : undefined,
        padding:    small ? '8px 14px' : '13px 20px',
        border:     'none',
        borderRadius: T.r.md,
        fontFamily: 'inherit',
        fontSize:   small ? T.f.xs : T.f.sm,
        fontWeight: 700,
        letterSpacing: '0.08em',
        cursor:     disabled ? 'not-allowed' : 'pointer',
        opacity:    disabled ? 0.55 : 1,
        // Smooth spring-like transition for the press animation
        transition: 'opacity 0.15s, transform 0.12s cubic-bezier(0.4,0,0.2,1)',
        WebkitTapHighlightColor: 'transparent',
        ...V[variant],
        ...style,
      }}
    >
      {children}
    </button>
  );
}
