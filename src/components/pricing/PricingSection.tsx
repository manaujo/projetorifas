import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Check, Star } from 'lucide-react';
import { Button } from '../ui/Button';

export const PricingSection: React.FC = () => {
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  return (
    <section id="planos" className="py-16 bg-gray-50">
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
          {/* Plano Econômico */}
          <motion.div 
            className="bg-white rounded-2xl shadow-card hover:shadow-lg transition-shadow duration-300"
            {...fadeInUp}
            transition={{ delay: 0.2 }}
          >
            <div className="p-8">
              <h3 className="font-display font-bold text-xl text-gray-900 mb-4">Econômico</h3>
              <div className="mb-6">
                <span className="text-3xl font-bold text-primary-500">R$ 97,00</span>
                <span className="text-gray-500 ml-2">por campanha</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center text-gray-600">
                  <Check size={20} className="text-primary-500 mr-2 flex-shrink-0" />
                  <span>Até R$ 5,00 por bilhete</span>
                </li>
                <li className="flex items-center text-gray-600">
                  <Check size={20} className="text-primary-500 mr-2 flex-shrink-0" />
                  <span>Até 1.000 bilhetes</span>
                </li>
              </ul>
              <Link to="/nova-rifa">
                <Button fullWidth>Começar agora</Button>
              </Link>
            </div>
          </motion.div>

          {/* Plano Padrão */}
          <motion.div 
            className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 transform md:-translate-y-4 relative"
            {...fadeInUp}
            transition={{ delay: 0.3 }}
          >
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-gold-500 text-primary-900 text-sm font-medium px-4 py-1 rounded-full flex items-center">
                <Star size={16} className="mr-1" />
                Mais Popular
              </div>
            </div>
            <div className="p-8 border-2 border-primary-500 rounded-2xl">
              <h3 className="font-display font-bold text-xl text-gray-900 mb-4">Padrão</h3>
              <div className="mb-6">
                <span className="text-3xl font-bold text-primary-500">R$ 159,90</span>
                <span className="text-gray-500 ml-2">por campanha</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center text-gray-600">
                  <Check size={20} className="text-primary-500 mr-2 flex-shrink-0" />
                  <span>Tudo do plano Econômico</span>
                </li>
                <li className="flex items-center text-gray-600">
                  <Check size={20} className="text-primary-500 mr-2 flex-shrink-0" />
                  <span>Valor ilimitado por bilhete</span>
                </li>
                <li className="flex items-center text-gray-600">
                  <Check size={20} className="text-primary-500 mr-2 flex-shrink-0" />
                  <span>Até 100.000 bilhetes</span>
                </li>
              </ul>
              <Link to="/nova-rifa">
                <Button fullWidth variant="secondary">Começar agora</Button>
              </Link>
            </div>
          </motion.div>

          {/* Plano Premium */}
          <motion.div 
            className="bg-white rounded-2xl shadow-card hover:shadow-lg transition-shadow duration-300"
            {...fadeInUp}
            transition={{ delay: 0.4 }}
          >
            <div className="p-8">
              <h3 className="font-display font-bold text-xl text-gray-900 mb-4">Premium</h3>
              <div className="mb-6">
                <div className="flex items-center">
                  <span className="text-3xl font-bold text-primary-500">R$ 499,00</span>
                  <span className="text-gray-500 ml-2">por campanha</span>
                </div>
                <span className="text-sm text-error-500 line-through">De R$ 999,90</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center text-gray-600">
                  <Check size={20} className="text-primary-500 mr-2 flex-shrink-0" />
                  <span>Tudo do plano Padrão</span>
                </li>
                <li className="flex items-center text-gray-600">
                  <Check size={20} className="text-primary-500 mr-2 flex-shrink-0" />
                  <span>Até 1.000.000 de bilhetes</span>
                </li>
              </ul>
              <Link to="/nova-rifa">
                <Button fullWidth>Começar agora</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};