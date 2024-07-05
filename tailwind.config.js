/** @type {import('tailwindcss').Config} */
const { transform } = require('lodash');
const colors = require('tailwindcss/colors');
module.exports = {
  content: [
    "./templates/*.pug",
    "./www/js/*.js"
  ],
  theme: {
    screens: {
      "sm":"430px",
      // => @media (min-width: 430px)

      "md": "768px",
      // => @media (min-width: 768px)

      "lg": "1280px",
      // => @media (min-width: 1280px)

      "xl": "1440px",
      // => @media (min-width: 1440px)

      "2xl": "2160px"
      // => @media (min-width: 2160px)
    },
    colors:{
      transparent: "transparent",
      black: "black",
      white: "white",
      blue: "#007bff",
      indigo: "#6610f2",
      purple: "#6f42c1",
      pink: "#e83e8c",
      red: "#dc3545",
      orange: "#fd7e14",
      yellow: "#ffc107",
      green: "#05B41D",
      slate: "#272b30",
      "earl": {
        100: "#FDFDFD",
        200: "#D0D0D1",
        300: "#A2A2A4",
        400: "#757577",
        500: "#47474A",
        600: "#37373A",
        700: "#272729",
        800: "#171718",
        900: "#070708"
      },
    },
    extend: {
      fontFamily: {
        body: "Vremena Grotesk, ui-serif, sans-serif",
        brand: "Neogrotesk Ess Black, Helvetica, sans-serif",
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
  ],
};

