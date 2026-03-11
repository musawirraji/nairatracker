'use client';
import { T } from '@/ui/tokens';
import { Toast as ToastType } from '@/application/ToastContext';

const COLORS: Record<string, { bg: string; border: string }> = {
  success: { bg: 'rgba(0,230,118,0.15)',   border: 'rgba(0,230,118,0.35)'   },
  error:   { bg: 'rgba(255,61,87,0.15)',    border: 'rgba(255,61,87,0.35)'   },
  info:    { bg: 'rgba(255,255,255,0.08)',  border: 'rgba(255,255,255,0.15)' },
};

const TEXT: Record<string, string> = {
  success: T.color.green,
  error:   T.color.red,
  info:    T.color.soft,
};

export function Toast({ toast }: { toast: ToastType | null }) {
  if (!toast) return null;
  const c = COLORS[toast.type] || COLORS.info;
  const t = TEXT[toast.type]   || TEXT.info;

  return (
    <div style={{
      // Bottom center — above the nav bar, visible over keyboard on mobile
      position:  'fixed',
      bottom:    'calc(80px + env(safe-area-inset-bottom) + 12px)',
      left:      '50%',
      transform: 'translateX(-50%)',
      zIndex:    9999,
      background:   c.bg,
      border:       `1px solid ${c.border}`,
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      color:        t,
      padding:      '12px 20px',
      borderRadius: T.r.full,
      fontSize:     T.f.sm,
      fontWeight:   700,
      whiteSpace:   'nowrap',
      maxWidth:     'calc(100vw - 40px)',
      textAlign:    'center',
      boxShadow:    '0 4px 24px rgba(0,0,0,0.4)',
      animation:    'nt-slideup 0.22s cubic-bezier(0.4,0,0.2,1)',
    }}>
      {toast.msg}
      <style>{`
        @keyframes nt-slideup {
          from { transform: translateX(-50%) translateY(16px); opacity: 0; }
          to   { transform: translateX(-50%) translateY(0);    opacity: 1; }
        }
      `}</style>
    </div>
  );
}
