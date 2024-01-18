/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./{static,src,pages}/**/*.{html,tsx}'],
  theme: {
    colors: {
      inherit: 'inherit',
      night: '#080808',
      dark: '#111',
      gray: '#888',
      navy: '#15079C',
      sky: '#8CB3F2',
      sunbeam: '#EEF0AD',
      orange: '#D12D0E',
      dirt: '#372733',
      white: '#FFF',
    },
    fontFamily: {
      sunflower: ['Sunflower', 'sans-serif'],
    },
    extend: {},
  },
  plugins: [],
};
