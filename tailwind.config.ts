import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#1B263B',
          navyDark: '#0f1728',
          navyLight: '#d8deeb',
          sky: '#eef2f8',
          gold: '#C5A059',
          goldDark: '#8e7340',
          goldLight: '#e8d7b3',
          garnet: '#7B241C',
          cream: '#F5F5F0',
          charcoal: '#1a1d24',
          darkGray: '#404754',
          softGray: '#eceff3',
          ghost: '#f7f8fb',
          teal: '#004142',
          tealLight: '#007970',
          orange: '#C74601',
          // Light Mode Design Tokens
          lm: {
            bg: '#1F1C1B',       // Outer dark background
            card: '#FAFBF8',     // Main card surface
            stroke: '#524048',   // Borders
            text: '#1F1C1B',     // Primary text
            textSoft: '#747474', // Secondary text
            sky: '#F7FEFF',      // Accents (light teal)
            skyBorder: '#C4F4F5',
            input: '#E5E4E3',
          },
          // Night Mode Design Tokens (brand kit – deep teal)
          nm: {
            bg: '#020F10',       // Near-black teal background
            card: '#071E1F',     // Card surface
            stroke: '#07282A',   // Borders
            text: '#FAFBF8',     // Primary text
            textSoft: '#D9D6D5', // Secondary text
            accent: '#64F4F5',   // Teal 400 accent
            accentWarm: '#E56E2E', // Orange 400 accent
            input: '#0A2223',    // Input surfaces
          }
        },
      },
      fontFamily: {
        sans: ['Roboto', 'system-ui', 'sans-serif'],
        heading: ['Montserrat', 'sans-serif'],
      },
    },
  },
}

export default config
