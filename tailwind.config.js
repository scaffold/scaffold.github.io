/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./{static,src}/**/*.{html,tsx}'],
  theme: {
    colors: {
      inherit: 'inherit',
      night: '#080808',
      gray: '#888',
      navy: '#15079C',
      sky: '#8CB3F2',
      sunbeam: '#EEF0AD',
      orange: '#D12D0E',
      dirt: '#372733',
    },
    fontFamily: {
      sunflower: ['Sunflower', 'sans-serif'],
    },
    extend: {},
  },
  plugins: [],
};
