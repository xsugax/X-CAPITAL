import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand Colors
        'xc-black':   '#05050d',
        'xc-dark':    '#080812',
        'xc-card':    '#0d0d1e',
        'xc-border':  '#1a1a3a',
        'xc-purple':  '#7c3aed',
        'xc-purple-light': '#a78bfa',
        'xc-gold':    '#d97706',
        'xc-gold-light': '#fbbf24',
        'xc-cyan':    '#06b6d4',
        'xc-green':   '#10b981',
        'xc-red':     '#ef4444',
        'xc-text':    '#f1f5f9',
        'xc-muted':   '#64748b',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'xc-hero': 'radial-gradient(ellipse at top, #1e0a4b 0%, #05050d 60%)',
        'xc-card-glow': 'linear-gradient(135deg, rgba(124,58,237,0.08) 0%, rgba(6,182,212,0.04) 100%)',
      },
      boxShadow: {
        'xc-glow':   '0 0 30px rgba(124, 58, 237, 0.15)',
        'xc-card':   '0 4px 24px rgba(0, 0, 0, 0.5)',
        'xc-purple': '0 0 20px rgba(124, 58, 237, 0.4)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
