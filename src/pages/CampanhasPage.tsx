import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Ticket, ArrowRight } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useCampanhasPublicas } from '../hooks/useCampanhas';
import { formatCurrency } from '../lib/utils';

export const CampanhasPage: React.FC = () => {
  const { campanhas, loading } = useCampanhasPublicas();

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </Card>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Campanhas Ativas
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Participe das melhores campanhas e concorra a prêmios incríveis
          </p>
        </div>

        {campanhas.length === 0 ? (
          <div className="text-center py-12">
            <Ticket className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhuma campanha ativa
            </h3>
            <p className="text-gray-600">
              Volte em breve para ver novas campanhas!
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {campanhas.map((campanha) => (
              <Card key={campanha.id} padding={false} className="overflow-hidden hover:shadow-lg transition-shadow">
                {campanha.imagem_url && (
                  <img 
                    src={campanha.imagem_url} 
                    alt={campanha.nome}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  {campanha.destaque && (
                    <div className="flex items-center mb-2">
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      <span className="text-sm text-yellow-600 font-medium">Destaque</span>
                    </div>
                  )}
                  <h3 className="text-xl font-semibold mb-2">{campanha.nome}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">{campanha.descricao}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Bilhetes vendidos:</span>
                      <span className="font-medium">{campanha.bilhetes_vendidos || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Total de bilhetes:</span>
                      <span className="font-medium">{campanha.total_bilhetes || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">A partir de</span>
                      <span className="text-lg font-bold text-blue-600">
                        {formatCurrency(campanha.preco_bilhete)}
                      </span>
                    </div>
                  </div>

                  <Link to={`/campanhas/${campanha.id}`}>
                    <Button className="w-full">
                      Ver Detalhes
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};