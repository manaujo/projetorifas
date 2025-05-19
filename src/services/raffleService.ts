import { supabase } from '../lib/supabase';
import { Raffle, RaffleNumber, Ticket } from '../types';

export const createRaffle = async (raffleData: Omit<Raffle, 'id' | 'createdAt' | 'soldNumbers'>): Promise<Raffle> => {
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
    status: 'available',
  }));

  const { error: numbersError } = await supabase
    .from('raffle_numbers')
    .insert(numbers);

  if (numbersError) throw numbersError;

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
};

export const getRaffles = async (): Promise<Raffle[]> => {
  const { data, error } = await supabase
    .from('raffles')
    .select(`
      *,
      raffle_numbers!inner(number)
    `)
    .eq('raffle_numbers.status', 'sold');

  if (error) throw error;

  return data.map(raffle => ({
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
    soldNumbers: raffle.raffle_numbers.map((n: any) => n.number),
  }));
};

export const getRaffleById = async (id: string): Promise<Raffle | null> => {
  const { data, error } = await supabase
    .from('raffles')
    .select(`
      *,
      raffle_numbers!inner(number)
    `)
    .eq('id', id)
    .eq('raffle_numbers.status', 'sold')
    .single();

  if (error) return null;

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
    soldNumbers: data.raffle_numbers.map((n: any) => n.number),
  };
};

export const getRaffleNumbers = async (raffleId: string): Promise<RaffleNumber[]> => {
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
};

export const getUserRaffles = async (userId: string): Promise<Raffle[]> => {
  const { data, error } = await supabase
    .from('raffles')
    .select(`
      *,
      raffle_numbers!inner(number)
    `)
    .eq('created_by', userId)
    .eq('raffle_numbers.status', 'sold');

  if (error) throw error;

  return data.map(raffle => ({
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
    soldNumbers: raffle.raffle_numbers.map((n: any) => n.number),
  }));
};

export const getUserTickets = async (userId: string): Promise<Ticket[]> => {
  const { data, error } = await supabase
    .from('tickets')
    .select(`
      *,
      raffle_numbers!inner(number)
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
};

export const purchaseTickets = async (
  raffleId: string,
  userId: string,
  numbers: number[],
  paymentMethod: 'pix' | 'credit_card'
): Promise<void> => {
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

  // Update raffle numbers status
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
};