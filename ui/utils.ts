export const fmt = (n: number): string => {
  const a = Math.abs(n);
  if (a >= 1_000_000) return `₦${(a / 1_000_000).toFixed(2)}M`;
  if (a >= 1_000)     return `₦${(a / 1_000).toFixed(1)}K`;
  return `₦${a.toLocaleString()}`;
};

export const fmtFull = (n: number): string =>
  `₦${Math.abs(n).toLocaleString('en-NG')}`;

export const todayISO = (): string =>
  new Date().toISOString().split('T')[0];

export const monthLabel = (yyyymm: string): string => {
  const MONTHS = ['January','February','March','April','May','June',
    'July','August','September','October','November','December'];
  const [year, mo] = yyyymm.split('-');
  return `${MONTHS[parseInt(mo) - 1]} ${year}`;
};
