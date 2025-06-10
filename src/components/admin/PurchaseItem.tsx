import React, { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  User, 
  Phone, 
  CreditCard, 
  Calendar, 
  Hash, 
  DollarSign, 
  Check, 
  X, 
  Ticket,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { PendingPurchase } from '../../types';
import { Button } from '../ui/Button';

interface PurchaseItemProps {
  purchase: PendingPurchase;
  onAuthorize: (purchaseId: string) => void;
  onReject: (purchaseId: string) => void;
  isLoading?: boolean;
}

export const PurchaseItem: React.FC<PurchaseItemProps> = ({
  purchase,
  onAuthorize,
  onReject,
  isLoading = false,
}) => {
  const [actionLoading, setActionLoading] = useState<'authorize' | 'reject' | null>(null);

  const handleAuthorize = async () => {
    setActionLoading('authorize');
    try {
      await onAuthorize(purchase.id);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    setActionLoading('reject');
    try {
      await onReject(purchase.id);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusIcon = () => {
    switch (purchase.status) {
      case 'pending':
        return <Clock className="text-warning-500\" size={20} />;
      case 'authorized':
        return <CheckCircle className="text-success-500" size={20} />;
      case 'rejected':
        return <XCircle className="text-error-500" size={20} />;
      default:
        return <Clock className="text-gray-500" size={20} />;
    }
  };

  const getStatusText = () => {
    switch (purchase.status) {
      case 'pending':
        return 'Pendente';
      case 'authorized':
        return 'Autorizada';
      case 'rejected':
        return 'Recusada';
      default:
        return 'Desconhecido';
    }
  };

  const getStatusColor = () => {
    switch (purchase.status) {
      case 'pending':
        return 'bg-warning-100 text-warning-700 border-warning-200';
      case 'authorized':
        return 'bg-success-100 text-success-700 border-success-200';
      case 'rejected':
        return 'bg-error-100 text-error-700 border-error-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-card border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-200">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
            <User className="text-primary-600" size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-gray-900">
              {purchase.buyerName}
            </h3>
            <p className="text-sm text-gray-500">
              {purchase.raffleName}
            </p>
          </div>
        </div>
        
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border ${getStatusColor()}`}>
          {getStatusIcon()}
          <span className="text-sm font-medium">
            {getStatusText()}
          </span>
        </div>
      </div>

      {/* Purchase Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center text-gray-600 mb-1">
            <Phone size={16} className="mr-2" />
            <span className="text-xs font-medium">Telefone</span>
          </div>
          <p className="text-sm font-semibold text-gray-900">
            {purchase.buyerPhone}
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center text-gray-600 mb-1">
            <Hash size={16} className="mr-2" />
            <span className="text-xs font-medium">CPF</span>
          </div>
          <p className="text-sm font-semibold text-gray-900">
            {purchase.buyerCpf}
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center text-gray-600 mb-1">
            <Ticket size={16} className="mr-2" />
            <span className="text-xs font-medium">Bilhetes</span>
          </div>
          <p className="text-sm font-semibold text-gray-900">
            {purchase.ticketCount} {purchase.ticketCount === 1 ? 'bilhete' : 'bilhetes'}
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center text-gray-600 mb-1">
            <DollarSign size={16} className="mr-2" />
            <span className="text-xs font-medium">Valor Total</span>
          </div>
          <p className="text-sm font-semibold text-primary-600">
            R$ {purchase.totalAmount.toFixed(2).replace('.', ',')}
          </p>
        </div>
      </div>

      {/* Selected Numbers */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          Números Selecionados:
        </h4>
        <div className="flex flex-wrap gap-2">
          {purchase.selectedNumbers.map((number) => (
            <span
              key={number}
              className="bg-primary-100 text-primary-700 px-2 py-1 rounded-md text-xs font-medium"
            >
              {number.toString().padStart(3, '0')}
            </span>
          ))}
        </div>
      </div>

      {/* Purchase Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-2 sm:space-y-0">
        <div className="flex items-center text-gray-600">
          <Calendar size={16} className="mr-2" />
          <span className="text-sm">
            {format(new Date(purchase.purchaseDate), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
          </span>
        </div>
        
        <div className="flex items-center text-gray-600">
          <CreditCard size={16} className="mr-2" />
          <span className="text-sm">
            {purchase.paymentMethod === 'pix' ? 'PIX' : 'Cartão de Crédito'}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      {purchase.status === 'pending' && (
        <div className="flex space-x-3">
          <Button
            variant="outline"
            leftIcon={<X size={16} />}
            onClick={handleReject}
            isLoading={actionLoading === 'reject'}
            disabled={isLoading || actionLoading !== null}
            className="flex-1 border-error-300 text-error-600 hover:bg-error-50"
          >
            Recusar
          </Button>
          
          <Button
            leftIcon={<Check size={16} />}
            onClick={handleAuthorize}
            isLoading={actionLoading === 'authorize'}
            disabled={isLoading || actionLoading !== null}
            className="flex-1 bg-success-500 hover:bg-success-600"
          >
            Autorizar
          </Button>
        </div>
      )}

      {purchase.status === 'authorized' && (
        <div className="bg-success-50 border border-success-200 rounded-lg p-3">
          <div className="flex items-center text-success-700">
            <CheckCircle size={16} className="mr-2" />
            <span className="text-sm font-medium">
              Compra autorizada com sucesso
            </span>
          </div>
        </div>
      )}

      {purchase.status === 'rejected' && (
        <div className="bg-error-50 border border-error-200 rounded-lg p-3">
          <div className="flex items-center text-error-700">
            <XCircle size={16} className="mr-2" />
            <span className="text-sm font-medium">
              Compra recusada
            </span>
          </div>
        </div>
      )}
    </div>
  );
};