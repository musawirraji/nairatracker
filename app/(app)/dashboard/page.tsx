'use client';

import { Dashboard }    from '@/ui/screens/Dashboard/Dashboard';
import { useAppData }   from '@/application/AppDataContext';

export default function DashboardPage() {
  const { txns, goal, loading } = useAppData();
  return <Dashboard txns={txns} goal={goal} loading={loading} />;
}
