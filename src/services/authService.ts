import { User } from '../types';

// Remove mock users and admin account
export const hasActivePlan = (user: User): boolean => {
  if (!user.plan || user.plan === 'free') return false;
  if (!user.planExpiresAt) return false;
  return new Date(user.planExpiresAt) > new Date();
};