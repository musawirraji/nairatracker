'use client';
import { T } from '@/ui/tokens';

interface Props {
  open:         boolean;
  title:        string;
  message:      string;
  confirmLabel: string;
  danger?:      boolean;
  onConfirm:    () => void;
  onCancel:     () => void;
}

export function ConfirmDialog({ open, title, message, confirmLabel, danger, onConfirm, onCancel }: Props) {
  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onCancel}
        style={{
          position:   'fixed',
          inset:      0,
          zIndex:     200,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
        }}
      />

      {/* Dialog */}
      <div style={{
        position:   'fixed',
        bottom:     0,
        left:       '50%',
        transform:  'translateX(-50%)',
        zIndex:     201,
        width:      '100%',
        maxWidth:   480,
        background: T.color.surface,
        borderTop:  `1px solid ${T.color.border}`,
        borderRadius: `${T.r.xl}px ${T.r.xl}px 0 0`,
        padding:    '28px 20px',
        paddingBottom: 'calc(28px + env(safe-area-inset-bottom))',
        animation:  'nt-slideup 0.22s cubic-bezier(0.4,0,0.2,1)',
      }}>
        {/* Handle */}
        <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.12)', margin: '0 auto 24px' }} />

        <div style={{ fontSize: T.f.lg, fontWeight: 800, color: T.color.text, marginBottom: 8 }}>
          {title}
        </div>
        <div style={{ fontSize: T.f.sm, color: T.color.soft, marginBottom: 28, lineHeight: 1.6 }}>
          {message}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            onClick={onConfirm}
            style={{
              width:         '100%',
              padding:       '14px',
              background:    danger ? T.color.red : T.color.gold,
              color:         '#fff',
              border:        'none',
              borderRadius:  T.r.md,
              fontWeight:    800,
              fontSize:      T.f.sm,
              letterSpacing: '0.08em',
              cursor:        'pointer',
              fontFamily:    'inherit',
            }}
          >
            {confirmLabel}
          </button>
          <button
            onClick={onCancel}
            style={{
              width:        '100%',
              padding:      '14px',
              background:   'rgba(255,255,255,0.05)',
              color:        T.color.soft,
              border:       `1px solid ${T.color.border}`,
              borderRadius: T.r.md,
              fontWeight:   700,
              fontSize:     T.f.sm,
              cursor:       'pointer',
              fontFamily:   'inherit',
            }}
          >
            Cancel
          </button>
        </div>
      </div>

      <style>{`@keyframes nt-slideup { from { transform: translateX(-50%) translateY(100%); } to { transform: translateX(-50%) translateY(0); } }`}</style>
    </>
  );
}
