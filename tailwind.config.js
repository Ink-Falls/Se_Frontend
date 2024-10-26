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
     }
    },
  },
  plugins: [],
};

