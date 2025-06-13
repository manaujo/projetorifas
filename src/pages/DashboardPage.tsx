import React, { useState } from 'react';
import { Plus, BarChart3, Settings, Ticket, Users, DollarSign } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { useAuth } from '../hooks/useAuth';
import { useCampanhas } from '../hooks/useCampanhas';
import { useRifas } from '../hooks/useRifas';
import { formatCurrency, formatDate } from '../lib/utils';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { campanhas } = useCampanhas();
  const { rifas } = useRifas();
  const [activeTab, setActiveTab] = useState<'overview' | 'campanhas' | 'rifas' | 'vendas'>('overview');

  const totalCampanhas = campanhas.length;
  const totalRifas = rifas.length;
  const totalArrecadado = [...campanhas, ...rifas].reduce((total, item) => total + (item.total_arrecadado || 0), 0);
  const totalBilhetesVendidos = [...campanhas, ...rifas].reduce((total, item) => total + (item.bilhetes_vendidos || 0), 0);

  return (
    <ProtectedRoute>
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Bem-vindo, {user?.nome}</p>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card>
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Total Arrecadado</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalArrecadado)}</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Ticket className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Bilhetes Vendidos</p>
                  <p className="text-2xl font-bold text-gray-900">{totalBilhetesVendidos}</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Campanhas</p>
                  <p className="text-2xl font-bold text-gray-900">{totalCampanhas}</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Rifas</p>
                  <p className="text-2xl font-bold text-gray-900">{totalRifas}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-gray-200 mb-8">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', label: 'Visão Geral' },
                { id: 'campanhas', label: 'Campanhas' },
                { id: 'rifas', label: 'Rifas' },
                { id: 'vendas', label: 'Vendas' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Recent Campanhas */}
              <Card>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Campanhas Recentes</h3>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Campanha
                  </Button>
                </div>
                <div className="space-y-3">
                  {campanhas.slice(0, 5).map((campanha) => (
                    <div key={campanha.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{campanha.nome}</p>
                        <p className="text-sm text-gray-600">{formatDate(campanha.created_at)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(campanha.total_arrecadado || 0)}</p>
                        <p className="text-sm text-gray-600">{campanha.bilhetes_vendidos || 0} bilhetes</p>
                      </div>
                    </div>
                  ))}
                  {campanhas.length === 0 && (
                    <p className="text-gray-500 text-center py-4">Nenhuma campanha criada</p>
                  )}
                </div>
              </Card>

              {/* Recent Rifas */}
              <Card>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Rifas Recentes</h3>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Rifa
                  </Button>
                </div>
                <div className="space-y-3">
                  {rifas.slice(0, 5).map((rifa) => (
                    <div key={rifa.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{rifa.nome}</p>
                        <p className="text-sm text-gray-600">{formatDate(rifa.created_at)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(rifa.total_arrecadado || 0)}</p>
                        <p className="text-sm text-gray-600">{rifa.bilhetes_vendidos || 0} bilhetes</p>
                      </div>
                    </div>
                  ))}
                  {rifas.length === 0 && (
                    <p className="text-gray-500 text-center py-4">Nenhuma rifa criada</p>
                  )}
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'campanhas' && (
            <Card>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Minhas Campanhas</h3>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Campanha
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nome
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Bilhetes Vendidos
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Arrecadado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {campanhas.map((campanha) => (
                      <tr key={campanha.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{campanha.nome}</div>
                            <div className="text-sm text-gray-500">{formatDate(campanha.created_at)}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            campanha.status === 'ativa' 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {campanha.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {campanha.bilhetes_vendidos || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(campanha.total_arrecadado || 0)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Button variant="outline" size="sm">
                            <Settings className="h-4 w-4 mr-1" />
                            Gerenciar
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {campanhas.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Nenhuma campanha criada ainda</p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {activeTab === 'rifas' && (
            <Card>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Minhas Rifas</h3>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Rifa
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nome
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Bilhetes Vendidos
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Arrecadado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {rifas.map((rifa) => (
                      <tr key={rifa.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{rifa.nome}</div>
                            <div className="text-sm text-gray-500">{formatDate(rifa.created_at)}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            rifa.status === 'ativa' 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {rifa.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {rifa.bilhetes_vendidos || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(rifa.total_arrecadado || 0)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Button variant="outline" size="sm">
                            <Settings className="h-4 w-4 mr-1" />
                            Gerenciar
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {rifas.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Nenhuma rifa criada ainda</p>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
};