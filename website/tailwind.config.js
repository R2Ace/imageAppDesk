/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(214 32% 91%)', // #e2e8f0
        input: 'hsl(214 32% 91%)', // #e2e8f0
        ring: 'hsl(214 100% 59%)', // #3b82f6
        background: 'hsl(0 0% 100%)', // white
        accent: {
          DEFAULT: 'hsl(210 40% 98%)', // #f8fafc
          foreground: 'hsl(222 84% 15%)', // #1e293b
        },
        primary: {
          DEFAULT: 'hsl(214 100% 59%)', // #3b82f6
          50: 'hsl(214 100% 97%)',
          100: 'hsl(214 100% 95%)',
          500: 'hsl(214 100% 59%)',
          600: 'hsl(214 100% 55%)',
          700: 'hsl(214 100% 50%)',
          900: 'hsl(225 83% 53%)', // #1d4ed8
        },
        secondary: 'hsl(210 40% 98%)', // #f8fafc
        foreground: 'hsl(222 84% 15%)', // #1e293b
        'muted-foreground': 'hsl(215 16% 65%)',
      },
      backgroundImage: {
        'gradient-hero': 'linear-gradient(135deg, hsl(214 100% 97%), hsl(0 0% 100%))',
        'gradient-primary': 'linear-gradient(135deg, hsl(214 100% 59%), hsl(214 100% 75%))',
        'gradient-glow': 'linear-gradient(180deg, hsl(214 100% 59% / 0.1), transparent)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        glow: {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' }
        },
        'bounce-subtle': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-4px)' }
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0px)', opacity: '1' }
        },
        'slide-down': {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0%)', opacity: '1' }
        }
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        glow: 'glow 2s ease-in-out infinite',
        'bounce-subtle': 'bounce-subtle 2s ease-in-out infinite',
        'slide-up': 'slide-up 0.6s ease-out',
        'slide-down': 'slide-down 0.3s ease-out'
      },
      boxShadow: {
        'strong': '0 25px 50px -12px rgb(59 130 246 / 0.2)',
        'glow': '0 0 20px rgb(59 130 246 / 0.3)'
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
