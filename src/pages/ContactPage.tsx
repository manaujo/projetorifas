import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export const ContactPage: React.FC = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-12">
            <h1 className="font-display font-bold text-2xl md:text-3xl text-gray-900 mb-2">
              Entre em Contato
            </h1>
            <p className="text-gray-600">
              Estamos aqui para ajudar. Entre em contato conosco.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="bg-white rounded-lg shadow-card p-6 mb-6">
                <h2 className="font-display font-semibold text-xl text-gray-900 mb-4">
                  Informações de Contato
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <Mail className="w-5 h-5 text-primary-500 mt-1 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">Email</p>
                      <a href="mailto:contato@rifativa.com.br" className="text-gray-600 hover:text-primary-500">
                        contato@rifativa.com.br
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Phone className="w-5 h-5 text-primary-500 mt-1 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">Telefone</p>
                      <a href="tel:+5500000000000" className="text-gray-600 hover:text-primary-500">
                        (00) 0000-0000
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <MapPin className="w-5 h-5 text-primary-500 mt-1 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">Endereço</p>
                      <p className="text-gray-600">
                        Av. Principal, 1000<br />
                        Centro, Cidade - UF<br />
                        CEP: 00000-000
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-card p-6">
                <h2 className="font-display font-semibold text-xl text-gray-900 mb-4">
                  Horário de Atendimento
                </h2>
                <div className="space-y-2">
                  <p className="text-gray-600">
                    <span className="font-medium text-gray-900">Segunda a Sexta:</span><br />
                    09:00 - 18:00
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium text-gray-900">Sábado:</span><br />
                    09:00 - 13:00
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium text-gray-900">Domingo:</span><br />
                    Fechado
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-card p-6">
              <h2 className="font-display font-semibold text-xl text-gray-900 mb-4">
                Envie sua Mensagem
              </h2>
              <form className="space-y-4">
                <Input
                  label="Nome"
                  placeholder="Seu nome completo"
                />
                <Input
                  type="email"
                  label="Email"
                  placeholder="seu@email.com"
                />
                <Input
                  type="tel"
                  label="Telefone"
                  placeholder="(00) 00000-0000"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mensagem
                  </label>
                  <textarea
                    rows={5}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Digite sua mensagem..."
                  ></textarea>
                </div>
                <Button
                  type="submit"
                  fullWidth
                  leftIcon={<Send size={16} />}
                >
                  Enviar Mensagem
                </Button>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};