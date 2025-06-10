import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { RafflePage } from './pages/RafflePage';
import { DashboardPage } from './pages/DashboardPage';
import { CreateRafflePage } from './pages/CreateRafflePage';
import { CreateCampaignPage } from './pages/CreateCampaignPage';
import { RafflesPage } from './pages/RafflesPage';
import { CampaignsPage } from './pages/CampaignsPage';
import { CampaignPage } from './pages/CampaignPage';
import { AboutPage } from './pages/AboutPage';
import { FAQPage } from './pages/FAQPage';
import { PricingPage } from './pages/PricingPage';
import { ContactPage } from './pages/ContactPage';
import { hasActivePlan } from './services/authService';

// Protected route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

// Plan required route wrapper
const PlanRequiredRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (!user || (!hasActivePlan(user) && user.role !== 'admin')) {
    return <Navigate to="/precos" />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/rifas" element={<RafflesPage />} />
          <Route path="/rifas/:id" element={<RafflePage />} />
          <Route path="/campanhas" element={<CampaignsPage />} />
          <Route path="/campanhas/:id" element={<CampaignPage />} />
          <Route path="/sobre" element={<AboutPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/precos" element={<PricingPage />} />
          <Route path="/contato" element={<ContactPage />} />
          
          {/* Protected routes */}
          <Route 
            path="/dashboard/*" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Plan required routes */}
          <Route 
            path="/criar-rifa" 
            element={
              <PlanRequiredRoute>
                <CreateRafflePage />
              </PlanRequiredRoute>
            } 
          />
          
          <Route 
            path="/criar-campanha" 
            element={
              <PlanRequiredRoute>
                <CreateCampaignPage />
              </PlanRequiredRoute>
            } 
          />
          
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
      
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 5000,
          style: {
            background: '#fff',
            color: '#363636',
            boxShadow: '0 3px 10px rgba(0, 0, 0, 0.1)',
            borderRadius: '8px',
            padding: '16px',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </AuthProvider>
  );
}

export default App;