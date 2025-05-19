import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { RaffleCard } from '../components/RaffleCard';
import { Input } from '../components/ui/Input';
import { getRaffles } from '../services/raffleService';
import { Raffle } from '../types';

export const RafflesPage: React.FC = () => {
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'charity'>('all');

  useEffect(() => {
    const fetchRaffles = async () => {
      try {
        const data = await getRaffles();
        setRaffles(data);
      } catch (error) {
        console.error('Failed to fetch raffles:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRaffles();
  }, []);

  const filteredRaffles = raffles.filter(raffle => {
    const matchesSearch = raffle.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         raffle.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'active') {
      return matchesSearch && raffle.status === 'active';
    } else if (filter === 'charity') {
      return matchesSearch && raffle.isCharity;
    }
    
    return matchesSearch;
  });

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="font-display font-bold text-2xl md:text-3xl text-gray-900 mb-2">
            Rifas Disponíveis
          </h1>
          <p className="text-gray-600 mb-8">
            Encontre as melhores oportunidades e participe
          </p>

          <div className="bg-white rounded-lg shadow-card p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Buscar rifas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    filter === 'all'
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Todas
                </button>
                <button
                  onClick={() => setFilter('active')}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    filter === 'active'
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Ativas
                </button>
                <button
                  onClick={() => setFilter('charity')}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    filter === 'charity'
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Beneficentes
                </button>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
              {[1, 2, 3, 4, 5, 6].map((item) => (
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
          ) : filteredRaffles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRaffles.map((raffle) => (
                <motion.div
                  key={raffle.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <RaffleCard raffle={raffle} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Search size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma rifa encontrada
              </h3>
              <p className="text-gray-600">
                Tente ajustar seus filtros ou termos de busca
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
};