import React from 'react';
import { Trophy, Medal, Crown, Users } from 'lucide-react';
import { BuyerRanking } from '../../types';

interface BuyerRankingListProps {
  rankings: BuyerRanking[];
}

export const BuyerRankingList: React.FC<BuyerRankingListProps> = ({ rankings }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="font-display font-semibold text-lg text-gray-900 mb-4 flex items-center">
        <Trophy size={20} className="text-gold-500 mr-2" />
        Ranking de Compradores
      </h3>
      
      <div className="space-y-3">
        {rankings.slice(0, 10).map((buyer, index) => (
          <div 
            key={buyer.userId}
            className={`flex items-center justify-between p-3 rounded-xl transition-all duration-200 ${
              index === 0 ? 'bg-gradient-to-r from-gold-50 to-yellow-50 border border-gold-200' :
              index === 1 ? 'bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200' :
              index === 2 ? 'bg-gradient-to-r from-primary-50 to-blue-50 border border-primary-200' :
              'bg-gray-50 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold mr-3 ${
                index === 0 ? 'bg-gradient-to-r from-gold-500 to-yellow-500' :
                index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500' :
                index === 2 ? 'bg-gradient-to-r from-primary-500 to-blue-500' :
                'bg-gradient-to-r from-gray-300 to-gray-400'
              }`}>
                {index < 3 ? (
                  index === 0 ? <Crown size={18} /> :
                  index === 1 ? <Medal size={18} /> :
                  <Trophy size={18} />
                ) : (
                  <span className="text-sm">
                    {index + 1}
                  </span>
                )}
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">
                  {buyer.userName}
                </p>
                <p className="text-xs text-gray-500">
                  {buyer.ticketsBought} {buyer.ticketsBought === 1 ? 'bilhete' : 'bilhetes'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-sm font-bold ${
                index === 0 ? 'text-gold-600' :
                index === 1 ? 'text-gray-600' :
                index === 2 ? 'text-primary-600' :
                'text-gray-500'
              }`}>
                {buyer.participationPercentage.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-400">
                participação
              </div>
            </div>
          </div>
        ))}
        
        {rankings.length === 0 && (
          <div className="text-center py-8">
            <Users size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 text-sm">
              Nenhum bilhete vendido ainda
            </p>
            <p className="text-gray-400 text-xs">
              Seja o primeiro a participar!
            </p>
          </div>
        )}

        {rankings.length > 10 && (
          <div className="text-center pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              +{rankings.length - 10} participantes
            </p>
          </div>
        )}
      </div>
    </div>
  );
};