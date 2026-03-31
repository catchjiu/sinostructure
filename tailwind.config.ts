import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        chinese: ["'Noto Sans TC'", "'PingFang TC'", "'Microsoft JhengHei'", 'sans-serif'],
      },
      boxShadow: {
        tile: '0 2px 12px 0 rgba(0,0,0,0.08)',
        card: '0 4px 24px 0 rgba(0,0,0,0.06)',
      },
      animation: {
        'shimmer': 'shimmer 2s linear infinite',
        'bounce-subtle': 'bounce-subtle 0.4s ease-out',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'bounce-subtle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
