/** @type {import('tailwindcss').Config} */
export default {
  // Scan HTML + JS/JSX so Tailwind keeps only the classes we actually use.
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};
