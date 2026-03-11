'use client';

import { useRouter }   from 'next/navigation';
import { Settings }    from '@/ui/screens/Settings/Settings';
import { useAuth }     from '@/application/useAuth';
import { useAppData }  from '@/application/AppDataContext';
import { useToast }    from '@/application/ToastContext';

export default function SettingsPage() {
  const { user, signOut, updatePassword } = useAuth();
  const { goal, saving, updateGoal }      = useAppData();
  const { showToast }                     = useToast();
  const router                            = useRouter();

  if (!user) return null;

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <Settings
      user={user}
      goal={goal}
      saving={saving}
      onUpdateGoal={updateGoal}
      onUpdatePassword={updatePassword}
      onLogout={handleLogout}
      showToast={showToast}
    />
  );
}
