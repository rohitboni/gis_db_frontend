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
          50: '#f8f9fa',
          100: '#e9ecef',
          200: '#dee2e6',
          300: '#ced4da',
          400: '#adb5bd',
          500: '#6c757d',
          600: '#495057',
          700: '#343a40',
          800: '#212529',
          900: '#1a1d20',
        },
        accent: {
          50: '#faf8f3',
          100: '#f5f1e8',
          200: '#e8dfc8',
          300: '#d4c4a0',
          400: '#c4a969',
          500: '#b8944f',
          600: '#9d7a3f',
          700: '#7d6132',
          800: '#5d4825',
          900: '#3d3019',
        },
        luxury: {
          gold: '#c9a961',
          'gold-light': '#e8d9b7',
          'dark-navy': '#1a1f2e',
          'charcoal': '#2c3e50',
          'slate': '#4a5568',
          'cream': '#f5f3f0',
          'ivory': '#faf9f6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'luxury': '0 10px 40px -10px rgba(0, 0, 0, 0.15)',
        'luxury-lg': '0 20px 60px -15px rgba(0, 0, 0, 0.2)',
        'inner-luxury': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        },
      backgroundImage: {
        'gradient-luxury': 'linear-gradient(135deg, #2c3e50 0%, #1a1f2e 100%)',
        'gradient-primary': 'linear-gradient(135deg, #495057 0%, #343a40 100%)',
        'gradient-accent': 'linear-gradient(135deg, #c9a961 0%, #b8944f 100%)',
        'gradient-subtle': 'linear-gradient(135deg, #f5f3f0 0%, #faf9f6 100%)',
      },
    },
  },
  plugins: [],
}

