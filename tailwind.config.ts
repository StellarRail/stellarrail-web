/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}', './src/app/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#eef3ff',
          100: '#d9e4ff',
          500: '#24407c',
          700: '#16294f',
          800: '#0f1e3a',
          900: '#0a1528',
          950: '#060d1c'
        },
        stellar: {
          300: '#9be8ff',
          400: '#4fd6ff',
          500: '#00b5e3',
          600: '#0090b6'
        }
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-grotesk)', 'var(--font-inter)', 'sans-serif']
      }
    }
  },
  plugins: []
}
