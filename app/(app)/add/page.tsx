'use client';

import { useState, useCallback }        from 'react';
import { useRouter }                    from 'next/navigation';
import { AddTransaction }               from '@/ui/screens/AddTransaction/AddTransaction';
import { useAppData }                   from '@/application/AppDataContext';
import { transactionService }           from '@/domain/transaction/transactionService';
import { FormState }                    from '@/ui/types';
import { todayISO }                     from '@/ui/utils';

const freshForm = (): FormState => ({
  type: 'in', amount: '', category: '', note: '', date: todayISO(),
});

export default function AddPage() {
  const { addTransaction }              = useAppData();
  const router                          = useRouter();
  const [form, setForm]                 = useState<FormState>(freshForm());
  const [submitting, setSubmitting]     = useState(false);
  const [saved, setSaved]               = useState(false);
  // Remember which type was last used so "Add Another" pre-selects same type
  const [lastType, setLastType]         = useState<'in' | 'out'>('in');

  const handleSubmit = async () => {
    const amount = transactionService.validateAmount(form.amount);
    if (!amount)        return;   // AddTransaction screen shows inline error via toast from context
    if (!form.category) return;

    setSubmitting(true);
    try {
      await addTransaction({
        type:     form.type,
        amount,
        category: form.category,
        note:     form.note,
        date:     form.date,
        source:   'manual',
      });
      setLastType(form.type);
      setSaved(true);
    } catch {
      // Error toast shown by AppDataContext
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddAnother = useCallback(() => {
    // Reset form, keep same type (most common pattern: logging multiple expenses)
    setForm({ ...freshForm(), type: lastType });
    setSaved(false);
  }, [lastType]);

  const handleGoBack = useCallback(() => {
    router.push('/dashboard');
  }, [router]);

  return (
    <AddTransaction
      form={form}
      setForm={setForm}
      onSubmit={handleSubmit}
      submitting={submitting}
      saved={saved}
      onAddAnother={handleAddAnother}
      onGoBack={handleGoBack}
    />
  );
}
