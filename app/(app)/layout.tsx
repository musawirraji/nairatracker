'use client';

import { useEffect }              from 'react';
import { useRouter, usePathname } from 'next/navigation';

import { T }                                   from '@/ui/tokens';
import { BottomNav }                           from '@/ui/components/BottomNav/BottomNav';
import { Toast }                               from '@/ui/components/Toast/Toast';
import { Spinner }                             from '@/ui/components/Spinner/Spinner';
import { useAuth }                             from '@/application/useAuth';
import { useToast, ToastProvider }             from '@/application/ToastContext';
import { AppDataProvider, useAppData }         from '@/application/AppDataContext';

// ─── Route titles ─────────────────────────────────────────────────────────────

const TITLES: Record<string, string> = {
  '/dashboard':    '',
  '/transactions': 'History',
  '/add':          'Add Transaction',
  '/settings':     'Settings',
};

// ─── Error state — shown when initial data load fails ─────────────────────────

function DataErrorBanner() {
  const { error, retryLoad, loading } = useAppData();
  if (!error) return null;
  return (
    <div style={{
      margin:       '12px 16px 0',
      padding:      '12px 16px',
      background:   T.color.redDim,
      border:       `1px solid rgba(255,61,87,0.3)`,
      borderRadius: T.r.md,
      display:      'flex',
      justifyContent: 'space-between',
      alignItems:   'center',
      gap:          12,
    }}>
      <div style={{ fontSize: T.f.xs, color: T.color.red, flex: 1 }}>
        {error}
      </div>
      <button
        onClick={retryLoad}
        disabled={loading}
        style={{
          background:    T.color.red,
          color:         '#fff',
          border:        'none',
          borderRadius:  T.r.sm,
          padding:       '6px 12px',
          fontSize:      T.f.xs,
          fontWeight:    700,
          cursor:        loading ? 'not-allowed' : 'pointer',
          opacity:       loading ? 0.6 : 1,
          fontFamily:    'inherit',
          flexShrink:    0,
        }}
      >
        {loading ? '…' : 'Retry'}
      </button>
    </div>
  );
}

// ─── AppShell — sits inside both providers, renders the full chrome ───────────

function AppShell({ children }: { children: React.ReactNode }) {
  const { user, ready } = useAuth();
  const { toast }       = useToast();
  const router          = useRouter();
  const path            = usePathname();

  // Fallback redirect — useAuth handles SIGNED_OUT directly,
  // but this catches the initial load case where user was never logged in
  useEffect(() => {
    if (ready && !user) router.push('/login');
  }, [ready, user, router]);

  if (!ready || !user) return <Spinner fullPage />;

  const title = path === '/dashboard'
    ? `Hey, ${user.firstName} 👋`
    : (TITLES[path] || '');

  return (
    // AppDataProvider mounts once here — all pages share this single instance
    // No page ever calls useTransactions or useGoal directly
    <AppDataProvider userId={user.id}>
      <div style={{
        minHeight:  '100dvh',
        background: T.color.bg,
        color:      T.color.text,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}>
        {/* Subtle grid background */}
        <div style={{
          position:        'fixed',
          inset:           0,
          zIndex:          0,
          pointerEvents:   'none',
          backgroundImage: `linear-gradient(${T.color.border} 1px,transparent 1px),
                            linear-gradient(90deg,${T.color.border} 1px,transparent 1px)`,
          backgroundSize:  '48px 48px',
        }} />

        {/* Single toast instance for the entire app */}
        <Toast toast={toast} />

        <div style={{
          position:      'relative',
          zIndex:        1,
          maxWidth:      480,
          margin:        '0 auto',
          // Accounts for nav height + device safe area (home bar / notch)
          paddingBottom: 'calc(80px + env(safe-area-inset-bottom))',
          // Minimum horizontal padding protects 320px screens
          paddingLeft:   'max(16px, env(safe-area-inset-left))',
          paddingRight:  'max(16px, env(safe-area-inset-right))',
        }}>

          {/* Header */}
          <div style={{
            paddingTop:     28,
            paddingBottom:  0,
            display:        'flex',
            justifyContent: 'space-between',
            alignItems:     'flex-start',
          }}>
            <div>
              <div style={{
                fontSize:      10,
                letterSpacing: '0.22em',
                color:         T.color.gold,
                marginBottom:  4,
                fontWeight:    600,
              }}>
                NAIRATRACKER
              </div>
              <div style={{
                fontSize:      T.f.xl,
                fontWeight:    800,
                letterSpacing: '-0.02em',
                color:         T.color.text,
              }}>
                {title}
              </div>
            </div>
            <div style={{
              background:    T.color.goldDim,
              border:        `1px solid ${T.color.borderStrong}`,
              color:         T.color.gold,
              padding:       '6px 12px',
              borderRadius:  T.r.sm,
              fontSize:      10,
              fontWeight:    700,
              letterSpacing: '0.12em',
            }}>
              {new Date().getFullYear()}
            </div>
          </div>

          {/* Error banner — only shows when data load fails */}
          <DataErrorBanner />

          {children}
        </div>

        <BottomNav />
      </div>
    </AppDataProvider>
  );
}

// ─── AppLayout — ToastProvider wraps everything so toast is shared app-wide ───

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <AppShell>{children}</AppShell>
    </ToastProvider>
  );
}
