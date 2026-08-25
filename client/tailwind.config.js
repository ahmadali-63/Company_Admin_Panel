/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "sans-serif"],
      },
      colors: {
        // Exact User 6-Color Palette
        palette: {
          purple: "#845EC2",
          purpleLight: "#c084fc",
          royal: "#2C73D2",
          azure: "#0081CF",
          ocean: "#0089BA",
          teal: "#008E9B",
          emerald: "#008F7A",
        },
        dark: {
          950: "#060913",
          900: "#0a1020",
          850: "#0f172e",
          800: "#14203e",
          750: "#1b2c52",
          700: "#223867",
        },
        brand: {
          50: "#faf5ff",
          100: "#f3e8ff",
          200: "#e9d5ff",
          300: "#d8b4fe",
          400: "#c084fc",
          500: "#845EC2",
          600: "#2C73D2",
          700: "#0081CF",
          800: "#0089BA",
          900: "#008F7A",
        },
      },
      backgroundImage: {
        "matching-gradient":
          "linear-gradient(135deg, #845EC2 0%, #2C73D2 20%, #0081CF 40%, #0089BA 60%, #008E9B 80%, #008F7A 100%)",
        "matching-gradient-h":
          "linear-gradient(90deg, #845EC2 0%, #2C73D2 20%, #0081CF 40%, #0089BA 60%, #008E9B 80%, #008F7A 100%)",
        "purple-neon-gradient":
          "linear-gradient(135deg, #845EC2 0%, #a855f7 50%, #2C73D2 100%)",
        "cyan-neon-gradient":
          "linear-gradient(135deg, #0081CF 0%, #0089BA 50%, #008F7A 100%)",
      },
      boxShadow: {
        "glow-purple": "0 0 35px -5px rgba(132, 94, 194, 0.55)",
        "glow-purple-lg": "0 0 45px 0px rgba(132, 94, 194, 0.70)",
        "glow-royal": "0 0 35px -5px rgba(44, 115, 210, 0.55)",
        "glow-azure": "0 0 35px -5px rgba(0, 129, 207, 0.55)",
        "glow-emerald": "0 0 35px -5px rgba(0, 143, 122, 0.55)",
        "card": "0 10px 30px -10px rgba(0, 0, 0, 0.5)",
        "glass": "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 3s ease-in-out infinite",
        "gradient-shift": "gradientShift 8s ease infinite alternate",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        gradientShift: {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "100% 50%" },
        },
      },
    },
  },
  plugins: [],
};
