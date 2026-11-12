/** @type {import('tailwindcss').Config} */

// Apple-inspired design tokens (see DESIGN-apple.md).
// Neutrals and blue are remapped at the theme level so every existing
// utility (slate-*, blue-*) resolves to the same calm, single-accent system.
const neutral = {
  50: '#fafafc',  // surface-pearl
  100: '#f5f5f7', // canvas-parchment
  200: '#e8e8ed', // hairline
  300: '#d2d2d7', // chip gray
  400: '#86868b',
  500: '#6e6e73',
  600: '#515154',
  700: '#424245',
  800: '#333336', // ink-muted-80
  900: '#1d1d1f', // ink
  950: '#000000',
};

const actionBlue = {
  50: '#f0f6fd',
  100: '#e0eefb',
  200: '#bfdbf7',
  300: '#8dbdf0',
  400: '#2997ff', // primary-on-dark
  500: '#0071e3', // primary-focus
  600: '#0066cc', // primary
  700: '#0058b0',
  800: '#004a94',
  900: '#003a75',
  950: '#002650',
};

export default {
  // Hover styles only apply on devices that can truly hover (no sticky taps on touch).
  future: { hoverOnlyWhenSupported: true },
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        slate: neutral,
        gray: neutral,
        blue: actionBlue,
        indigo: actionBlue,
        purple: actionBlue,
        primary: {
          DEFAULT: '#0066cc',
          hover: '#0058b0',
          active: '#004a94',
          focus: '#0071e3',
          'on-dark': '#2997ff',
        },
        ink: {
          DEFAULT: '#1d1d1f',
          80: '#333336',
          48: '#7a7a7a',
        },
        canvas: '#ffffff',
        parchment: '#f5f5f7',
        pearl: '#fafafc',
        hairline: '#e0e0e0',
        tile: { 1: '#272729', 2: '#2a2a2c', 3: '#252527' },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Text"',
          'Inter',
          'system-ui',
          'sans-serif',
        ],
        display: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          'Inter',
          'system-ui',
          'sans-serif',
        ],
        mono: ['ui-monospace', 'SFMono-Regular', '"SF Mono"', 'Menlo', 'monospace'],
      },
      borderRadius: {
        xs: '5px',
        sm: '6px',
        md: '8px',
        lg: '8px',
        xl: '11px',
        '2xl': '18px',
        '3xl': '22px',
      },
      boxShadow: {
        // Apple: no shadows on chrome. Elevation only for floating layers.
        '2xs': 'none',
        xs: 'none',
        sm: 'none',
        md: 'none',
        lg: '0 8px 30px rgba(0, 0, 0, 0.08)',
        xl: '0 20px 60px rgba(0, 0, 0, 0.16)',
        '2xl': '0 24px 80px rgba(0, 0, 0, 0.22)',
        product: '3px 5px 30px 0 rgba(0, 0, 0, 0.22)',
      },
      letterSpacing: {
        apple: '-0.374px',
        'apple-tight': '-0.28px',
        caption: '-0.224px',
      },
      // Motion tokens — every existing `transition-*` utility inherits these.
      transitionTimingFunction: {
        DEFAULT: 'cubic-bezier(0.23, 1, 0.32, 1)',
        out: 'cubic-bezier(0.23, 1, 0.32, 1)',
        'in-out': 'cubic-bezier(0.77, 0, 0.175, 1)',
        drawer: 'cubic-bezier(0.32, 0.72, 0, 1)',
      },
      transitionDuration: {
        DEFAULT: '200ms',
        press: '120ms',
        fast: '160ms',
        base: '220ms',
        slow: '280ms',
      },
      zIndex: {
        nav: '30',
        overlay: '40',
        drawer: '50',
        modal: '60',
      },
    },
  },
  plugins: [],
};
