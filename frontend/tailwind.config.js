/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['"Baloo 2"', 'cursive'],
        body: ['Nunito', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
