import formsPlugin from '@tailwindcss/forms';
import typographyPlugin from '@tailwindcss/typography';

//可以基于defaultTheme的预设参数去修改覆盖；
import defaultTheme from 'tailwindcss/defaultTheme';
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./app/**/*.{js,ts,jsx,tsx}'],
  theme: {
    //修改container的预设，注意它不单是个类名
    container: {
      center: true,
      darkMode: 'false',
      padding: {
        DEFAULT: '1rem',
        xl: '40px',
        '2xl': '128px',
      },
    },
    extend: {
      colors: {
        primary: 'rgb(var(--color-primary) / <alpha-value>)',
        contrast: 'rgb(var(--color-contrast) / <alpha-value>)',
        notice: 'rgb(var(--color-accent) / <alpha-value>)',
        shopPay: 'rgb(var(--color-shop-pay) / <alpha-value>)',
        brand: 'rgb(var(--color-brand) / <alpha-value>)',
        highlight: 'rgb(var(--color-highlight) / <alpha-value>)',
      },
      screens: {
        // 引入defaultTheme是因为: hydrogen-demo-store模板把max-width去掉了，导致无论哪种设备左右边距都是固定的。
        // sm: '32em',
        // md: '48em',
        // lg: '64em',
        // xl: '80em',
        // '2xl': '96em',
        // 'sm-max': {max: '48em'},
        // 'sm-only': {min: '32em', max: '48em'},
        // 'md-only': {min: '48em', max: '64em'},
        // 'lg-only': {min: '64em', max: '80em'},
        // 'xl-only': {min: '80em', max: '96em'},
        // '2xl-only': {min: '96em'},
        ...defaultTheme.screens,
        'sm-max': {max: defaultTheme.screens.md},
        'sm-only': {min: defaultTheme.screens.sm, max: defaultTheme.screens.md},
        'md-only': {min: defaultTheme.screens.md, max: defaultTheme.screens.lg},
        'lg-only': {min: defaultTheme.screens.lg, max: defaultTheme.screens.xl},
        'xl-only': {
          min: defaultTheme.screens.xl,
          max: defaultTheme.screens['2xl'],
        },
        '2xl-only': {min: defaultTheme.screens['2xl']},
      },
      spacing: {
        nav: 'var(--height-nav)',
        screen: 'var(--screen-height, 100vh)',
      },
      height: {
        screen: 'var(--screen-height, 100vh)',
        'screen-no-nav':
          'calc(var(--screen-height, 100vh) - var(--height-nav))',
        'screen-dynamic': 'var(--screen-height-dynamic, 100vh)',
      },
      width: {
        mobileGallery: 'calc(100vw - 3rem)',
      },
      fontFamily: {
        sans: ['Poppins', 'Helvetica Neue', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['Poppins', '"IBMPlexSerif"', 'Palatino', 'ui-serif'],
      },
      fontSize: {
        display: ['var(--font-size-display)', '1.1'],
        heading: ['var(--font-size-heading)', '1.25'],
        lead: ['var(--font-size-lead)', '1.333'],
        copy: ['var(--font-size-copy)', '1.5'],
        fine: ['var(--font-size-fine)', '1.333'],
      },
      maxWidth: {
        'prose-narrow': '45ch',
        'prose-wide': '80ch',
      },
      boxShadow: {
        border: 'inset 0px 0px 0px 1px rgb(var(--color-primary) / 0.08)',
        darkHeader: 'inset 0px -1px 0px 0px rgba(21, 21, 21, 0.4)',
        lightHeader: 'inset 0px -1px 0px 0px rgba(21, 21, 21, 0.05)',
      },
    },
  },
  plugins: [formsPlugin, typographyPlugin],
};
