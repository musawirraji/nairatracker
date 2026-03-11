'use client';
import { T } from '@/ui/tokens';

interface Props {
  icon:    string;
  title:   string;
  body:    string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ icon, title, body, action }: Props) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <div style={{ fontSize: 48, lineHeight: 1, marginBottom: 4, opacity: 0.4 }}>{icon}</div>
      <div style={{ fontSize: T.f.lg, fontWeight: 700, color: T.color.text }}>{title}</div>
      <div style={{ fontSize: T.f.sm, color: T.color.soft, lineHeight: 1.6, maxWidth: 280 }}>{body}</div>
      {action && (
        <button
          onClick={action.onClick}
          style={{
            marginTop:     8,
            padding:       '11px 24px',
            background:    `linear-gradient(135deg,${T.color.gold},#FF9800)`,
            color:         '#0A0A0F',
            border:        'none',
            borderRadius:  T.r.md,
            fontWeight:    800,
            fontSize:      T.f.xs,
            letterSpacing: '0.1em',
            cursor:        'pointer',
            fontFamily:    'inherit',
          }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
