export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: string;
  balance: number;
  pixKey?: string;
  plan?: 'free' | 'basic' | 'premium';
  planExpiresAt?: string;
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
  pixKey?: string;
}

export interface Ticket {
  id: string;
  raffleId: string;
  userId?: string;
  numbers: number[];
  purchaseDate: string;
  paymentStatus: 'pending' | 'completed' | 'failed';
  paymentMethod: 'pix' | 'credit_card';
  buyerInfo?: {
    name: string;
    cpf: string;
    phone: string;
  };
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

export interface Campaign {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  totalTickets: number;
  ticketPrice: number;
  featured: boolean;
  status: 'draft' | 'active' | 'paused' | 'completed';
  mode: 'simple' | 'combo';
  comboRules?: {
    buy: number;
    get: number;
  };
  prizes: Prize[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  pixKey?: string;
}

export interface Prize {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  position: number;
}

export interface CampaignTicket {
  id: string;
  campaignId: string;
  number: number;
  isPrize: boolean;
  prizeDescription?: string;
  status: 'available' | 'reserved' | 'sold';
  userId?: string;
  purchaseDate?: string;
  buyerInfo?: {
    name: string;
    cpf: string;
    phone: string;
  };
}

export interface BuyerRanking {
  userId: string;
  userName: string;
  ticketsBought: number;
  participationPercentage: number;
}

export interface Purchase {
  id: string;
  type: 'raffle' | 'campaign';
  itemId: string;
  buyerInfo: {
    name: string;
    cpf: string;
    phone: string;
  };
  numbers: number[];
  totalAmount: number;
  pixKey: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
}