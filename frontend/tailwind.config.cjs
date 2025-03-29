/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          bg: "#0f0f23",
          text: "#e6e6e6"
        },
        secondary: {
          bg: "#1a1a2e",
          text: "#b0bec5"
        },
        tertiary: {
          bg: "#232342",
          text: "#78909c"
        },
        elevated: {
          bg: "#2a2a4a"
        },
        accent: {
          primary: "#64b5f6",
          "primary-hover": "#90caf9",
          secondary: "#81c784"
        },
        status: {
          pending: "#6c6c8b",
          "in-progress": "#4fc3f7",
          completed: "#81c784",
          draw: "#ffb74d"
        },
        border: "#3f3f5a"
      },
      spacing: {
        'xs': '0.25rem',
        'sm': '0.5rem',
        'md': '1rem',
        'lg': '1.5rem',
        'xl': '2rem',
        'xxl': '3rem'
      },
      borderRadius: {
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'round': '50px'
      },
      boxShadow: {
        'sm': '0 2px 4px rgba(0, 0, 0, 0.15)',
        'md': '0 4px 8px rgba(0, 0, 0, 0.2)',
        'lg': '0 6px 12px rgba(0, 0, 0, 0.25)'
      }
    },
  },
  plugins: [],
} 