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
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        },
        bot: {
          dark: '#0B0F19',
          card: '#111827',
          border: '#1F2937',
          accent: '#3B82F6',
          teal: '#14B8A6'
        }
      },
    },
  },
  plugins: [],
}

