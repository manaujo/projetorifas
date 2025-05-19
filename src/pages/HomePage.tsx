import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Ticket, Users, Zap, Shield, ArrowRight, Search } from "lucide-react";
import { Layout } from "../components/layout/Layout";
import { Button } from "../components/ui/Button";
import { RaffleCard } from "../components/RaffleCard";
import { PricingSection } from "../components/pricing/PricingSection";
import { AboutSection } from "../components/about/AboutSection";
import { Raffle } from "../types";
import { getRaffles } from "../services/raffleService";
import { useAuth } from "../contexts/AuthContext";
import Img from "../assets/c0b098c0-29eb-447e-b616-1fdf7002095e.png";

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [activeRaffles, setActiveRaffles] = useState<Raffle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRaffles = async () => {
      try {
        const raffles = await getRaffles();
        setActiveRaffles(
          raffles.filter((raffle) => raffle.status === "active")
        );
      } catch (error) {
        console.error("Failed to fetch raffles", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRaffles();
  }, []);

  const handleCreateRaffle = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate('/criar-rifa');
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-primary-500 text-white pt-16 pb-24 md:pt-20 md:pb-32">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <motion.div
              className="md:w-1/2 mb-8 md:mb-0"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="font-display font-bold text-3xl md:text-4xl lg:text-5xl mb-4 leading-tight">
                Transformando sua sorte em grandes conquistas
              </h1>
              <p className="text-lg mb-6 text-primary-100 max-w-xl">
                Participe de rifas online de forma segura e confiável. Ganhe
                prêmios incríveis ou crie sua própria campanha.
              </p>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <Button
                  size="lg"
                  variant="secondary"
                  rightIcon={<ArrowRight size={16} />}
                  onClick={() => navigate('/rifas')}
                >
                  Ver Rifas Disponíveis
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-primary-500"
                  onClick={handleCreateRaffle}
                >
                  Criar Minha Rifa
                </Button>
              </div>
            </motion.div>

            <motion.div
              className="md:w-1/2 flex justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <img
                src={Img}
                alt="Prêmios de rifa"
                className="rounded-lg shadow-xl max-w-full h-auto"
                style={{ maxHeight: "400px" }}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display font-bold text-2xl md:text-3xl text-gray-900 mb-4">
              Por que escolher a Rifativa?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              A melhor plataforma para criação e participação em rifas online
              com segurança, transparência e facilidade.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <motion.div
              className="bg-white p-6 rounded-lg shadow-soft hover:shadow-card transition-shadow duration-300"
              whileHover={{ y: -5 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center text-primary-500 mb-4">
                <Shield size={24} />
              </div>
              <h3 className="font-display font-semibold text-lg text-gray-900 mb-2">
                100% Seguro
              </h3>
              <p className="text-gray-600 text-sm">
                Plataforma com criptografia de ponta a ponta e políticas rígidas
                de proteção ao usuário.
              </p>
            </motion.div>

            <motion.div
              className="bg-white p-6 rounded-lg shadow-soft hover:shadow-card transition-shadow duration-300"
              whileHover={{ y: -5 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center text-primary-500 mb-4">
                <Zap size={24} />
              </div>
              <h3 className="font-display font-semibold text-lg text-gray-900 mb-2">
                Rápido & Fácil
              </h3>
              <p className="text-gray-600 text-sm">
                Crie ou participe de rifas em minutos, com interface intuitiva e
                pagamentos instantâneos.
              </p>
            </motion.div>

            <motion.div
              className="bg-white p-6 rounded-lg shadow-soft hover:shadow-card transition-shadow duration-300"
              whileHover={{ y: -5 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center text-primary-500 mb-4">
                <Ticket size={24} />
              </div>
              <h3 className="font-display font-semibold text-lg text-gray-900 mb-2">
                Sorteios Verificados
              </h3>
              <p className="text-gray-600 text-sm">
                Sorteios baseados em loterias oficiais ou algoritmos
                verificáveis para máxima transparência.
              </p>
            </motion.div>

            <motion.div
              className="bg-white p-6 rounded-lg shadow-soft hover:shadow-card transition-shadow duration-300"
              whileHover={{ y: -5 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center text-primary-500 mb-4">
                <Users size={24} />
              </div>
              <h3 className="font-display font-semibold text-lg text-gray-900 mb-2">
                Comunidade Confiável
              </h3>
              <p className="text-gray-600 text-sm">
                Milhares de usuários satisfeitos e campanhas bem-sucedidas em
                nossa plataforma.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <AboutSection />

      {/* Pricing Section */}
      <PricingSection />

      {/* Active Raffles Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <div>
              <h2 className="font-display font-bold text-2xl md:text-3xl text-gray-900 mb-2">
                Rifas em Destaque
              </h2>
              <p className="text-gray-600">
                Confira as campanhas mais populares do momento
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Button
                variant="outline"
                rightIcon={<ArrowRight size={16} />}
                onClick={() => navigate('/rifas')}
              >
                Ver Todas as Rifas
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="bg-white rounded-lg overflow-hidden shadow-card"
                >
                  <div className="h-48 bg-gray-300"></div>
                  <div className="p-4">
                    <div className="h-6 bg-gray-300 rounded mb-3"></div>
                    <div className="h-16 bg-gray-200 rounded mb-3"></div>
                    <div className="h-10 bg-gray-300 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeRaffles.map((raffle) => (
                <motion.div
                  key={raffle.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <RaffleCard raffle={raffle} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-500 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display font-bold text-2xl md:text-3xl mb-6">
            Pronto para criar sua própria campanha?
          </h2>
          <p className="text-primary-100 mb-8 max-w-2xl mx-auto">
            Crie uma rifa para seu produto ou para uma causa beneficente. É
            rápido, fácil e seguro!
          </p>
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 justify-center">
            <Button size="lg" variant="secondary" onClick={handleCreateRaffle}>
              Criar Minha Rifa
            </Button>
            <button
              onClick={() => scrollToSection("sobre-nos")}
              className="inline-flex items-center justify-center px-6 py-3 border-2 border-white text-white hover:bg-white hover:text-primary-500 font-medium rounded-md transition-colors duration-200"
            >
              Como Funciona
            </button>
          </div>
        </div>
      </section>

      {/* Search Banner */}
      <section className="py-14 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="bg-white shadow-card rounded-lg p-6 flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0 md:mr-8">
              <h3 className="font-display font-semibold text-xl text-gray-900 mb-2">
                Procurando uma rifa específica?
              </h3>
              <p className="text-gray-600">
                Use nossa busca para encontrar exatamente o que você procura.
              </p>
            </div>
            <div className="w-full md:w-1/2 lg:w-1/3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar rifas..."
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};