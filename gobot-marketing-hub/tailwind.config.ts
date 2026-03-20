import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
        },
        dark: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          850: '#172033',
          900: '#0f172a',
          950: '#020617',
        },
        accent: {
          teal: '#14b8a6',
          emerald: '#10b981',
          violet: '#8b5cf6',
          rose: '#f43f5e',
          amber: '#f59e0b',
        },
      },
      backgroundImage: {
        'gradient-dark': 'linear-gradient(135deg, #0f172a 0%, #020617 50%, #0f172a 100%)',
        'gradient-card': 'linear-gradient(135deg, rgba(30,41,59,0.5) 0%, rgba(15,23,42,0.8) 100%)',
        'gradient-gold': 'linear-gradient(135deg, #ca8a04 0%, #eab308 50%, #facc15 100%)',
        'gradient-accent': 'linear-gradient(135deg, #ca8a04 0%, #14b8a6 100%)',
      },
      boxShadow: {
        'glow-gold': '0 0 20px rgba(234, 179, 8, 0.15)',
        'glow-teal': '0 0 20px rgba(20, 184, 166, 0.15)',
      },
    },
  },
  plugins: [],
};

export default config;
