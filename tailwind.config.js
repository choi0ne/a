/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-primary': '#1428A0',
        'brand-secondary': '#0F1E7A',
        'brand-accent': '#FFC107',
        'brand-light': '#F0F7F7',
        'brand-dark': '#1A202C',
      },
    },
  },
  plugins: [],
}
