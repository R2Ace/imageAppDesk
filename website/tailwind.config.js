/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Instrument Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        border: 'hsl(220 13% 91%)',
        input: 'hsl(220 13% 91%)',
        ring: 'hsl(210 100% 52%)',
        background: 'hsl(0 0% 100%)',
        foreground: 'hsl(222 47% 11%)',
        
        primary: {
          DEFAULT: 'hsl(210 100% 52%)', // Glacier blue #148dd9
          50: 'hsl(210 100% 98%)',
          100: 'hsl(210 100% 95%)',
          200: 'hsl(210 100% 85%)',
          300: 'hsl(210 100% 75%)',
          400: 'hsl(210 100% 65%)',
          500: 'hsl(210 100% 52%)',
          600: 'hsl(210 100% 45%)',
          700: 'hsl(210 100% 40%)',
          800: 'hsl(210 100% 35%)',
          900: 'hsl(210 100% 30%)',
        },
        
        secondary: 'hsl(210 40% 98%)',
        
        accent: {
          DEFAULT: 'hsl(210 40% 98%)',
          foreground: 'hsl(222 47% 11%)',
        },
        
        'accent-warm': {
          DEFAULT: 'hsl(16 100% 60%)', // Coral #ff6f3c
          50: 'hsl(16 100% 97%)',
          100: 'hsl(16 100% 92%)',
          200: 'hsl(16 100% 85%)',
          300: 'hsl(16 100% 75%)',
          400: 'hsl(16 100% 65%)',
          500: 'hsl(16 100% 60%)',
          600: 'hsl(16 100% 50%)',
          700: 'hsl(16 100% 45%)',
        },
        
        'muted-foreground': 'hsl(215 16% 47%)',
        
        emerald: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        
        amber: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
      },
      
      backgroundImage: {
        'gradient-hero': 'linear-gradient(135deg, hsl(210 100% 98%), hsl(0 0% 100%))',
        'gradient-primary': 'linear-gradient(135deg, hsl(210 100% 52%), hsl(210 100% 65%))',
        'gradient-warm': 'linear-gradient(135deg, hsl(16 100% 60%), hsl(16 100% 50%))',
        'gradient-glow': 'linear-gradient(180deg, hsl(210 100% 52% / 0.08), transparent)',
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' }
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
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px hsl(210 100% 52% / 0.2)' },
          '50%': { boxShadow: '0 0 40px hsl(210 100% 52% / 0.4)' }
        }
      },
      
      animation: {
        float: 'float 8s ease-in-out infinite',
        glow: 'glow 2s ease-in-out infinite',
        'bounce-subtle': 'bounce-subtle 2s ease-in-out infinite',
        'slide-up': 'slide-up 0.6s ease-out',
        'slide-down': 'slide-down 0.3s ease-out',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite'
      },
      
      boxShadow: {
        'strong': '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 10px 15px -3px rgb(0 0 0 / 0.08), 0 20px 25px -5px rgb(0 0 0 / 0.05)',
        'glow': '0 0 30px hsl(210 100% 52% / 0.15)',
        'glow-warm': '0 0 30px hsl(16 100% 60% / 0.2)',
        'floating': '0 50px 100px -20px rgba(0, 0, 0, 0.1), 0 30px 60px -30px rgba(0, 0, 0, 0.15)'
      },
      
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
