export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: string;
  balance: number;
}

export interface Raffle {
  id: string;
  title: string;
  description: string;
  price: number;
  totalNumbers: number;
  imageUrl: string;
  drawDate: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  createdBy: string;
  createdAt: string;
  isCharity: boolean;
  soldNumbers: number[];
}

export interface Ticket {
  id: string;
  raffleId: string;
  userId: string;
  numbers: number[];
  purchaseDate: string;
  paymentStatus: 'pending' | 'completed' | 'failed';
  paymentMethod: 'pix' | 'credit_card';
}

export interface RaffleNumber {
  number: number;
  status: 'available' | 'reserved' | 'sold';
  userId?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}