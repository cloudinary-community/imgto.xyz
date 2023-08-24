import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      keyframes: {
        'faderight': {
          '0%': {
            backgroundPosition: '100% 50%'
          },
          '100%': {
            backgroundPosition: '0 50%'
          },
        }
      },
      animation: {
        'faderight': 'faderight 1.2s ease-in-out 1s infinite',
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography')
  ],
}
export default config
