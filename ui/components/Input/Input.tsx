'use client';
import { CSSProperties, forwardRef } from 'react';
import { T } from '@/ui/tokens';

interface Props {
  label?:       string;
  type?:        string;
  placeholder?: string;
  value:        string;
  onChange:     (v: string) => void;
  onEnter?:     () => void;
  style?:       CSSProperties;
  inputStyle?:  CSSProperties;
  inputMode?:   React.HTMLAttributes<HTMLInputElement>['inputMode'];
}

export const Input = forwardRef<HTMLInputElement, Props>(
  ({ label, type = 'text', placeholder, value, onChange, onEnter, style, inputStyle, inputMode }, ref) => (
    <div style={style}>
      {label && (
        <div style={{ fontSize: T.f.xs, letterSpacing: '0.18em', color: T.color.dim, marginBottom: T.s.sm, fontWeight: 600 }}>
          {label}
        </div>
      )}
      <input
        ref={ref} type={type} inputMode={inputMode}
        placeholder={placeholder} value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && onEnter?.()}
        style={{
          width: '100%', background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: T.r.md, padding: '13px 16px',
          color: T.color.text, fontSize: T.f.md,
          outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
          ...inputStyle,
        }}
      />
    </div>
  )
);
Input.displayName = 'Input';
