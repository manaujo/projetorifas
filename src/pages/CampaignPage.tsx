import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Ticket, Award, AlertTriangle, DollarSign, Calendar, Users, Gift, Calculator } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { BuyerRankingList } from '../components/campaigns/BuyerRankingList';
import { PurchaseModal } from '../components/PurchaseModal';
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
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [comboValue, setComboValue] = useState<number>(0);

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

    let quantity = 1;
    
    if (campaign.mode === 'combo' && campaign.comboRules) {
      quantity = campaign.comboRules.numbersPerValue || 1;
    }

    const randomTickets: number[] = [];
    while (randomTickets.length < quantity && availableTickets.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableTickets.length);
      randomTickets.push(availableTickets[randomIndex]);
      availableTickets.splice(randomIndex, 1);
    }

    setSelectedTickets(randomTickets);
  };

  const handleComboValueChange = (value: number) => {
    if (!campaign || campaign.mode !== 'combo' || !campaign.comboRules) return;

    setComboValue(value);
    
    const { baseValue, numbersPerValue } = campaign.comboRules;
    const allowedNumbers = Math.floor(value / baseValue) * numbersPerValue;
    
    // Clear current selection and allow user to select up to allowedNumbers
    setSelectedTickets([]);
    
    // Auto-select random numbers if user wants
    if (allowedNumbers > 0) {
      const availableTickets = tickets
        .filter(t => t.status === 'available')
        .map(t => t.number);

      const randomTickets: number[] = [];
      const maxToSelect = Math.min(allowedNumbers, availableTickets.length);
      
      while (randomTickets.length < maxToSelect) {
        const randomIndex = Math.floor(Math.random() * availableTickets.length);
        const number = availableTickets[randomIndex];
        if (!randomTickets.includes(number)) {
          randomTickets.push(number);
        }
        availableTickets.splice(randomIndex, 1);
      }
      
      setSelectedTickets(randomTickets);
    }
  };

  const handlePurchase = async () => {
    if (!isAuthenticated || !user || !campaign || selectedTickets.length === 0) return;

    // Verificar se a campanha tem PIX configurado
    if (!campaign.pixKey) {
      toast.error('Chave PIX não configurada para esta campanha');
      return;
    }

    setIsPurchaseModalOpen(true);
  };

  const handleConfirmPurchase = async (buyerInfo: { name: string; cpf: string; phone: string }) => {
    if (!campaign || selectedTickets.length === 0) return;

    try {
      setIsSubmitting(true);
      await purchaseTickets(campaign.id, user?.id || 'guest', selectedTickets);
      toast.success('Bilhetes comprados com sucesso!');
      
      // Refresh tickets
      const updatedTickets = await getCampaignTickets(campaign.id);
      setTickets(updatedTickets);
      setSelectedTickets([]);
      setComboValue(0);
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

  const totalPrice = campaign.mode === 'combo' ? comboValue : selectedTickets.length * campaign.ticketPrice;
  const percentageSold = Math.round((tickets.filter(t => t.status === 'sold').length / campaign.totalTickets) * 100);
  
  const maxSelectableTickets = campaign.mode === 'combo' && campaign.comboRules 
    ? Math.floor(comboValue / campaign.comboRules.baseValue) * campaign.comboRules.numbersPerValue
    : selectedTickets.length;

  // Verificar se o botão deve estar habilitado
  const isPurchaseButtonEnabled = selectedTickets.length > 0 && 
                                  !isSubmitting && 
                                  campaign.pixKey && 
                                  campaign.status === 'active';

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Campaign Info */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-lg shadow-card overflow-hidden mb-6"
            >
              <div className="relative">
                <img
                  src={campaign.coverImage}
                  alt={campaign.title}
                  className="w-full h-64 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h1 className="font-display font-bold text-2xl md:text-3xl text-white mb-2">
                    {campaign.title}
                  </h1>
                  <p className="text-white/90 text-sm md:text-base">{campaign.description}</p>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-primary-50 p-4 rounded-lg text-center">
                    <DollarSign className="text-primary-500 mx-auto mb-2" size={20} />
                    <p className="text-xs text-gray-600 mb-1">Valor por Bilhete</p>
                    <p className="font-semibold text-sm">
                      R$ {campaign.ticketPrice.toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                  <div className="bg-primary-50 p-4 rounded-lg text-center">
                    <Ticket className="text-primary-500 mx-auto mb-2" size={20} />
                    <p className="text-xs text-gray-600 mb-1">Total de Bilhetes</p>
                    <p className="font-semibold text-sm">{campaign.totalTickets.toLocaleString()}</p>
                  </div>
                  <div className="bg-primary-50 p-4 rounded-lg text-center">
                    <Award className="text-primary-500 mx-auto mb-2" size={20} />
                    <p className="text-xs text-gray-600 mb-1">Modo</p>
                    <p className="font-semibold text-sm">
                      {campaign.mode === 'combo' ? 'Combo' : 'Simples'}
                    </p>
                  </div>
                  <div className="bg-primary-50 p-4 rounded-lg text-center">
                    <AlertTriangle className="text-primary-500 mx-auto mb-2" size={20} />
                    <p className="text-xs text-gray-600 mb-1">Status</p>
                    <p className="font-semibold text-sm">
                      {campaign.status === 'active' ? 'Ativa' : 
                       campaign.status === 'completed' ? 'Concluída' : 
                       campaign.status === 'paused' ? 'Pausada' : 'Rascunho'}
                    </p>
                  </div>
                </div>

                {campaign.mode === 'combo' && campaign.comboRules && (
                  <div className="bg-gradient-to-r from-primary-50 to-gold-50 p-6 rounded-lg mb-6 border border-primary-200">
                    <div className="flex items-center mb-4">
                      <Calculator className="text-primary-500 mr-2" size={20} />
                      <h3 className="font-semibold text-lg text-gray-900">Combo por Valor</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="bg-white p-4 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">A cada</p>
                        <p className="font-bold text-lg text-primary-600">
                          R$ {campaign.comboRules.baseValue?.toFixed(2).replace('.', ',')}
                        </p>
                      </div>
                      <div className="bg-white p-4 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Você ganha</p>
                        <p className="font-bold text-lg text-gold-600">
                          {campaign.comboRules.numbersPerValue} números
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <Input
                        type="number"
                        label="Quanto você quer investir? (R$)"
                        placeholder="Ex: 10"
                        value={comboValue || ''}
                        onChange={(e) => handleComboValueChange(Number(e.target.value))}
                        min={campaign.comboRules.baseValue}
                        step={campaign.comboRules.baseValue}
                      />
                      
                      {comboValue > 0 && (
                        <div className="bg-white p-4 rounded-lg border border-primary-200">
                          <p className="text-sm text-gray-600">
                            Com R$ {comboValue.toFixed(2).replace('.', ',')} você pode escolher até{' '}
                            <span className="font-bold text-primary-600">
                              {maxSelectableTickets} números
                            </span>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Prizes */}
                {campaign.prizes && campaign.prizes.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-lg mb-4 flex items-center">
                      <Gift className="mr-2 text-primary-500" size={20} />
                      Prêmios
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {campaign.prizes.map((prize) => (
                        <div key={prize.id} className="bg-gray-50 p-4 rounded-lg">
                          {prize.imageUrl && (
                            <img 
                              src={prize.imageUrl} 
                              alt={prize.title}
                              className="w-full h-32 object-cover rounded-md mb-3"
                            />
                          )}
                          <h4 className="font-medium text-gray-900 mb-1">{prize.title}</h4>
                          <p className="text-sm text-gray-600">{prize.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Progress */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">Progresso da Venda</span>
                    <span>{percentageSold}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${percentageSold}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{tickets.filter(t => t.status === 'sold').length} vendidos</span>
                    <span>Total: {campaign.totalTickets}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Tickets Selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-lg shadow-card p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-display font-semibold text-xl">
                  Selecione seus Bilhetes
                </h2>
                <Button
                  variant="outline"
                  onClick={handleRandomSelection}
                  disabled={isSubmitting || (campaign.mode === 'combo' && comboValue === 0)}
                >
                  Escolher Aleatoriamente
                </Button>
              </div>

              {campaign.mode === 'combo' && comboValue === 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-blue-700 text-sm">
                    💡 Primeiro defina quanto você quer investir no combo acima para liberar a seleção de números.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-10 gap-2 mb-6 max-h-96 overflow-y-auto">
                {tickets.map((ticket) => {
                  const isSelected = selectedTickets.includes(ticket.number);
                  const isAvailable = ticket.status === 'available';
                  const canSelect = campaign.mode === 'combo' 
                    ? comboValue > 0 && selectedTickets.length < maxSelectableTickets
                    : true;

                  return (
                    <button
                      key={ticket.number}
                      onClick={() => handleTicketSelection(ticket.number)}
                      disabled={!isAvailable || isSubmitting || (campaign.mode === 'combo' && comboValue === 0) || (!isSelected && !canSelect)}
                      className={`
                        aspect-square rounded-md flex items-center justify-center text-xs font-medium transition-all duration-200
                        ${!isAvailable 
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : isSelected
                          ? 'bg-primary-500 text-white shadow-md transform scale-105'
                          : canSelect || (campaign.mode !== 'combo')
                          ? 'bg-primary-50 text-primary-600 hover:bg-primary-100 border border-primary-200'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }
                      `}
                    >
                      {ticket.number}
                    </button>
                  );
                })}
              </div>

              {(selectedTickets.length > 0 || totalPrice > 0) && (
                <div className="border-t pt-4">
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-700">
                        {selectedTickets.length} {selectedTickets.length === 1 ? 'número' : 'números'} selecionado{selectedTickets.length !== 1 ? 's' : ''}
                      </span>
                      <span className="font-bold text-lg text-primary-600">
                        Total: R$ {totalPrice.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                    
                    {campaign.mode === 'combo' && comboValue > 0 && (
                      <div className="text-sm text-gray-600">
                        Investimento: R$ {comboValue.toFixed(2).replace('.', ',')} • 
                        Pode escolher até {maxSelectableTickets} números
                      </div>
                    )}
                  </div>
                  
                  <Button
                    fullWidth
                    size="lg"
                    onClick={handlePurchase}
                    disabled={!isPurchaseButtonEnabled}
                    isLoading={isSubmitting}
                  >
                    {!campaign.pixKey ? 'PIX não configurado' : 
                     campaign.status !== 'active' ? 'Campanha inativa' :
                     selectedTickets.length === 0 ? 'Selecione números' :
                     'Comprar Bilhetes'}
                  </Button>
                </div>
              )}
            </motion.div>
          </div>

          {/* Buyer Ranking */}
          <div className="lg:col-span-1">
            <BuyerRankingList rankings={rankings} />
          </div>
        </div>
      </div>

      {/* Modal de compra com PIX correto da campanha */}
      {campaign.pixKey && (
        <PurchaseModal
          isOpen={isPurchaseModalOpen}
          onClose={() => setIsPurchaseModalOpen(false)}
          selectedNumbers={selectedTickets}
          totalPrice={totalPrice}
          pixKey={campaign.pixKey} // PIX correto da campanha
          itemTitle={campaign.title}
          onConfirmPurchase={handleConfirmPurchase}
          isCombo={campaign.mode === 'combo'}
          comboInfo={campaign.comboRules ? {
            baseValue: campaign.comboRules.baseValue || 0,
            numbersPerValue: campaign.comboRules.numbersPerValue || 0,
          } : undefined}
        />
      )}
    </Layout>
  );
};