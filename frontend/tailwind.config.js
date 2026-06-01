/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        terminal: {
          bg: '#0d1117',
          fg: '#c9d1d9',
          green: '#3fb950',
          yellow: '#d29922',
          blue: '#58a6ff',
          purple: '#bc8cff',
          red: '#f85149',
        }
      }
    },
  },
  plugins: [],
}
