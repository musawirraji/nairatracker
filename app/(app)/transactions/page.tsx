'use client';

import { useRouter }                        from 'next/navigation';
import { Transactions }                     from '@/ui/screens/Transactions/Transactions';
import { useAppData }                       from '@/application/AppDataContext';
import { useToast }                         from '@/application/ToastContext';
import { useExport }                        from '@/application/useExport';
import { UpdateTransactionDTO }             from '@/infrastructure/supabase/repositories/transactionRepository';

export default function TransactionsPage() {
  const { txns, removeTransaction, updateTransaction } = useAppData();
  const { showToast }                                  = useToast();
  const { exportCSV }                                  = useExport();
  const router                                         = useRouter();

  const handleDelete = async (id: string) => {
    try {
      await removeTransaction(id);
      showToast('Transaction deleted', 'info');
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  const handleUpdate = async (id: string, dto: UpdateTransactionDTO) => {
    try {
      await updateTransaction(id, dto);
      showToast('Transaction updated');
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  return (
    <Transactions
      txns={txns}
      onDelete={handleDelete}
      onUpdate={handleUpdate}
      onExport={() => exportCSV(txns)}
      onAddClick={() => router.push('/add')}
    />
  );
}
