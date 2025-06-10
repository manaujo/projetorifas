import { supabase } from '../lib/supabase';
import { Campaign, CampaignTicket, BuyerRanking } from '../types';

// Mock storage for campaigns when database is not available
let mockCampaigns: Campaign[] = [
  {
    id: 'campaign-1',
    title: 'Mega Campanha de Natal',
    description: 'Participe da nossa mega campanha de Natal e concorra a prêmios incríveis! Temos smartphones, notebooks, vale-compras e muito mais.',
    coverImage: 'https://images.pexels.com/photos/1303081/pexels-photo-1303081.jpeg',
    totalTickets: 1000,
    ticketPrice: 15.00,
    featured: true,
    status: 'active',
    mode: 'combo',
    comboRules: {
      baseValue: 5,
      numbersPerValue: 20,
    },
    prizes: [
      {
        id: 'prize-1',
        title: 'iPhone 15 Pro Max',
        description: 'iPhone 15 Pro Max 256GB na cor Titânio Natural',
        imageUrl: 'https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg',
        position: 1,
      },
      {
        id: 'prize-2',
        title: 'MacBook Air M2',
        description: 'MacBook Air M2 13" 256GB SSD 8GB RAM',
        imageUrl: 'https://images.pexels.com/photos/205421/pexels-photo-205421.jpeg',
        position: 2,
      },
    ],
    createdBy: 'admin-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    pixKey: 'campanha@pix.com',
  },
  {
    id: 'campaign-2',
    title: 'Campanha Solidária',
    description: 'Uma campanha especial para ajudar famílias carentes. Todos os recursos arrecadados serão destinados a cestas básicas.',
    coverImage: 'https://images.pexels.com/photos/6995247/pexels-photo-6995247.jpeg',
    totalTickets: 500,
    ticketPrice: 10.00,
    featured: false,
    status: 'active',
    mode: 'simple',
    prizes: [
      {
        id: 'prize-3',
        title: 'Cestas Básicas',
        description: '100 cestas básicas para famílias carentes',
        position: 1,
      },
    ],
    createdBy: 'admin-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    pixKey: 'solidaria@pix.com',
  },
];

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
      createdBy: campaignData.createdBy,
      pixKey: campaignData.pixKey,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockCampaigns.push(mockCampaign);
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
      createdBy: campaignData.createdBy,
      pixKey: campaignData.pixKey,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockCampaigns.push(mockCampaign);
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
    // Return mock tickets for demo campaigns
    const campaign = mockCampaigns.find(c => c.id === campaignId);
    if (!campaign) return [];
    
    return Array.from({ length: campaign.totalTickets }, (_, i) => ({
      id: `ticket-${campaignId}-${i + 1}`,
      campaignId,
      number: i + 1,
      isPrize: false,
      status: 'available' as const,
    }));
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
    // Return mock tickets for demo campaigns
    const campaign = mockCampaigns.find(c => c.id === campaignId);
    if (!campaign) return [];
    
    return Array.from({ length: campaign.totalTickets }, (_, i) => ({
      id: `ticket-${campaignId}-${i + 1}`,
      campaignId,
      number: i + 1,
      isPrize: false,
      status: 'available' as const,
    }));
  }
};

export const getBuyerRanking = async (campaignId: string): Promise<BuyerRanking[]> => {
  const dbAvailable = await checkDatabase();
  
  if (!dbAvailable) {
    return [];
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
    // For mock campaigns, just simulate the purchase
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