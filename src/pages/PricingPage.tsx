import React from 'react';
import { Layout } from '../components/layout/Layout';
import { PricingSection } from '../components/pricing/PricingSection';

export const PricingPage: React.FC = () => {
  return (
    <Layout>
      <div className="pt-16">
        <PricingSection />
      </div>
    </Layout>
  );
};