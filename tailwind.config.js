/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cute-pink': '#FFB6C1',
        'cute-blue': '#87CEEB',
        'cute-yellow': '#FFE4B5',
        'cute-green': '#98FB98',
        'cute-purple': '#DDA0DD',
      },
      fontFamily: {
        'cute': ['Comic Sans MS', 'cursive', 'sans-serif'],
      },
      borderRadius: {
        'cute': '20px',
      },
      boxShadow: {
        'cute': '0 4px 15px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
}

