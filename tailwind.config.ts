import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        bebas: ['var(--font-bebas)', 'cursive'],
        barlow: ['var(--font-barlow)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      colors: {
        brand: {
          red: '#ff2d2d',
          gold: '#c8a96e',
          dark: '#0a0a0a',
          mid: '#1a1a1a',
          border: '#2a2a2a',
        }
      }
    },
  },
  plugins: [],
}
export default config
