import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Download } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { StripeService } from '../services/stripeService';
import { getProductByPriceId } from '../stripe-config';

export const SuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const userSubscription = await StripeService.getUserSubscription();
        setSubscription(userSubscription);
      } catch (error) {
        console.error('Error fetching subscription:', error);
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) {
      // Add a small delay to ensure webhook has processed
      setTimeout(fetchSubscription, 2000);
    } else {
      setLoading(false);
    }
  }, [sessionId]);

  const product = subscription?.price_id ? getProductByPriceId(subscription.price_id) : null;

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full"
        >
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-success-600" />
            </div>

            <h1 className="font-display font-bold text-2xl text-gray-900 mb-4">
              Pagamento Realizado com Sucesso!
            </h1>

            {loading ? (
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-6"></div>
              </div>
            ) : product ? (
              <div className="mb-6">
                <p className="text-gray-600 mb-4">
                  Você adquiriu o plano <strong>{product.name}</strong>
                </p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">{product.description}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-600 mb-6">
                Seu pagamento foi processado com sucesso. Você já pode começar a usar todos os recursos da plataforma.
              </p>
            )}

            <div className="space-y-3">
              <Link to="/dashboard">
                <Button fullWidth leftIcon={<ArrowRight size={16} />}>
                  Ir para o Dashboard
                </Button>
              </Link>
              
              <Link to="/criar-rifa">
                <Button fullWidth variant="outline">
                  Criar Primeira Rifa
                </Button>
              </Link>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Você receberá um email de confirmação em breve com os detalhes da sua compra.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};