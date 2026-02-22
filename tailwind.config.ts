import type { Config } from 'tailwindcss'

const config: Config = {
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
        },
      },
      fontFamily: {
        sans: ['Roboto', 'system-ui', 'sans-serif'],
      },
    },
  },
}

export default config
