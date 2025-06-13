export interface StripeProduct {
  priceId: string;
  name: string;
  description: string;
  mode: 'payment' | 'subscription';
}

export const stripeProducts: StripeProduct[] = [
  {
    priceId: 'price_1RZYQZB4if3rE1yXBHNyoPuj',
    name: 'Econômico',
    description: 'até 2 rifas e 2 campanhas e até 100.000 bilhetes.',
    mode: 'payment',
  },
  {
    priceId: 'price_1RZYZtB4if3rE1yXtrQRcFes',
    name: 'Padrão',
    description: 'até 5 rifas, 5 campanhas, até 500.000 bilhetes.',
    mode: 'payment',
  },
  {
    priceId: 'price_1RZYatB4if3rE1yXBD1iIfUl',
    name: 'Premium',
    description: 'até 10 rifas, 10 campanhas, até 1.000.000 bilhetes.',
    mode: 'payment',
  },
];

export const getProductByPriceId = (priceId: string): StripeProduct | undefined => {
  return stripeProducts.find(product => product.priceId === priceId);
};