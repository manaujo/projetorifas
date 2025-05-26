import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Ticket, Award, AlertTriangle, DollarSign } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { BuyerRankingList } from '../components/campaigns/BuyerRankingList';
import { Campaign, CampaignTicket, BuyerRanking } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { getCampaignById, getCampaignTickets, getBuyerRanking, purchaseTickets } from '../services/campaignService';

export const CampaignPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [tickets, setTickets] = useState<CampaignTicket[]>([]);
  const [rankings, setRankings] = useState<BuyerRanking[]>([]);
  const [selectedTickets, setSelectedTickets] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchCampaignData = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const [campaignData, ticketsData, rankingsData] = await Promise.all([
          getCampaignById(id),
          getCampaignTickets(id),
          getBuyerRanking(id),
        ]);

        if (!campaignData) {
          navigate('/campanhas');
          return;
        }

        setCampaign(campaignData);
        setTickets(ticketsData);
        setRankings(rankingsData);
      } catch (error) {
        console.error('Failed to fetch campaign data:', error);
        toast.error('Erro ao carregar dados da campanha');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaignData();
  }, [id, navigate]);

  const handleTicketSelection = (number: number) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setSelectedTickets(prev => {
      if (prev.includes(number)) {
        return prev.filter(n => n !== number);
      }
      return [...prev, number];
    });
  };

  const handleRandomSelection = () => {
    if (!campaign) return;

    const availableTickets = tickets
      .filter(t => t.status === 'available')
      .map(t => t.number);

    const quantity = campaign.mode === 'combo' && campaign.comboRules
      ? campaign.comboRules.buy
      : 1;

    const randomTickets: number[] = [];
    while (randomTickets.length < quantity && availableTickets.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableTickets.length);
      randomTickets.push(availableTickets[randomIndex]);
      availableTickets.splice(randomIndex, 1);
    }

    setSelectedTickets(randomTickets);
  };

  const handlePurchase = async () => {
    if (!isAuthenticated || !user || !campaign || selectedTickets.length === 0) return;

    try {
      setIsSubmitting(true);
      await purchaseTickets(campaign.id, user.id, selectedTickets);
      toast.success('Bilhetes comprados com sucesso!');
      
      // Refresh tickets
      const updatedTickets = await getCampaignTickets(campaign.id);
      setTickets(updatedTickets);
      setSelectedTickets([]);
    } catch (error) {
      console.error('Failed to purchase tickets:', error);
      toast.error('Erro ao comprar bilhetes');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded max-w-md mb-4"></div>
            <div className="h-64 bg-gray-200 rounded mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-40 bg-gray-200 rounded"></div>
              <div className="h-40 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!campaign) return null;

  const totalPrice = selectedTickets.length * campaign.ticketPrice;
  const percentageSold = Math.round((tickets.filter(t => t.status === 'sold').length / campaign.totalTickets) * 100);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Campaign Info */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-card overflow-hidden">
              <img
                src={campaign.coverImage}
                alt={campaign.title}
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <h1 className="font-display font-bold text-2xl text-gray-900 mb-4">
                  {campaign.title}
                </h1>
                <p className="text-gray-600 mb-6">{campaign.description}</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-primary-50 p-4 rounded-lg">
                    <DollarSign className="text-primary-500 mb-2" size={20} />
                    <p className="text-sm text-gray-600">Valor</p>
                    <p className="font-semibold">
                      R$ {campaign.ticketPrice.toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                  <div className="bg-primary-50 p-4 rounded-lg">
                    <Ticket className="text-primary-500 mb-2" size={20} />
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="font-semibold">{campaign.totalTickets} bilhetes</p>
                  </div>
                  <div className="bg-primary-50 p-4 rounded-lg">
                    <Award className="text-primary-500 mb-2" size={20} />
                    <p className="text-sm text-gray-600">Modo</p>
                    <p className="font-semibold">
                      {campaign.mode === 'combo' ? 'Combo' : 'Simples'}
                    </p>
                  </div>
                  <div className="bg-primary-50 p-4 rounded-lg">
                    <AlertTriangle className="text-primary-500 mb-2" size={20} />
                    <p className="text-sm text-gray-600">Status</p>
                    <p className="font-semibold">
                      {campaign.status === 'active' ? 'Ativa' : 
                       campaign.status === 'completed' ? 'Concluída' : 
                       campaign.status === 'paused' ? 'Pausada' : 'Rascunho'}
                    </p>
                  </div>
                </div>

                {campaign.mode === 'combo' && campaign.comboRules && (
                  <div className="bg-primary-50 p-4 rounded-lg mb-6">
                    <h3 className="font-semibold text-lg mb-2">Regras do Combo</h3>
                    <p>
                      Compre {campaign.comboRules.buy} e 
                      Ganhe {campaign.comboRules.get} bilhetes extras!
                    </p>
                  </div>
                )}

                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progresso da Venda</span>
                    <span>{percentageSold}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-500 h-2 rounded-full"
                      style={{ width: `${percentageSold}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Buyer Ranking */}
          <div className="lg:col-span-1">
            <BuyerRankingList rankings={rankings} />
          </div>
        </div>

        {/* Tickets Selection */}
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow-card p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display font-semibold text-xl">
                Selecione seus Bilhetes
              </h2>
              <Button
                variant="outline"
                onClick={handleRandomSelection}
                disabled={isSubmitting}
              >
                Escolher Aleatoriamente
              </Button>
            </div>

            <div className="grid grid-cols-10 gap-2 mb-6">
              {tickets.map((ticket) => (
                <button
                  key={ticket.number}
                  onClick={() => handleTicketSelection(ticket.number)}
                  disabled={ticket.status !== 'available' || isSubmitting}
                  className={`
                    aspect-square rounded-md flex items-center justify-center text-sm font-medium
                    ${ticket.status === 'sold' 
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : selectedTickets.includes(ticket.number)
                      ? 'bg-primary-500 text-white'
                      : 'bg-primary-50 text-primary-600 hover:bg-primary-100'
                    }
                  `}
                >
                  {ticket.number}
                </button>
              ))}
            </div>

            {selectedTickets.length > 0 && (
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-sm text-gray-600">
                      {selectedTickets.length} bilhetes selecionados
                    </p>
                    <p className="font-semibold">
                      Total: R$ {totalPrice.toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                  <Button
                    onClick={handlePurchase}
                    isLoading={isSubmitting}
                    disabled={isSubmitting}
                  >
                    Comprar Bilhetes
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};