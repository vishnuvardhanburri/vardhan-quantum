/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'surface': '#05060A',
        'surface-elev': '#0A0C14',
        'surface-card': '#0D0F17',
        'border': 'rgba(255,255,255,0.06)',
        'border-hover': 'rgba(255,255,255,0.12)',
        'text-primary': '#F0F2F5',
        'text-secondary': '#9BA0B5',
        'text-tertiary': '#5A5F73',
        'accent': '#00F5D4',
        'accent-hover': '#00E5C4',
        'indigo': '#8A2BE2',
        'crimson': '#FF0055',
        'amber': '#FFB703',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'xs': ['0.72rem', { lineHeight: '1rem' }],
        'sm': ['0.81rem', { lineHeight: '1.15rem' }],
        'base': ['0.94rem', { lineHeight: '1.4rem' }],
        'md': ['1.05rem', { lineHeight: '1.5rem' }],
        'lg': ['1.18rem', { lineHeight: '1.6rem' }],
        'xl': ['1.31rem', { lineHeight: '1.7rem' }],
        '2xl': ['1.72rem', { lineHeight: '1.3' }],
        '3xl': ['2.44rem', { lineHeight: '1.2' }],
      },
      spacing: {
        '72': '18rem',
        '84': '21rem',
        '96': '24rem',
      },
      borderRadius: {
        'lg': '0.75rem',
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        'card': '0 4px 24px -4px rgba(0,0,0,0.3)',
        'elev': '0 8px 32px -8px rgba(0,0,0,0.4)',
      },
    },
  },
  plugins: [],
};
