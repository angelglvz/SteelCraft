import type { Config } from 'tailwindcss';

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // SteelCraft Dark System Palette
        'accent-blue': '#86C9FF',
        'accent-coral': '#FF928F',
        'accent-yellow': '#FBFF8F',
        'dark-canvas': '#5C7080',
        'dark-surface': '#AA9898',
        'dark-surface-hover': '#988787',
        'text-light': '#F8FAFC',
        'text-muted': '#E2E8F0',
        'text-dark': '#1E293B',
        'border-dark': 'rgba(255, 255, 255, 0.18)',
      },
      fontFamily: {
        'hurmeno2': ['hurme_no2-webfont', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        'hurme': ['Hurme Geometric Sans', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      fontSize: {
        caption: ['12px', { lineHeight: '18px' }],
        'body-sm': ['14px', { lineHeight: '20px' }],
        body: ['16px', { lineHeight: '24px' }],
        subheading: ['20px', { lineHeight: '28px' }],
        'heading-sm': ['24px', { lineHeight: '32px' }],
        heading: ['32px', { lineHeight: '41px' }],
        display: ['44px', { lineHeight: '55px' }],
      },
      spacing: {
        unit: '8px',
        8: '8px',
        16: '16px',
        24: '24px',
        32: '32px',
        40: '40px',
        48: '48px',
        64: '64px',
      },
      borderRadius: {
        'radius-md': '4px',
        'radius-lg': '8px',
        'radius-3xl': '24px',
        'radius-full': '200px',
        card: '8px',
        pill: '200px',
        input: '4px',
        button: '4px',
        'feature-card': '24px',
      },
      boxShadow: {
        md: 'rgba(0, 0, 0, 0.25) 0px 4px 16px 0px',
        subtle: 'rgba(255, 255, 255, 0.05) 0px 0px 1px 0px inset',
        sm: 'rgba(0, 0, 0, 0.15) 0px 2px 4px 0px',
      },
      maxWidth: {
        page: '1200px',
      },
      gap: {
        section: '80px',
      },
    },
  },
  plugins: [],
} satisfies Config;