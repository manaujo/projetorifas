import React from 'react';
import { Link } from 'react-router-dom';
import { Ticket, Star, Users, Shield, ArrowRight } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useCampanhasPublicas } from '../hooks/useCampanhas';
import { formatCurrency } from '../lib/utils';

export const HomePage: React.FC = () => {
  const { campanhas, loading } = useCampanhasPublicas();

  const featuredCampanhas = campanhas.filter(c => c.destaque).slice(0, 3);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Transforme sua sorte em
              <span className="text-yellow-400"> grandes conquistas</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Participe de rifas e campanhas online de forma segura e confiável. 
              Ganhe prêmios incríveis ou crie sua própria campanha.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/campanhas">
                <Button size="lg" className="bg-yellow-500 text-blue-900 hover:bg-yellow-400">
                  Ver Campanhas
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600">
                  Criar Conta
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Por que escolher a Rifativa?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              A plataforma mais segura e confiável para rifas online
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">100% Seguro</h3>
              <p className="text-gray-600">
                Plataforma com criptografia de ponta e políticas rígidas de proteção
              </p>
            </Card>

            <Card className="text-center">
              <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Comunidade Confiável</h3>
              <p className="text-gray-600">
                Milhares de usuários satisfeitos e campanhas bem-sucedidas
              </p>
            </Card>

            <Card className="text-center">
              <Ticket className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Sorteios Verificados</h3>
              <p className="text-gray-600">
                Sorteios transparentes com números aleatórios verificáveis
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Campaigns */}
      {featuredCampanhas.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Campanhas em Destaque
              </h2>
              <p className="text-xl text-gray-600">
                Confira as campanhas mais populares do momento
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {featuredCampanhas.map((campanha) => (
                <Card key={campanha.id} padding={false} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {campanha.imagem_url && (
                    <img 
                      src={campanha.imagem_url} 
                      alt={campanha.nome}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-6">
                    <div className="flex items-center mb-2">
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      <span className="text-sm text-yellow-600 font-medium">Destaque</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{campanha.nome}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{campanha.descricao}</p>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm text-gray-500">A partir de</span>
                      <span className="text-lg font-bold text-blue-600">
                        {formatCurrency(campanha.preco_bilhete)}
                      </span>
                    </div>
                    <Link to={`/campanhas/${campanha.id}`}>
                      <Button className="w-full">Ver Detalhes</Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link to="/campanhas">
                <Button variant="outline" size="lg">
                  Ver Todas as Campanhas
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="bg-gray-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Pronto para começar?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Crie sua conta e comece a participar das melhores rifas e campanhas online
          </p>
          <Link to="/register">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              Criar Conta Grátis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
};