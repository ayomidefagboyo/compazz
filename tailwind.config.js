/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'accent': '#00ff88',
        'charcoal': '#111111',
        'dark-gray': '#1a1a1a',
        'medium-gray': '#666666',
        'light-gray': '#a0a0a0',
        'border': '#333333',
        'light': '#a0a0a0',
      }
    },
  },
  plugins: [],
};
