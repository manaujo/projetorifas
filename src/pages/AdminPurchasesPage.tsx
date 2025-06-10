import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Clock, CheckCircle, XCircle, BarChart3 } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { AdminSidebar } from '../components/admin/AdminSidebar';
import { PurchaseList } from '../components/admin/PurchaseList';
import { RaffleSettingsPanel } from '../components/admin/RaffleSettingsPanel';
import { AnalyticsPanel } from '../components/admin/AnalyticsPanel';
import { PendingPurchase } from '../types';
import { useAuth } from '../contexts/AuthContext';
import {
  getPendingPurchases,
  getAuthorizedPurchases,
  getRejectedPurchases,
  authorizePurchase,
  rejectPurchase,
} from '../services/purchaseService';

export const AdminPurchasesPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('pending');
  const [pendingPurchases, setPendingPurchases] = useState<PendingPurchase[]>([]);
  const [authorizedPurchases, setAuthorizedPurchases] = useState<PendingPurchase[]>([]);
  const [rejectedPurchases, setRejectedPurchases] = useState<PendingPurchase[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadPurchases();
    }
  }, [user]);

  const loadPurchases = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const [pending, authorized, rejected] = await Promise.all([
        getPendingPurchases(user.id),
        getAuthorizedPurchases(user.id),
        getRejectedPurchases(user.id),
      ]);

      setPendingPurchases(pending);
      setAuthorizedPurchases(authorized);
      setRejectedPurchases(rejected);
    } catch (error) {
      console.error('Failed to load purchases:', error);
      toast.error('Erro ao carregar compras');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthorizePurchase = async (purchaseId: string) => {
    try {
      await authorizePurchase(purchaseId);
      toast.success('Compra autorizada com sucesso!');
      
      // Move purchase from pending to authorized
      const purchase = pendingPurchases.find(p => p.id === purchaseId);
      if (purchase) {
        setPendingPurchases(prev => prev.filter(p => p.id !== purchaseId));
        setAuthorizedPurchases(prev => [...prev, { ...purchase, status: 'authorized' }]);
      }
    } catch (error) {
      console.error('Failed to authorize purchase:', error);
      toast.error('Erro ao autorizar compra');
    }
  };

  const handleRejectPurchase = async (purchaseId: string) => {
    try {
      await rejectPurchase(purchaseId);
      toast.success('Compra recusada');
      
      // Move purchase from pending to rejected
      const purchase = pendingPurchases.find(p => p.id === purchaseId);
      if (purchase) {
        setPendingPurchases(prev => prev.filter(p => p.id !== purchaseId));
        setRejectedPurchases(prev => [...prev, { ...purchase, status: 'rejected' }]);
      }
    } catch (error) {
      console.error('Failed to reject purchase:', error);
      toast.error('Erro ao recusar compra');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'pending':
        return (
          <PurchaseList
            purchases={pendingPurchases}
            onAuthorize={handleAuthorizePurchase}
            onReject={handleRejectPurchase}
            isLoading={isLoading}
            emptyMessage="Nenhuma compra pendente"
            emptyIcon={<Clock size={48} className="text-gray-400" />}
          />
        );
      
      case 'authorized':
        return (
          <PurchaseList
            purchases={authorizedPurchases}
            onAuthorize={handleAuthorizePurchase}
            onReject={handleRejectPurchase}
            isLoading={isLoading}
            emptyMessage="Nenhuma compra autorizada"
            emptyIcon={<CheckCircle size={48} className="text-gray-400" />}
          />
        );
      
      case 'rejected':
        return (
          <PurchaseList
            purchases={rejectedPurchases}
            onAuthorize={handleAuthorizePurchase}
            onReject={handleRejectPurchase}
            isLoading={isLoading}
            emptyMessage="Nenhuma compra recusada"
            emptyIcon={<XCircle size={48} className="text-gray-400" />}
          />
        );
      
      case 'analytics':
        return (
          <AnalyticsPanel
            pendingCount={pendingPurchases.length}
            authorizedCount={authorizedPurchases.length}
            rejectedCount={rejectedPurchases.length}
          />
        );
      
      case 'settings':
        return user ? <RaffleSettingsPanel userId={user.id} /> : null;
      
      default:
        return null;
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'pending':
        return 'Compras Pendentes';
      case 'authorized':
        return 'Compras Autorizadas';
      case 'rejected':
        return 'Compras Recusadas';
      case 'analytics':
        return 'Relatórios e Analytics';
      case 'settings':
        return 'Configurações das Rifas';
      default:
        return 'Painel Administrativo';
    }
  };

  const getPageDescription = () => {
    switch (activeTab) {
      case 'pending':
        return 'Gerencie as compras que aguardam sua aprovação';
      case 'authorized':
        return 'Visualize todas as compras que foram autorizadas';
      case 'rejected':
        return 'Histórico de compras que foram recusadas';
      case 'analytics':
        return 'Acompanhe o desempenho das suas rifas';
      case 'settings':
        return 'Configure suas rifas e preferências';
      default:
        return 'Gerencie suas rifas e compras';
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Acesso Negado
            </h1>
            <p className="text-gray-600">
              Você precisa estar logado para acessar esta página.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <AdminSidebar
                activeTab={activeTab}
                onTabChange={setActiveTab}
                pendingCount={pendingPurchases.length}
                authorizedCount={authorizedPurchases.length}
                rejectedCount={rejectedPurchases.length}
              />
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Header */}
              <div className="mb-8">
                <h1 className="font-display font-bold text-2xl md:text-3xl text-gray-900 mb-2">
                  {getPageTitle()}
                </h1>
                <p className="text-gray-600">
                  {getPageDescription()}
                </p>
              </div>

              {/* Content */}
              <div className="space-y-6">
                {renderContent()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};