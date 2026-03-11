import { getSupabaseBrowserClient } from '../client';
import { Goal } from '@/domain/goal/Goal';

export const goalRepository = {

  async find(userId: string): Promise<Goal | null> {
    const sb = getSupabaseBrowserClient();
    const { data, error } = await sb
      .from('goals').select('*').eq('user_id', userId).single();
    if (error) return null;
    return data as Goal;
  },

  async upsert(userId: string, target: number): Promise<void> {
    const sb = getSupabaseBrowserClient();
    const { error } = await sb.from('goals').upsert(
      { user_id: userId, target, year: new Date().getFullYear() },
      { onConflict: 'user_id' },
    );
    if (error) throw new Error(error.message);
  },
};
