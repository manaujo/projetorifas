import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Check, Star, Loader2 } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { stripeProducts } from '../stripe-config';
import { StripeService } from '../services/stripeService';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

export const PricingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null);

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  const handlePurchase = async (priceId: string, mode: 'payment' | 'subscription') => {
    if (!isAuthenticated) {
      toast.error('Você precisa estar logado para fazer uma compra');
      return;
    }

    setLoadingPriceId(priceId);

    try {
      const { url } = await StripeService.createCheckoutSession({
        priceId,
        successUrl: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/precos`,
        mode,
      });

      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.error('Erro ao processar pagamento. Tente novamente.');
    } finally {
      setLoadingPriceId(null);
    }
  };

  const getPrice = (name: string) => {
    switch (name) {
      case 'Econômico':
        return 'R$ 97,00';
      case 'Padrão':
        return 'R$ 159,90';
      case 'Premium':
        return 'R$ 499,00';
      default:
        return 'Consulte';
    }
  };

  const getFeatures = (name: string) => {
    switch (name) {
      case 'Econômico':
        return [
          'Até 2 rifas',
          'Até 2 campanhas',
          'Até 100.000 bilhetes',
          'Suporte por email',
          'Pagamentos via PIX',
        ];
      case 'Padrão':
        return [
          'Até 5 rifas',
          'Até 5 campanhas',
          'Até 500.000 bilhetes',
          'Suporte prioritário',
          'Pagamentos via PIX',
          'Relatórios avançados',
        ];
      case 'Premium':
        return [
          'Até 10 rifas',
          'Até 10 campanhas',
          'Até 1.000.000 bilhetes',
          'Suporte VIP',
          'Pagamentos via PIX',
          'Relatórios avançados',
          'Customização avançada',
          'API de integração',
        ];
      default:
        return [];
    }
  };

  return (
    <Layout>
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <motion.h2 
              className="font-display font-bold text-2xl md:text-3xl text-gray-900 mb-4"
              {...fadeInUp}
            >
              Escolha o plano ideal para sua campanha
            </motion.h2>
            <motion.p 
              className="text-gray-600 max-w-2xl mx-auto"
              {...fadeInUp}
              transition={{ delay: 0.1 }}
            >
              Comece sua rifa com segurança e as melhores ferramentas
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stripeProducts.map((product, index) => {
              const isPopular = product.name === 'Padrão';
              const features = getFeatures(product.name);
              const price = getPrice(product.name);
              const isLoading = loadingPriceId === product.priceId;

              return (
                <motion.div 
                  key={product.priceId}
                  className={`bg-white rounded-2xl shadow-card hover:shadow-lg transition-shadow duration-300 ${
                    isPopular ? 'transform md:-translate-y-4 relative border-2 border-primary-500' : ''
                  }`}
                  {...fadeInUp}
                  transition={{ delay: 0.2 + index * 0.1 }}
                >
                  {isPopular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="bg-gold-500 text-primary-900 text-sm font-medium px-4 py-1 rounded-full flex items-center">
                        <Star size={16} className="mr-1" />
                        Mais Popular
                      </div>
                    </div>
                  )}
                  
                  <div className="p-8">
                    <h3 className="font-display font-bold text-xl text-gray-900 mb-4">
                      {product.name}
                    </h3>
                    <div className="mb-6">
                      <span className="text-3xl font-bold text-primary-500">{price}</span>
                      <span className="text-gray-500 ml-2">por campanha</span>
                    </div>
                    
                    <ul className="space-y-4 mb-8">
                      {features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center text-gray-600">
                          <Check size={20} className="text-primary-500 mr-2 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    {isAuthenticated ? (
                      <Button
                        fullWidth
                        variant={isPopular ? 'secondary' : 'primary'}
                        onClick={() => handlePurchase(product.priceId, product.mode)}
                        disabled={isLoading}
                        leftIcon={isLoading ? <Loader2 size={16} className="animate-spin" /> : undefined}
                      >
                        {isLoading ? 'Processando...' : 'Começar agora'}
                      </Button>
                    ) : (
                      <Link to="/login">
                        <Button fullWidth variant={isPopular ? 'secondary' : 'primary'}>
                          Fazer login para comprar
                        </Button>
                      </Link>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4">
              Todas as compras são processadas de forma segura através do Stripe
            </p>
            <div className="flex justify-center items-center space-x-4">
              <img 
                src="https://images.stripe.com/v1/icons/brands/visa.svg" 
                alt="Visa" 
                className="h-8"
              />
              <img 
                src="https://images.stripe.com/v1/icons/brands/mastercard.svg" 
                alt="Mastercard" 
                className="h-8"
              />
              <img 
                src="https://images.stripe.com/v1/icons/brands/amex.svg" 
                alt="American Express" 
                className="h-8"
              />
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};