/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        japan: {
          bg: '#FDFBF7',
          'bg-subtle': '#F5F2EB',
          'bg-elevated': '#ECE7DE',
          indigo: {
            50: '#F0F4FA',
            100: '#DCE6F5',
            200: '#B8CEEB',
            500: '#2A4365',
            700: '#1A2B49',
            800: '#14213D',
            900: '#0B132B',
          },
          vermilion: {
            50: '#FDF2F0',
            100: '#FCE4E2',
            200: '#F9CCC8',
            500: '#E83929',
            600: '#D42D1E',
            700: '#B52114',
          },
          charcoal: {
            900: '#1C1917',
            800: '#292524',
            700: '#44403C',
            500: '#78716C',
            400: '#A8A29E',
            200: '#E7E5E4',
            100: '#F5F5F4',
          },
          gold: {
            500: '#D97706',
            100: '#FEF3C7',
          },
          sage: {
            500: '#059669',
            100: '#D1FAE5',
          },
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        japanese: ['"Noto Sans JP"', '"Hiragino Sans"', '"Hiragino Kaku Gothic ProN"', 'Meiryo', 'sans-serif'],
        serif: ['"Noto Serif JP"', 'serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px 0 rgba(0, 0, 0, 0.02)',
        'card': '0 4px 14px 0 rgba(28, 25, 23, 0.05)',
        'elevated': '0 10px 30px -4px rgba(20, 33, 61, 0.08)',
        'glow-red': '0 0 20px -2px rgba(232, 57, 41, 0.25)',
      },
      borderRadius: {
        'xl': '0.875rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      }
    },
  },
  plugins: [],
}
