/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./{static,src,pages}/**/*.{html,tsx}'],
  theme: {
    colors: {
      inherit: 'inherit',
      night: '#080F11',
      dark: '#111',
      gray: '#888',
      navy: '#15079C',
      sky: '#8CB3F2',
      cloud: '#B0CBF6',
      mist: '#D4E3FA',
      sunbeam: '#EEF0AD',
      orange: '#D12D0E',
      dirt: '#372733',
      white: '#FFF',
    },
    fontFamily: {
      sunflower: ['Sunflower', 'sans-serif'],
    },
    extend: {
      backgroundImage: {
        construction: `
          repeating-linear-gradient(
            -45deg,
            #8CB3F2,
            #8CB3F2 2rem,
            #B0CBF6 2rem,
            #B0CBF6 4rem
          ) /* ,
          linear-gradient(
            to bottom,
            #eee,
            #999
          ) */
        `,
      },
    },
  },
  plugins: [],
};
