/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        wipro: {
          dark: '#070F2B',
          navy: '#0B192C',
          slate: '#1E3E62',
          blue: '#1B5B8A',
          sky: '#0284c7',
          teal: '#0d9488',
          accent: '#2563EB',
          subtle: '#F1F5F9',
          border: '#E2E8F0'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
