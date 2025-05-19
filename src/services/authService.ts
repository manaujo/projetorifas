import { User } from '../types';

// Mock admin user for demonstration
const ADMIN_USER: User = {
  id: 'admin-1',
  name: 'Administrador',
  email: 'marcio.araujo.m7@gmail.com',
  role: 'admin',
  createdAt: new Date().toISOString(),
  balance: 0,
};

export const mockLogin = async (email: string, password: string): Promise<User> => {
  // Simulating API call delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Check if credentials match the admin account
  if (email === 'marcio.araujo.m7@gmail.com' && password === '1234567') {
    return ADMIN_USER;
  }
  
  // Mock regular user
  if (email && password.length >= 6) {
    return {
      id: `user-${Date.now()}`,
      name: email.split('@')[0],
      email,
      role: 'user',
      createdAt: new Date().toISOString(),
      balance: 0,
    };
  }
  
  throw new Error('Credenciais inválidas. Por favor, tente novamente.');
};