import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter, Mail, Phone } from 'lucide-react';
import { Logo } from '../Logo';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-primary-900 text-white">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & About */}
          <div className="md:col-span-1">
            <Logo variant="white" className="mb-4" />
            <p className="text-gray-300 text-sm mb-4">
              Transformando sua sorte em grandes conquistas. A Rifativa oferece uma plataforma segura e confiável para criação e participação em rifas online.
            </p>
            <div className="flex space-x-4">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-gold-400 transition-colors">
                <Instagram size={20} />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-gold-400 transition-colors">
                <Facebook size={20} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-gold-400 transition-colors">
                <Twitter size={20} />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div className="md:col-span-1">
            <h4 className="font-display font-semibold text-lg mb-4">Links Rápidos</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-gold-400 transition-colors text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/raffles" className="text-gray-300 hover:text-gold-400 transition-colors text-sm">
                  Rifas Ativas
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-gray-300 hover:text-gold-400 transition-colors text-sm">
                  Como Funciona
                </Link>
              </li>
              <li>
                <Link to="/create-raffle" className="text-gray-300 hover:text-gold-400 transition-colors text-sm">
                  Criar Rifa
                </Link>
              </li>
              <li>
                <Link to="/winners" className="text-gray-300 hover:text-gold-400 transition-colors text-sm">
                  Ganhadores
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Legal */}
          <div className="md:col-span-1">
            <h4 className="font-display font-semibold text-lg mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/terms" className="text-gray-300 hover:text-gold-400 transition-colors text-sm">
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-300 hover:text-gold-400 transition-colors text-sm">
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link to="/refund-policy" className="text-gray-300 hover:text-gold-400 transition-colors text-sm">
                  Política de Reembolso
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-300 hover:text-gold-400 transition-colors text-sm">
                  Perguntas Frequentes
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Contact */}
          <div className="md:col-span-1">
            <h4 className="font-display font-semibold text-lg mb-4">Contato</h4>
            <ul className="space-y-3">
              <li className="flex items-start">
                <Mail size={18} className="mr-2 mt-0.5 text-gray-300" />
                <a href="mailto:contato@rifativa.com.br" className="text-gray-300 hover:text-gold-400 transition-colors text-sm">
                  contato@rifativa.com.br
                </a>
              </li>
              <li className="flex items-start">
                <Phone size={18} className="mr-2 mt-0.5 text-gray-300" />
                <a href="tel:+5500000000000" className="text-gray-300 hover:text-gold-400 transition-colors text-sm">
                  (00) 0000-0000
                </a>
              </li>
            </ul>
            
            <div className="mt-6">
              <h5 className="font-medium mb-2 text-gray-200 text-sm">Formas de Pagamento</h5>
              <div className="flex space-x-2">
                <div className="bg-white p-1 rounded">
                  <img src="https://images.pexels.com/photos/8447653/pexels-photo-8447653.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" alt="PIX" className="h-6 w-auto object-contain" />
                </div>
                <div className="bg-white p-1 rounded">
                  <img src="https://images.pexels.com/photos/5865196/pexels-photo-5865196.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" alt="Credit Card" className="h-6 w-auto object-contain" />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-800">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <p className="text-gray-400 text-sm">
              &copy; {currentYear} Rifativa. Todos os direitos reservados.
            </p>
            <p className="text-gray-400 text-sm mt-2 md:mt-0">
              Desenvolvido com ❤️ por Bolt
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};