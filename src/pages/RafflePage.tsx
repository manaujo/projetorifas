import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Share2, Clock, Calendar, Award, BadgeCheck, AlertTriangle, DollarSign } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { Raffle, RaffleNumber } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { getRaffleById, getRaffleNumbers, purchaseTickets } from '../services/raffleService';

export const RafflePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [raffle, setRaffle] = useState<Raffle | null>(null);
  const [raffleNumbers, setRaffleNumbers] = useState<RaffleNumber[]>([]);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit_card'>('pix');
  
  useEffect(() => {
    const fetchRaffleData = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const raffleData = await getRaffleById(id);
        
        if (!raffleData) {
          navigate('/raffles');
          return;
        }
        
        setRaffle(raffleData);
        
        const numbers = await getRaffleNumbers(id);
        setRaffleNumbers(numbers);
      } catch (error) {
        console.error('Failed to fetch raffle data', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRaffleData();
  }, [id, navigate]);
  
  const handleNumberClick = (number: number) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    const isAvailable = raffleNumbers.find(n => n.number === number)?.status === 'available';
    
    if (!isAvailable) return;
    
    setSelectedNumbers(prev => {
      if (prev.includes(number)) {
        return prev.filter(n => n !== number);
      } else {
        return [...prev, number];
      }
    });
  };
  
  const handleSubmit = async () => {
    if (!isAuthenticated || !user || !raffle || selectedNumbers.length === 0) return;
    
    try {
      setIsSubmitting(true);
      await purchaseTickets(raffle.id, user.id, selectedNumbers, paymentMethod);
      
      // In a real app, redirect to payment page
      // For now, just navigate to a success page
      navigate('/payment-success');
    } catch (error) {
      console.error('Failed to purchase tickets', error);
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
  
  if (!raffle) return null;
  
  const totalPrice = selectedNumbers.length * raffle.price;
  const formattedDrawDate = format(new Date(raffle.drawDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  const percentageSold = Math.round((raffle.soldNumbers.length / raffle.totalNumbers) * 100);
  
  // Group numbers into rows of 10 for better display
  const numbersGrid = [];
  for (let i = 0; i < raffle.totalNumbers; i += 10) {
    numbersGrid.push(raffleNumbers.slice(i, i + 10));
  }
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6">
          <ol className="flex">
            <li>
              <a href="/" className="hover:text-primary-500">Home</a>
            </li>
            <li className="mx-2">/</li>
            <li>
              <a href="/raffles" className="hover:text-primary-500">Rifas</a>
            </li>
            <li className="mx-2">/</li>
            <li className="text-gray-900">{raffle.title}</li>
          </ol>
        </nav>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Raffle Image and Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white rounded-lg shadow-card overflow-hidden">
              <div className="relative">
                <img 
                  src={raffle.imageUrl} 
                  alt={raffle.title} 
                  className="w-full h-64 md:h-80 object-cover"
                />
                {raffle.isCharity && (
                  <div className="absolute top-4 right-4 bg-primary-500 text-white text-sm px-3 py-1 rounded-full flex items-center">
                    <BadgeCheck size={16} className="mr-1" />
                    Beneficente
                  </div>
                )}
              </div>
              
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <h1 className="font-display font-bold text-2xl md:text-3xl text-gray-900 mb-4">
                    {raffle.title}
                  </h1>
                  <button className="text-gray-500 hover:text-primary-500">
                    <Share2 size={20} />
                  </button>
                </div>
                
                <div className="mb-6">
                  <p className="text-gray-600 mb-4">{raffle.description}</p>
                  
                  <div className="flex flex-wrap gap-4 mt-4">
                    <div className="bg-gray-50 px-4 py-3 rounded-md">
                      <div className="flex items-center text-gray-500 mb-1">
                        <Clock size={16} className="mr-1" />
                        <span className="text-xs">Status</span>
                      </div>
                      <p className="font-medium text-sm">
                        {raffle.status === 'active' ? 'Ativa' : raffle.status === 'completed' ? 'Concluída' : 'Cancelada'}
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 px-4 py-3 rounded-md">
                      <div className="flex items-center text-gray-500 mb-1">
                        <Calendar size={16} className="mr-1" />
                        <span className="text-xs">Data do Sorteio</span>
                      </div>
                      <p className="font-medium text-sm">{formattedDrawDate}</p>
                    </div>
                    
                    <div className="bg-gray-50 px-4 py-3 rounded-md">
                      <div className="flex items-center text-gray-500 mb-1">
                        <Award size={16} className="mr-1" />
                        <span className="text-xs">Números</span>
                      </div>
                      <p className="font-medium text-sm">{raffle.totalNumbers} números</p>
                    </div>
                    
                    <div className="bg-gray-50 px-4 py-3 rounded-md">
                      <div className="flex items-center text-gray-500 mb-1">
                        <DollarSign size={16} className="mr-1" />
                        <span className="text-xs">Preço por Número</span>
                      </div>
                      <p className="font-medium text-sm">R$ {raffle.price.toFixed(2).replace('.', ',')}</p>
                    </div>
                  </div>
                </div>
                
                {/* Progress bar */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">Progresso da Venda</span>
                    <span>{percentageSold}% vendido</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-primary-500 h-2.5 rounded-full" 
                      style={{ width: `${percentageSold}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{raffle.soldNumbers.length} números vendidos</span>
                    <span>Total: {raffle.totalNumbers}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Number Selection and Checkout */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="bg-white rounded-lg shadow-card overflow-hidden">
              <div className="p-6 border-b">
                <h2 className="font-display font-semibold text-xl text-gray-900 mb-2">
                  Escolha seus números
                </h2>
                <p className="text-gray-600 text-sm">
                  Selecione os números que deseja comprar.
                </p>
              </div>
              
              <div className="p-6">
                <div className="mb-4">
                  <div className="flex justify-end space-x-4 mb-4">
                    <div className="flex items-center">
                      <span className="inline-block w-4 h-4 bg-gray-200 rounded-sm mr-1"></span>
                      <span className="text-xs text-gray-500">Disponível</span>
                    </div>
                    <div className="flex items-center">
                      <span className="inline-block w-4 h-4 bg-success-500 rounded-sm mr-1"></span>
                      <span className="text-xs text-gray-500">Selecionado</span>
                    </div>
                    <div className="flex items-center">
                      <span className="inline-block w-4 h-4 bg-gray-500 rounded-sm mr-1"></span>
                      <span className="text-xs text-gray-500">Vendido</span>
                    </div>
                  </div>
                  
                  {/* Numbers grid */}
                  <div className="max-h-[400px] overflow-y-auto pr-2">
                    {numbersGrid.map((row, rowIndex) => (
                      <div key={rowIndex} className="flex flex-wrap mb-2">
                        {row.map(num => {
                          const isAvailable = num.status === 'available';
                          const isSelected = selectedNumbers.includes(num.number);
                          
                          return (
                            <button
                              key={num.number}
                              onClick={() => handleNumberClick(num.number)}
                              disabled={!isAvailable}
                              className={`
                                w-9 h-9 m-0.5 rounded-md flex items-center justify-center text-sm font-medium 
                                ${isAvailable 
                                  ? isSelected
                                    ? 'bg-success-500 text-white' 
                                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                                  : 'bg-gray-500 text-white cursor-not-allowed opacity-60'
                                }
                                transition-colors duration-200
                              `}
                            >
                              {num.number}
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className={`border-t pt-4 mt-4 ${selectedNumbers.length ? 'block' : 'hidden'}`}>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-700">
                      {selectedNumbers.length} {selectedNumbers.length === 1 ? 'número' : 'números'} selecionado{selectedNumbers.length !== 1 ? 's' : ''}
                    </span>
                    <span className="font-medium">
                      Total: R$ {totalPrice.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                  
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Forma de pagamento</h3>
                    <div className="flex space-x-3">
                      <button
                        type="button"
                        className={`flex items-center px-4 py-2 rounded-md border ${
                          paymentMethod === 'pix'
                            ? 'border-primary-500 bg-primary-50 text-primary-600'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        onClick={() => setPaymentMethod('pix')}
                      >
                        <img src="https://images.pexels.com/photos/8447653/pexels-photo-8447653.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" alt="Pix" className="h-6 w-auto mr-2" />
                        <span>PIX</span>
                      </button>
                      
                      <button
                        type="button"
                        className={`flex items-center px-4 py-2 rounded-md border ${
                          paymentMethod === 'credit_card'
                            ? 'border-primary-500 bg-primary-50 text-primary-600'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        onClick={() => setPaymentMethod('credit_card')}
                      >
                        <img src="https://images.pexels.com/photos/5865196/pexels-photo-5865196.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" alt="Credit Card" className="h-6 w-auto mr-2" />
                        <span>Cartão</span>
                      </button>
                    </div>
                  </div>
                  
                  <Button
                    fullWidth
                    size="lg"
                    isLoading={isSubmitting}
                    onClick={handleSubmit}
                    disabled={selectedNumbers.length === 0}
                  >
                    Finalizar Compra
                  </Button>
                  
                  <div className="mt-4 text-xs text-gray-500 flex items-start">
                    <AlertTriangle size={14} className="mr-1 mt-0.5 flex-shrink-0" />
                    <span>
                      Ao finalizar a compra, você concorda com os Termos de Uso e Política de Privacidade da Rifativa.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};