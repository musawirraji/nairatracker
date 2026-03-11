'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';

import { transactionRepository } from '@/infrastructure/supabase/repositories/transactionRepository';
import { goalRepository }        from '@/infrastructure/supabase/repositories/goalRepository';
import { Transaction, CreateTransactionDTO } from '@/domain/transaction/Transaction';
import { UpdateTransactionDTO }  from '@/infrastructure/supabase/repositories/transactionRepository';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AppDataState {
  txns:    Transaction[];
  goal:    number;
  loading: boolean;
  saving:  boolean;
  error:   string | null;
}

interface AppDataActions {
  addTransaction:    (dto: CreateTransactionDTO) => Promise<Transaction>;
  updateTransaction: (id: string, dto: UpdateTransactionDTO) => Promise<Transaction>;
  removeTransaction: (id: string) => Promise<void>;
  updateGoal:        (target: number) => Promise<void>;
  retryLoad:         () => void;
}

type AppDataContextValue = AppDataState & AppDataActions;

// ─── Context ──────────────────────────────────────────────────────────────────

const AppDataContext = createContext<AppDataContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

interface AppDataProviderProps {
  userId:   string;
  children: ReactNode;
}

export function AppDataProvider({ userId, children }: AppDataProviderProps) {
  const [txns,    setTxns]    = useState<Transaction[]>([]);
  const [goal,    setGoal]    = useState(100_000_000);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  // ── Initial load — one fetch, then realtime keeps it fresh ─────────────────
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Parallel fetch — transactions and goal at the same time
      const [txnData, goalData] = await Promise.all([
        transactionRepository.findAll(userId),
        goalRepository.find(userId),
      ]);
      setTxns(txnData);
      if (goalData) setGoal(Number(goalData.target));
    } catch (e: any) {
      // Store the error so the UI can show a retry option
      // Don't throw — we want the app to stay mounted
      setError(e.message || 'Failed to load data. Check your connection.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  // ── Realtime — n8n auto-inserts appear instantly without a page refresh ─────
  useEffect(() => {
    const channel = transactionRepository.subscribeToInserts(userId, incoming => {
      setTxns(prev =>
        prev.some(t => t.id === incoming.id) ? prev : [incoming, ...prev]
      );
    });
    return () => { channel.unsubscribe(); };
  }, [userId]);

  // ── Actions ────────────────────────────────────────────────────────────────

  const addTransaction = async (dto: CreateTransactionDTO): Promise<Transaction> => {
    const created = await transactionRepository.create(userId, dto);
    // Optimistic update — add locally, realtime will confirm
    setTxns(prev => [created, ...prev]);
    return created;
  };

  const updateTransaction = async (id: string, dto: UpdateTransactionDTO): Promise<Transaction> => {
    const updated = await transactionRepository.update(id, dto);
    setTxns(prev => prev.map(t => t.id === id ? updated : t));
    return updated;
  };

  const removeTransaction = async (id: string): Promise<void> => {
    // Optimistic update — remove locally before server confirms
    // If server fails, the next realtime event or page refresh will restore it
    setTxns(prev => prev.filter(t => t.id !== id));
    try {
      await transactionRepository.remove(id);
    } catch (e) {
      // Rollback — re-fetch to restore the deleted item
      load();
      throw e;
    }
  };

  const updateGoal = async (target: number): Promise<void> => {
    setSaving(true);
    try {
      await goalRepository.upsert(userId, target);
      setGoal(target);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppDataContext.Provider value={{
      txns, goal, loading, saving, error,
      addTransaction, updateTransaction, removeTransaction,
      updateGoal, retryLoad: load,
    }}>
      {children}
    </AppDataContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAppData(): AppDataContextValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used inside <AppDataProvider>');
  return ctx;
}
