import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // 붉은사막 테마 컬러
        crimson: {
          50: '#fff1f1',
          100: '#ffe1e1',
          200: '#ffc7c7',
          300: '#ffa0a0',
          400: '#ff6b6b',
          500: '#f83b3b',
          600: '#e51b1b',
          700: '#c11313',
          800: '#a01414',
          900: '#841717',
          950: '#490707',
        },
        sand: {
          50: '#fdf8ed',
          100: '#f8edcf',
          200: '#f0d99a',
          300: '#e8c064',
          400: '#e2a93d',
          500: '#d98f25',
          600: '#c06e1b',
          700: '#9f5119',
          800: '#83401b',
          900: '#6c3519',
          950: '#3d1a09',
        },
        stone: {
          950: '#0c0a09',
        },
      },
      fontFamily: {
        sans: ['var(--font-pretendard)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
}

export default config
