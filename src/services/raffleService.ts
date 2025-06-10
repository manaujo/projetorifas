import { supabase } from '../lib/supabase';
import { Raffle, RaffleNumber, Ticket } from '../types';

// Mock storage for raffles when database is not available
let mockRaffles: Raffle[] = [
  {
    id: 'mock-1701234567890',
    title: 'iPhone 15 Pro Max',
    description: 'iPhone 15 Pro Max 256GB na cor de sua escolha',
    price: 10.00,
    totalNumbers: 1000,
    imageUrl: 'https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg',
    drawDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    createdBy: 'admin-1',
    createdAt: new Date().toISOString(),
    isCharity: false,
    soldNumbers: [],
    pixKey: 'admin@pix.com',
  },
  {
    id: 'mock-1701234567891',
    title: 'Notebook Gamer RTX 4060',
    description: 'Notebook Gamer com RTX 4060, 16GB RAM, SSD 512GB',
    price: 15.00,
    totalNumbers: 500,
    imageUrl: 'https://images.pexels.com/photos/2047905/pexels-photo-2047905.jpeg',
    drawDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    createdBy: 'admin-1',
    createdAt: new Date().toISOString(),
    isCharity: false,
    soldNumbers: [],
    pixKey: 'notebook@pix.com',
  }
];

// Mock purchases for admin panel
let mockPurchases: any[] = [];

// Initialize database schema if tables don't exist
const initializeDatabase = async () => {
  try {
    // Check if tables exist by attempting a simple query
    const { error: rafflesError } = await supabase
      .from('raffles')
      .select('id')
      .limit(1);

    if (rafflesError) {
      console.warn('Database tables not found, using mock data. Please run the migration in Supabase SQL Editor.');
      return false;
    }

    return true;
  } catch (error) {
    console.warn('Database connection failed, using mock data.');
    return false;
  }
};

let databaseAvailable: boolean | null = null;

const checkDatabase = async () => {
  if (databaseAvailable === null) {
    databaseAvailable = await initializeDatabase();
  }
  return databaseAvailable;
};

export const createRaffle = async (raffleData: Omit<Raffle, 'id' | 'createdAt' | 'soldNumbers'>): Promise<Raffle> => {
  const dbAvailable = await checkDatabase();
  
  if (!dbAvailable) {
    // Create mock raffle
    const mockRaffle: Raffle = {
      id: `mock-${Date.now()}`,
      title: raffleData.title,
      description: raffleData.description,
      price: raffleData.price,
      totalNumbers: raffleData.totalNumbers,
      imageUrl: raffleData.imageUrl,
      drawDate: raffleData.drawDate,
      status: raffleData.status,
      createdBy: raffleData.createdBy,
      createdAt: new Date().toISOString(),
      isCharity: raffleData.isCharity,
      soldNumbers: [],
      pixKey: raffleData.pixKey,
    };

    mockRaffles.push(mockRaffle);
    return mockRaffle;
  }

  try {
    const { data, error } = await supabase
      .from('raffles')
      .insert({
        title: raffleData.title,
        description: raffleData.description,
        price: raffleData.price,
        total_numbers: raffleData.totalNumbers,
        image_url: raffleData.imageUrl,
        draw_date: raffleData.drawDate,
        status: raffleData.status,
        is_charity: raffleData.isCharity,
        created_by: raffleData.createdBy,
        pix_key: raffleData.pixKey,
      })
      .select()
      .single();

    if (error) throw error;

    // Create raffle numbers
    const numbers = Array.from({ length: raffleData.totalNumbers }, (_, i) => ({
      raffle_id: data.id,
      number: i + 1,
      status: 'available'
    }));

    await supabase
      .from('raffle_numbers')
      .insert(numbers);

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      price: data.price,
      totalNumbers: data.total_numbers,
      imageUrl: data.image_url,
      drawDate: data.draw_date,
      status: data.status,
      createdBy: data.created_by,
      createdAt: data.created_at,
      isCharity: data.is_charity,
      soldNumbers: [],
      pixKey: data.pix_key,
    };
  } catch (error) {
    console.error('Database operation failed, using mock data:', error);
    // Fallback to mock raffle
    const mockRaffle: Raffle = {
      id: `mock-${Date.now()}`,
      title: raffleData.title,
      description: raffleData.description,
      price: raffleData.price,
      totalNumbers: raffleData.totalNumbers,
      imageUrl: raffleData.imageUrl,
      drawDate: raffleData.drawDate,
      status: raffleData.status,
      createdBy: raffleData.createdBy,
      createdAt: new Date().toISOString(),
      isCharity: raffleData.isCharity,
      soldNumbers: [],
      pixKey: raffleData.pixKey,
    };

    mockRaffles.push(mockRaffle);
    return mockRaffle;
  }
};

export const getRaffles = async (): Promise<Raffle[]> => {
  const dbAvailable = await checkDatabase();
  
  if (!dbAvailable) {
    return mockRaffles;
  }

  try {
    const { data: rafflesData, error: rafflesError } = await supabase
      .from('raffles')
      .select('*')
      .order('created_at', { ascending: false });

    if (rafflesError) throw rafflesError;

    const { data: numbersData, error: numbersError } = await supabase
      .from('raffle_numbers')
      .select('raffle_id, number')
      .eq('status', 'sold');

    if (numbersError) throw numbersError;

    // Group sold numbers by raffle_id
    const soldNumbersByRaffle = numbersData.reduce((acc: { [key: string]: number[] }, curr) => {
      if (!acc[curr.raffle_id]) {
        acc[curr.raffle_id] = [];
      }
      acc[curr.raffle_id].push(curr.number);
      return acc;
    }, {});

    return rafflesData.map(raffle => ({
      id: raffle.id,
      title: raffle.title,
      description: raffle.description,
      price: raffle.price,
      totalNumbers: raffle.total_numbers,
      imageUrl: raffle.image_url,
      drawDate: raffle.draw_date,
      status: raffle.status,
      createdBy: raffle.created_by,
      createdAt: raffle.created_at,
      isCharity: raffle.is_charity,
      soldNumbers: soldNumbersByRaffle[raffle.id] || [],
      pixKey: raffle.pix_key,
    }));
  } catch (error) {
    console.error('Database operation failed, using mock data:', error);
    return mockRaffles;
  }
};

export const getRaffleById = async (id: string): Promise<Raffle | null> => {
  const dbAvailable = await checkDatabase();
  
  if (!dbAvailable) {
    return mockRaffles.find(r => r.id === id) || null;
  }

  try {
    const { data: raffle, error: raffleError } = await supabase
      .from('raffles')
      .select('*')
      .eq('id', id)
      .single();

    if (raffleError) throw raffleError;

    const { data: numbers, error: numbersError } = await supabase
      .from('raffle_numbers')
      .select('number')
      .eq('raffle_id', id)
      .eq('status', 'sold');

    if (numbersError) throw numbersError;

    return {
      id: raffle.id,
      title: raffle.title,
      description: raffle.description,
      price: raffle.price,
      totalNumbers: raffle.total_numbers,
      imageUrl: raffle.image_url,
      drawDate: raffle.draw_date,
      status: raffle.status,
      createdBy: raffle.created_by,
      createdAt: raffle.created_at,
      isCharity: raffle.is_charity,
      soldNumbers: numbers.map(n => n.number),
      pixKey: raffle.pix_key,
    };
  } catch (error) {
    console.error('Database operation failed, using mock data:', error);
    return mockRaffles.find(r => r.id === id) || null;
  }
};

export const getRaffleNumbers = async (raffleId: string): Promise<RaffleNumber[]> => {
  const dbAvailable = await checkDatabase();
  
  if (!dbAvailable) {
    const raffle = mockRaffles.find(r => r.id === raffleId);
    if (!raffle) return [];
    
    return Array.from({ length: raffle.totalNumbers }, (_, i) => ({
      number: i + 1,
      status: raffle.soldNumbers.includes(i + 1) ? 'sold' : 'available',
    }));
  }

  try {
    const { data, error } = await supabase
      .from('raffle_numbers')
      .select('*')
      .eq('raffle_id', raffleId)
      .order('number', { ascending: true });

    if (error) throw error;

    return data.map(number => ({
      number: number.number,
      status: number.status,
      userId: number.user_id,
    }));
  } catch (error) {
    console.error('Database operation failed, using mock data:', error);
    const raffle = mockRaffles.find(r => r.id === raffleId);
    if (!raffle) return [];
    
    return Array.from({ length: raffle.totalNumbers }, (_, i) => ({
      number: i + 1,
      status: raffle.soldNumbers.includes(i + 1) ? 'sold' : 'available',
    }));
  }
};

export const getUserRaffles = async (userId: string): Promise<Raffle[]> => {
  const dbAvailable = await checkDatabase();
  
  if (!dbAvailable) {
    return mockRaffles.filter(r => r.createdBy === userId);
  }

  try {
    const { data: rafflesData, error: rafflesError } = await supabase
      .from('raffles')
      .select('*')
      .eq('created_by', userId)
      .order('created_at', { ascending: false });

    if (rafflesError) throw rafflesError;

    const { data: numbersData, error: numbersError } = await supabase
      .from('raffle_numbers')
      .select('raffle_id, number')
      .eq('status', 'sold')
      .in('raffle_id', rafflesData.map(r => r.id));

    if (numbersError) throw numbersError;

    const soldNumbersByRaffle = numbersData.reduce((acc: { [key: string]: number[] }, curr) => {
      if (!acc[curr.raffle_id]) {
        acc[curr.raffle_id] = [];
      }
      acc[curr.raffle_id].push(curr.number);
      return acc;
    }, {});

    return rafflesData.map(raffle => ({
      id: raffle.id,
      title: raffle.title,
      description: raffle.description,
      price: raffle.price,
      totalNumbers: raffle.total_numbers,
      imageUrl: raffle.image_url,
      drawDate: raffle.draw_date,
      status: raffle.status,
      createdBy: raffle.created_by,
      createdAt: raffle.created_at,
      isCharity: raffle.is_charity,
      soldNumbers: soldNumbersByRaffle[raffle.id] || [],
      pixKey: raffle.pix_key,
    }));
  } catch (error) {
    console.error('Database operation failed, using mock data:', error);
    return mockRaffles.filter(r => r.createdBy === userId);
  }
};

export const getUserTickets = async (userId: string): Promise<Ticket[]> => {
  const dbAvailable = await checkDatabase();
  
  if (!dbAvailable) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('tickets')
      .select(`
        *,
        raffle_numbers!inner (
          number
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(ticket => ({
      id: ticket.id,
      raffleId: ticket.raffle_id,
      userId: ticket.user_id,
      numbers: ticket.raffle_numbers.map((n: any) => n.number),
      purchaseDate: ticket.purchase_date,
      paymentStatus: ticket.payment_status,
      paymentMethod: ticket.payment_method,
    }));
  } catch (error) {
    console.error('Database operation failed:', error);
    return [];
  }
};

export const purchaseTickets = async (
  raffleId: string,
  userId: string,
  numbers: number[],
  paymentMethod: 'pix' | 'credit_card',
  buyerInfo?: { name: string; cpf: string; phone: string }
): Promise<void> => {
  const dbAvailable = await checkDatabase();
  
  if (!dbAvailable) {
    const raffle = mockRaffles.find(r => r.id === raffleId);
    if (raffle) {
      // Add to mock purchases for admin panel
      const mockPurchase = {
        id: `purchase-${Date.now()}`,
        raffleId: raffleId,
        raffleName: raffle.title,
        buyerName: buyerInfo?.name || 'Comprador Anônimo',
        buyerPhone: buyerInfo?.phone || 'Não informado',
        buyerCpf: buyerInfo?.cpf || 'Não informado',
        ticketCount: numbers.length,
        totalAmount: numbers.length * raffle.price,
        purchaseDate: new Date().toISOString(),
        status: 'pending',
        selectedNumbers: numbers,
        paymentMethod: paymentMethod,
      };
      
      mockPurchases.push(mockPurchase);
      console.log('Mock purchase created:', mockPurchase);
    }
    return;
  }

  try {
    // Create ticket record
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .insert({
        raffle_id: raffleId,
        user_id: userId,
        purchase_date: new Date().toISOString(),
        payment_status: 'pending',
        payment_method: paymentMethod,
        buyer_info: buyerInfo,
      })
      .select()
      .single();

    if (ticketError) throw ticketError;

    // Update raffle numbers status
    const { error: numbersError } = await supabase
      .from('raffle_numbers')
      .update({
        status: 'reserved', // Start as reserved, will be 'sold' after payment confirmation
        user_id: userId,
        ticket_id: ticket.id
      })
      .eq('raffle_id', raffleId)
      .in('number', numbers)
      .eq('status', 'available');

    if (numbersError) throw numbersError;

    console.log('Purchase created successfully:', { raffleId, userId, numbers, ticketId: ticket.id });
  } catch (error) {
    console.error('Database operation failed:', error);
    throw new Error('Erro ao processar compra. Tente novamente.');
  }
};

export const confirmPurchasePayment = async (ticketId: string): Promise<void> => {
  const dbAvailable = await checkDatabase();
  
  if (!dbAvailable) {
    console.log('Mock payment confirmed for ticket:', ticketId);
    return;
  }

  try {
    // Update ticket payment status
    const { error: ticketError } = await supabase
      .from('tickets')
      .update({ payment_status: 'completed' })
      .eq('id', ticketId);

    if (ticketError) throw ticketError;

    // Update raffle numbers to sold
    const { error: numbersError } = await supabase
      .from('raffle_numbers')
      .update({ status: 'sold' })
      .eq('ticket_id', ticketId);

    if (numbersError) throw numbersError;

    console.log('Payment confirmed for ticket:', ticketId);
  } catch (error) {
    console.error('Failed to confirm payment:', error);
    throw new Error('Erro ao confirmar pagamento.');
  }
};

export const rejectPurchasePayment = async (ticketId: string): Promise<void> => {
  const dbAvailable = await checkDatabase();
  
  if (!dbAvailable) {
    console.log('Mock payment rejected for ticket:', ticketId);
    return;
  }

  try {
    // Update ticket payment status
    const { error: ticketError } = await supabase
      .from('tickets')
      .update({ payment_status: 'failed' })
      .eq('id', ticketId);

    if (ticketError) throw ticketError;

    // Release raffle numbers back to available
    const { error: numbersError } = await supabase
      .from('raffle_numbers')
      .update({ 
        status: 'available',
        user_id: null,
        ticket_id: null
      })
      .eq('ticket_id', ticketId);

    if (numbersError) throw numbersError;

    console.log('Payment rejected for ticket:', ticketId);
  } catch (error) {
    console.error('Failed to reject payment:', error);
    throw new Error('Erro ao recusar pagamento.');
  }
};

// Export mock purchases for admin panel
export const getMockPurchases = () => mockPurchases;

// Real-time subscription for raffle purchases
export const subscribeToRafflePurchases = (callback: () => void) => {
  if (databaseAvailable) {
    const subscription = supabase
      .channel('raffle_purchases')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tickets',
        },
        () => {
          callback();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  } else {
    // For mock data, simulate real-time updates
    const interval = setInterval(callback, 5000);
    return () => clearInterval(interval);
  }
};