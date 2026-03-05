/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Syne', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      colors: {
        n: {
          bg:    '#09090c',
          surf:  '#111117',
          card:  '#16161e',
          card2: '#1d1d27',
          bdr:   '#222230',
          bdr2:  '#2c2c3e',
          tx:    '#eeeef3',
          sub:   '#7070a0',
          muted: '#3e3e58',
          grn:   '#34d399',
          grn2:  '#10b981',
          red:   '#f87171',
          amb:   '#fbbf24',
        },
      },
    },
  },
  plugins: [],
}
