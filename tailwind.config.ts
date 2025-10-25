// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        novexiqPrimary: '#2563EB', // A custom blue, for example
        novexiqAccent: '#FACC15', // A custom yellow
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Add 'Inter' as your default sans-serif font
        heading: ['Montserrat', 'sans-serif'], // A custom font for headings
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
export default config