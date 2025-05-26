import { supabase } from '../lib/supabase';
import { Raffle, RaffleNumber, Ticket } from '../types';

// Mock storage for raffles when database is not available
let mockRaffles: Raffle[] = [];

export const createRaffle = async (raffleData: Omit<Raffle, 'id' | 'createdAt' | 'soldNumbers'>): Promise<Raffle> => {
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

    if (error) {
      // If database operation fails, create a mock raffle
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
    // If any error occurs, create a mock raffle
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
  try {
    const { data: rafflesData, error: rafflesError } = await supabase
      .from('raffles')
      .select('*');

    if (rafflesError) {
      return mockRaffles;
    }

    const { data: numbersData, error: numbersError } = await supabase
      .from('raffle_numbers')
      .select('raffle_id, number')
      .eq('status', 'sold');

    if (numbersError) {
      return mockRaffles;
    }

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
    return mockRaffles;
  }
};

export const getRaffleById = async (id: string): Promise<Raffle | null> => {
  try {
    const { data: raffle, error: raffleError } = await supabase
      .from('raffles')
      .select('*')
      .eq('id', id)
      .single();

    if (raffleError) {
      return mockRaffles.find(r => r.id === id) || null;
    }

    const { data: numbers, error: numbersError } = await supabase
      .from('raffle_numbers')
      .select('number')
      .eq('raffle_id', id)
      .eq('status', 'sold');

    if (numbersError) {
      return mockRaffles.find(r => r.id === id) || null;
    }

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
    return mockRaffles.find(r => r.id === id) || null;
  }
};

export const getRaffleNumbers = async (raffleId: string): Promise<RaffleNumber[]> => {
  try {
    const { data, error } = await supabase
      .from('raffle_numbers')
      .select('*')
      .eq('raffle_id', raffleId);

    if (error) {
      const raffle = mockRaffles.find(r => r.id === raffleId);
      if (!raffle) return [];
      
      return Array.from({ length: raffle.totalNumbers }, (_, i) => ({
        number: i + 1,
        status: 'available',
      }));
    }

    return data.map(number => ({
      number: number.number,
      status: number.status,
      userId: number.user_id,
    }));
  } catch (error) {
    const raffle = mockRaffles.find(r => r.id === raffleId);
    if (!raffle) return [];
    
    return Array.from({ length: raffle.totalNumbers }, (_, i) => ({
      number: i + 1,
      status: 'available',
    }));
  }
};

export const getUserRaffles = async (userId: string): Promise<Raffle[]> => {
  try {
    // First check if the user has any tickets
    const { data: ticketsData, error: ticketsError } = await supabase
      .from('tickets')
      .select('raffle_id')
      .eq('user_id', userId);

    if (ticketsError) {
      return mockRaffles.filter(r => r.createdBy === userId);
    }

    // Get all raffles created by the user or where they have tickets
    const { data: rafflesData, error: rafflesError } = await supabase
      .from('raffles')
      .select('*')
      .or(`created_by.eq.${userId},id.in.(${ticketsData.map(t => t.raffle_id).join(',')})`);

    if (rafflesError) {
      return mockRaffles.filter(r => r.createdBy === userId);
    }

    const { data: numbersData, error: numbersError } = await supabase
      .from('raffle_numbers')
      .select('raffle_id, number')
      .eq('status', 'sold')
      .in('raffle_id', rafflesData.map(r => r.id));

    if (numbersError) {
      return mockRaffles.filter(r => r.createdBy === userId);
    }

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
    return mockRaffles.filter(r => r.createdBy === userId);
  }
};

export const getUserTickets = async (userId: string): Promise<Ticket[]> => {
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

    if (error) return [];

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
    return [];
  }
};

export const purchaseTickets = async (
  raffleId: string,
  userId: string,
  numbers: number[],
  paymentMethod: 'pix' | 'credit_card'
): Promise<void> => {
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

    if (ticketError) {
      const raffle = mockRaffles.find(r => r.id === raffleId);
      if (raffle) {
        raffle.soldNumbers = [...raffle.soldNumbers, ...numbers];
      }
      return;
    }

    const { error: numbersError } = await supabase
      .from('raffle_numbers')
      .update({
        status: 'sold',
        user_id: userId,
        ticket_id: ticket.id
      })
      .eq('raffle_id', raffleId)
      .in('number', numbers);

    if (numbersError) {
      const raffle = mockRaffles.find(r => r.id === raffleId);
      if (raffle) {
        raffle.soldNumbers = [...raffle.soldNumbers, ...numbers];
      }
    }
  } catch (error) {
    const raffle = mockRaffles.find(r => r.id === raffleId);
    if (raffle) {
      raffle.soldNumbers = [...raffle.soldNumbers, ...numbers];
    }
  }
};