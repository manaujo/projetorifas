import React from 'react';
import { motion } from 'framer-motion';
import { Award, Shield } from 'lucide-react';

export const AboutSection: React.FC = () => {
  return (
    <section id="sobre-nos" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-display font-bold text-2xl md:text-3xl text-gray-900 mb-4">
              Sobre a Rifativa
            </h2>
            <h3 className="text-lg text-primary-500 mb-6">
              Conectando sorte, solidariedade e inovação digital
            </h3>
            <div className="space-y-4 text-gray-600">
              <p>
                A Rifativa nasceu com o propósito de transformar o jeito como rifas e campanhas solidárias são realizadas no Brasil. Nossa missão é conectar causas a pessoas de forma transparente, segura e moderna.
              </p>
              <p>
                Com uma plataforma intuitiva e recursos inovadores, oferecemos a melhor experiência para quem deseja criar rifas profissionais e alcançar seus objetivos — seja por solidariedade, projetos pessoais ou ações promocionais.
              </p>
              <p>
                Valorizamos a confiança dos nossos usuários, por isso investimos constantemente em segurança, usabilidade e suporte personalizado.
              </p>
              <p className="font-medium text-primary-500">
                Junte-se a nós e faça parte de uma nova era de campanhas online.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-6">
              <div className="bg-primary-50 rounded-lg p-4">
                <Award className="text-primary-500 mb-2" size={24} />
                <h4 className="font-semibold text-gray-900 mb-1">Confiabilidade</h4>
                <p className="text-sm text-gray-600">
                  + de 1.000 rifas realizadas com sucesso
                </p>
              </div>
              <div className="bg-primary-50 rounded-lg p-4">
                <Shield className="text-primary-500 mb-2" size={24} />
                <h4 className="font-semibold text-gray-900 mb-1">Segurança</h4>
                <p className="text-sm text-gray-600">
                  Plataforma 100% segura e transparente
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-2 gap-4"
          >
            <div className="space-y-4">
              <img
                src="https://images.pexels.com/photos/7413915/pexels-photo-7413915.jpeg"
                alt="Campanhas solidárias"
                className="w-full h-48 object-cover rounded-lg shadow-lg"
              />
              <img
                src="https://images.pexels.com/photos/7621138/pexels-photo-7621138.jpeg"
                alt="Sorteios online"
                className="w-full h-64 object-cover rounded-lg shadow-lg"
              />
            </div>
            <div className="space-y-4 mt-8">
              <img
                src="https://images.pexels.com/photos/7621140/pexels-photo-7621140.jpeg"
                alt="Prêmios e campanhas"
                className="w-full h-64 object-cover rounded-lg shadow-lg"
              />
              <img
                src="https://images.pexels.com/photos/7621141/pexels-photo-7621141.jpeg"
                alt="Rifas online"
                className="w-full h-48 object-cover rounded-lg shadow-lg"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};