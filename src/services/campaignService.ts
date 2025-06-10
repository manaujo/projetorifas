import { supabase } from '../lib/supabase';
import { Campaign, CampaignTicket, BuyerRanking, CampaignPromotion } from '../types';

// Mock storage for campaigns when database is not available
let mockCampaigns: Campaign[] = [
  {
    id: 'campaign-1',
    title: 'VW T‑CROSS TSI COMFORTLINE 2022 OU R$ 115.000,00 NO PIX',
    description: 'Concorra a um Volkswagen T-Cross TSI Comfortline 2022 0KM ou R$ 115.000,00 no PIX! Uma oportunidade única de realizar o sonho do carro próprio ou garantir uma quantia em dinheiro.',
    coverImage: 'https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg',
    totalTickets: 100000,
    ticketPrice: 2.50,
    featured: true,
    status: 'active',
    mode: 'simple',
    promotions: [
      { id: 'promo-1', quantity: 10, price: 19.50 },
      { id: 'promo-2', quantity: 15, price: 30.00 },
      { id: 'promo-3', quantity: 20, price: 38.00 },
      { id: 'promo-4', quantity: 50, price: 90.00 },
      { id: 'promo-5', quantity: 100, price: 175.00 },
    ],
    prizes: [
      {
        id: 'prize-1',
        title: 'VW T-Cross TSI Comfortline 2022 OU R$ 115.000,00 no PIX',
        description: 'Volkswagen T-Cross TSI Comfortline 2022 0KM, cor a escolher, ou R$ 115.000,00 depositados na conta do ganhador via PIX',
        imageUrl: 'https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg',
        position: 1,
        type: 'main',
      },
      {
        id: 'prize-2',
        title: 'R$ 5.000,00 no PIX',
        description: 'Prêmio para o maior comprador da campanha',
        position: 2,
        type: 'biggest_buyer',
      },
      {
        id: 'prize-3',
        title: 'R$ 1.000,00 no PIX',
        description: 'Prêmio para o portador do bilhete premiado',
        position: 3,
        type: 'winning_ticket',
      },
    ],
    winningTicket: '003457',
    createdBy: 'admin-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    pixKey: 'campanha@pix.com',
  },
  {
    id: 'campaign-2',
    title: 'iPhone 15 Pro Max 256GB OU R$ 12.000,00 NO PIX',
    description: 'Concorra ao mais novo iPhone 15 Pro Max 256GB na cor de sua escolha ou R$ 12.000,00 no PIX! Tecnologia de ponta na palma da sua mão.',
    coverImage: 'https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg',
    totalTickets: 10000,
    ticketPrice: 5.00,
    featured: false,
    status: 'active',
    mode: 'simple',
    promotions: [
      { id: 'promo-6', quantity: 5, price: 20.00 },
      { id: 'promo-7', quantity: 10, price: 35.00 },
      { id: 'promo-8', quantity: 20, price: 65.00 },
      { id: 'promo-9', quantity: 50, price: 150.00 },
    ],
    prizes: [
      {
        id: 'prize-4',
        title: 'iPhone 15 Pro Max 256GB OU R$ 12.000,00 no PIX',
        description: 'iPhone 15 Pro Max 256GB na cor de sua escolha ou R$ 12.000,00 depositados via PIX',
        imageUrl: 'https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg',
        position: 1,
        type: 'main',
      },
      {
        id: 'prize-5',
        title: 'R$ 1.000,00 no PIX',
        description: 'Prêmio para o maior comprador da campanha',
        position: 2,
        type: 'biggest_buyer',
      },
      {
        id: 'prize-6',
        title: 'R$ 500,00 no PIX',
        description: 'Prêmio para o portador do bilhete premiado',
        position: 3,
        type: 'winning_ticket',
      },
    ],
    winningTicket: '007890',
    createdBy: 'admin-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    pixKey: 'iphone@pix.com',
  },
];

// Generate random ticket numbers for campaigns
const generateRandomTickets = (campaignId: string, totalTickets: number): CampaignTicket[] => {
  const tickets: CampaignTicket[] = [];
  const usedNumbers = new Set<string>();
  
  for (let i = 0; i < totalTickets; i++) {
    let ticketNumber: string;
    do {
      // Generate random 6-digit number
      ticketNumber = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    } while (usedNumbers.has(ticketNumber));
    
    usedNumbers.add(ticketNumber);
    
    tickets.push({
      id: `ticket-${campaignId}-${i + 1}`,
      campaignId,
      number: ticketNumber,
      isPrize: false,
      status: 'available',
    });
  }
  
  return tickets;
};

// Initialize mock tickets for campaigns
let mockTickets: { [campaignId: string]: CampaignTicket[] } = {};
mockCampaigns.forEach(campaign => {
  mockTickets[campaign.id] = generateRandomTickets(campaign.id, Math.min(campaign.totalTickets, 1000)); // Limit for demo
});

// Initialize database schema if tables don't exist
const initializeDatabase = async () => {
  try {
    const { error } = await supabase
      .from('campaigns')
      .select('id')
      .limit(1);

    if (error) {
      console.warn('Campaign tables not found, using mock data. Please run the migration in Supabase SQL Editor.');
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

export const createCampaign = async (campaignData: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>): Promise<Campaign> => {
  const dbAvailable = await checkDatabase();
  
  console.log('Criando campanha:', campaignData); // Debug
  
  if (!dbAvailable) {
    // Create mock campaign
    const mockCampaign: Campaign = {
      id: `mock-campaign-${Date.now()}`,
      title: campaignData.title,
      description: campaignData.description,
      coverImage: campaignData.coverImage,
      totalTickets: campaignData.totalTickets,
      ticketPrice: campaignData.ticketPrice,
      featured: campaignData.featured,
      status: campaignData.status,
      mode: campaignData.mode,
      comboRules: campaignData.comboRules,
      prizes: campaignData.prizes,
      promotions: campaignData.promotions || [],
      winningTicket: campaignData.winningTicket,
      createdBy: campaignData.createdBy,
      pixKey: campaignData.pixKey,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockCampaigns.push(mockCampaign);
    
    // Generate tickets for the new campaign
    mockTickets[mockCampaign.id] = generateRandomTickets(mockCampaign.id, Math.min(mockCampaign.totalTickets, 1000));
    
    console.log('Campanha mock criada:', mockCampaign); // Debug
    return mockCampaign;
  }

  try {
    const { data, error } = await supabase
      .from('campaigns')
      .insert({
        title: campaignData.title,
        description: campaignData.description,
        cover_image: campaignData.coverImage,
        total_tickets: campaignData.totalTickets,
        ticket_price: campaignData.ticketPrice,
        featured: campaignData.featured,
        status: campaignData.status,
        mode: campaignData.mode,
        combo_rules: campaignData.comboRules,
        created_by: campaignData.createdBy,
        pix_key: campaignData.pixKey,
      })
      .select()
      .single();

    if (error) {
      console.error('Erro no Supabase:', error);
      throw error;
    }

    console.log('Campanha criada no Supabase:', data); // Debug

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      coverImage: data.cover_image,
      totalTickets: data.total_tickets,
      ticketPrice: data.ticket_price,
      featured: data.featured,
      status: data.status,
      mode: data.mode,
      comboRules: data.combo_rules,
      prizes: campaignData.prizes,
      promotions: campaignData.promotions || [],
      winningTicket: campaignData.winningTicket,
      createdBy: data.created_by,
      pixKey: data.pix_key,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  } catch (error) {
    console.error('Database operation failed, using mock data:', error);
    // Fallback to mock campaign
    const mockCampaign: Campaign = {
      id: `mock-campaign-${Date.now()}`,
      title: campaignData.title,
      description: campaignData.description,
      coverImage: campaignData.coverImage,
      totalTickets: campaignData.totalTickets,
      ticketPrice: campaignData.ticketPrice,
      featured: campaignData.featured,
      status: campaignData.status,
      mode: campaignData.mode,
      comboRules: campaignData.comboRules,
      prizes: campaignData.prizes,
      promotions: campaignData.promotions || [],
      winningTicket: campaignData.winningTicket,
      createdBy: campaignData.createdBy,
      pixKey: campaignData.pixKey,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockCampaigns.push(mockCampaign);
    mockTickets[mockCampaign.id] = generateRandomTickets(mockCampaign.id, Math.min(mockCampaign.totalTickets, 1000));
    return mockCampaign;
  }
};

export const getCampaigns = async (): Promise<Campaign[]> => {
  const dbAvailable = await checkDatabase();
  
  if (!dbAvailable) {
    return mockCampaigns;
  }

  try {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(campaign => ({
      id: campaign.id,
      title: campaign.title,
      description: campaign.description,
      coverImage: campaign.cover_image,
      totalTickets: campaign.total_tickets,
      ticketPrice: campaign.ticket_price,
      featured: campaign.featured,
      status: campaign.status,
      mode: campaign.mode,
      comboRules: campaign.combo_rules,
      prizes: [], // Would need to fetch from a separate prizes table
      promotions: [], // Would need to fetch from a separate promotions table
      createdBy: campaign.created_by,
      pixKey: campaign.pix_key,
      createdAt: campaign.created_at,
      updatedAt: campaign.updated_at,
    }));
  } catch (error) {
    console.error('Database operation failed, using mock data:', error);
    return mockCampaigns;
  }
};

export const getCampaignById = async (id: string): Promise<Campaign | null> => {
  const dbAvailable = await checkDatabase();
  
  if (!dbAvailable) {
    return mockCampaigns.find(c => c.id === id) || null;
  }

  try {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      coverImage: data.cover_image,
      totalTickets: data.total_tickets,
      ticketPrice: data.ticket_price,
      featured: data.featured,
      status: data.status,
      mode: data.mode,
      comboRules: data.combo_rules,
      prizes: [], // Would need to fetch from a separate prizes table
      promotions: [], // Would need to fetch from a separate promotions table
      createdBy: data.created_by,
      pixKey: data.pix_key,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  } catch (error) {
    console.error('Database operation failed, using mock data:', error);
    return mockCampaigns.find(c => c.id === id) || null;
  }
};

export const getCampaignTickets = async (campaignId: string): Promise<CampaignTicket[]> => {
  const dbAvailable = await checkDatabase();
  
  if (!dbAvailable) {
    return mockTickets[campaignId] || [];
  }

  try {
    const { data, error } = await supabase
      .from('campaign_tickets')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('number', { ascending: true });

    if (error) throw error;

    return data.map(ticket => ({
      id: ticket.id,
      campaignId: ticket.campaign_id,
      number: ticket.number,
      isPrize: ticket.is_prize,
      prizeDescription: ticket.prize_description,
      status: ticket.status,
      userId: ticket.user_id,
      purchaseDate: ticket.purchase_date,
    }));
  } catch (error) {
    console.error('Database operation failed, using mock data:', error);
    return mockTickets[campaignId] || [];
  }
};

export const getBuyerRanking = async (campaignId: string): Promise<BuyerRanking[]> => {
  const dbAvailable = await checkDatabase();
  
  if (!dbAvailable) {
    // Generate mock ranking data
    const tickets = mockTickets[campaignId] || [];
    const soldTickets = tickets.filter(t => t.status === 'sold');
    
    const buyerStats: { [userId: string]: { name: string; count: number } } = {};
    
    soldTickets.forEach(ticket => {
      if (ticket.userId) {
        if (!buyerStats[ticket.userId]) {
          buyerStats[ticket.userId] = {
            name: `Usuário ${ticket.userId.slice(-4)}`,
            count: 0
          };
        }
        buyerStats[ticket.userId].count++;
      }
    });
    
    return Object.entries(buyerStats)
      .map(([userId, stats]) => ({
        userId,
        userName: stats.name,
        ticketsBought: stats.count,
        participationPercentage: Math.round((stats.count / soldTickets.length) * 100)
      }))
      .sort((a, b) => b.ticketsBought - a.ticketsBought);
  }

  try {
    const { data, error } = await supabase
      .from('buyer_rankings')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('tickets_bought', { ascending: false });

    if (error) throw error;

    return data.map(ranking => ({
      userId: ranking.user_id,
      userName: ranking.user_name,
      ticketsBought: ranking.tickets_bought,
      participationPercentage: ranking.participation_percentage,
    }));
  } catch (error) {
    console.error('Database operation failed:', error);
    return [];
  }
};

export const purchaseTickets = async (
  campaignId: string,
  userId: string,
  ticketNumbers: number[],
): Promise<void> => {
  const dbAvailable = await checkDatabase();
  
  if (!dbAvailable) {
    // For mock campaigns, update ticket status
    const tickets = mockTickets[campaignId] || [];
    const ticketNumberStrings = ticketNumbers.map(n => n.toString().padStart(6, '0'));
    
    tickets.forEach(ticket => {
      if (ticketNumberStrings.includes(ticket.number) && ticket.status === 'available') {
        ticket.status = 'sold';
        ticket.userId = userId;
        ticket.purchaseDate = new Date().toISOString();
      }
    });
    
    console.log(`Mock purchase: Campaign ${campaignId}, User ${userId}, Tickets ${ticketNumbers.join(', ')}`);
    return;
  }

  try {
    const { error } = await supabase
      .from('campaign_tickets')
      .update({
        status: 'sold',
        user_id: userId,
        purchase_date: new Date().toISOString(),
      })
      .eq('campaign_id', campaignId)
      .in('number', ticketNumbers)
      .eq('status', 'available');

    if (error) throw error;
  } catch (error) {
    console.error('Database operation failed:', error);
    // For mock campaigns, just simulate the purchase
    console.log(`Mock purchase: Campaign ${campaignId}, User ${userId}, Tickets ${ticketNumbers.join(', ')}`);
  }
};

export const updateCampaignStatus = async (
  campaignId: string,
  status: Campaign['status'],
): Promise<void> => {
  const dbAvailable = await checkDatabase();
  
  if (!dbAvailable) {
    // Update mock campaign
    const campaign = mockCampaigns.find(c => c.id === campaignId);
    if (campaign) {
      campaign.status = status;
      campaign.updatedAt = new Date().toISOString();
    }
    return;
  }

  try {
    const { error } = await supabase
      .from('campaigns')
      .update({ status })
      .eq('id', campaignId);

    if (error) throw error;
  } catch (error) {
    console.error('Database operation failed:', error);
    // Update mock campaign
    const campaign = mockCampaigns.find(c => c.id === campaignId);
    if (campaign) {
      campaign.status = status;
      campaign.updatedAt = new Date().toISOString();
    }
  }
};