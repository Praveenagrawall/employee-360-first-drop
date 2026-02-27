/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'kpmg-blue': '#00338D',
        'kpmg-blue-dark': '#002366',
        'kpmg-blue-light': '#0091DA',
        'kpmg-blue-hover': '#004BB4',

        'page-bg': '#F4F6F9',
        'card-bg': '#FFFFFF',
        'sidebar-bg': '#FFFFFF',
        'sidebar-active': '#E8F0FE',
        'sidebar-hover': '#F0F4F8',
        'table-header-bg': '#E3EFF9',
        'table-row-hover': '#F5F9FD',
        'table-stripe': '#FAFBFD',

        'text-primary': '#1A1A2E',
        'text-secondary': '#5A6474',
        'text-muted': '#8E99A4',
        'text-link': '#0068B5',

        'status-active': '#0D9B50',
        'status-warning': '#E5850A',
        'status-error': '#D4311E',
        'status-info': '#0091DA',
        'status-neutral': '#8E99A4',

        'badge-client': '#00338D',
        'badge-internal': '#0D9B50',
        'badge-proposal': '#E5850A',

        // Keep legacy for compatibility during migration if needed, but aim to replace
        primary: {
          DEFAULT: '#00338D',
          50: '#E6EBF5',
          100: '#B3C2E0',
          200: '#809ACC',
          300: '#4D71B7',
          400: '#2652A2',
          500: '#00338D',
          600: '#002D7A',
          700: '#002366',
          800: '#001A53',
          900: '#001040',
        },
      },
      backgroundImage: {
        'header-gradient': 'linear-gradient(135deg, #00338D 0%, #0056B3 50%, #0077CC 100%)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '4px',
        'md': '6px',
        'lg': '8px',
        'card': '4px', // Reduced from 12px for SAP look
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'DEFAULT': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
};
