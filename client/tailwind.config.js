/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // User's Exact Custom Palette
        black: { DEFAULT: '#000000', 100: '#000000', 200: '#000000', 300: '#000000', 400: '#000000', 500: '#000000', 600: '#333333', 700: '#666666', 800: '#999999', 900: '#cccccc' },
        prussian_blue: { DEFAULT: '#14213d', 100: '#04070c', 200: '#080d19', 300: '#0c1425', 400: '#101b31', 500: '#14213d', 600: '#29447e', 700: '#3e67bf', 800: '#7e99d5', 900: '#beccea' },
        orange: { DEFAULT: '#fca311', 100: '#362101', 200: '#6b4201', 300: '#a16402', 400: '#d68502', 500: '#fca311', 600: '#fdb541', 700: '#fec871', 800: '#fedaa0', 900: '#ffedd0' },
        alabaster_grey: { DEFAULT: '#e5e5e5', 100: '#2e2e2e', 200: '#5c5c5c', 300: '#8a8a8a', 400: '#b8b8b8', 500: '#e5e5e5', 600: '#ebebeb', 700: '#f0f0f0', 800: '#f5f5f5', 900: '#fafafa' },
        white: { DEFAULT: '#ffffff', 100: '#333333', 200: '#666666', 300: '#999999', 400: '#cccccc', 500: '#ffffff', 600: '#ffffff', 700: '#ffffff', 800: '#ffffff', 900: '#ffffff' },
        
        // Brand maps to Orange (inverted to match Tailwind's 50-light to 900-dark expected convention)
        brand: {
          50: '#ffedd0', // orange.900
          100: '#fedaa0', // orange.800
          200: '#fec871', // orange.700
          300: '#fdb541', // orange.600
          400: '#fca311', // orange.500
          500: '#fca311', // DEFAULT
          600: '#d68502', // orange.400
          700: '#a16402', // orange.300
          800: '#6b4201', // orange.200
          900: '#362101', // orange.100
        },

        // Slate was used for Dark Mode. We INVERT it here to map to our new Light Mode colors!
        // So components using bg-slate-900 (dark) will magically become white/alabaster.
        // And components using text-slate-100 (light text) will magically become prussian blue.
        slate: {
          50: '#000000', // black
          100: '#14213d', // prussian_blue
          200: '#29447e', // prussian_blue.600
          300: '#3e67bf', // prussian_blue.700
          400: '#7e99d5', // prussian_blue.800
          500: '#b8b8b8', // alabaster_grey.400
          600: '#e5e5e5', // alabaster_grey
          700: '#f0f0f0', // alabaster_grey.700
          800: '#f5f5f5', // alabaster_grey.800 (card bg)
          900: '#fafafa', // alabaster_grey.900 (darker bg)
          950: '#ffffff', // white (darkest bg -> now white base!)
        },
      },
    },
  },
  plugins: [],
};
