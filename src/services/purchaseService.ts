import { supabase } from '../lib/supabase';
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
    purchaseDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
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
    purchaseDate: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    status: 'pending',
    selectedNumbers: [1, 7, 13, 21, 34, 55, 89, 144, 233, 377],
    paymentMethod: 'pix',
  },
];

// Check if database is available
const checkDatabase = async () => {
  try {
    const { error } = await supabase
      .from('tickets')
      .select('id')
      .limit(1);
    return !error;
  } catch {
    return false;
  }
};

export const getPendingPurchases = async (creatorId: string): Promise<PendingPurchase[]> => {
  const dbAvailable = await checkDatabase();
  
  if (!dbAvailable) {
    return mockPendingPurchases.filter(purchase => purchase.status === 'pending');
  }

  try {
    const { data, error } = await supabase
      .from('tickets')
      .select(`
        *,
        raffles!inner (
          id,
          title,
          created_by
        ),
        raffle_numbers!inner (
          number
        )
      `)
      .eq('raffles.created_by', creatorId)
      .eq('payment_status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(ticket => ({
      id: ticket.id,
      raffleId: ticket.raffle_id,
      raffleName: ticket.raffles.title,
      buyerName: ticket.buyer_info?.name || 'Comprador Anônimo',
      buyerPhone: ticket.buyer_info?.phone || 'Não informado',
      buyerCpf: ticket.buyer_info?.cpf || 'Não informado',
      ticketCount: ticket.raffle_numbers.length,
      totalAmount: ticket.raffle_numbers.length * 10, // This should come from raffle price
      purchaseDate: ticket.created_at,
      status: 'pending',
      selectedNumbers: ticket.raffle_numbers.map((n: any) => n.number),
      paymentMethod: ticket.payment_method,
    }));
  } catch (error) {
    console.error('Failed to fetch pending purchases:', error);
    return mockPendingPurchases.filter(purchase => purchase.status === 'pending');
  }
};

export const getAuthorizedPurchases = async (creatorId: string): Promise<PendingPurchase[]> => {
  const dbAvailable = await checkDatabase();
  
  if (!dbAvailable) {
    return mockPendingPurchases.filter(purchase => purchase.status === 'authorized');
  }

  try {
    const { data, error } = await supabase
      .from('tickets')
      .select(`
        *,
        raffles!inner (
          id,
          title,
          created_by
        ),
        raffle_numbers!inner (
          number
        )
      `)
      .eq('raffles.created_by', creatorId)
      .eq('payment_status', 'completed')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(ticket => ({
      id: ticket.id,
      raffleId: ticket.raffle_id,
      raffleName: ticket.raffles.title,
      buyerName: ticket.buyer_info?.name || 'Comprador Anônimo',
      buyerPhone: ticket.buyer_info?.phone || 'Não informado',
      buyerCpf: ticket.buyer_info?.cpf || 'Não informado',
      ticketCount: ticket.raffle_numbers.length,
      totalAmount: ticket.raffle_numbers.length * 10,
      purchaseDate: ticket.created_at,
      status: 'authorized',
      selectedNumbers: ticket.raffle_numbers.map((n: any) => n.number),
      paymentMethod: ticket.payment_method,
    }));
  } catch (error) {
    console.error('Failed to fetch authorized purchases:', error);
    return mockPendingPurchases.filter(purchase => purchase.status === 'authorized');
  }
};

export const getRejectedPurchases = async (creatorId: string): Promise<PendingPurchase[]> => {
  const dbAvailable = await checkDatabase();
  
  if (!dbAvailable) {
    return mockPendingPurchases.filter(purchase => purchase.status === 'rejected');
  }

  try {
    const { data, error } = await supabase
      .from('tickets')
      .select(`
        *,
        raffles!inner (
          id,
          title,
          created_by
        ),
        raffle_numbers!inner (
          number
        )
      `)
      .eq('raffles.created_by', creatorId)
      .eq('payment_status', 'failed')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(ticket => ({
      id: ticket.id,
      raffleId: ticket.raffle_id,
      raffleName: ticket.raffles.title,
      buyerName: ticket.buyer_info?.name || 'Comprador Anônimo',
      buyerPhone: ticket.buyer_info?.phone || 'Não informado',
      buyerCpf: ticket.buyer_info?.cpf || 'Não informado',
      ticketCount: ticket.raffle_numbers.length,
      totalAmount: ticket.raffle_numbers.length * 10,
      purchaseDate: ticket.created_at,
      status: 'rejected',
      selectedNumbers: ticket.raffle_numbers.map((n: any) => n.number),
      paymentMethod: ticket.payment_method,
    }));
  } catch (error) {
    console.error('Failed to fetch rejected purchases:', error);
    return mockPendingPurchases.filter(purchase => purchase.status === 'rejected');
  }
};

export const authorizePurchase = async (purchaseId: string): Promise<void> => {
  const dbAvailable = await checkDatabase();
  
  if (!dbAvailable) {
    const purchase = mockPendingPurchases.find(p => p.id === purchaseId);
    if (purchase) {
      purchase.status = 'authorized';
    }
    return;
  }

  try {
    // Update ticket payment status to completed
    const { error: ticketError } = await supabase
      .from('tickets')
      .update({ payment_status: 'completed' })
      .eq('id', purchaseId);

    if (ticketError) throw ticketError;

    // Update raffle numbers to sold
    const { error: numbersError } = await supabase
      .from('raffle_numbers')
      .update({ status: 'sold' })
      .eq('ticket_id', purchaseId);

    if (numbersError) throw numbersError;

    console.log('Purchase authorized:', purchaseId);
  } catch (error) {
    console.error('Failed to authorize purchase:', error);
    throw new Error('Erro ao autorizar compra');
  }
};

export const rejectPurchase = async (purchaseId: string): Promise<void> => {
  const dbAvailable = await checkDatabase();
  
  if (!dbAvailable) {
    const purchase = mockPendingPurchases.find(p => p.id === purchaseId);
    if (purchase) {
      purchase.status = 'rejected';
    }
    return;
  }

  try {
    // Update ticket payment status to failed
    const { error: ticketError } = await supabase
      .from('tickets')
      .update({ payment_status: 'failed' })
      .eq('id', purchaseId);

    if (ticketError) throw ticketError;

    // Release raffle numbers back to available
    const { error: numbersError } = await supabase
      .from('raffle_numbers')
      .update({ 
        status: 'available',
        user_id: null,
        ticket_id: null
      })
      .eq('ticket_id', purchaseId);

    if (numbersError) throw numbersError;

    console.log('Purchase rejected:', purchaseId);
  } catch (error) {
    console.error('Failed to reject purchase:', error);
    throw new Error('Erro ao recusar compra');
  }
};

export const getRaffleSettings = async (raffleId: string): Promise<RaffleSettings | null> => {
  const dbAvailable = await checkDatabase();
  
  if (!dbAvailable) {
    // Return mock settings
    return {
      id: raffleId,
      title: 'Rifa Mock',
      description: 'Descrição da rifa mock',
      price: 10.00,
      totalNumbers: 1000,
      drawDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      isCharity: false,
      pixKey: 'admin@pix.com',
      autoApprove: false,
      maxTicketsPerPurchase: 50,
    };
  }

  try {
    const { data, error } = await supabase
      .from('raffles')
      .select('*')
      .eq('id', raffleId)
      .single();

    if (error) throw error;

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      price: data.price,
      totalNumbers: data.total_numbers,
      drawDate: data.draw_date,
      status: data.status,
      isCharity: data.is_charity,
      pixKey: data.pix_key || '',
      autoApprove: false, // This would need to be added to the database schema
      maxTicketsPerPurchase: 50, // This would need to be added to the database schema
    };
  } catch (error) {
    console.error('Failed to fetch raffle settings:', error);
    return null;
  }
};

export const updateRaffleSettings = async (raffleId: string, settings: Partial<RaffleSettings>): Promise<void> => {
  const dbAvailable = await checkDatabase();
  
  if (!dbAvailable) {
    console.log('Mock settings updated for raffle:', raffleId, settings);
    return;
  }

  try {
    const { error } = await supabase
      .from('raffles')
      .update({
        title: settings.title,
        description: settings.description,
        price: settings.price,
        pix_key: settings.pixKey,
      })
      .eq('id', raffleId);

    if (error) throw error;

    console.log('Raffle settings updated:', raffleId);
  } catch (error) {
    console.error('Failed to update raffle settings:', error);
    throw new Error('Erro ao atualizar configurações');
  }
};

export const getUserRaffleIds = async (creatorId: string): Promise<string[]> => {
  const dbAvailable = await checkDatabase();
  
  if (!dbAvailable) {
    return ['mock-1701234567890', 'mock-1701234567891'];
  }

  try {
    const { data, error } = await supabase
      .from('raffles')
      .select('id')
      .eq('created_by', creatorId);

    if (error) throw error;

    return data.map(raffle => raffle.id);
  } catch (error) {
    console.error('Failed to fetch user raffle IDs:', error);
    return [];
  }
};

// Real-time subscription for purchases
export const subscribeToPurchases = (creatorId: string, callback: () => void) => {
  const subscription = supabase
    .channel('purchases')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'tickets',
        filter: `raffles.created_by=eq.${creatorId}`,
      },
      () => {
        callback();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(subscription);
  };
};