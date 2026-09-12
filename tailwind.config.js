/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sand: {
          50: '#FCFBF9',
          100: '#FAF7F2',
          200: '#F4EFEA',
          300: '#EAE1D7',
          400: '#D5C4B4',
          500: '#B8A08C',
          800: '#4A3E36',
          900: '#2C231E',
        },
        terracotta: {
          50: '#FDF7F5',
          100: '#FAECE7',
          200: '#F4D4CA',
          300: '#EBB4A4',
          400: '#DE8B74',
          500: '#D26B50',
          600: '#BF5539',
          700: '#9E422B',
        },
        sage: {
          50: '#F5F7F4',
          100: '#E8ECE5',
          200: '#D2DBD0',
          300: '#B1C2AE',
          400: '#8DA489',
          500: '#6E886A',
          600: '#546C50',
          700: '#41543E',
        },
        warmred: {
          50: '#FEF2F2',
          100: '#FDE2E2',
          500: '#DC4C4C',
          600: '#B93838',
          700: '#992B2B',
        },
        warmamber: {
          50: '#FFFDF5',
          100: '#FEF8DE',
          500: '#E5A122',
          600: '#C58414',
          700: '#9E660B',
        }
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
