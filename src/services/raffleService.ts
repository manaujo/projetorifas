import { Raffle, Ticket, RaffleNumber } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Mock data for demonstration
const mockRaffles: Raffle[] = [
  {
    id: '1',
    title: 'iPhone 15 Pro Max',
    description: 'Concorra a um iPhone 15 Pro Max novinho na caixa. Sorteio garantido após venda de todos os números!',
    price: 10,
    totalNumbers: 100,
    imageUrl: 'https://images.pexels.com/photos/15618051/pexels-photo-15618051.jpeg',
    drawDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days from now
    status: 'active',
    createdBy: 'admin-1',
    createdAt: new Date().toISOString(),
    isCharity: false,
    soldNumbers: [5, 10, 15, 20, 25],
  },
  {
    id: '2',
    title: 'Notebook Gamer',
    description: 'Notebook gamer de última geração com RTX 4070, 32GB RAM e SSD de 1TB.',
    price: 25,
    totalNumbers: 50,
    imageUrl: 'https://images.pexels.com/photos/1229861/pexels-photo-1229861.jpeg',
    drawDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    status: 'active',
    createdBy: 'admin-1',
    createdAt: new Date().toISOString(),
    isCharity: false,
    soldNumbers: [2, 4, 6, 8, 10, 12, 14, 16],
  },
  {
    id: '3',
    title: 'Ajuda para Tratamento Médico',
    description: 'Toda a renda será destinada ao tratamento médico de crianças com câncer no Hospital da Criança.',
    price: 5,
    totalNumbers: 200,
    imageUrl: 'https://images.pexels.com/photos/5214961/pexels-photo-5214961.jpeg',
    drawDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    status: 'active',
    createdBy: 'admin-1',
    createdAt: new Date().toISOString(),
    isCharity: true,
    soldNumbers: [25, 50, 75, 100, 125, 150, 175, 200],
  },
];

const mockTickets: Ticket[] = [];

// Get all raffles
export const getRaffles = async (): Promise<Raffle[]> => {
  // Simulating API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return [...mockRaffles];
};

// Get raffle by ID
export const getRaffleById = async (id: string): Promise<Raffle | null> => {
  // Simulating API call delay
  await new Promise(resolve => setTimeout(resolve, 300));
  const raffle = mockRaffles.find(r => r.id === id);
  return raffle || null;
};

// Create a new raffle
export const createRaffle = async (raffleData: Omit<Raffle, 'id' | 'createdAt' | 'soldNumbers'>): Promise<Raffle> => {
  // Simulating API call delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const newRaffle: Raffle = {
    ...raffleData,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    soldNumbers: [],
  };
  
  mockRaffles.push(newRaffle);
  return newRaffle;
};

// Get raffle numbers status
export const getRaffleNumbers = async (raffleId: string): Promise<RaffleNumber[]> => {
  // Simulating API call delay
  await new Promise(resolve => setTimeout(resolve, 400));
  
  const raffle = mockRaffles.find(r => r.id === raffleId);
  if (!raffle) {
    throw new Error('Raffle not found');
  }
  
  const numbers: RaffleNumber[] = [];
  
  for (let i = 1; i <= raffle.totalNumbers; i++) {
    numbers.push({
      number: i,
      status: raffle.soldNumbers.includes(i) ? 'sold' : 'available'
    });
  }
  
  return numbers;
};

// Purchase raffle tickets
export const purchaseTickets = async (
  raffleId: string, 
  userId: string, 
  selectedNumbers: number[], 
  paymentMethod: 'pix' | 'credit_card'
): Promise<Ticket> => {
  // Simulating API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const raffle = mockRaffles.find(r => r.id === raffleId);
  if (!raffle) {
    throw new Error('Rifa não encontrada');
  }
  
  // Check if the numbers are available
  for (const num of selectedNumbers) {
    if (raffle.soldNumbers.includes(num)) {
      throw new Error(`O número ${num} já foi vendido`);
    }
    
    if (num < 1 || num > raffle.totalNumbers) {
      throw new Error(`O número ${num} é inválido`);
    }
  }
  
  // Update raffle with sold numbers
  raffle.soldNumbers = [...raffle.soldNumbers, ...selectedNumbers];
  
  // Create ticket
  const newTicket: Ticket = {
    id: uuidv4(),
    raffleId,
    userId,
    numbers: selectedNumbers,
    purchaseDate: new Date().toISOString(),
    paymentStatus: 'pending',
    paymentMethod,
  };
  
  mockTickets.push(newTicket);
  
  return newTicket;
};

// Get user tickets
export const getUserTickets = async (userId: string): Promise<Ticket[]> => {
  // Simulating API call delay
  await new Promise(resolve => setTimeout(resolve, 600));
  
  return mockTickets.filter(ticket => ticket.userId === userId);
};

// Get raffle creator's raffles
export const getUserRaffles = async (userId: string): Promise<Raffle[]> => {
  // Simulating API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return mockRaffles.filter(raffle => raffle.createdBy === userId);
};