import { supabase } from '../lib/supabase';
import { Campaign, CampaignTicket, BuyerRanking } from '../types';

export const createCampaign = async (campaignData: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>): Promise<Campaign> => {
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
    createdBy: data.created_by,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
};

export const getCampaigns = async (): Promise<Campaign[]> => {
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
    createdBy: campaign.created_by,
    createdAt: campaign.created_at,
    updatedAt: campaign.updated_at,
  }));
};

export const getCampaignById = async (id: string): Promise<Campaign | null> => {
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;

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
};

export const getCampaignTickets = async (campaignId: string): Promise<CampaignTicket[]> => {
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
};

export const getBuyerRanking = async (campaignId: string): Promise<BuyerRanking[]> => {
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
};

export const purchaseTickets = async (
  campaignId: string,
  userId: string,
  ticketNumbers: number[],
): Promise<void> => {
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
};

export const updateCampaignStatus = async (
  campaignId: string,
  status: Campaign['status'],
): Promise<void> => {
  const { error } = await supabase
    .from('campaigns')
    .update({ status })
    .eq('id', campaignId);

  if (error) throw error;
};