import React from 'react';
import { PendingPurchase } from '../../types';
import { PurchaseItem } from './PurchaseItem';
import { ShoppingCart, Clock, CheckCircle, XCircle } from 'lucide-react';

interface PurchaseListProps {
  purchases: PendingPurchase[];
  onAuthorize: (purchaseId: string) => void;
  onReject: (purchaseId: string) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
}

export const PurchaseList: React.FC<PurchaseListProps> = ({
  purchases,
  onAuthorize,
  onReject,
  isLoading = false,
  emptyMessage = "Nenhuma compra encontrada",
  emptyIcon = <ShoppingCart size={48} className="text-gray-400" />,
}) => {
  if (purchases.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="flex justify-center mb-4">
          {emptyIcon}
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {emptyMessage}
        </h3>
        <p className="text-gray-600">
          {emptyMessage.includes('pendente') 
            ? 'Todas as compras foram processadas ou não há compras no momento.'
            : emptyMessage.includes('autorizada')
            ? 'Nenhuma compra foi autorizada ainda.'
            : 'Nenhuma compra foi recusada ainda.'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {purchases.map((purchase) => (
        <PurchaseItem
          key={purchase.id}
          purchase={purchase}
          onAuthorize={onAuthorize}
          onReject={onReject}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
};