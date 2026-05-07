/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          red: '#E63946',
          dark: '#0D0D0D',
          card: '#1A1A1A',
          border: '#2A2A2A',
        },
      },
    },
  },
  plugins: [],
};
