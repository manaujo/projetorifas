import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Ticket, Star, Clock } from 'lucide-react';
import { Campaign } from '../../types';
import { Button } from '../ui/Button';

interface CampaignCardProps {
  campaign: Campaign;
}

export const CampaignCard: React.FC<CampaignCardProps> = ({ campaign }) => {
  const soldTickets = 0; // This will be calculated from campaign_tickets
  const percentageSold = Math.round((soldTickets / campaign.totalTickets) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg overflow-hidden shadow-card hover:shadow-lg transition-shadow duration-300"
    >
      <div className="relative">
        <img 
          src={campaign.coverImage} 
          alt={campaign.title} 
          className="w-full h-48 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-2 left-3 flex items-center">
          <span className={`${
            campaign.status === 'active' ? 'bg-success-500' :
            campaign.status === 'paused' ? 'bg-warning-500' :
            campaign.status === 'completed' ? 'bg-primary-500' :
            'bg-gray-500'
          } w-2 h-2 rounded-full mr-1.5`}></span>
          <span className="text-white text-sm font-medium">
            {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
          </span>
        </div>
        {campaign.featured && (
          <div className="absolute top-2 right-2 bg-gold-500 text-primary-900 text-xs px-2 py-1 rounded-md flex items-center">
            <Star size={14} className="mr-1" />
            Destaque
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-display font-bold text-lg text-gray-800 mb-1 line-clamp-1">
          {campaign.title}
        </h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {campaign.description}
        </p>
        
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center">
            <Ticket size={16} className="text-primary-500 mr-1" />
            <span className="text-primary-500 font-medium">
              R$ {campaign.ticketPrice.toFixed(2).replace('.', ',')}
            </span>
          </div>
          {campaign.mode === 'combo' && campaign.comboRules && (
            <div className="text-sm bg-primary-50 text-primary-600 px-2 py-1 rounded">
              Compre {campaign.comboRules.buy} e Ganhe {campaign.comboRules.get}
            </div>
          )}
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
            <span>{soldTickets} bilhetes vendidos</span>
            <span>Total: {campaign.totalTickets}</span>
          </div>
        </div>
        
        <Link to={`/campanhas/${campaign.id}`}>
          <Button fullWidth>Ver Detalhes</Button>
        </Link>
      </div>
    </motion.div>
  );
};