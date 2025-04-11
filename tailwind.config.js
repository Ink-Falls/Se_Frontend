/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: 'class', // Enable class-based dark mode strategy
  theme: {
    extend: {
      height: {
        "sidebar-size": "54rem",
      },
      spacing: {
        "sidebar-space": "27rem",
        "table-head": "100rem",
        "content-height": "40.5rem",
        "scroll-height": "35rem",
      },
      fontFamily: {
        poppins: ["Poppins"],
      },
      screens: {
        mid: "1000px", // Custom breakpoint between md (768px) and lg (1024px)
      },
      animation: {
        "spin-slow": "spin 3s linear infinite",
        progress: "progress 2s ease-in-out infinite",
        growth: "growth 1s ease-in-out infinite",
        ping: "ping 2s cubic-bezier(0, 0, 0.2, 1) infinite",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        progress: {
          "0%": { width: "0%" },
          "100%": { width: "100%" },
        },
        growth: {
          "0%, 100%": { transform: "scaleY(0.5)" },
          "50%": { transform: "scaleY(1)" },
        },
      },
      colors: {
        // Add theme colors that will work well in both light and dark modes
        primary: {
          light: '#F6BA18',
          dark: '#F6BA18',  // Keep the yellow brand color in dark mode
          hover: {
            light: '#e5ad16',
            dark: '#ffc72c',
          }
        },
        secondary: {
          light: '#212529',
          dark: '#F8F9FA', // Invert for dark mode
        },
        // Custom dark mode colors
        dark: {
          bg: {
            primary: '#121212',
            secondary: '#1E1E1E',
            tertiary: '#2D2D2D',
          },
          text: {
            primary: '#F8F9FA',
            secondary: '#B3B3B3',
            accent: '#F6BA18',
          },
          border: '#404040',
          surface: '#333333',
        },
      },
      boxShadow: {
        'dark-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.7)',
        'dark-md': '0 4px 6px -1px rgba(0, 0, 0, 0.7), 0 2px 4px -1px rgba(0, 0, 0, 0.7)',
        'dark-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.7), 0 4px 6px -2px rgba(0, 0, 0, 0.7)',
        'dark-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.7), 0 10px 10px -5px rgba(0, 0, 0, 0.7)',
      }
    },
  },
  plugins: [],
};
