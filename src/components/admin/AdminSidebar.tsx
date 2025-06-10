import React from 'react';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Settings, 
  BarChart3,
  Users,
  Ticket,
  DollarSign
} from 'lucide-react';

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  pendingCount: number;
  authorizedCount: number;
  rejectedCount: number;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  onTabChange,
  pendingCount,
  authorizedCount,
  rejectedCount,
}) => {
  const menuItems = [
    {
      id: 'pending',
      label: 'Compras Pendentes',
      icon: Clock,
      count: pendingCount,
      color: 'text-warning-600',
      bgColor: 'bg-warning-100',
    },
    {
      id: 'authorized',
      label: 'Compras Autorizadas',
      icon: CheckCircle,
      count: authorizedCount,
      color: 'text-success-600',
      bgColor: 'bg-success-100',
    },
    {
      id: 'rejected',
      label: 'Compras Recusadas',
      icon: XCircle,
      count: rejectedCount,
      color: 'text-error-600',
      bgColor: 'bg-error-100',
    },
    {
      id: 'analytics',
      label: 'Relatórios',
      icon: BarChart3,
      color: 'text-primary-600',
      bgColor: 'bg-primary-100',
    },
    {
      id: 'settings',
      label: 'Configurações',
      icon: Settings,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-card p-6">
      <div className="mb-6">
        <h2 className="font-display font-bold text-xl text-gray-900 mb-2">
          Painel Administrativo
        </h2>
        <p className="text-gray-600 text-sm">
          Gerencie as compras das suas rifas
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-3 mb-6">
        <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-primary-600 font-medium">Total de Compras</p>
              <p className="text-lg font-bold text-primary-700">
                {pendingCount + authorizedCount + rejectedCount}
              </p>
            </div>
            <Ticket className="text-primary-500" size={24} />
          </div>
        </div>

        <div className="bg-gradient-to-r from-success-50 to-success-100 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-success-600 font-medium">Taxa de Aprovação</p>
              <p className="text-lg font-bold text-success-700">
                {authorizedCount + rejectedCount > 0 
                  ? Math.round((authorizedCount / (authorizedCount + rejectedCount)) * 100)
                  : 0}%
              </p>
            </div>
            <BarChart3 className="text-success-500" size={24} />
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                isActive
                  ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-500'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center">
                <Icon 
                  size={18} 
                  className={`mr-3 ${isActive ? 'text-primary-600' : 'text-gray-500'}`} 
                />
                <span className="font-medium text-sm">
                  {item.label}
                </span>
              </div>
              
              {item.count !== undefined && item.count > 0 && (
                <span className={`${item.bgColor} ${item.color} text-xs font-bold px-2 py-1 rounded-full min-w-[20px] text-center`}>
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Help Section */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2 text-sm">
          💡 Dica
        </h4>
        <p className="text-xs text-gray-600">
          Autorize as compras rapidamente para melhorar a experiência dos seus clientes.
        </p>
      </div>
    </div>
  );
};