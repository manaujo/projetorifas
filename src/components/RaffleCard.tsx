import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Ticket, BadgeCheck } from 'lucide-react';
import { Raffle } from '../types';
import { Button } from './ui/Button';

interface RaffleCardProps {
  raffle: Raffle;
}

export const RaffleCard: React.FC<RaffleCardProps> = ({ raffle }) => {
  const percentageSold = Math.round((raffle.soldNumbers.length / raffle.totalNumbers) * 100);
  const formattedDrawDate = format(new Date(raffle.drawDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  
  const statusText = raffle.status === 'active' 
    ? 'Ativa' 
    : raffle.status === 'completed' 
      ? 'Concluída' 
      : raffle.status === 'cancelled' 
        ? 'Cancelada' 
        : 'Rascunho';
  
  const statusColor = raffle.status === 'active' 
    ? 'bg-success-500' 
    : raffle.status === 'completed' 
      ? 'bg-primary-500' 
      : raffle.status === 'cancelled' 
        ? 'bg-error-500' 
        : 'bg-gray-500';

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-card hover:shadow-lg transition-shadow duration-300">
      <div className="relative">
        <img 
          src={raffle.imageUrl} 
          alt={raffle.title} 
          className="w-full h-48 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-2 left-3 flex items-center">
          <span className={`${statusColor} w-2 h-2 rounded-full mr-1.5`}></span>
          <span className="text-white text-sm font-medium">{statusText}</span>
        </div>
        {raffle.isCharity && (
          <div className="absolute top-2 right-2 bg-primary-500 text-white text-xs px-2 py-1 rounded-md flex items-center">
            <BadgeCheck size={14} className="mr-1" />
            Beneficente
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-display font-bold text-lg text-gray-800 mb-1 line-clamp-1">
          {raffle.title}
        </h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {raffle.description}
        </p>
        
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center">
            <Ticket size={16} className="text-primary-500 mr-1" />
            <span className="text-primary-500 font-medium">
              R$ {raffle.price.toFixed(2).replace('.', ',')}
            </span>
          </div>
          <div className="text-sm text-gray-500">
            Sorteio: {formattedDrawDate}
          </div>
        </div>
        
        <div className="mb-3">
          <div className="flex justify-between text-sm mb-1">
            <span>Progresso</span>
            <span className="font-medium">{percentageSold}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary-500 h-2 rounded-full"
              style={{ width: `${percentageSold}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{raffle.soldNumbers.length} números vendidos</span>
            <span>Total: {raffle.totalNumbers}</span>
          </div>
        </div>
        
        <Link to={`/rifas/${raffle.id}`}>
          <Button fullWidth>Ver Detalhes</Button>
        </Link>
      </div>
    </div>
  );
};