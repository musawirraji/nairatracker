'use client';
import { T } from '@/ui/tokens';

interface Props {
  open:     boolean;
  onClose:  () => void;
  title:    string;
  children: React.ReactNode;
}

export function BottomSheet({ open, onClose, title, children }: Props) {
  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position:   'fixed',
          inset:      0,
          zIndex:     200,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
        }}
      />

      {/* Sheet */}
      <div style={{
        position:   'fixed',
        bottom:     0,
        left:       '50%',
        transform:  'translateX(-50%)',
        zIndex:     201,
        width:      '100%',
        maxWidth:   480,
        maxHeight:  '90dvh',
        overflowY:  'auto',
        background: T.color.surface,
        borderTop:  `1px solid ${T.color.border}`,
        borderRadius: `${T.r.xl}px ${T.r.xl}px 0 0`,
        padding:    '20px 20px 28px',
        paddingBottom: 'calc(28px + env(safe-area-inset-bottom))',
        animation:  'nt-slideup 0.22s cubic-bezier(0.4,0,0.2,1)',
      }}>
        {/* Handle */}
        <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.12)', margin: '0 auto 20px' }} />

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: T.f.lg, fontWeight: 800, color: T.color.text }}>{title}</div>
          <button
            onClick={onClose}
            style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: T.color.soft, cursor: 'pointer', width: 32, height: 32, borderRadius: T.r.sm, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit' }}
          >×</button>
        </div>

        {children}
      </div>
    </>
  );
}
