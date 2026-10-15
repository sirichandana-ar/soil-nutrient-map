/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        agro: {
          dark: '#080d14',
          surface: '#0f172a',
          card: '#131e33',
          border: '#1e293b',
          muted: '#64748b',
          emerald: '#10b981',
          leaf: '#059669',
          soil: '#92400e',
          clay: '#b45309',
          amber: '#f59e0b',
          nitrogen: '#38bdf8',
          phosphorus: '#a855f7',
          potassium: '#ec4899',
          moisture: '#06b6d4',
          optimal: '#22c55e',
          deficient: '#ef4444',
          warning: '#f97316'
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'glow-emerald': '0 0 25px -5px rgba(16, 185, 129, 0.25)',
        'glow-cyan': '0 0 25px -5px rgba(6, 182, 212, 0.25)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'flow': 'flow 2s ease-in-out infinite',
      },
      keyframes: {
        flow: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-3px)' },
        }
      }
    },
  },
  plugins: [],
}
