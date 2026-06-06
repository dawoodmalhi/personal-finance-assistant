export type User = {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
};

export type Transaction = {
  id: string;
  userId: string;
  amount: number;
  category: string;
  date: Date;
  description: string;
};

export type Budget = {
  id: string;
  userId: string;
  category: string;
  limit: number;
  spent: number;
};

export type Category = {
  id: string;
  name: string;
};