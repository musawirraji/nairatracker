export type TxnType   = 'in' | 'out';
export type TxnSource = 'manual' | 'auto';

export interface Transaction {
  id:               string;
  user_id:          string;
  type:             TxnType;
  amount:           number;
  category:         string;
  note:             string | null;
  date:             string;
  source:           TxnSource;
  idempotency_key:  string | null;
  created_at:       string;
}

export interface CreateTransactionDTO {
  type:     TxnType;
  amount:   number;
  category: string;
  note:     string;
  date:     string;
  source:   TxnSource;
}

export const INCOME_CATEGORIES = [
  'Freelance', 'Client Payment', 'Investment Returns',
  'Side Project', 'Salary', 'Gift', 'Other',
] as const;

export const EXPENSE_CATEGORIES = [
  'Rent', 'Food', 'Transport', 'Family',
  'Business', 'Bills', 'Personal', 'Savings Transfer', 'Other',
] as const;

export const CATEGORY_COLORS: Record<string, string> = {
  Freelance:           '#FFD23C',
  'Client Payment':    '#00E676',
  'Investment Returns':'#4FC3F7',
  'Side Project':      '#CE93D8',
  Salary:              '#80CBC4',
  Gift:                '#FFB74D',
  Rent:                '#FF3D57',
  Food:                '#FF7043',
  Transport:           '#FFA726',
  Family:              '#AB47BC',
  Business:            '#42A5F5',
  Bills:               '#EF5350',
  Personal:            '#EC407A',
  'Savings Transfer':  '#26A69A',
  Other:               '#78909C',
};
