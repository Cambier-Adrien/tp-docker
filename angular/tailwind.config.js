/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        "vercel-dark": "#000000",
        "vercel-light": "#FFFFFF",
        "vercel-accent": "#0070f3",
        "vercel-gray": "#888888",
        "vercel-border": "#333333",
      },
    },
  },
  plugins: [],
};
