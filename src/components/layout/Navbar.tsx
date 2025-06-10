import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Ticket, User, LogOut, Menu, X, Home, Gift, PlusCircle, Megaphone, Crown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { hasActivePlan } from '../../services/authService';
import { Button } from '../ui/Button';
import { Logo } from '../Logo';

export const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  
  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);
  
  const canCreateContent = user && (hasActivePlan(user) || user.role === 'admin');
  
  return (
    <header className="bg-white shadow-sm fixed w-full top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <Logo className="h-8 w-auto" />
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                location.pathname === '/' 
                  ? 'text-primary-600 bg-primary-50' 
                  : 'text-gray-700 hover:text-primary-600 hover:bg-gray-100'
              }`}
            >
              Início
            </Link>
            <Link
              to="/rifas"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                location.pathname === '/rifas' 
                  ? 'text-primary-600 bg-primary-50' 
                  : 'text-gray-700 hover:text-primary-600 hover:bg-gray-100'
              }`}
            >
              Rifas
            </Link>
            <Link
              to="/campanhas"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                location.pathname === '/campanhas' 
                  ? 'text-primary-600 bg-primary-50' 
                  : 'text-gray-700 hover:text-primary-600 hover:bg-gray-100'
              }`}
            >
              Campanhas
            </Link>
            <Link
              to="/sobre"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                location.pathname === '/sobre' 
                  ? 'text-primary-600 bg-primary-50' 
                  : 'text-gray-700 hover:text-primary-600 hover:bg-gray-100'
              }`}
            >
              Sobre Nós
            </Link>
            <Link
              to="/faq"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                location.pathname === '/faq' 
                  ? 'text-primary-600 bg-primary-50' 
                  : 'text-gray-700 hover:text-primary-600 hover:bg-gray-100'
              }`}
            >
              FAQ
            </Link>
            <Link
              to="/precos"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                location.pathname === '/precos' 
                  ? 'text-primary-600 bg-primary-50' 
                  : 'text-gray-700 hover:text-primary-600 hover:bg-gray-100'
              }`}
            >
              Preços
            </Link>
            <Link
              to="/contato"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                location.pathname === '/contato' 
                  ? 'text-primary-600 bg-primary-50' 
                  : 'text-gray-700 hover:text-primary-600 hover:bg-gray-100'
              }`}
            >
              Contato
            </Link>
          </nav>
          
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                {!canCreateContent && user?.role !== 'admin' && (
                  <Link to="/precos">
                    <Button variant="secondary\" leftIcon={<Crown size={16} />} size="sm">
                      Upgrade
                    </Button>
                  </Link>
                )}
                
                {canCreateContent && (
                  <>
                    <Link to="/criar-campanha">
                      <Button variant="ghost" leftIcon={<Megaphone size={16} />} className="mr-2">
                        Nova Campanha
                      </Button>
                    </Link>
                    <Link to="/criar-rifa">
                      <Button variant="ghost" leftIcon={<PlusCircle size={16} />} className="mr-2">
                        Nova Rifa
                      </Button>
                    </Link>
                  </>
                )}
                
                <Link to="/dashboard">
                  <Button variant="ghost" leftIcon={<User size={16} />} className="mr-2">
                    Minha Conta
                  </Button>
                </Link>
                <Button variant="outline" leftIcon={<LogOut size={16} />} onClick={logout}>
                  Sair
                </Button>
              </div>
            ) : (
              <div className="flex space-x-3">
                <Link to="/login">
                  <Button variant="outline">Entrar</Button>
                </Link>
                <Link to="/register">
                  <Button>Cadastrar</Button>
                </Link>
              </div>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="text-gray-700 hover:text-primary-500 focus:outline-none"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            >
              {menuOpen ? (
                <X size={24} />
              ) : (
                <Menu size={24} />
              )}
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden py-2 border-t border-gray-200">
            <div className="px-2 space-y-1">
              <Link
                to="/"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-100"
                onClick={closeMenu}
              >
                <div className="flex items-center">
                  <Home size={18} className="mr-2" />
                  Início
                </div>
              </Link>
              <Link
                to="/rifas"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-100"
                onClick={closeMenu}
              >
                <div className="flex items-center">
                  <Ticket size={18} className="mr-2" />
                  Rifas
                </div>
              </Link>
              <Link
                to="/campanhas"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-100"
                onClick={closeMenu}
              >
                <div className="flex items-center">
                  <Megaphone size={18} className="mr-2" />
                  Campanhas
                </div>
              </Link>
              <Link
                to="/sobre"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-100"
                onClick={closeMenu}
              >
                <div className="flex items-center">
                  <Gift size={18} className="mr-2" />
                  Sobre Nós
                </div>
              </Link>
              <Link
                to="/faq"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-100"
                onClick={closeMenu}
              >
                <div className="flex items-center">
                  <PlusCircle size={18} className="mr-2" />
                  FAQ
                </div>
              </Link>
              <Link
                to="/precos"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-100"
                onClick={closeMenu}
              >
                <div className="flex items-center">
                  <Crown size={18} className="mr-2" />
                  Preços
                </div>
              </Link>
              <Link
                to="/contato"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-100"
                onClick={closeMenu}
              >
                <div className="flex items-center">
                  <User size={18} className="mr-2" />
                  Contato
                </div>
              </Link>
            </div>

            <div className="mt-3 px-2 space-y-1">
              {isAuthenticated ? (
                <>
                  {!canCreateContent && user?.role !== 'admin' && (
                    <Link 
                      to="/precos" 
                      className="block px-3 py-2 rounded-md text-base font-medium text-gold-600 hover:bg-gold-50"
                      onClick={closeMenu}
                    >
                      <div className="flex items-center">
                        <Crown size={18} className="mr-2" />
                        Upgrade para Premium
                      </div>
                    </Link>
                  )}
                  
                  {canCreateContent && (
                    <>
                      <Link 
                        to="/criar-campanha" 
                        className="block px-3 py-2 rounded-md text-base font-medium text-primary-600 hover:bg-primary-50"
                        onClick={closeMenu}
                      >
                        <div className="flex items-center">
                          <Megaphone size={18} className="mr-2" />
                          Nova Campanha
                        </div>
                      </Link>
                      <Link 
                        to="/criar-rifa" 
                        className="block px-3 py-2 rounded-md text-base font-medium text-primary-600 hover:bg-primary-50"
                        onClick={closeMenu}
                      >
                        <div className="flex items-center">
                          <PlusCircle size={18} className="mr-2" />
                          Nova Rifa
                        </div>
                      </Link>
                    </>
                  )}
                  
                  <Link 
                    to="/dashboard" 
                    className="block px-3 py-2 rounded-md text-base font-medium text-primary-600 hover:bg-primary-50"
                    onClick={closeMenu}
                  >
                    <div className="flex items-center">
                      <User size={18} className="mr-2" />
                      Minha Conta
                    </div>
                  </Link>
                  <button
                    onClick={() => { logout(); closeMenu(); }}
                    className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-100"
                  >
                    <div className="flex items-center">
                      <LogOut size={18} className="mr-2" />
                      Sair
                    </div>
                  </button>
                </>
              ) : (
                <div className="flex flex-col space-y-2 px-2 pt-2 pb-3">
                  <Link to="/login" onClick={closeMenu}>
                    <Button variant="outline" fullWidth>Entrar</Button>
                  </Link>
                  <Link to="/register" onClick={closeMenu}>
                    <Button fullWidth>Cadastrar</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};