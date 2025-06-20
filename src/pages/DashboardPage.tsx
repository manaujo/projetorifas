import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { LayoutGrid, Ticket, Settings, PlusCircle, CreditCard, Users, Award, Megaphone } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { RaffleCard } from '../components/RaffleCard';
import { CampaignCard } from '../components/campaigns/CampaignCard';
import { ShareModal } from '../components/ShareModal';
import { Raffle, Campaign, Ticket as TicketType } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { getUserRaffles, getUserTickets, getRaffleById } from '../services/raffleService';
import { getCampaigns } from '../services/campaignService';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'myRaffles' | 'myCampaigns' | 'myTickets' | 'account'>('overview');
  const [userRaffles, setUserRaffles] = useState<Raffle[]>([]);
  const [userCampaigns, setUserCampaigns] = useState<Campaign[]>([]);
  const [userTickets, setUserTickets] = useState<(TicketType & { raffle: Raffle | null })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        const raffles = await getUserRaffles(user.id);
        setUserRaffles(raffles);
        
        // Fetch campaigns if user has plan
        if (profile?.plano) {
          const campaigns = await getCampaigns();
          setUserCampaigns(campaigns.filter(c => c.createdBy === user.id));
        }
        
        const tickets = await getUserTickets(user.id);
        
        const ticketsWithRaffles = await Promise.all(
          tickets.map(async (ticket) => {
            const raffle = await getRaffleById(ticket.raffleId);
            return { ...ticket, raffle };
          })
        );
        
        setUserTickets(ticketsWithRaffles);
      } catch (error) {
        console.error('Failed to fetch user data', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, [user, profile]);

  if (!user) {
    return null;
  }

  const handleCreateRaffle = () => {
    navigate('/criar-rifa');
  };

  const handleCreateCampaign = () => {
    navigate('/criar-campanha');
  };

  const handleBrowseRaffles = () => {
    navigate('/rifas');
  };

  const handleInviteFriends = () => {
    setIsShareModalOpen(true);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-display font-bold text-2xl md:text-3xl text-gray-900 mb-2">
            Painel de Controle
          </h1>
          <p className="text-gray-600">
            Bem-vindo(a), {profile?.nome || user.email}. Gerencie suas rifas, campanhas e participações.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-card overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-500 mr-4">
                    {(profile?.nome || user.email).charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="font-medium text-base text-gray-900">
                      {profile?.nome || user.email}
                    </h2>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
                {profile?.plano && (
                  <span className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                    Plano {profile.plano}
                  </span>
                )}
              </div>
              
              <nav className="py-2">
                <button
                  className={`w-full flex items-center px-6 py-3 text-left ${
                    activeTab === 'overview'
                      ? 'bg-primary-50 text-primary-600 border-l-4 border-primary-500'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setActiveTab('overview')}
                >
                  <LayoutGrid size={18} className="mr-3" />
                  <span className="text-sm font-medium">Visão Geral</span>
                </button>
                
                <button
                  className={`w-full flex items-center px-6 py-3 text-left ${
                    activeTab === 'myRaffles'
                      ? 'bg-primary-50 text-primary-600 border-l-4 border-primary-500'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setActiveTab('myRaffles')}
                >
                  <Award size={18} className="mr-3" />
                  <span className="text-sm font-medium">Minhas Rifas</span>
                </button>

                {profile?.plano && (
                  <button
                    className={`w-full flex items-center px-6 py-3 text-left ${
                      activeTab === 'myCampaigns'
                        ? 'bg-primary-50 text-primary-600 border-l-4 border-primary-500'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setActiveTab('myCampaigns')}
                  >
                    <Megaphone size={18} className="mr-3" />
                    <span className="text-sm font-medium">Minhas Campanhas</span>
                  </button>
                )}
                
                <button
                  className={`w-full flex items-center px-6 py-3 text-left ${
                    activeTab === 'myTickets'
                      ? 'bg-primary-50 text-primary-600 border-l-4 border-primary-500'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setActiveTab('myTickets')}
                >
                  <Ticket size={18} className="mr-3" />
                  <span className="text-sm font-medium">Meus Bilhetes</span>
                </button>
                
                <button
                  className={`w-full flex items-center px-6 py-3 text-left ${
                    activeTab === 'account'
                      ? 'bg-primary-50 text-primary-600 border-l-4 border-primary-500'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setActiveTab('account')}
                >
                  <Settings size={18} className="mr-3" />
                  <span className="text-sm font-medium">Configurações</span>
                </button>
              </nav>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  {/* Stats Cards */}
                  <div className="bg-white rounded-lg shadow-card p-6">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-sm font-medium text-gray-500">
                        Plano Atual
                      </h3>
                      <CreditCard size={18} className="text-primary-500" />
                    </div>
                    <p className="text-2xl font-display font-bold text-gray-900">
                      {profile?.plano ? profile.plano.charAt(0).toUpperCase() + profile.plano.slice(1) : 'Gratuito'}
                    </p>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow-card p-6">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-sm font-medium text-gray-500">
                        {profile?.plano ? 'Rifas + Campanhas' : 'Rifas Criadas'}
                      </h3>
                      <Award size={18} className="text-primary-500" />
                    </div>
                    <p className="text-2xl font-display font-bold text-gray-900">
                      {profile?.plano ? userRaffles.length + userCampaigns.length : userRaffles.length}
                    </p>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow-card p-6">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-sm font-medium text-gray-500">
                        Bilhetes Comprados
                      </h3>
                      <Ticket size={18} className="text-primary-500" />
                    </div>
                    <p className="text-2xl font-display font-bold text-gray-900">
                      {userTickets.length}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Quick Actions */}
                  <div className="bg-white rounded-lg shadow-card p-6">
                    <h3 className="font-display font-semibold text-lg text-gray-900 mb-4">
                      Ações Rápidas
                    </h3>
                    <div className="space-y-3">
                      {!profile?.plano ? (
                        <Link to="/precos">
                          <Button fullWidth leftIcon={<CreditCard size={16} />}>
                            Escolher Plano
                          </Button>
                        </Link>
                      ) : (
                        <>
                          <Button 
                            fullWidth
                            leftIcon={<PlusCircle size={16} />}
                            onClick={handleCreateRaffle}
                          >
                            Criar Nova Rifa
                          </Button>
                          <Button 
                            fullWidth
                            variant="secondary"
                            leftIcon={<Megaphone size={16} />}
                            onClick={handleCreateCampaign}
                          >
                            Criar Nova Campanha
                          </Button>
                        </>
                      )}
                      <Button 
                        fullWidth
                        variant="outline"
                        leftIcon={<Ticket size={16} />}
                        onClick={handleBrowseRaffles}
                      >
                        Participar de Rifas
                      </Button>
                      <Button 
                        fullWidth
                        variant="ghost"
                        leftIcon={<Users size={16} />}
                        onClick={handleInviteFriends}
                      >
                        Convidar Amigos
                      </Button>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow-card p-6">
                    <h3 className="font-display font-semibold text-lg text-gray-900 mb-4">
                      Próximos Sorteios
                    </h3>
                    {userTickets.length > 0 ? (
                      <div className="space-y-4">
                        {userTickets.slice(0, 3).map(ticket => (
                          ticket.raffle && (
                            <div key={ticket.id} className="flex justify-between items-center">
                              <div>
                                <p className="font-medium text-gray-900">{ticket.raffle.title}</p>
                                <p className="text-sm text-gray-500">
                                  {format(new Date(ticket.raffle.drawDate), "dd/MM/yyyy")}
                                </p>
                              </div>
                              <div className="text-sm bg-primary-50 text-primary-600 px-2 py-1 rounded-md">
                                {ticket.numbers.length} {ticket.numbers.length === 1 ? 'bilhete' : 'bilhetes'}
                              </div>
                            </div>
                          )
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">
                        Você ainda não comprou nenhum bilhete.
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Recent Items */}
                {(userRaffles.length > 0 || userCampaigns.length > 0) && (
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-display font-semibold text-lg text-gray-900">
                        Suas Criações Recentes
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {userRaffles.slice(0, 1).map(raffle => (
                        <RaffleCard key={raffle.id} raffle={raffle} />
                      ))}
                      {profile?.plano && userCampaigns.slice(0, 1).map(campaign => (
                        <CampaignCard key={campaign.id} campaign={campaign} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* My Raffles Tab */}
            {activeTab === 'myRaffles' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="font-display font-semibold text-xl text-gray-900">
                    Minhas Rifas
                  </h2>
                  {profile?.plano ? (
                    <Link to="/criar-rifa">
                      <Button leftIcon={<PlusCircle size={16} />}>
                        Nova Rifa
                      </Button>
                    </Link>
                  ) : (
                    <Link to="/precos">
                      <Button leftIcon={<CreditCard size={16} />}>
                        Escolher Plano
                      </Button>
                    </Link>
                  )}
                </div>
                
                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
                    {[1, 2].map((item) => (
                      <div key={item} className="bg-white rounded-lg overflow-hidden shadow-card">
                        <div className="h-48 bg-gray-300"></div>
                        <div className="p-4">
                          <div className="h-6 bg-gray-300 rounded mb-3"></div>
                          <div className="h-16 bg-gray-200 rounded mb-3"></div>
                          <div className="h-10 bg-gray-300 rounded"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : userRaffles.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {userRaffles.map(raffle => (
                      <RaffleCard key={raffle.id} raffle={raffle} />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow-card p-8 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto flex items-center justify-center mb-4">
                      <Award size={24} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma rifa criada</h3>
                    <p className="text-gray-600 mb-6">
                      {profile?.plano 
                        ? 'Você ainda não criou nenhuma rifa. Comece agora mesmo!'
                        : 'Para criar rifas, você precisa escolher um plano.'
                      }
                    </p>
                    {profile?.plano ? (
                      <Link to="/criar-rifa">
                        <Button leftIcon={<PlusCircle size={16} />}>
                          Criar Minha Primeira Rifa
                        </Button>
                      </Link>
                    ) : (
                      <Link to="/precos">
                        <Button leftIcon={<CreditCard size={16} />}>
                          Escolher Plano
                        </Button>
                      </Link>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* My Campaigns Tab */}
            {activeTab === 'myCampaigns' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="font-display font-semibold text-xl text-gray-900">
                    Minhas Campanhas
                  </h2>
                  {profile?.plano ? (
                    <Link to="/criar-campanha">
                      <Button leftIcon={<Megaphone size={16} />}>
                        Nova Campanha
                      </Button>
                    </Link>
                  ) : (
                    <Link to="/precos">
                      <Button leftIcon={<CreditCard size={16} />}>
                        Escolher Plano
                      </Button>
                    </Link>
                  )}
                </div>
                
                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
                    {[1, 2].map((item) => (
                      <div key={item} className="bg-white rounded-lg overflow-hidden shadow-card">
                        <div className="h-48 bg-gray-300"></div>
                        <div className="p-4">
                          <div className="h-6 bg-gray-300 rounded mb-3"></div>
                          <div className="h-16 bg-gray-200 rounded mb-3"></div>
                          <div className="h-10 bg-gray-300 rounded"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : userCampaigns.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {userCampaigns.map(campaign => (
                      <CampaignCard key={campaign.id} campaign={campaign} />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow-card p-8 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto flex items-center justify-center mb-4">
                      <Megaphone size={24} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma campanha criada</h3>
                    <p className="text-gray-600 mb-6">
                      {profile?.plano 
                        ? 'Você ainda não criou nenhuma campanha. Comece agora mesmo!'
                        : 'Para criar campanhas, você precisa escolher um plano.'
                      }
                    </p>
                    {profile?.plano ? (
                      <Link to="/criar-campanha">
                        <Button leftIcon={<Megaphone size={16} />}>
                          Criar Minha Primeira Campanha
                        </Button>
                      </Link>
                    ) : (
                      <Link to="/precos">
                        <Button leftIcon={<CreditCard size={16} />}>
                          Escolher Plano
                        </Button>
                      </Link>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {/* My Tickets Tab */}
            {activeTab === 'myTickets' && (
              <div>
                <h2 className="font-display font-semibold text-xl text-gray-900 mb-6">
                  Meus Bilhetes
                </h2>
                
                {isLoading ? (
                  <div className="space-y-4 animate-pulse">
                    {[1, 2, 3].map((item) => (
                      <div key={item} className="bg-white rounded-lg overflow-hidden shadow-card p-4">
                        <div className="h-6 bg-gray-300 rounded mb-3 w-1/2"></div>
                        <div className="h-4 bg-gray-200 rounded mb-3 w-1/3"></div>
                        <div className="h-8 bg-gray-300 rounded w-full"></div>
                      </div>
                    ))}
                  </div>
                ) : userTickets.length > 0 ? (
                  <div className="space-y-4">
                    {userTickets.map(ticket => (
                      ticket.raffle && (
                        <div key={ticket.id} className="bg-white rounded-lg shadow-card p-5">
                          <div className="flex flex-col md:flex-row justify-between">
                            <div>
                              <h3 className="font-medium text-lg text-gray-900 mb-1">
                                {ticket.raffle.title}
                              </h3>
                              <p className="text-gray-600 mb-3">
                                Sorteio em: {format(new Date(ticket.raffle.drawDate), "dd/MM/yyyy")}
                              </p>
                              
                              <div className="flex flex-wrap gap-1 mb-4">
                                {ticket.numbers.map(num => (
                                  <span key={num} className="bg-primary-100 text-primary-700 px-2 py-1 rounded text-xs font-medium">
                                    {num}
                                  </span>
                                ))}
                              </div>
                            </div>
                            
                            <div className="mt-4 md:mt-0 md:ml-4 md:text-right">
                              <p className="text-gray-500 text-sm mb-2">
                                Status de Pagamento:
                                <span className={`ml-1 font-medium ${
                                  ticket.paymentStatus === 'completed' 
                                    ? 'text-success-700' 
                                    : ticket.paymentStatus === 'failed'
                                      ? 'text-error-500'
                                      : 'text-warning-500'
                                }`}>
                                  {ticket.paymentStatus === 'completed' 
                                    ? 'Pago' 
                                    : ticket.paymentStatus === 'failed' 
                                      ? 'Falhou'
                                      : 'Pendente'
                                  }
                                </span>
                              </p>
                              
                              <p className="text-gray-500 text-sm mb-2">
                                Método: {ticket.paymentMethod === 'pix' ? 'PIX' : 'Cartão de Crédito'}
                              </p>
                              
                              <p className="text-gray-500 text-sm">
                                Comprado em: {format(new Date(ticket.purchaseDate), "dd/MM/yyyy")}
                              </p>
                            </div>
                          </div>
                          
                          <div className="mt-4 flex justify-end">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => navigate(`/rifas/${ticket.raffleId}`)}
                            >
                              Ver Rifa
                            </Button>
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow-card p-8 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto flex items-center justify-center mb-4">
                      <Ticket size={24} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum bilhete comprado</h3>
                    <p className="text-gray-600 mb-6">
                      Você ainda não comprou nenhum bilhete. Participe de uma rifa!
                    </p>
                    <Link to="/rifas">
                      <Button>
                        Ver Rifas Disponíveis
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
            
            {/* Account Settings Tab */}
            {activeTab === 'account' && (
              <div className="bg-white rounded-lg shadow-card p-6">
                <h2 className="font-display font-semibold text-xl text-gray-900 mb-6">
                  Configurações da Conta
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Informações Pessoais</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nome
                        </label>
                        <input
                          type="text"
                          value={profile?.nome || ''}
                          disabled
                          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          value={user.email || ''}
                          disabled
                          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Plano Atual</h3>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>Plano:</strong> {profile?.plano ? profile.plano.charAt(0).toUpperCase() + profile.plano.slice(1) : 'Nenhum plano ativo'}
                      </p>
                      {!profile?.plano && (
                        <Link to="/precos">
                          <Button size="sm">
                            Escolher Plano
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                  
                  {profile?.plano && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Ações Rápidas</h3>
                      <div className="flex space-x-4">
                        <Link to="/criar-rifa">
                          <Button leftIcon={<PlusCircle size={16} />}>
                            Criar Nova Rifa
                          </Button>
                        </Link>
                        <Link to="/criar-campanha">
                          <Button variant="outline" leftIcon={<Megaphone size={16} />}>
                            Criar Campanha
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        url={window.location.origin}
        title="Participe das melhores rifas e campanhas online na Rifativa!"
      />
    </Layout>
  );
};