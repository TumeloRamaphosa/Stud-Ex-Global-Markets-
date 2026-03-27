import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        rajdhani: ['Rajdhani', 'sans-serif'],
        mono: ['Share Tech Mono', 'monospace'],
      },
      colors: {
        primary: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c3d66',
          950: '#001f3f',
        },
        gold: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        dark: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
          950: '#030712',
        },
        cyber: {
          black: '#0a0a0a',
          dark: '#121212',
          pink: '#ff1493',
          magenta: '#ff00ff',
          cyan: '#00ffff',
          yellow: '#ffff00',
          blue: '#00d4ff',
          purple: '#9d00ff',
          red: '#ff0040',
        },
      },
      backgroundImage: {
        'gradient-dark': 'linear-gradient(135deg, #001f3f 0%, #0c3d66 100%)',
        'gradient-accent': 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
        'gradient-cyber': 'linear-gradient(135deg, #ff1493, #9d00ff, #00ffff)',
        'gradient-cyber-dark': 'linear-gradient(180deg, #0a0a0a, #1a1a2e, #0a0a0a)',
      },
      boxShadow: {
        'glow-gold': '0 0 20px rgba(251, 191, 36, 0.3)',
        'glow-primary': '0 0 20px rgba(2, 132, 199, 0.3)',
        'glow-pink': '0 0 20px rgba(255, 20, 147, 0.4), 0 0 40px rgba(255, 20, 147, 0.2)',
        'glow-cyan': '0 0 20px rgba(0, 255, 255, 0.4), 0 0 40px rgba(0, 255, 255, 0.2)',
        'glow-purple': '0 0 20px rgba(157, 0, 255, 0.4), 0 0 40px rgba(157, 0, 255, 0.2)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'neon-flicker': 'neonFlicker 3s ease-in-out infinite',
        'glitch': 'glitch 0.3s ease-in-out',
        'grid-move': 'gridMove 20s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'typewriter': 'typewriter 3s steps(30) 1s forwards',
        'count-up': 'countUp 2s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        neonFlicker: {
          '0%, 19%, 21%, 23%, 25%, 54%, 56%, 100%': {
            textShadow: '0 0 10px #ff1493, 0 0 20px #ff1493, 0 0 40px #ff1493',
          },
          '20%, 24%, 55%': {
            textShadow: 'none',
          },
        },
        glitch: {
          '0%, 100%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(-2px, -2px)' },
          '60%': { transform: 'translate(2px, 2px)' },
          '80%': { transform: 'translate(2px, -2px)' },
        },
        gridMove: {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '50px 50px' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  darkMode: 'class',
  plugins: [],
};

export default config;
