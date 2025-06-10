import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Ticket, 
  Clock,
  CheckCircle,
  XCircle,
  Calendar
} from 'lucide-react';

interface AnalyticsPanelProps {
  pendingCount: number;
  authorizedCount: number;
  rejectedCount: number;
}

export const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({
  pendingCount,
  authorizedCount,
  rejectedCount,
}) => {
  const totalPurchases = pendingCount + authorizedCount + rejectedCount;
  const approvalRate = totalPurchases > 0 ? (authorizedCount / totalPurchases) * 100 : 0;
  const rejectionRate = totalPurchases > 0 ? (rejectedCount / totalPurchases) * 100 : 0;

  // Mock data for demonstration
  const mockData = {
    totalRevenue: 2450.00,
    totalTicketsSold: 245,
    averageTicketsPerPurchase: 3.2,
    topBuyer: 'João Silva Santos',
    topBuyerTickets: 25,
    recentActivity: [
      { action: 'Compra autorizada', buyer: 'Maria Costa', amount: 50.00, time: '2 min atrás' },
      { action: 'Nova compra', buyer: 'Pedro Santos', amount: 30.00, time: '15 min atrás' },
      { action: 'Compra autorizada', buyer: 'Ana Silva', amount: 80.00, time: '1h atrás' },
    ]
  };

  const stats = [
    {
      title: 'Receita Total',
      value: `R$ ${mockData.totalRevenue.toFixed(2).replace('.', ',')}`,
      icon: DollarSign,
      color: 'text-success-600',
      bgColor: 'bg-success-100',
      change: '+12.5%',
      changeType: 'positive' as const,
    },
    {
      title: 'Bilhetes Vendidos',
      value: mockData.totalTicketsSold.toString(),
      icon: Ticket,
      color: 'text-primary-600',
      bgColor: 'bg-primary-100',
      change: '+8.3%',
      changeType: 'positive' as const,
    },
    {
      title: 'Taxa de Aprovação',
      value: `${approvalRate.toFixed(1)}%`,
      icon: CheckCircle,
      color: 'text-success-600',
      bgColor: 'bg-success-100',
      change: approvalRate > 80 ? '+5.2%' : '-2.1%',
      changeType: approvalRate > 80 ? 'positive' as const : 'negative' as const,
    },
    {
      title: 'Compras Pendentes',
      value: pendingCount.toString(),
      icon: Clock,
      color: 'text-warning-600',
      bgColor: 'bg-warning-100',
      change: pendingCount > 5 ? '+15%' : '-10%',
      changeType: pendingCount > 5 ? 'negative' as const : 'positive' as const,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-card p-6">
        <h3 className="font-display font-semibold text-lg text-gray-900 mb-2 flex items-center">
          <BarChart3 className="mr-2" size={20} />
          Relatórios e Analytics
        </h3>
        <p className="text-gray-600 text-sm">
          Acompanhe o desempenho das suas rifas e vendas
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                  <Icon className={stat.color} size={24} />
                </div>
                <span className={`text-sm font-medium ${
                  stat.changeType === 'positive' ? 'text-success-600' : 'text-error-600'
                }`}>
                  {stat.change}
                </span>
              </div>
              <h4 className="text-sm font-medium text-gray-600 mb-1">
                {stat.title}
              </h4>
              <p className="text-2xl font-bold text-gray-900">
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Charts and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Purchase Status Distribution */}
        <div className="bg-white rounded-lg shadow-card p-6">
          <h4 className="font-semibold text-gray-900 mb-4">
            Distribuição de Compras
          </h4>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-success-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Autorizadas</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-900 mr-2">
                  {authorizedCount}
                </span>
                <span className="text-xs text-gray-500">
                  ({approvalRate.toFixed(1)}%)
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-warning-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Pendentes</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-900 mr-2">
                  {pendingCount}
                </span>
                <span className="text-xs text-gray-500">
                  ({totalPurchases > 0 ? ((pendingCount / totalPurchases) * 100).toFixed(1) : 0}%)
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-error-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Recusadas</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-900 mr-2">
                  {rejectedCount}
                </span>
                <span className="text-xs text-gray-500">
                  ({rejectionRate.toFixed(1)}%)
                </span>
              </div>
            </div>
          </div>

          {/* Visual Progress Bars */}
          <div className="mt-6 space-y-3">
            <div>
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Taxa de Aprovação</span>
                <span>{approvalRate.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-success-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${approvalRate}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-card p-6">
          <h4 className="font-semibold text-gray-900 mb-4">
            Atividade Recente
          </h4>
          
          <div className="space-y-4">
            {mockData.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-3 ${
                    activity.action.includes('autorizada') ? 'bg-success-500' :
                    activity.action.includes('Nova') ? 'bg-warning-500' :
                    'bg-primary-500'
                  }`}></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {activity.action}
                    </p>
                    <p className="text-xs text-gray-500">
                      {activity.buyer} • R$ {activity.amount.toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-gray-400">
                  {activity.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Performers */}
      <div className="bg-white rounded-lg shadow-card p-6">
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
          <TrendingUp className="mr-2" size={18} />
          Destaques
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg">
            <Users className="mx-auto text-primary-600 mb-2" size={24} />
            <h5 className="font-semibold text-gray-900">Maior Comprador</h5>
            <p className="text-sm text-gray-600">{mockData.topBuyer}</p>
            <p className="text-lg font-bold text-primary-600">
              {mockData.topBuyerTickets} bilhetes
            </p>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-success-50 to-success-100 rounded-lg">
            <Ticket className="mx-auto text-success-600 mb-2" size={24} />
            <h5 className="font-semibold text-gray-900">Média por Compra</h5>
            <p className="text-sm text-gray-600">Bilhetes por transação</p>
            <p className="text-lg font-bold text-success-600">
              {mockData.averageTicketsPerPurchase}
            </p>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-warning-50 to-warning-100 rounded-lg">
            <Calendar className="mx-auto text-warning-600 mb-2" size={24} />
            <h5 className="font-semibold text-gray-900">Tempo Médio</h5>
            <p className="text-sm text-gray-600">Para aprovar compras</p>
            <p className="text-lg font-bold text-warning-600">
              2.5h
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};