/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: 'hsl(var(--background))',
          dark: '#101c28',
          light: '#2a4257'
        },
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: '#8fe64d',
          dark: '#66b730',
          light: '#c8ff75',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: '#4f6e8d',
          dark: '#374d63',
          light: '#7ca2c7',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        success: {
          DEFAULT: '#8fe64d',
          light: '#bfff72',
          dark: '#62a82e',
        },
        warning: {
          DEFAULT: '#f4d04f',
          light: '#ffe17b',
          dark: '#c8a323',
        },
        error: {
          DEFAULT: '#e8584f',
          light: '#ff8f7f',
          dark: '#b93730',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-primary': 'linear-gradient(145deg, #26384a 0%, #182431 45%, #0d141d 100%)',
      },
      fontFamily: {
        sans: ['Rajdhani', 'Arial Narrow', 'sans-serif'],
        display: ['Teko', 'Rajdhani', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
} 
