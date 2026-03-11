'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { T } from '@/ui/tokens';

const NAV = [
  { href: '/dashboard',    icon: '◈', label: 'Home'    },
  { href: '/transactions', icon: '≡', label: 'History' },
  { href: '/add',          icon: '+', label: 'Add'     },
  { href: '/settings',     icon: '⊙', label: 'Profile' },
];

export function BottomNav() {
  const path = usePathname();
  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
      background: 'rgba(7,7,15,0.97)',
      borderTop: `1px solid ${T.color.border}`,
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      display: 'flex',
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      {NAV.map(({ href, icon, label }) => {
        const active = path === href;
        const isAdd  = href === '/add';
        return (
          <Link key={href} href={href} style={{
            flex: 1, padding: '10px 4px 12px',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 4,
            textDecoration: 'none', position: 'relative',
            WebkitTapHighlightColor: 'transparent',
          }}>
            {isAdd ? (
              <div style={{
                width: 44, height: 44, borderRadius: T.r.md,
                background: `linear-gradient(135deg,${T.color.gold},#FF9800)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, fontWeight: 800, color: '#0A0A0F',
                marginTop: -8,
                boxShadow: active ? `0 0 24px rgba(255,208,50,0.55)` : `0 0 14px rgba(255,208,50,0.2)`,
              }}>+</div>
            ) : (
              <>
                <div style={{ fontSize: 20, lineHeight: 1, color: active ? T.color.gold : T.color.dim, transition: 'color 0.2s' }}>
                  {icon}
                </div>
                <div style={{ fontSize: 9, letterSpacing: '0.06em', fontWeight: active ? 700 : 400, color: active ? T.color.gold : T.color.dim, transition: 'color 0.2s' }}>
                  {label}
                </div>
                {active && <div style={{ position: 'absolute', bottom: 6, width: 4, height: 4, borderRadius: '50%', background: T.color.gold }} />}
              </>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
