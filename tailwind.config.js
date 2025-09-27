/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        host: ['"Host Grotesk"', 'sans-serif'],
      },
      colors: {
        // SmartBook-like palette: amber/gold accent with deep surfaces
        brand: {
          DEFAULT: '#f5b301', // primary accent (gold/amber)
          dark: '#d79c00',    // hover/darker state
        },
        surface: {
          900: '#0b0f19',
          800: '#0a0e18',
          700: '#0a0d15',
        },
      },
      boxShadow: {
        card: '0 10px 25px rgba(0,0,0,0.25)',
      },
    },
  },
  plugins: [],
}
