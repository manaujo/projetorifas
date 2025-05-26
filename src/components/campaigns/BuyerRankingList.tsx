import React from 'react';
import { Trophy, Medal } from 'lucide-react';
import { BuyerRanking } from '../../types';

interface BuyerRankingListProps {
  rankings: BuyerRanking[];
}

export const BuyerRankingList: React.FC<BuyerRankingListProps> = ({ rankings }) => {
  return (
    <div className="bg-white rounded-lg shadow-card p-6">
      <h3 className="font-display font-semibold text-lg text-gray-900 mb-4 flex items-center">
        <Trophy size={20} className="text-gold-500 mr-2" />
        Ranking de Compradores
      </h3>
      
      <div className="space-y-4">
        {rankings.map((buyer, index) => (
          <div 
            key={buyer.userId}
            className={`flex items-center justify-between p-3 rounded-lg ${
              index === 0 ? 'bg-gold-50' :
              index === 1 ? 'bg-gray-100' :
              index === 2 ? 'bg-primary-50' :
              'bg-white'
            }`}
          >
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                {index < 3 ? (
                  <Medal 
                    size={16} 
                    className={
                      index === 0 ? 'text-gold-500' :
                      index === 1 ? 'text-gray-500' :
                      'text-primary-500'
                    } 
                  />
                ) : (
                  <span className="text-sm font-medium text-primary-500">
                    {index + 1}
                  </span>
                )}
              </div>
              <div>
                <p className="font-medium text-gray-900">{buyer.userName}</p>
                <p className="text-sm text-gray-500">
                  {buyer.ticketsBought} bilhetes
                </p>
              </div>
            </div>
            <div className="text-sm font-medium text-primary-500">
              {buyer.participationPercentage}%
            </div>
          </div>
        ))}
        
        {rankings.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Nenhum bilhete vendido ainda
          </div>
        )}
      </div>
    </div>
  );
};