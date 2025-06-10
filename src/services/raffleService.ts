import { supabase } from '../lib/supabase';
import { Raffle, RaffleNumber, Ticket } from '../types';

// Mock storage for raffles when database is not available
let mockRaffles: Raffle[] = [];

// Initialize database schema if tables don't exist
const initializeDatabase = async () => {
  try {
    // Check if tables exist by attempting a simple query
    const { error: rafflesError } = await supabase
      .from('raffles')
      .select('id')
      .limit(1);

    const { error: numbersError } = await supabase
      .from('raffle_numbers')
      .select('id')
      .limit(1);

    const { error: ticketsError } = await supabase
      .from('tickets')
      .select('id')
      .limit(1);

    // If any table doesn't exist, we'll work with mock data
    if (rafflesError || numbersError || ticketsError) {
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
      .select('*');

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
      .eq('raffle_id', raffleId);

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
    // First check if the user has any tickets
    const { data: ticketsData, error: ticketsError } = await supabase
      .from('tickets')
      .select('raffle_id')
      .eq('user_id', userId);

    if (ticketsError) throw ticketsError;

    const raffleIds = ticketsData.map(t => t.raffle_id);

    // Get all raffles created by the user or where they have tickets
    const { data: rafflesData, error: rafflesError } = await supabase
      .from('raffles')
      .select('*')
      .or(`created_by.eq.${userId}${raffleIds.length > 0 ? `,id.in.(${raffleIds.join(',')})` : ''}`);

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
      .eq('user_id', userId);

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
  paymentMethod: 'pix' | 'credit_card'
): Promise<void> => {
  const dbAvailable = await checkDatabase();
  
  if (!dbAvailable) {
    const raffle = mockRaffles.find(r => r.id === raffleId);
    if (raffle) {
      raffle.soldNumbers = [...raffle.soldNumbers, ...numbers];
    }
    return;
  }

  try {
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .insert({
        raffle_id: raffleId,
        user_id: userId,
        purchase_date: new Date().toISOString(),
        payment_status: 'pending',
        payment_method: paymentMethod,
      })
      .select()
      .single();

    if (ticketError) throw ticketError;

    const { error: numbersError } = await supabase
      .from('raffle_numbers')
      .update({
        status: 'sold',
        user_id: userId,
        ticket_id: ticket.id
      })
      .eq('raffle_id', raffleId)
      .in('number', numbers);

    if (numbersError) throw numbersError;
  } catch (error) {
    console.error('Database operation failed, using mock data:', error);
    const raffle = mockRaffles.find(r => r.id === raffleId);
    if (raffle) {
      raffle.soldNumbers = [...raffle.soldNumbers, ...numbers];
    }
  }
};