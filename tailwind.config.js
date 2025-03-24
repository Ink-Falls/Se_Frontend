/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      height: {
        'sidebar-size': '54rem',
      },
      spacing:{
        'sidebar-space': '27rem',
        'table-head': '100rem',
        'content-height':'40.5rem',
        'scroll-height':'35rem',
      },
      fontFamily: {
        'poppins': ['Poppins'],
     },
     screens: {
      'mid': '1000px', // Custom breakpoint between md (768px) and lg (1024px)
    },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'progress': 'progress 2s ease-in-out infinite',
      },
      keyframes: {
        progress: {
          '0%': { width: '0%' },
          '100%': { width: '100%' }
        }
      }
    },
  },
  plugins: [],
};

