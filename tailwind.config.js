/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Surface Architecture
        'surface': 'var(--color-surface)',
        'background': 'var(--color-background)',
        'surface-bright': 'var(--color-surface-bright)',
        'surface-dim': 'var(--color-surface-dim)',
        'surface-container-lowest': 'var(--color-surface-container-lowest)',
        'surface-container-low': 'var(--color-surface-container-low)',
        'surface-container': 'var(--color-surface-container)',
        'surface-container-high': 'var(--color-surface-container-high)',
        'surface-container-highest': 'var(--color-surface-container-highest)',
        'surface-variant': 'var(--color-surface-variant)',

        // Text & Outlines
        'on-surface': 'var(--color-on-surface)',
        'on-surface-variant': 'var(--color-on-surface-variant)',
        'on-background': 'var(--color-on-background)',
        'inverse-surface': 'var(--color-inverse-surface)',
        'outline': 'var(--color-outline)',
        'outline-variant': 'var(--color-outline-variant)',

        // Brand Primary (Ink Black)
        'primary': 'var(--color-primary)',
        'on-primary': 'var(--color-on-primary)',
        'primary-container': 'var(--color-primary-container)',
        'surface-tint': 'var(--color-surface-tint)',

        // Interactive Blue (Agent Actions)
        'secondary': 'var(--color-secondary)',
        'on-secondary': 'var(--color-on-secondary)',
        'secondary-container': 'var(--color-secondary-container)',
        'secondary-fixed': 'var(--color-secondary-fixed)',

        // Validated Emerald (Success / Verified)
        'tertiary': 'var(--color-tertiary)',
        'on-tertiary': 'var(--color-on-tertiary)',
        'tertiary-container': 'var(--color-tertiary-container)',
        'on-tertiary-container': 'var(--color-on-tertiary-container)',
        'tertiary-fixed': 'var(--color-tertiary-fixed)',
        'tertiary-fixed-dim': 'var(--color-tertiary-fixed-dim)',

        // Error / Abort
        'error': 'var(--color-error)',
        'on-error': 'var(--color-on-error)',
        'error-container': 'var(--color-error-container)',
        'on-error-container': 'var(--color-on-error-container)',
      },
      fontFamily: {
        headline: ['Manrope', 'sans-serif'],
        display: ['Manrope', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      fontSize: {
        'display': ['48px', { lineHeight: '56px', letterSpacing: '-0.03em', fontWeight: '600' }],
        'display-mobile': ['36px', { lineHeight: '44px', letterSpacing: '-0.025em', fontWeight: '600' }],
        'headline-lg': ['32px', { lineHeight: '40px', letterSpacing: '-0.02em', fontWeight: '600' }],
        'headline-lg-mobile': ['26px', { lineHeight: '32px', letterSpacing: '-0.02em', fontWeight: '600' }],
        'headline-md': ['22px', { lineHeight: '28px', letterSpacing: '-0.015em', fontWeight: '600' }],
        'headline-sm': ['18px', { lineHeight: '24px', letterSpacing: '-0.01em', fontWeight: '600' }],
        'body-lg': ['16px', { lineHeight: '24px', letterSpacing: '-0.01em', fontWeight: '400' }],
        'body-md': ['14px', { lineHeight: '20px', letterSpacing: '-0.005em', fontWeight: '400' }],
        'body-sm': ['13px', { lineHeight: '18px', letterSpacing: '0em', fontWeight: '400' }],
        'label-md': ['12px', { lineHeight: '16px', letterSpacing: '0.02em', fontWeight: '500' }],
        'label-sm': ['11px', { lineHeight: '14px', letterSpacing: '0.04em', fontWeight: '500' }],
        'mono-currency': ['15px', { lineHeight: '20px', letterSpacing: '-0.02em', fontWeight: '500' }],
        'mono-data': ['13px', { lineHeight: '18px', letterSpacing: '-0.01em', fontWeight: '400' }],
      },
      spacing: {
        'space-2': '2px',
        'space-4': '4px',
        'space-8': '8px',
        'space-12': '12px',
        'space-16': '16px',
        'space-20': '20px',
        'space-24': '24px',
        'space-32': '32px',
        'space-40': '40px',
        'space-48': '48px',
        'space-64': '64px',
        'space-80': '80px',
        'gutter-desktop': '24px',
        'gutter-mobile': '16px',
        'max-width-content': '1200px',
      },
      maxWidth: {
        'content': '1200px',
      },
      borderRadius: {
        'DEFAULT': '4px',
        'lg': '8px',
        'xl': '12px',
        '2xl': '16px',
        'full': '9999px',
      },
      boxShadow: {
        'L1': '0 1px 2px 0 rgba(17, 17, 16, 0.03), 0 1px 3px 0 rgba(17, 17, 16, 0.02)',
        'L2': '0 4px 6px -1px rgba(17, 17, 16, 0.04)',
        'L3': '0 10px 15px -3px rgba(17, 17, 16, 0.08), 0 4px 6px -4px rgba(17, 17, 16, 0.04)',
      },
    },
  },
  plugins: [],
};
