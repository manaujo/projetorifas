import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  Ticket, 
  Award, 
  DollarSign, 
  Users, 
  Gift, 
  Share2, 
  Trophy,
  Crown,
  Target,
  Plus,
  Minus,
  ShoppingCart,
  Copy,
  Check,
  Facebook,
  MessageCircle,
  Send
} from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { BuyerRankingList } from '../components/campaigns/BuyerRankingList';
import { PurchaseModal } from '../components/PurchaseModal';
import { QRCodeGenerator } from '../components/QRCodeGenerator';
import { Campaign, CampaignTicket, BuyerRanking, CampaignPromotion } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { getCampaignById, getCampaignTickets, getBuyerRanking, purchaseTickets } from '../services/campaignService';

export const CampaignPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [tickets, setTickets] = useState<CampaignTicket[]>([]);
  const [rankings, setRankings] = useState<BuyerRanking[]>([]);
  const [selectedQuantity, setSelectedQuantity] = useState<number>(0);
  const [selectedPromotion, setSelectedPromotion] = useState<CampaignPromotion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);

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

  const handleQuantityChange = (change: number) => {
    const newQuantity = Math.max(0, selectedQuantity + change);
    setSelectedQuantity(newQuantity);
    setSelectedPromotion(null);
  };

  const handlePromotionSelect = (promotion: CampaignPromotion) => {
    setSelectedQuantity(promotion.quantity);
    setSelectedPromotion(promotion);
  };

  const handlePurchase = async () => {
    if (!campaign || selectedQuantity === 0) return;

    if (!campaign.pixKey) {
      toast.error('Chave PIX não configurada para esta campanha');
      return;
    }

    setIsPurchaseModalOpen(true);
  };

  const handleConfirmPurchase = async (buyerInfo: { name: string; cpf: string; phone: string }) => {
    if (!campaign || selectedQuantity === 0) return;

    try {
      setIsSubmitting(true);
      
      // Generate random ticket numbers for the purchase
      const ticketNumbers: string[] = [];
      const availableTickets = tickets.filter(t => t.status === 'available');
      
      for (let i = 0; i < selectedQuantity && i < availableTickets.length; i++) {
        const randomIndex = Math.floor(Math.random() * availableTickets.length);
        const ticket = availableTickets.splice(randomIndex, 1)[0];
        ticketNumbers.push(ticket.number);
      }

      await purchaseTickets(campaign.id, user?.id || 'guest', ticketNumbers.map(n => parseInt(n)));
      
      toast.success('Bilhetes comprados com sucesso!');
      
      // Refresh data
      const [updatedTickets, updatedRankings] = await Promise.all([
        getCampaignTickets(campaign.id),
        getBuyerRanking(campaign.id)
      ]);
      
      setTickets(updatedTickets);
      setRankings(updatedRankings);
      setSelectedQuantity(0);
      setSelectedPromotion(null);
    } catch (error) {
      console.error('Failed to purchase tickets:', error);
      toast.error('Erro ao comprar bilhetes');
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateTotal = () => {
    if (selectedPromotion) {
      return selectedPromotion.price;
    }
    return selectedQuantity * (campaign?.ticketPrice || 0);
  };

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const text = `Participe da campanha: ${campaign?.title}`;
    
    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`);
        break;
      case 'telegram':
        window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`);
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
        break;
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success('Link copiado!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Erro ao copiar link');
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

  const soldTickets = tickets.filter(t => t.status === 'sold').length;
  const percentageSold = Math.round((soldTickets / campaign.totalTickets) * 100);
  const totalAmount = calculateTotal();

  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Hero Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden"
              >
                <div className="relative">
                  <img
                    src={campaign.coverImage}
                    alt={campaign.title}
                    className="w-full h-80 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <h1 className="font-display font-bold text-2xl md:text-3xl text-white mb-2">
                      {campaign.title}
                    </h1>
                    <div className="flex items-center space-x-4">
                      <div className="bg-gold-500 text-primary-900 px-4 py-2 rounded-full font-bold">
                        Por apenas R$ {campaign.ticketPrice.toFixed(2).replace('.', ',')}
                      </div>
                      {campaign.featured && (
                        <div className="bg-primary-500 text-white px-3 py-1 rounded-full text-sm flex items-center">
                          <Crown size={14} className="mr-1" />
                          Destaque
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <p className="text-gray-600 mb-6">{campaign.description}</p>
                  
                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium">Progresso da Campanha</span>
                      <span className="text-primary-600 font-bold">{percentageSold}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${percentageSold}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>{soldTickets.toLocaleString()} bilhetes vendidos</span>
                      <span>Meta: {campaign.totalTickets.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Share Buttons */}
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleShare('whatsapp')}
                        leftIcon={<MessageCircle size={16} />}
                      >
                        WhatsApp
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleShare('telegram')}
                        leftIcon={<Send size={16} />}
                      >
                        Telegram
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleShare('facebook')}
                        leftIcon={<Facebook size={16} />}
                      >
                        Facebook
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyLink}
                      leftIcon={copied ? <Check size={16} /> : <Copy size={16} />}
                    >
                      {copied ? 'Copiado!' : 'Copiar Link'}
                    </Button>
                  </div>
                </div>
              </motion.div>

              {/* Promotions Section */}
              {campaign.promotions && campaign.promotions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="bg-white rounded-2xl shadow-lg p-6"
                >
                  <h2 className="font-display font-bold text-xl text-gray-900 mb-4 flex items-center">
                    <Gift className="mr-2 text-primary-500" size={24} />
                    Promoções Especiais
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {campaign.promotions.map((promotion) => {
                      const savings = (promotion.quantity * campaign.ticketPrice) - promotion.price;
                      const isSelected = selectedPromotion?.id === promotion.id;
                      
                      return (
                        <button
                          key={promotion.id}
                          onClick={() => handlePromotionSelect(promotion)}
                          className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${
                            isSelected
                              ? 'border-primary-500 bg-primary-50 shadow-md'
                              : 'border-gray-200 hover:border-primary-300 hover:shadow-sm'
                          }`}
                        >
                          {savings > 0 && (
                            <div className="absolute -top-2 -right-2 bg-success-500 text-white text-xs px-2 py-1 rounded-full">
                              Economize R$ {savings.toFixed(2)}
                            </div>
                          )}
                          <div className="text-center">
                            <div className="font-bold text-lg text-gray-900">
                              {promotion.quantity} bilhetes
                            </div>
                            <div className="text-primary-600 font-bold text-xl">
                              R$ {promotion.price.toFixed(2).replace('.', ',')}
                            </div>
                            <div className="text-sm text-gray-500">
                              R$ {(promotion.price / promotion.quantity).toFixed(2)} por bilhete
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Ticket Selection */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white rounded-2xl shadow-lg p-6"
              >
                <h2 className="font-display font-bold text-xl text-gray-900 mb-6 flex items-center">
                  <Ticket className="mr-2 text-primary-500" size={24} />
                  Selecione seus Bilhetes
                </h2>

                {/* Quick Add Buttons */}
                <div className="grid grid-cols-4 gap-3 mb-6">
                  {[1, 5, 25, 50].map((amount) => (
                    <Button
                      key={amount}
                      variant="outline"
                      onClick={() => handleQuantityChange(amount)}
                      className="text-sm"
                    >
                      +{amount}
                    </Button>
                  ))}
                </div>

                {/* Quantity Selector */}
                <div className="flex items-center justify-center space-x-4 mb-6">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={selectedQuantity <= 0}
                    className="w-12 h-12 rounded-full"
                  >
                    <Minus size={20} />
                  </Button>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary-600">
                      {selectedQuantity}
                    </div>
                    <div className="text-sm text-gray-500">
                      {selectedQuantity === 1 ? 'bilhete' : 'bilhetes'}
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => handleQuantityChange(1)}
                    className="w-12 h-12 rounded-full"
                  >
                    <Plus size={20} />
                  </Button>
                </div>

                {/* Total and Purchase Button */}
                {selectedQuantity > 0 && (
                  <div className="border-t pt-6">
                    <div className="bg-gray-50 rounded-xl p-4 mb-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-sm text-gray-600">Total a pagar:</div>
                          <div className="text-2xl font-bold text-primary-600">
                            R$ {totalAmount.toFixed(2).replace('.', ',')}
                          </div>
                          {selectedPromotion && (
                            <div className="text-sm text-success-600">
                              Promoção aplicada!
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600">Bilhetes:</div>
                          <div className="text-xl font-bold text-gray-900">
                            {selectedQuantity}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      fullWidth
                      size="lg"
                      onClick={handlePurchase}
                      disabled={!campaign.pixKey || campaign.status !== 'active'}
                      isLoading={isSubmitting}
                      leftIcon={<ShoppingCart size={20} />}
                      className="text-lg py-4"
                    >
                      {!campaign.pixKey ? 'PIX não configurado' : 
                       campaign.status !== 'active' ? 'Campanha inativa' :
                       `Participar - R$ ${totalAmount.toFixed(2).replace('.', ',')}`}
                    </Button>
                  </div>
                )}
              </motion.div>

              {/* Prizes Section */}
              {campaign.prizes && campaign.prizes.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="bg-white rounded-2xl shadow-lg p-6"
                >
                  <h2 className="font-display font-bold text-xl text-gray-900 mb-6 flex items-center">
                    <Trophy className="mr-2 text-gold-500" size={24} />
                    Prêmios da Campanha
                  </h2>
                  
                  <div className="space-y-4">
                    {campaign.prizes.map((prize, index) => (
                      <div key={prize.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                          index === 0 ? 'bg-gold-500' :
                          index === 1 ? 'bg-gray-400' :
                          'bg-primary-500'
                        }`}>
                          {index + 1}º
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {index + 1}º ganhador(a): {prize.title}
                          </h3>
                          <p className="text-gray-600 text-sm">{prize.description}</p>
                          {prize.type === 'winning_ticket' && campaign.winningTicket && (
                            <div className="mt-2 inline-flex items-center bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm">
                              <Target size={14} className="mr-1" />
                              Bilhete premiado: {campaign.winningTicket}
                            </div>
                          )}
                        </div>
                        
                        {prize.imageUrl && (
                          <img
                            src={prize.imageUrl}
                            alt={prize.title}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-6">
                {/* Campaign Stats */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="bg-white rounded-2xl shadow-lg p-6"
                >
                  <h3 className="font-display font-semibold text-lg text-gray-900 mb-4">
                    Estatísticas
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Bilhetes vendidos:</span>
                      <span className="font-bold text-primary-600">{soldTickets.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total de bilhetes:</span>
                      <span className="font-bold">{campaign.totalTickets.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Participantes:</span>
                      <span className="font-bold">{rankings.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        campaign.status === 'active' ? 'bg-success-100 text-success-700' :
                        campaign.status === 'completed' ? 'bg-primary-100 text-primary-700' :
                        campaign.status === 'paused' ? 'bg-warning-100 text-warning-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {campaign.status === 'active' ? 'Ativa' :
                         campaign.status === 'completed' ? 'Concluída' :
                         campaign.status === 'paused' ? 'Pausada' : 'Rascunho'}
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* Buyer Ranking */}
                <BuyerRankingList rankings={rankings} />

                {/* My Tickets Button */}
                {user && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <Button
                      fullWidth
                      variant="outline"
                      leftIcon={<Ticket size={16} />}
                      onClick={() => navigate('/dashboard')}
                    >
                      Ver Meus Bilhetes
                    </Button>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Purchase Modal */}
      {campaign.pixKey && (
        <PurchaseModal
          isOpen={isPurchaseModalOpen}
          onClose={() => setIsPurchaseModalOpen(false)}
          selectedNumbers={Array.from({ length: selectedQuantity }, (_, i) => i + 1)}
          totalPrice={totalAmount}
          pixKey={campaign.pixKey}
          itemTitle={campaign.title}
          onConfirmPurchase={handleConfirmPurchase}
          isCombo={false}
        />
      )}
    </Layout>
  );
};