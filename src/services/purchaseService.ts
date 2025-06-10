import { PendingPurchase, RaffleSettings } from '../types';

// Mock storage for pending purchases
let mockPendingPurchases: PendingPurchase[] = [
  {
    id: 'purchase-1',
    raffleId: 'mock-1701234567890',
    raffleName: 'iPhone 15 Pro Max',
    buyerName: 'João Silva Santos',
    buyerPhone: '(11) 99999-9999',
    buyerCpf: '123.456.789-00',
    ticketCount: 5,
    totalAmount: 50.00,
    purchaseDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    status: 'pending',
    selectedNumbers: [15, 23, 47, 89, 156],
    paymentMethod: 'pix',
  },
  {
    id: 'purchase-2',
    raffleId: 'mock-1701234567890',
    raffleName: 'iPhone 15 Pro Max',
    buyerName: 'Maria Oliveira Costa',
    buyerPhone: '(11) 88888-8888',
    buyerCpf: '987.654.321-00',
    ticketCount: 10,
    totalAmount: 100.00,
    purchaseDate: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    status: 'pending',
    selectedNumbers: [1, 7, 13, 21, 34, 55, 89, 144, 233, 377],
    paymentMethod: 'pix',
  },
  {
    id: 'purchase-3',
    raffleId: 'mock-1701234567891',
    raffleName: 'Notebook Gamer',
    buyerName: 'Carlos Eduardo Lima',
    buyerPhone: '(21) 77777-7777',
    buyerCpf: '456.789.123-00',
    ticketCount: 3,
    totalAmount: 45.00,
    purchaseDate: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    status: 'pending',
    selectedNumbers: [42, 77, 99],
    paymentMethod: 'credit_card',
  },
  {
    id: 'purchase-4',
    raffleId: 'mock-1701234567890',
    raffleName: 'iPhone 15 Pro Max',
    buyerName: 'Ana Paula Ferreira',
    buyerPhone: '(31) 66666-6666',
    buyerCpf: '789.123.456-00',
    ticketCount: 2,
    totalAmount: 20.00,
    purchaseDate: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
    status: 'authorized',
    selectedNumbers: [11, 22],
    paymentMethod: 'pix',
  },
  {
    id: 'purchase-5',
    raffleId: 'mock-1701234567891',
    raffleName: 'Notebook Gamer',
    buyerName: 'Pedro Henrique Santos',
    buyerPhone: '(41) 55555-5555',
    buyerCpf: '321.654.987-00',
    ticketCount: 8,
    totalAmount: 120.00,
    purchaseDate: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
    status: 'rejected',
    selectedNumbers: [5, 10, 15, 20, 25, 30, 35, 40],
    paymentMethod: 'pix',
  },
];

// Mock storage for raffle settings
let mockRaffleSettings: { [raffleId: string]: RaffleSettings } = {
  'mock-1701234567890': {
    id: 'mock-1701234567890',
    title: 'iPhone 15 Pro Max',
    description: 'iPhone 15 Pro Max 256GB na cor de sua escolha',
    price: 10.00,
    totalNumbers: 1000,
    drawDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    isCharity: false,
    pixKey: 'criador@pix.com',
    autoApprove: false,
    maxTicketsPerPurchase: 50,
  },
  'mock-1701234567891': {
    id: 'mock-1701234567891',
    title: 'Notebook Gamer',
    description: 'Notebook Gamer RTX 4060 16GB RAM',
    price: 15.00,
    totalNumbers: 500,
    drawDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    isCharity: false,
    pixKey: 'criador@pix.com',
    autoApprove: true,
    maxTicketsPerPurchase: 25,
  },
};

export const getPendingPurchases = async (creatorId: string): Promise<PendingPurchase[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Filter purchases for raffles created by this user
  // In a real app, this would be done via database query
  return mockPendingPurchases.filter(purchase => 
    purchase.status === 'pending'
  );
};

export const getAuthorizedPurchases = async (creatorId: string): Promise<PendingPurchase[]> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return mockPendingPurchases.filter(purchase => 
    purchase.status === 'authorized'
  );
};

export const getRejectedPurchases = async (creatorId: string): Promise<PendingPurchase[]> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return mockPendingPurchases.filter(purchase => 
    purchase.status === 'rejected'
  );
};

export const authorizePurchase = async (purchaseId: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const purchase = mockPendingPurchases.find(p => p.id === purchaseId);
  if (purchase) {
    purchase.status = 'authorized';
  }
};

export const rejectPurchase = async (purchaseId: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const purchase = mockPendingPurchases.find(p => p.id === purchaseId);
  if (purchase) {
    purchase.status = 'rejected';
  }
};

export const getRaffleSettings = async (raffleId: string): Promise<RaffleSettings | null> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return mockRaffleSettings[raffleId] || null;
};

export const updateRaffleSettings = async (raffleId: string, settings: Partial<RaffleSettings>): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  if (mockRaffleSettings[raffleId]) {
    mockRaffleSettings[raffleId] = {
      ...mockRaffleSettings[raffleId],
      ...settings,
    };
  }
};

export const getUserRaffleIds = async (creatorId: string): Promise<string[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // In a real app, this would query the database for raffles created by this user
  // For now, return mock raffle IDs
  return Object.keys(mockRaffleSettings);
};