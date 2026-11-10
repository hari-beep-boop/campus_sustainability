/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        page: 'var(--page)',
        frame: 'var(--frame)',
        card: 'var(--card)',
        'card-border': 'var(--card-border)',
        ink: 'var(--ink)',
        muted: 'var(--muted)',
        primary: 'var(--primary)',
        'primary-soft': 'var(--primary-soft)',
        hatch: 'var(--hatch)',
        danger: 'var(--danger)',
        'danger-soft': 'var(--danger-soft)',
        warn: 'var(--warn)',
        energy: 'var(--energy)',
        water: 'var(--water)',
        air: 'var(--air)',
        ai: 'var(--ai)',
      },
      borderRadius: {
        frame: '28px',
        card: '22px',
        tile: '16px',
        pill: '9999px',
      },
      boxShadow: {
        soft: '0 4px 20px -2px rgba(14, 107, 90, 0.06)',
        frame: '0 12px 48px -6px rgba(16, 28, 25, 0.08)',
        pill: '0 2px 8px -1px rgba(14, 107, 90, 0.12)',
      },
    },
  },
  plugins: [],
};
