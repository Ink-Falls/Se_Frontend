/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
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
    },
  },
  plugins: [],
};
