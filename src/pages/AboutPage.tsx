import React from 'react';
import { Layout } from '../components/layout/Layout';
import { AboutSection } from '../components/about/AboutSection';

export const AboutPage: React.FC = () => {
  return (
    <Layout>
      <div className="pt-16">
        <AboutSection />
      </div>
    </Layout>
  );
};