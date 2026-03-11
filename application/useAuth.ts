'use client';

import { useState, useEffect } from 'react';
import { useRouter }           from 'next/navigation';
import { authRepository }      from '@/infrastructure/supabase/repositories/authRepository';
import { AppUser, mapUser }    from '@/domain/user/User';

export function useAuth() {
  const [user,  setUser]  = useState<AppUser | null>(null);
  const [ready, setReady] = useState(false);
  const router            = useRouter();

  useEffect(() => {
    // Initial session check — determines if user is already logged in
    authRepository.getUser().then(raw => {
      setUser(raw ? mapUser(raw) : null);
      setReady(true);
    });

    // Listen for every auth event going forward
    const sub = authRepository.onAuthChange((raw, event) => {
      if (event === 'SIGNED_OUT') {
        // Token expired or user signed out — clear user and redirect immediately
        // Don't wait for the layout's useEffect — act now
        setUser(null);
        router.push('/login');
        return;
      }
      if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') {
        setUser(raw ? mapUser(raw) : null);
      }
    });

    return () => sub.unsubscribe();
  // router is stable — including it prevents an eslint warning but doesn't cause re-runs
  }, [router]);

  const signIn = async (email: string, password: string) => {
    const raw = await authRepository.signIn(email, password);
    setUser(mapUser(raw));
  };

  const signUp = async (email: string, password: string, name: string) => {
    const { user: raw, session } = await authRepository.signUp(email, password, name);
    if (raw && session) setUser(mapUser(raw));
    return !!session;
  };

  const signOut = async () => {
    await authRepository.signOut();
    // onAuthChange will fire SIGNED_OUT and handle the redirect
  };

  const updatePassword = (pw: string) => authRepository.updatePassword(pw);

  return { user, ready, signIn, signUp, signOut, updatePassword };
}
