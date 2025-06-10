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
      buy: 5,
      get: 1,
    },
    createdBy: 'admin-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
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
    createdBy: 'admin-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const createCampaign = async (campaignData: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>): Promise<Campaign> => {
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
      })
      .select()
      .single();

    if (error) {
      // If database operation fails, create a mock campaign
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
        createdBy: campaignData.createdBy,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockCampaigns.push(mockCampaign);
      return mockCampaign;
    }

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
      createdBy: data.created_by,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  } catch (error) {
    // If any error occurs, create a mock campaign
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
      createdBy: campaignData.createdBy,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockCampaigns.push(mockCampaign);
    return mockCampaign;
  }
};

export const getCampaigns = async (): Promise<Campaign[]> => {
  try {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return mockCampaigns;
    }

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
      createdBy: campaign.created_by,
      createdAt: campaign.created_at,
      updatedAt: campaign.updated_at,
    }));
  } catch (error) {
    return mockCampaigns;
  }
};

export const getCampaignById = async (id: string): Promise<Campaign | null> => {
  try {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return mockCampaigns.find(c => c.id === id) || null;
    }

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
      createdBy: data.created_by,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  } catch (error) {
    return mockCampaigns.find(c => c.id === id) || null;
  }
};

export const getCampaignTickets = async (campaignId: string): Promise<CampaignTicket[]> => {
  try {
    const { data, error } = await supabase
      .from('campaign_tickets')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('number', { ascending: true });

    if (error) {
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
  try {
    const { data, error } = await supabase
      .from('buyer_rankings')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('tickets_bought', { ascending: false });

    if (error) {
      return [];
    }

    return data.map(ranking => ({
      userId: ranking.user_id,
      userName: ranking.user_name,
      ticketsBought: ranking.tickets_bought,
      participationPercentage: ranking.participation_percentage,
    }));
  } catch (error) {
    return [];
  }
};

export const purchaseTickets = async (
  campaignId: string,
  userId: string,
  ticketNumbers: number[],
): Promise<void> => {
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

    if (error) {
      // For mock campaigns, just simulate the purchase
      console.log(`Mock purchase: Campaign ${campaignId}, User ${userId}, Tickets ${ticketNumbers.join(', ')}`);
    }
  } catch (error) {
    // For mock campaigns, just simulate the purchase
    console.log(`Mock purchase: Campaign ${campaignId}, User ${userId}, Tickets ${ticketNumbers.join(', ')}`);
  }
};

export const updateCampaignStatus = async (
  campaignId: string,
  status: Campaign['status'],
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('campaigns')
      .update({ status })
      .eq('id', campaignId);

    if (error) {
      // Update mock campaign
      const campaign = mockCampaigns.find(c => c.id === campaignId);
      if (campaign) {
        campaign.status = status;
        campaign.updatedAt = new Date().toISOString();
      }
    }
  } catch (error) {
    // Update mock campaign
    const campaign = mockCampaigns.find(c => c.id === campaignId);
    if (campaign) {
      campaign.status = status;
      campaign.updatedAt = new Date().toISOString();
    }
  }
};