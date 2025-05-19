import React from 'react';
import { motion } from 'framer-motion';
import { Layout } from '../components/layout/Layout';

const faqs = [
  {
    question: 'Como funciona a Rifativa?',
    answer: 'A Rifativa é uma plataforma que permite criar e participar de rifas online de forma segura e transparente. Você pode escolher números, fazer o pagamento e acompanhar o sorteio, tudo de forma digital.'
  },
  {
    question: 'Como são realizados os sorteios?',
    answer: 'Os sorteios são realizados de forma automática e transparente, utilizando um sistema verificável baseado em algoritmos criptográficos ou através da loteria federal.'
  },
  {
    question: 'Como recebo meu prêmio?',
    answer: 'Após ser declarado vencedor, você será notificado por email e telefone. O organizador da rifa entrará em contato para combinar a entrega do prêmio.'
  },
  {
    question: 'Quais são as formas de pagamento aceitas?',
    answer: 'Aceitamos pagamentos via PIX e cartão de crédito. Todas as transações são processadas de forma segura através de gateways de pagamento confiáveis.'
  },
  {
    question: 'Como criar minha própria rifa?',
    answer: 'Para criar uma rifa, você precisa se cadastrar na plataforma, escolher um plano, preencher as informações do prêmio e definir o número de bilhetes e valor. Após a aprovação, sua rifa estará disponível para participação.'
  },
  {
    question: 'É seguro participar das rifas?',
    answer: 'Sim! A Rifativa possui diversos mecanismos de segurança e verificação para garantir a legitimidade das rifas e a proteção dos participantes.'
  }
];

export const FAQPage: React.FC = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <h1 className="font-display font-bold text-2xl md:text-3xl text-gray-900 mb-2">
            Perguntas Frequentes
          </h1>
          <p className="text-gray-600 mb-8">
            Encontre respostas para as dúvidas mais comuns sobre a Rifativa
          </p>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-card p-6"
              >
                <h3 className="font-display font-semibold text-lg text-gray-900 mb-2">
                  {faq.question}
                </h3>
                <p className="text-gray-600">
                  {faq.answer}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};