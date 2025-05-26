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
  createdBy: string;
  createdAt: string;
  updatedAt: string;
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
}

export interface BuyerRanking {
  userId: string;
  userName: string;
  ticketsBought: number;
  participationPercentage: number;
}