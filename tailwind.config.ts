/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}', './src/app/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#F8FAFC',
        ink: {
          DEFAULT: '#0F172A',
          secondary: '#475569'
        },
        line: {
          DEFAULT: '#E2E8F0',
          hover: '#CBD5E1'
        },
        brand: {
          DEFAULT: '#0284C7',
          dark: '#0369A1'
        },
        success: {
          DEFAULT: '#059669',
          dark: '#047857'
        },
        warning: {
          DEFAULT: '#D97706',
          dark: '#B45309'
        },
        danger: {
          DEFAULT: '#DC2626',
          dark: '#B91C1C'
        },
        navy: {
          50: '#EEF3FF',
          100: '#D9E4FF',
          500: '#1E3A8A',
          700: '#172554',
          800: '#0F172A',
          900: '#0A1120',
          950: '#060911'
        },
        stellar: {
          300: '#7DD3FC',
          400: '#38BDF8',
          500: '#0EA5E9',
          600: '#0284C7'
        }
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-grotesk)', 'var(--font-inter)', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'ui-monospace', 'monospace']
      },
      transitionTimingFunction: {
        'ease-out': 'cubic-bezier(0.23, 1, 0.32, 1)',
        'ease-in-out': 'cubic-bezier(0.77, 0, 0.175, 1)',
        'ease-spring': 'cubic-bezier(0.175, 0.885, 0.32, 1.15)'
      },
      boxShadow: {
        subtle: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        refract: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.08)',
        depth: '0 4px 16px -2px rgba(0, 0, 0, 0.06)'
      }
    }
  },
  plugins: []
}
