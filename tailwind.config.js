/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f4ff',
          100: '#e0e8ff',
          500: '#667eea',
          600: '#5a6fd8',
          700: '#4c5bc0',
        },
        secondary: {
          500: '#764ba2',
          600: '#6a4190',
          700: '#5d377e',
        }
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(180deg)' },
        }
      }
    },
  },
  plugins: [],
}