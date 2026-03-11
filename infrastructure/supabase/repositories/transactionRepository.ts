import { getSupabaseBrowserClient } from '../client';
import { Transaction, CreateTransactionDTO } from '@/domain/transaction/Transaction';

export interface UpdateTransactionDTO {
  amount:   number;
  category: string;
  note:     string;
  date:     string;
  type:     'in' | 'out';
}

export const transactionRepository = {

  async findAll(userId: string): Promise<Transaction[]> {
    const sb = getSupabaseBrowserClient();
    const { data, error } = await sb
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('date',       { ascending: false })
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data || []) as Transaction[];
  },

  async create(userId: string, dto: CreateTransactionDTO): Promise<Transaction> {
    const sb = getSupabaseBrowserClient();
    const { data, error } = await sb
      .from('transactions')
      .insert({ user_id: userId, ...dto })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as Transaction;
  },

  async update(id: string, dto: UpdateTransactionDTO): Promise<Transaction> {
    const sb = getSupabaseBrowserClient();
    const { data, error } = await sb
      .from('transactions')
      .update(dto)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as Transaction;
  },

  async remove(id: string): Promise<void> {
    const sb = getSupabaseBrowserClient();
    const { error } = await sb.from('transactions').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  subscribeToInserts(userId: string, onInsert: (t: Transaction) => void) {
    const sb = getSupabaseBrowserClient();
    return sb
      .channel(`txns:${userId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'transactions',
        filter: `user_id=eq.${userId}`,
      }, payload => onInsert(payload.new as Transaction))
      .subscribe();
  },
};
