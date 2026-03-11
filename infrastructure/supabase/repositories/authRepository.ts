import { getSupabaseBrowserClient } from '../client';

export const authRepository = {

  async getUser() {
    const sb = getSupabaseBrowserClient();
    const { data: { user } } = await sb.auth.getUser();
    return user;
  },

  async signIn(email: string, password: string) {
    const sb = getSupabaseBrowserClient();
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    return data.user!;
  },

  async signUp(email: string, password: string, fullName: string) {
    const sb = getSupabaseBrowserClient();
    const { data, error } = await sb.auth.signUp({
      email, password,
      options: { data: { full_name: fullName } },
    });
    if (error) throw new Error(error.message);
    return data;
  },

  async signOut() {
    const sb = getSupabaseBrowserClient();
    await sb.auth.signOut();
  },

  async updatePassword(password: string) {
    const sb = getSupabaseBrowserClient();
    const { error } = await sb.auth.updateUser({ password });
    if (error) throw new Error(error.message);
  },

  // onAuthChange fires for every auth event:
  // SIGNED_IN, TOKEN_REFRESHED, SIGNED_OUT, USER_UPDATED, PASSWORD_RECOVERY
  // Supabase SSR handles token refresh automatically — we just track the user state
  onAuthChange(cb: (user: any, event: string) => void) {
    const sb = getSupabaseBrowserClient();
    const { data: { subscription } } = sb.auth.onAuthStateChange((event, session) => {
      cb(session?.user ?? null, event);
    });
    return subscription;
  },
};
