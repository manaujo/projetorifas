import { User } from '../types';

// Mock admin user for demonstration
const ADMIN_USER: User = {
  id: 'admin-1',
  name: 'Administrador',
  email: 'marcio.araujo.m7@gmail.com',
  role: 'admin',
  createdAt: new Date().toISOString(),
  balance: 0,
  pixKey: 'admin@pix.com',
  plan: 'premium',
  planExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
};

// Mock users storage
let mockUsers: User[] = [ADMIN_USER];

export const mockLogin = async (email: string, password: string): Promise<User> => {
  // Simulating API call delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Check if credentials match the admin account
  if (email === 'marcio.araujo.m7@gmail.com' && password === '1234567') {
    return ADMIN_USER;
  }
  
  // Check existing mock users
  const existingUser = mockUsers.find(u => u.email === email);
  if (existingUser && password.length >= 6) {
    return existingUser;
  }
  
  // Mock regular user
  if (email && password.length >= 6) {
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: email.split('@')[0],
      email,
      role: 'user',
      createdAt: new Date().toISOString(),
      balance: 0,
      plan: 'free',
    };
    
    mockUsers.push(newUser);
    return newUser;
  }
  
  throw new Error('Credenciais inválidas. Por favor, tente novamente.');
};

export const mockRegister = async (name: string, email: string, password: string): Promise<User> => {
  // Simulating API call delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Check if user already exists
  const existingUser = mockUsers.find(u => u.email === email);
  if (existingUser) {
    throw new Error('Este email já está cadastrado.');
  }
  
  const newUser: User = {
    id: `user-${Date.now()}`,
    name,
    email,
    role: 'user',
    createdAt: new Date().toISOString(),
    balance: 0,
    plan: 'free',
  };
  
  mockUsers.push(newUser);
  return newUser;
};

export const updateUserProfile = async (userId: string, updates: Partial<User>): Promise<User> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const userIndex = mockUsers.findIndex(u => u.id === userId);
  if (userIndex === -1) {
    throw new Error('Usuário não encontrado.');
  }
  
  mockUsers[userIndex] = { ...mockUsers[userIndex], ...updates };
  return mockUsers[userIndex];
};

export const getUserById = async (userId: string): Promise<User | null> => {
  return mockUsers.find(u => u.id === userId) || null;
};

export const hasActivePlan = (user: User): boolean => {
  if (!user.plan || user.plan === 'free') return false;
  if (!user.planExpiresAt) return false;
  return new Date(user.planExpiresAt) > new Date();
};