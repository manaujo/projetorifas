/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#E6EEFF',
          100: '#C9D9FF',
          200: '#92ADFF',
          300: '#5E83FC',
          400: '#3E64CE',
          500: '#1E3A8A', // Main primary color
          600: '#152B68',
          700: '#0D1D45',
          800: '#060F23',
          900: '#030712',
        },
        gold: {
          50: '#FFFCEB',
          100: '#FFF4C6',
          200: '#FFEC9E',
          300: '#FFE175',
          400: '#FFD84D',
          500: '#FFD700', // Gold accent
          600: '#E6C200',
          700: '#BF9F00',
          800: '#997F00',
          900: '#735F00',
        },
        success: {
          50: '#ECFDF5',
          500: '#10B981',
          700: '#047857',
        },
        warning: {
          50: '#FFFBEB',
          500: '#F59E0B',
          700: '#B45309',
        },
        error: {
          50: '#FEF2F2',
          500: '#EF4444',
          700: '#B91C1C',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Montserrat', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 10px rgba(0, 0, 0, 0.05)',
        'card': '0 4px 20px rgba(0, 0, 0, 0.08)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};