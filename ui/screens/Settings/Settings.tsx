'use client';
import { useState } from 'react';
import { T }        from '@/ui/tokens';
import { fmt, fmtFull } from '@/ui/utils';
import { Card }     from '@/ui/components/Card/Card';
import { Button }   from '@/ui/components/Button/Button';
import { Input }    from '@/ui/components/Input/Input';
import { AppUser }  from '@/domain/user/User';

interface Props {
  user:             AppUser;
  goal:             number;
  saving:           boolean;
  onUpdateGoal:     (v: number) => Promise<void>;
  onUpdatePassword: (v: string) => Promise<void>;
  onLogout:         () => void;
  showToast:        (msg: string, type?: 'success' | 'error' | 'info') => void;
}

// ─── Password field with show/hide toggle ─────────────────────────────────────

function PasswordField({ placeholder, value, onChange }: {
  placeholder: string; value: string; onChange: (v: string) => void;
}) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <input
        type={show ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          width: '100%', background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: T.r.md, padding: '13px 44px 13px 16px',
          color: T.color.text, fontSize: T.f.md,
          outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
        }}
      />
      <button
        onClick={() => setShow(s => !s)}
        style={{
          position: 'absolute', right: 12, top: '50%',
          transform: 'translateY(-50%)',
          background: 'none', border: 'none',
          color: T.color.dim, cursor: 'pointer',
          fontSize: 16, padding: 4, lineHeight: 1,
        }}
        aria-label={show ? 'Hide password' : 'Show password'}
      >
        {show ? '🙈' : '👁'}
      </button>
    </div>
  );
}

// ─── Copy button for User ID ──────────────────────────────────────────────────

function CopyableId({ id }: { id: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(id).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{
        flex: 1,
        background: 'rgba(255,255,255,0.04)', borderRadius: T.r.sm,
        padding: '8px 12px', fontSize: 10, color: T.color.blue,
        fontFamily: 'monospace', wordBreak: 'break-all', userSelect: 'all',
        border: `1px solid rgba(79,195,247,0.12)`,
      }}>
        {id}
      </div>
      <button
        onClick={copy}
        style={{
          flexShrink: 0,
          background: copied ? T.color.greenDim : 'rgba(79,195,247,0.1)',
          border: `1px solid ${copied ? 'rgba(0,230,118,0.3)' : 'rgba(79,195,247,0.2)'}`,
          color: copied ? T.color.green : T.color.blue,
          borderRadius: T.r.sm, padding: '8px 12px',
          fontSize: T.f.xs, fontWeight: 700,
          cursor: 'pointer', fontFamily: 'inherit',
          transition: 'all 0.2s',
          whiteSpace: 'nowrap',
        }}
      >
        {copied ? '✓ Copied' : '📋 Copy'}
      </button>
    </div>
  );
}

// ─── Main Settings screen ─────────────────────────────────────────────────────

export function Settings({ user, goal, saving, onUpdateGoal, onUpdatePassword, onLogout, showToast }: Props) {
  const [editGoal,  setEditGoal]  = useState(false);
  const [goalInput, setGoalInput] = useState((goal / 1_000_000).toString());
  const [editPw,    setEditPw]    = useState(false);
  const [pwInput,   setPwInput]   = useState('');

  const saveGoal = async () => {
    const val = parseFloat(goalInput) * 1_000_000;
    if (!val || val <= 0) return showToast('Enter a valid goal', 'error');
    await onUpdateGoal(val);
    showToast('Goal updated!');
    setEditGoal(false);
  };

  const savePassword = async () => {
    if (pwInput.length < 6) return showToast('Minimum 6 characters', 'error');
    try {
      await onUpdatePassword(pwInput);
      showToast('Password changed');
      setEditPw(false);
      setPwInput('');
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Profile card */}
      <Card style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{
          width: 54, height: 54, borderRadius: '50%', flexShrink: 0,
          background: `linear-gradient(135deg,${T.color.gold},#FF9800)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, fontWeight: 800, color: '#0A0A0F',
        }}>
          {user.initials}
        </div>
        <div>
          <div style={{ fontSize: T.f.lg, fontWeight: 700, color: T.color.text }}>{user.fullName}</div>
          <div style={{ fontSize: T.f.xs, color: T.color.soft, marginTop: 3 }}>{user.email}</div>
        </div>
      </Card>

      {/* Goal */}
      <Card>
        <div style={{ fontSize: 10, letterSpacing: '0.2em', color: T.color.dim, marginBottom: 14, fontWeight: 600 }}>SAVINGS GOAL</div>
        {!editGoal ? (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: T.f['2xl'], fontWeight: 800, color: T.color.gold }}>{fmt(goal)}</div>
              <div style={{ fontSize: T.f.xs, color: T.color.soft, marginTop: 4 }}>{fmtFull(goal)}</div>
            </div>
            <Button small variant="secondary" onClick={() => { setGoalInput((goal / 1_000_000).toString()); setEditGoal(true); }}>
              Edit
            </Button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: T.f.xs, color: T.color.soft }}>New target in millions (₦)</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: T.color.gold, fontWeight: 700 }}>₦</span>
                <input
                  type="number"
                  value={goalInput}
                  onChange={e => setGoalInput(e.target.value)}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: T.r.md, padding: '13px 40px', color: T.color.text, fontSize: 22, fontWeight: 800, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                />
                <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: T.color.soft, fontSize: T.f.sm }}>M</span>
              </div>
              <Button onClick={saveGoal} disabled={saving}>{saving ? '…' : 'Save'}</Button>
              <Button variant="ghost" onClick={() => setEditGoal(false)}>✕</Button>
            </div>
          </div>
        )}
      </Card>

      {/* Security */}
      <Card>
        <div style={{ fontSize: 10, letterSpacing: '0.2em', color: T.color.dim, marginBottom: 14, fontWeight: 600 }}>SECURITY</div>
        {!editPw ? (
          <Button full variant="secondary" onClick={() => setEditPw(true)}>🔒 Change Password</Button>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <PasswordField
              placeholder="New password (min 6 chars)"
              value={pwInput}
              onChange={setPwInput}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <Button full onClick={savePassword}>Update</Button>
              <Button variant="ghost" onClick={() => { setEditPw(false); setPwInput(''); }}>Cancel</Button>
            </div>
          </div>
        )}
      </Card>

      {/* n8n auto-import */}
      <Card style={{ background: 'rgba(79,195,247,0.04)', border: '1px solid rgba(79,195,247,0.2)' }}>
        <div style={{ fontSize: 10, letterSpacing: '0.2em', color: T.color.blue, marginBottom: 10, fontWeight: 600 }}>AUTO-IMPORT · n8n</div>
        <div style={{ fontSize: T.f.xs, color: T.color.soft, lineHeight: 1.7, marginBottom: 12 }}>
          Transactions marked <strong style={{ color: T.color.gold }}>AUTO</strong> are inserted when your bank sends an alert email via your n8n workflow.
        </div>
        <div style={{ fontSize: 10, color: T.color.dim, marginBottom: 8, letterSpacing: '0.1em' }}>YOUR USER ID (for n8n)</div>
        <CopyableId id={user.id} />
      </Card>

      <Button full variant="danger" onClick={onLogout}>LOG OUT</Button>
    </div>
  );
}
