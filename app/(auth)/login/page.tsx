'use client';
import { useRouter } from 'next/navigation';
import { AuthScreen } from '@/ui/screens/Auth/AuthScreen';
import { useAuth } from '@/application/useAuth';

export default function LoginPage() {
  const router = useRouter();
  const { signIn, signUp } = useAuth();

  const handleSignIn = async (email: string, password: string) => {
    await signIn(email, password);
    router.push('/dashboard');
  };

  const handleSignUp = async (email: string, password: string, name: string) => {
    const hasSession = await signUp(email, password, name);
    if (hasSession) router.push('/dashboard');
    return hasSession;
  };

  return <AuthScreen onSignIn={handleSignIn} onSignUp={handleSignUp} />;
}
