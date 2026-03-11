'use client';
import { useState } from 'react';
import { T } from '@/ui/tokens';
import { Card } from '@/ui/components/Card/Card';
import { Button } from '@/ui/components/Button/Button';

type Mode = 'login' | 'signup';

interface Props {
  onSignIn: (email: string, password: string) => Promise<void>;
  onSignUp: (email: string, password: string, name: string) => Promise<boolean>;
}

// ─── Password input with show/hide toggle ─────────────────────────────────────

function PasswordInput({
  label, placeholder, value, onChange, onEnter,
}: {
  label: string; placeholder: string; value: string;
  onChange: (v: string) => void; onEnter?: () => void;
}) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <div style={{ fontSize: T.f.xs, letterSpacing: '0.18em', color: T.color.dim, marginBottom: T.s.sm, fontWeight: 600 }}>
        {label}
      </div>
      <div style={{ position: 'relative' }}>
        <input
          type={show ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && onEnter?.()}
          style={{
            width: '100%', background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: T.r.md, padding: '13px 44px 13px 16px',
            color: T.color.text, fontSize: T.f.md,
            outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
          }}
        />
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          style={{
            position: 'absolute', right: 12, top: '50%',
            transform: 'translateY(-50%)',
            background: 'none', border: 'none',
            color: T.color.dim, cursor: 'pointer',
            fontSize: 16, lineHeight: 1, padding: 4,
            display: 'flex', alignItems: 'center',
          }}
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? '🙈' : '👁'}
        </button>
      </div>
    </div>
  );
}

// ─── Text input ───────────────────────────────────────────────────────────────

function TextInput({
  label, type = 'text', placeholder, value, onChange, onEnter,
}: {
  label: string; type?: string; placeholder: string; value: string;
  onChange: (v: string) => void; onEnter?: () => void;
}) {
  return (
    <div>
      <div style={{ fontSize: T.f.xs, letterSpacing: '0.18em', color: T.color.dim, marginBottom: T.s.sm, fontWeight: 600 }}>
        {label}
      </div>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && onEnter?.()}
        style={{
          width: '100%', background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: T.r.md, padding: '13px 16px',
          color: T.color.text, fontSize: T.f.md,
          outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
        }}
      />
    </div>
  );
}

// ─── Success screen shown after signup ────────────────────────────────────────

function SignupSuccess({ email, onBackToLogin }: { email: string; onBackToLogin: () => void }) {
  return (
    <div style={{ textAlign: 'center', padding: '8px 0' }}>
      {/* Checkmark */}
      <div style={{
        width: 64, height: 64, borderRadius: '50%',
        background: T.color.greenDim,
        border: `2px solid rgba(0,230,118,0.35)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 20px',
        fontSize: 28,
      }}>
        ✓
      </div>

      <div style={{ fontSize: T.f.lg, fontWeight: 800, color: T.color.text, marginBottom: 10 }}>
        Account created!
      </div>

      <div style={{ fontSize: T.f.sm, color: T.color.soft, lineHeight: 1.7, marginBottom: 8 }}>
        We sent a confirmation link to
      </div>
      <div style={{
        fontSize: T.f.sm, fontWeight: 700, color: T.color.gold,
        marginBottom: 20, wordBreak: 'break-all',
      }}>
        {email}
      </div>

      <div style={{
        background: 'rgba(255,208,50,0.06)',
        border: `1px solid rgba(255,208,50,0.15)`,
        borderRadius: T.r.md,
        padding: '12px 16px',
        fontSize: T.f.xs,
        color: T.color.soft,
        lineHeight: 1.7,
        marginBottom: 24,
        textAlign: 'left',
      }}>
        <strong style={{ color: T.color.text }}>Next steps:</strong><br />
        1. Open your email inbox<br />
        2. Click the confirmation link<br />
        3. Come back here and log in
      </div>

      <Button full variant="secondary" onClick={onBackToLogin}>
        BACK TO LOG IN
      </Button>
    </div>
  );
}

// ─── Main AuthScreen ──────────────────────────────────────────────────────────

export function AuthScreen({ onSignIn, onSignUp }: Props) {
  const [mode,      setMode]      = useState<Mode>('login');
  const [email,     setEmail]     = useState('');
  const [pass,      setPass]      = useState('');
  const [confirm,   setConfirm]   = useState('');
  const [name,      setName]      = useState('');
  const [busy,      setBusy]      = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [succeeded, setSucceeded] = useState(false);

  const switchMode = (m: Mode) => {
    setMode(m); setError(null);
    setPass(''); setConfirm('');
  };

  const validate = (): string | null => {
    if (!email.trim())  return 'Email is required';
    if (!pass)          return 'Password is required';
    if (mode === 'signup') {
      if (pass.length < 6)    return 'Password must be at least 6 characters';
      if (pass !== confirm)   return 'Passwords do not match';
    }
    return null;
  };

  const submit = async () => {
    const err = validate();
    if (err) return setError(err);

    setBusy(true);
    setError(null);
    try {
      if (mode === 'login') {
        await onSignIn(email, pass);
      } else {
        const hasSession = await onSignUp(email, pass, name);
        if (!hasSession) {
          // Email confirmation required — show success screen
          setSucceeded(true);
        }
        // If hasSession is true, the login page will redirect automatically
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{
      minHeight: '100dvh', background: T.color.bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20, position: 'relative', fontFamily: 'inherit',
    }}>
      {/* Grid background */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        backgroundImage: `linear-gradient(${T.color.border} 1px,transparent 1px),
                          linear-gradient(90deg,${T.color.border} 1px,transparent 1px)`,
        backgroundSize: '48px 48px',
      }} />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 400 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 68, height: 68, borderRadius: T.r.xl, marginBottom: 16,
            background: `linear-gradient(135deg,${T.color.gold},#FF9800)`,
            fontSize: 32, fontWeight: 800, color: '#0A0A0F',
            boxShadow: `0 0 52px rgba(255,208,50,0.35)`,
          }}>₦</div>
          <div style={{ fontSize: T.f['2xl'], fontWeight: 800, letterSpacing: '-0.03em', color: T.color.text }}>
            NairaTracker
          </div>
          <div style={{ fontSize: T.f.sm, color: T.color.soft, marginTop: 6 }}>
            Track every naira. Hit your goal.
          </div>
        </div>

        <Card style={{ padding: 28 }}>

          {/* Success screen replaces the form entirely */}
          {succeeded ? (
            <SignupSuccess
              email={email}
              onBackToLogin={() => { setSucceeded(false); switchMode('login'); }}
            />
          ) : (
            <>
              {/* Mode toggle */}
              <div style={{
                display: 'flex', background: 'rgba(255,255,255,0.04)',
                borderRadius: T.r.md, padding: 4, marginBottom: 24,
              }}>
                {(['login', 'signup'] as Mode[]).map(m => (
                  <button key={m} onClick={() => switchMode(m)} style={{
                    flex: 1, padding: '10px',
                    background: mode === m ? T.color.gold : 'transparent',
                    color: mode === m ? '#0A0A0F' : T.color.soft,
                    border: 'none', borderRadius: T.r.sm, fontWeight: 700,
                    fontSize: T.f.xs, letterSpacing: '0.12em', textTransform: 'uppercase',
                    cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
                  }}>
                    {m === 'login' ? 'Log In' : 'Sign Up'}
                  </button>
                ))}
              </div>

              {/* Fields */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: T.s.md }}>
                {mode === 'signup' && (
                  <TextInput label="YOUR NAME" placeholder="Full name" value={name} onChange={setName} />
                )}

                <TextInput
                  label="EMAIL" type="email" placeholder="you@email.com"
                  value={email} onChange={setEmail} onEnter={submit}
                />

                <PasswordInput
                  label="PASSWORD" placeholder="••••••••"
                  value={pass} onChange={setPass}
                  onEnter={mode === 'login' ? submit : undefined}
                />

                {mode === 'signup' && (
                  <PasswordInput
                    label="CONFIRM PASSWORD" placeholder="••••••••"
                    value={confirm} onChange={setConfirm} onEnter={submit}
                  />
                )}
              </div>

              {/* Error */}
              {error && (
                <div style={{
                  marginTop: T.s.lg,
                  background: T.color.redDim,
                  border: `1px solid rgba(255,61,87,0.3)`,
                  borderRadius: T.r.md, padding: '10px 14px',
                  fontSize: T.f.xs, color: T.color.red,
                }}>
                  {error}
                </div>
              )}

              {/* Submit */}
              <Button full onClick={submit} disabled={busy} style={{ marginTop: T.s.xl }}>
                {busy ? 'Please wait…' : mode === 'login' ? 'LOG IN' : 'CREATE ACCOUNT'}
              </Button>
            </>
          )}
        </Card>

        <div style={{ textAlign: 'center', fontSize: 11, color: T.color.dim, marginTop: 16 }}>
          Secured by Supabase · Your data is private
        </div>
      </div>
    </div>
  );
}
