const defaultTheme = require( "tailwindcss/defaultTheme" );
const forms        = require( "@tailwindcss/forms" );

/** @type {import("tailwindcss").Config} */
module.exports = {
  content: [
    "src/**/*.{ts,tsm,svelte,html}"
  ],
  theme:   {
    extend: {
      fontFamily: {
        sans: [ "Titillium Web", ...defaultTheme.fontFamily.sans ]
      },
      animation:  {
        "breathe": "breathe 3s linear infinite"
      },
      keyframes: {
        breathe: {
          "0%, 100%": { transform: "scale(1)" },
          "50%":      { transform: "scale(1.01)" }
        }
      }
    }
  },
  plugins: [
    forms
  ]
};
