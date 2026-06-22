/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        notion: {
          bg: '#ffffff',
          warmBg: '#f6f5f4',
          text: 'rgba(0,0,0,0.95)',
          textSecondary: '#615d59',
          textMuted: '#a39e98',
          blue: '#0075de',
          blueHover: '#005bab',
          border: 'rgba(0,0,0,0.1)',
          focus: '#097fe8',
          badgeBg: '#f2f9ff',
          badgeText: '#097fe8',
          buttonSecondary: 'rgba(0,0,0,0.05)',
        },
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        }
      },
      boxShadow: {
        'notion-card': '0px 4px 18px rgba(0,0,0,0.04), 0px 2.025px 7.84688px rgba(0,0,0,0.027), 0px 0.8px 2.925px rgba(0,0,0,0.02), 0px 0.175px 1.04062px rgba(0,0,0,0.01)',
        'notion-deep': '0px 1px 3px rgba(0,0,0,0.01), 0px 3px 7px rgba(0,0,0,0.02), 0px 7px 15px rgba(0,0,0,0.02), 0px 14px 28px rgba(0,0,0,0.04), 0px 23px 52px rgba(0,0,0,0.05)',
      },
      letterSpacing: {
        'notion-display': '-2.125px',
        'notion-h1': '-1.5px',
        'notion-h2': '-0.625px',
        'notion-title': '-0.25px',
        'notion-body': '-0.125px',
        'notion-badge': '0.125px',
      }
    },
  },
  plugins: [],
}
